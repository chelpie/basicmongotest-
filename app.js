const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use express.json() middleware to parse JSON requests
app.use(express.json());

// MongoDB connection URI
const uri = process.env.MONGO_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Store your valid app signature hash(s) here
const validSignatures = [process.env.VALID_SIGNATURE_HASH]; // Replace with your valid signature hash(es)

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB!");

    // Define the database and collection
    const database = client.db('yourDatabaseName');
    const collection = database.collection('yourCollectionName');

    // API endpoint to add data
    app.post('/addData', async (req, res) => {
      try {
        // Check for the signature in the request header
        const clientSignature = req.headers['x-app-signature']; // Make sure your app sends this header

        if (!clientSignature || !validSignatures.includes(clientSignature)) {
          console.log("Signature check failed or missing.");
          return res.status(403).send('Forbidden: Invalid app signature');
        }
        console.log("Signature matched.");

        const data = req.body;
        
        console.log("Received data on server:", data);

        // Insert data into MongoDB collection
        const result = await collection.insertOne(data);
        console.log("Document added with _id:", result.insertedId);

        // Send a response back with the inserted document's ID
        res.status(200).send(`Document added with _id: ${result.insertedId}`);
      } catch (err) {
        console.error("Error adding document:", err);
        res.status(500).send('Error adding document');
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

// Run the main function
run().catch(console.dir);
