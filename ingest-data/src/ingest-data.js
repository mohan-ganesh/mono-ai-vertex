import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

/**
 *
 */
async function processDocument() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || "");
    const VERTEX_API_KEY = process.env.VERTEX_API_KEY;
    const namespace = "health.benefits";
    const [dbName, collectionName] = namespace.split(".");
    const collection = client.db(dbName).collection(collectionName);

    const pdfFilePath = "/WPA_2024_ACA_Brochure.pdf";
    const pdfLoader = new PDFLoader(pdfFilePath);
    const docs = await pdfLoader.load();
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocuments = await splitter.splitDocuments(docs);
    console.log(splitDocuments.length);
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: VERTEX_API_KEY,
    });
    const vectorstore = await MongoDBAtlasVectorSearch.fromDocuments(
      splitDocuments,
      embeddings,
      collection
    );

    const assignedIds = await vectorstore.addDocuments([
      { pageContent: "upsertable", metadata: {} },
    ]);

    const upsertedDocs = [{ pageContent: "overwritten", metadata: {} }];
    await vectorstore.addDocuments(upsertedDocs, { ids: assignedIds });
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
}
processDocument();
