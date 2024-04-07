import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

export async function getMongoVectorStore() {
  const client = new MongoClient(process.env.MONGODB_URI || "");
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const namespace = "mohanganesh.benefits";
  const [dbName, collectionName] = namespace.split(".");
  const collection = client.db(dbName).collection(collectionName);
  return new MongoDBAtlasVectorSearch(
    new GoogleGenerativeAIEmbeddings({ GOOGLE_API_KEY }),
    {
      collection,
      indexName: "benefits_vector_index",
      textKey: "raw_text",
      embeddingKey: "raw_text_embedding",
      primaryKey: "_id",
    }
  );
}
