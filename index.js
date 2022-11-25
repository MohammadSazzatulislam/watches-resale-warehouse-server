const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4lwt8qz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoryCollection = client
      .db("watchWerehouse")
      .collection("categories");
    const productsCollection = client
      .db("watchWerehouse")
      .collection("products");
    const addProductCollection = client
      .db("watchWerehouse")
      .collection("booked");
    const usersCollection = client.db("watchWerehouse").collection("users");

    app.get("/", (req, res) => {
      res.send("watches api is comming soon");
    });

    app.get("/category", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/product/:name", async (req, res) => {
      const name = req.params.name;
      const query = { category: name };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/product", async (req, res) => {
      const booked = req.body;
      const result = await addProductCollection.insertOne(booked);
      res.send(result);
    });

    app.get("/product", async (req, res) => {
      const userEmail = req.query.email;
      console.log(userEmail);
      const filter = { userEmail };
      const result = await addProductCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

     app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.selectOption === "Seller" });
     });
    
     app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.selectOption === "Buyers" });
     });
    
  } finally {
  }
}

run().catch((err) => console.log(err.message));

app.listen(port, () => {
  console.log(`port is running on : ${port}`);
});
