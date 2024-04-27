import { MongoClient, ObjectId } from "mongodb";

let client;
const COLLECTION_NAME = "AI";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

function getCollection() {
  if (!client) {
    throw new Error("Database is not connected");
  }

  const db = client.db();
  return db.collection(COLLECTION_NAME);
}

export async function insertDocument(document) {
  const collection = getCollection();
  const result = await collection.insertOne(document);
  return result.insertedId.toString();
}
export async function insertDocuments(document) {
  const collection = getCollection();
  const result = await collection.insertMany(document);
  return result.insertedId;
}

export async function findOneDocument(id) {
  let query = { _id: new ObjectId(id) };
  const collection = getCollection();
  const document = await collection.findOne(query);
  return document;
}

export async function updateDocument(documentId, message) {
  console.dir({ documentId, message });
  const collection = getCollection();

  const result = await collection.updateOne(
    { _id: new ObjectId(documentId) },
    { $push: { messages: message } }
  );

  return result.modifiedCount;
}

// module.exports = {
//   connect,
//   insertDocument,
//   findDocuments,
//   updateDocument,
// };
