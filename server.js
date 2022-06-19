const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = process.env.PORT || 8000


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/',(_, response)=>{
    response.render('index.ejs')
})

const connectToCollection = ({ connectionUri, databaseName, collectionName }) => {
    return MongoClient.connect(connectionUri, { useUnifiedTopology: true })
        .then(client => client.db(databaseName).collection(collectionName))
}

const serializeMongoDBError = error => ({ message: error.toString(), error})

app.get('/interact', (req, res, next) => {
    let filter = JSON.parse(req.query.filter)
    if (!Object.keys(filter).length) filter = undefined;

    return connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection.find(filter).toArray(), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(next)
});

app.post('/interact', (req, res, next) => {
    return connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection[Array.isArray(req.body.data) ? 'insertMany' : 'insertOne'](req.body.data), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(next)
});

app.put('/interact', (req, res, next) => {
    return connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection.updateMany(req.body.filter, { $set: req.body.data }), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(next)
});

app.delete('/interact', (req, res, next) => {
    return connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection.deleteMany(req.body.filter), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(next)
});

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})