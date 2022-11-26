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

    app.post("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          stutas: "stock out",
        },
      };
      const upDateProduct = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );

      const booked = req.body;
      const result = await addProductCollection.insertOne(booked);
      res.send(result);
    });

    app.get("/product", async (req, res) => {
      const userEmail = req.query.email;
      const filter = { userEmail };
      const result = await addProductCollection.find(filter).toArray();
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const productId = req.params.id;
      const filter = { _id: ObjectId(productId) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          stutas: "In stock",
        },
      };
      const upDateProduct = await productsCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      console.log(upDateProduct);
      const id = req.params.id;
      const query = { productId: id };
      const result = await addProductCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/buyers", async (req, res) => {
      const filter = { option: "Buyers" };
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      if (user?.option === "Seller") {
        return res.send({ isSeller: user?.option === "Seller" });
      } else if (user?.option === "Buyers") {
        return res.send({ isBuyers: user?.option === "Buyers" });
      }
      res.send({ isAdmin: user?.option === "Admin" });
    });

    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.delete("/addProduct/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/addProduct/:email", async (req, res) => {
      const userEmail = req.params.email;
      const filter = { sellerEmail: userEmail };
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err.message));

app.listen(port, () => {
  console.log(`port is running on : ${port}`);
});
