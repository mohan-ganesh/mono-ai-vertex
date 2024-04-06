import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(
  "mongodb+srv://vector-embeddings:marathon@mohanganesh.8fkkmtz.mongodb.net/?retryWrites=true&w=majority&appName=mohanganesh"
);
/**
 *
 */
async function processDocument() {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const namespace = "mohanganesh.benefits";
    const [dbName, collectionName] = namespace.split(".");
    const collection = client.db(dbName).collection(collectionName);

    const pdfFilePath = "attention-is-all-you-need.pdf";
    const pdfLoader = new PDFLoader(pdfFilePath);
    const pdfdocs = await pdfLoader.load();
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments(pdfdocs);
    console.log("Split Documents lenth is " + docs.length);
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GOOGLE_API_KEY,
    });

    //readonly collection: Collection<MongoDBDocument>;
    //readonly indexName?: string;
    //readonly textKey?: string;
    //readonly embeddingKey?: string;
    //readonly primaryKey?: string;
    const vectorstore = await MongoDBAtlasVectorSearch.fromDocuments(
      docs,
      embeddings,
      {
        collection,
        indexName: "benefits_vector_index",
        textKey: "raw_text",
        embeddingKey: "raw_text_embedding",
        primaryKey: "_id",
      }
    );

    const assignedIds = await vectorstore.addDocuments([
      { pageContent: "upsertable", metadata: {} },
    ]);

    console.log(assignedIds);
    const upsertedDocs = [{ pageContent: "overwritten", metadata: {} }];
    await vectorstore.addDocuments(upsertedDocs, { ids: assignedIds });
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}
processDocument();
