const express = require('express')
const { Db } = require('mongodb')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()


/** @type {Db} */
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'star-trek-api'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
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

app.get('/interact', (req, res) => {
    let filter = JSON.parse(req.query.filter)
    if (!Object.keys(filter).length) filter = undefined;
    console.log(filter)
    db.collection('alien-info').find(filter).toArray()
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

app.post('/interact', (req, res) => {
    db.collection('alien-info').insertOne(req.body.data)
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

app.put('/interact', (req, res) => {
    db.collection('alien-info').updateMany(req.body.filter, { $set: req.body.data })
        .then(data => res.send(data))
        .catch(error => console.trace(error))
});

app.delete('/interact', (req, res) => {
    db.collection('alien-info').deleteMany(req.body.filter)
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