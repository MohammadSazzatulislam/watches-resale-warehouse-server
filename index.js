const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4lwt8qz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function veryJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorization Access" });
  }
  jwt.verify(authHeader, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const paymentsCollection = client.db("watchWerehouse").collection("payments");

    app.get("/", (req, res) => {
      res.send("watches api is comming soon");
    });

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.option !== "Admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    app.get("/jwt/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const users = await usersCollection.findOne(query);
      if (users) {
        const token = jwt.sign({ users }, process.env.ACCESS_TOKEN, {
          expiresIn: "2d",
        });
        return res.send({ token });
      }
      res.status(403).send({ message: "forbidden access" });
    });

    app.get("/category", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/product/:name", veryJwt, async (req, res) => {
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

    app.get("/product", veryJwt, async (req, res) => {
      const userEmail = req.query.email;
      const filter = { userEmail };
      const result = await addProductCollection.find(filter).toArray();
      res.send(result);
    });

    app.delete("/product/:id", veryJwt, async (req, res) => {
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

    app.get("/users/buyers", veryJwt,  async (req, res) => {
      const filter = { option: "Buyers" };
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/users/sellers", veryJwt,  async (req, res) => {
      const filter = { option: "Seller" };
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    app.delete("/users/buyers/:id", veryJwt,  async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    app.delete("/users/sellers/:id", veryJwt,  async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
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
      return res.send({ isAdmin: user?.option === "Admin" });
    });

    app.post("/addProduct", veryJwt, async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.delete("/addProduct/:id", veryJwt, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/addProduct/:email", veryJwt, async (req, res) => {
      const userEmail = req.params.email;
      const filter = { sellerEmail: userEmail };
      const users = { email: userEmail };
      const allUsers = await usersCollection.findOne(users);
      if (allUsers.verify === "verifyed") {
        const option = { upsert: true };
        const query = { sellerEmail: userEmail };
        const updateDoc = {
          $set: {
            verify: "verifyed",
          },
        };
        const updateProducts = await productsCollection.updateMany(
          query,
          updateDoc,
          option
        );
      }
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });

    app.put("/verify/:email", veryJwt,  async (req, res) => {
      const userEmail = req.params.email;
      const filter = { email: userEmail };
      const updateDoc = {
        $set: {
          verify: "verifyed",
        },
      };
      const query = { sellerEmail: userEmail };
      const allSellerProduct = await productsCollection.updateMany(
        query,
        updateDoc
      );
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const amount = booking.price * 100;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
        },
      };
      const bookings = await addProductCollection.updateOne(filter, updateDoc);

      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err.message));

app.listen(port, () => {
  console.log(`port is running on : ${port}`);
});
