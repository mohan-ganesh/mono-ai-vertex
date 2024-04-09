import { v4 as uuidv4 } from "uuid";

import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { VertexAI } from "@langchain/google-vertexai";

import { getKey, insertIntoList, getFromList } from "../db/redis.js";

import { getMongoVectorStore } from "../langchain/vectorStore.js";

import { getQuestionPrompt, getAnswerPrompt } from "../langchain/prompt.js";
import combineDocuments from "../util/combineDocuments.js";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { response } from "express";

export async function interactionController(req, res, _) {
  console.log("start - interactionController(req,res,_)");
  let modelResponse = null;
  let sessionId = null;
  try {
    let { query } = req.body;
    console.log("start - interactionController() query: ", query);

    const term = req?.query?.term || "";

    if (!term) {
      res.status(400).send("Missing search term");
      return;
    }

    console.log(term);
    query = term;

    if (query == undefined || query == null || query == "") {
      query = "what is the attention is all about?";
    }
    sessionId = req.headers["sessionid"];
    if (!sessionId || sessionId == "null" || sessionId == "undefined") {
      sessionId = uuidv4();
    }

    await insertIntoList(sessionId, `session: ${query}`);

    const patientHistory = await getKey("patient-history");
    const sessionHistory = (await getFromList(sessionId, 0, -1)).join("\n");
    /*
    const model = new VertexAI({
      verbose: true,
      googleAuthOptions: {
        credentials: {
          type: "service_account",
          project_id: "mohanganesh",
          private_key_id: "284419d70d30af75e7b1520a7be5208f7c83a8cd",
          private_key:
            "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHWJhLLrnSuXrp\na+JXnWHjjVsVhGcN6h2DrO834J2XlLkm+UjJhVrKazlTDwGXkA/8eJT3Sbu6yMiY\nPp5E3chPmD7+OcmxsadQmXd/AAKRoVF5/ylqDg7IdxY1X5I4sxCulwyrCRqys4TI\nCRKdiqD72LaE7H9NQUoIvp+HFaTl5jXfgbXi4Q7NcMtCfnI/4zSEjNjmcT5S6w6I\nftCDdyULh8MLjEVEDFR8+vw0kfoPuYcE+NgvMEeLyhx/LwXioaYeA/F64afiBtYx\nlFS0jEIKKF+hfw/MdZPX4kELO4cXiAUjkXEIt6sl6TqAHb+HkbThgY5+zcbXGPj1\nfdUDAIcJAgMBAAECggEABL3e3n/xp9llWu7H4x9hXBMpUNtVw7MXSWHoTUcUnI3L\nMyoAERoQ0SqIgikj163zsWTRX0nz0xMyUUvBAkCXwovrqKqpeWZxRUWnPeA7T2k7\nycf33VfRAnPxtWqM7PgWbB637IwShGBohsUPeiuZXXA31DTXaNgmGYvmOcV6JwU+\nX7ur7pC/VHLbuS7HvppRj+rod97XLfWrN44CLzRJaG6v121RLfW/0izH7cF8tHFh\n9ywtNkpFYKxni2z52NqwniECsrn+HYvCRSUV18cvDEkp7NDqO4cecA09ViOfwtWe\nZu7qFQ4YnLG4WU9LwJMOyU1HB9Sdpo9lqivsgvDHEQKBgQD8ihs2L2MZLOvUgAvW\nSyMi4JqAivT+dx3BRmvq1TNSwygIuEj0H0ht34gpvF+jvMsHQOQscQ1RvNI6qh/v\n7BqK+kl3DHtApxfqmxj/cNkGXR7ub29QEXSx9xezKYmJhWQT+GNQm672fTj0Nuqs\n6CboR3SnDl2VYplXkrKSlZZu+QKBgQDKE+OmMUwDLyKL99bmCfcoknEE8u2yiccn\n0e934nNtVTqr6qtQHN+wrk40UZPUUD+o6i1dMGAlYU3wb0zUQuzteY3MJ2JYHZQy\nplUSU2Y99aD7x+X83wNE6phHp+/gjTaFkymGo1IgR1VEvdBN3b/t+3GJlvcQEZvx\nL5/lRlgMkQKBgCW2jifCXd81mSZL1Pi0kdO0jP4jQkD6EuR5Gsaf/iEe6cybkLF8\nNnnKBvCMpA+0svErXKfSXjXVp+OA4nIW5UPZ6ryvjXxzN5wee1YySQatQ2BCHfJs\nGOw2xUBJNLPnyrE8x8AS78b5nlbCGLunk5/eg+oquAkGB3ZPfwFq+2MpAoGAF6i2\neYnCBYlqOQr+XRaDmntywgqTK9kXuSDKMbYQn5df9CrYfduzkOMHgvaeITh4C5XH\nU+bLCvVWg7T0QNHJHZCiumlOCVUFOdzhjvC2wsBUZcYktjOCFXqF87XEzvyZipAN\nR5ctkVvortCuZ79zrjBHPb2wFXCKWnWh+dz/iBECgYBdb7qv6I0TWdRntVHfDAQ+\nYm8NlPJvkC8+ZiGggM8YRkb3xmr/+ExpR9NfXIkJn5blx6TR98Sr5cowMk0BdOrv\nQdt6m2WX4K1JZg2Dimgbi9eFtr/IQLGyNfZmEsvyc9TMwStKP+FQdViXmzZ9iLM3\nh5PBiiQBBZg+Fteq9Hr5ag==\n-----END PRIVATE KEY-----\n",
          client_email: "vector@mohanganesh.iam.gserviceaccount.com",
          client_id: "106044068256629206734",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url:
            "https://www.googleapis.com/robot/v1/metadata/x509/vector%40mohanganesh.iam.gserviceaccount.com",
          universe_domain: "googleapis.com",
        },
      },
    });
*/

    const model = new ChatGoogleGenerativeAI({
      verbose: false,
      modelName: "gemini-pro",
      maxOutputTokens: 2048,
      temperature: 0.7,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });

    /*
    modelResponse = await model.invoke([
      [
        "human",
        "What would be a good company name for a company that makes colorful socks?",
      ],
    ]);

    console.log(modelResponse);
    */
    const vectorstore = await getMongoVectorStore();

    const retriever = vectorstore.asRetriever();

    const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user question
    Context: {context}
    Question: {input}
    `);

    const result = await vectorstore.similaritySearch(query);

    console.log(result);

    modelResponse = result;
    /*

    const chain = await prompt.pipe(model);
    const response = chain.invoke({ input: query });
    modelResponse = response;
    console.dir(response, { depth: null });
    */
    await insertIntoList(sessionId, `${response}`);
  } catch (error) {
    console.error(error);
  }
  return { sessionId, modelResponse };
}
