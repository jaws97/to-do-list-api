const express = require('express');
const auth = require('../middleware/auth')
const User = require('../models/user');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp')

router.post("/user/login", async (req, res) => {
    try {
        let user = await User.findByCredentials(req.body.email, req.body.password);
        let token = await user.generateAuthToken();


        res.send({ user: user, token });
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

router.post('/user', async (req, res) => {

    const user = new User(req.body);
    try {
        await user.save();
        let token = await user.generateAuthToken();

        res.send({ user, token })
    }
    catch (err) {
        res.status(400).send(err)
    }

})


router.get('/users/me', auth, async (req, res) => {

    try {
        res.send(req.user)
    }
    catch (err) {
        return res.status(400).send(err)
    }

})

router.get('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

        await req.user.save();

        res.status(200).send({ "message": "Logged out successfully!" })
    }
    catch (err) {
        return res.status(400).send(err)
    }

})

router.get('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = [];

        await req.user.save();

        res.status(200).send({ "message": "Logged out of all devices!" })
    }
    catch (err) {
        return res.status(400).send(err)
    }

})

router.get('/users/:id', async (req, res) => {

    const _id = req.params.id
    try {
        let user = await User.findById(_id);

        if (!user) {
            return res.status(404).send('User not found')
        }
        res.send(user)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

router.patch('/users/me', auth, async (req, res) => {


    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];

    const isInvalid = updates.every((update) => { return allowedUpdates.includes(update) })

    if (!isInvalid) {
        return res.status(400).send({ "error": "Invalid operation" })
    }

    try {

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })

        await req.user.save()
        // let user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        res.send(req.user)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

router.delete('/user/me', auth, async (req, res) => {


    try {
        // let user = await User.findByIdAndDelete(_id);

        // if (!user) {
        //     return res.status(404).send('User not found')
        // }
        await req.user.remove()
        res.send(req.user)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(re, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer;
    await req.user.save()
    res.send(req.user)
},
    (error, req, res) => {
        console.log(err, "rtj")
        res.status(400).send({ error: error.message })
    })

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send(req.user)
})

router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error('')
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar)

    }
    catch (err) {
        res.stattus(404).send()
    }
})

module.exports = router