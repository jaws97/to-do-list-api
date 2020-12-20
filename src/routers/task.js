const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')
const Task = require('../models/tasks');

router.post('/task', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        createdby: req.user._id
    });

    try {
        await task.save();
        res.send(task)
    }
    catch (err) {
        res.status(400).send(err)
    }

})

router.get('/tasks', auth, async (req, res) => {

    const match = {};
    const sort = {};

    if (req.query.status) {
        match.status = req.query.status === 'true';
    }

    if (req.query.sort) {
        const parts = req.query.sort.split(":");
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // let tasks = await Task.find({ createdby: req.user._id });
        let tasks = await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate();
        res.send(req.user.tasks)
    }
    catch (err) {
        res.status(400).send(err)
    }

})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        // let task = await Task.findById(_id);
        let task = await Task.findOne({ _id, createdby: req.user._id });
        if (!task) {
            return res.status(404).send('Task not found')
        }
        res.send(task)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }

})

router.patch('/task/:id', auth, async (req, res) => {

    const _id = req.params.id
    const allowedUpdates = ["description", "status"];
    const updates = Object.keys(req.body);
    const isValid = updates.every((update) => { return allowedUpdates.includes(update) });

    if (!isValid) {
        return res.status(400).send({ "error": "Invalid update" })
    }

    try {
        let task = await Task.findOne({ _id, createdby: req.user._id });

        // let task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send('Task not found')
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()
        // let task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        res.send(task)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }

})

router.delete('/task/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        let task = await Task.findByIdAndDelete({ _id, createdby: req.user._id });
        if (!task) {
            return res.status(404).send('Task not found')
        }
        res.send(task)
    }
    catch (err) {
        res.status(400).send(err)
    }

})

module.exports = router