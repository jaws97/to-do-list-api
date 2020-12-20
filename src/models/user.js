const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Enter valid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot be password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'createdby'
})

userSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    let user = this;
    let token = jwt.sign({ _id: user._id.toString() }, 'mysecret', { expiresIn: '7 days' })

    user.tokens = user.tokens.concat({ token })

    await user.save();

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found')
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user;
}

//Hash the password before save
userSchema.pre('save', async function (next) {
    const user = this;
    console.log("Just before");

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()

})

//  Delete user tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ createdby: user._id });
    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User