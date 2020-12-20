const { MongoClient, ObjectID } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

const id = new ObjectID();
console.log(id);

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log(error);
    }

    console.log("Connection Established!");
    const db = client.db(databaseName);

    const update = db.collection('tasks').updateMany({
        completed: false
    }, {
        $set: {
            completed: true
        }
    })

    update.then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })

    // db.collection('tasks').findOne({
    //     _id: new ObjectID("5fb61e1c8aeb3d0db8e556fd")
    // }, (error, user) => {
    //     if (error) {
    //         return console.log(error);
    //     }
    //     console.log(user);
    // })
})