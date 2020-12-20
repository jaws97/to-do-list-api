const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task')
const app = express();
const port = process.env.PORT || 3000;

const multer = require('multer');
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload PDF'))
        }

        // cb(new Error('Please upload an image'));
        cb(undefined, true)
        // cb(undefined, false)
    }
})

const errorMiddleware = async (req, res, next) => {
    throw new Error('From middleware')
}

app.post('/upload', upload.single('upload'), (req, res) => {

    res.send()
},
    (error, req, res) => {
        console.log(err, "rtj")
        res.status(400).send({ error: error.message })
    })

app.use(express.json())
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server listening in port', port)
})


const jwt = require('jsonwebtoken');

const myFunction = async () => {

    let token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' });

    let isValid = jwt.verify(token, 'thisismynewcourse')
    console.log(isValid)
}

// myFunction()
const Task = require('./models/tasks');
const User = require('./models/user');

const main = async () => {
    // const task = await Task.findById('5fd98c0ab4e9b7572c9f003a');
    // await task.populate('createdby').execPopulate();
    // console.log(task.createdby)

    const user = await User.findById('5fd5c73ee0c774091497d867');
    await user.populate('tasks').execPopulate();
    console.log(user.tasks);
}

// main()