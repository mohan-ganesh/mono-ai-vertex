import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
let mongoClient, db;

export async function connectMongoDB() {
  console.log("Connecting to Mongo DB...");
  const uri = process.env.MONGODB_URI;
  mongoClient = new MongoClient(uri);
  try {
    await mongoClient.connect();
    mongoClient.db("mohanganesh");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to DB:", error);
    throw error;
  }
}

export async function getCollection(collectionName) {
  if (!mongoClient) {
    throw new Error("Database is not connected");
  }

  db = mongoClient.db("mohanganesh");
  return db.collection(collectionName);
}

export async function insertDocument(collectionName, document) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne(document);
    return result.insertedId.toString();
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function findDocuments(
  collectionName,
  query = {},
  projection = {},
  limit = 0,
  sort = {}
) {
  const collection = await getCollection(collectionName);
  const documents = await collection
    .find(query, projection)
    .limit(limit)
    .toArray();
  return documents;
}
export async function findOneDocument(collectionName, query = {}) {
  const collection = await getCollection(collectionName);
  const document = await collection.findOne(query);
  return document;
}

export async function updateDocument(collectionName, documentId, updatedData) {
  console.dir({ collectionName, documentId, updatedData });
  const collection = getCollection(collectionName);

  const result = await collection.updateOne(
    { _id: new ObjectId(documentId) },
    { $set: updatedData }
  );

  return result.modifiedCount;
}

export async function pushObjectIntoArray(
  collectionName,
  query,
  arrayName,
  item
) {
  const session = client.startSession({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
  });
  try {
    session.startTransaction();
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(
      query,
      {
        $push: {
          [arrayName]: item,
        },
      },
      { session }
    );
    await session.commitTransaction();
    return result.modifiedCount;
  } catch (error) {
    if (error.code === 112) {
      // WriteConflict error (code 112)
      console.log(`WriteConflict error`);
      if (session) {
        session.abortTransaction();
      }
    } else {
      console.error("Error updating document:", error);
      throw error;
    }
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
export async function updateOneDocument(
  collectionName,
  query,
  updateOperation
) {
  const collection = await getCollection(collectionName);
  const result = await collection.updateOne(query, updateOperation);
  return result.modifiedCount;
}
export async function aggregateDocuments(collectionName, pipeline) {
  const collection = await getCollection(collectionName);
  const documents = await collection.aggregate(pipeline).toArray();
  return documents;
}
