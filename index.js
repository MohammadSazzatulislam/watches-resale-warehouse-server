const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4lwt8qz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});






app.get('/', (req,res) => {
    res.send('watches api is comming soon')
})


app.listen(port ,()=> {
    console.log(`port is running on : ${port}`);
})