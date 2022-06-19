const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// app.use("/", (req, res) => {
//     res.sendFile(__dirname + "/index.html");
//    });

app.get('/',(request, response)=>{
    response.render('index.ejs')
})

const connectToCollection = ({ connectionUri, databaseName, collectionName }) => {
    return MongoClient.connect(connectionUri, { useUnifiedTopology: true })
        .then(client => client.db(databaseName).collection(collectionName))
}

const serializeMongoDBError = error => ({ message: error.toString(), error})

app.get('/interact', (req, res) => {
    let filter = JSON.parse(req.query.filter)
    if (!Object.keys(filter).length) filter = undefined;

    return connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection.find(filter).toArray(), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

app.post('/interact', (req, res) => {
    connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection[Array.isArray(req.body.data) ? 'insertMany' : 'insertOne'](req.body.data), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

app.put('/interact', (req, res) => {
    connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection.updateMany(req.body.filter, { $set: req.body.data }), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

app.delete('/interact', (req, res) => {
    connectToCollection(JSON.parse(req.get('x-mongodb-authorization')))
        .then(collection => collection.deleteMany(req.body.filter), serializeMongoDBError)
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

//DOES NOT FUNCTION YET
app.post('/massinsert', (req,res) => {
    //const test = JSON.parse(req.body)
    //console.log(test)
    db.collection('alien-info').insertMany(
        [{name: 'test',speciesName: 'test',features: 'test',homeworld: 'test',image: 'test',interestingFact: 'test',notableExamples: 'test'},{name: 'test2',speciesName: 'test2',features: 'test2',homeworld: 'test2',image: 'test2',interestingFact: 'test2',notableExamples: 'test2'}]
    )
    .then(result => {
        console.log(result)
        res.redirect('/')
    })
    .catch(error => console.error(error))
})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})