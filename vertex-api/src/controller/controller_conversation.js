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
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

export async function conversationController(req, res, _) {
  console.log("start - conversationController(req,res,_)");
  let modelResponse = null;
  let sessionId = null;

  try {
    let { query } = req.body;
    console.log("start - conversationController() query: ", query);

    if (query !== null && query !== undefined) {
      sessionId = req.headers["sessionid"];
      if (!sessionId || sessionId == "null" || sessionId == "undefined") {
        sessionId = uuidv4();
      }

      const model = new ChatGoogleGenerativeAI({
        verbose: false,
        modelName: "gemini-pro",
        maxOutputTokens: 2048,
        temperature: 0.9,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      });

      const vectorstore = await getMongoVectorStore();

      const retriever = vectorstore.asRetriever();

      const questionPrompt = ChatPromptTemplate.fromTemplate(`
    Answer the user's question from the following context to your best to describe as much as you can:
    {context}
    Question: {input}    
    `);

      const chain = await createStuffDocumentsChain({
        llm: model,
        prompt: questionPrompt,
      });

      const retrievalChain = await createRetrievalChain({
        combineDocsChain: chain,
        retriever: retriever,
      });

      const response = await retrievalChain.invoke({
        input: query,
      });
      console.log(response);

      modelResponse = response;
    } else {
      res.status(400).send("missing payload term");
      return;
    }
    //await insertIntoList(sessionId, `System : ${response}`);
  } catch (error) {
    console.error(error);
  }

  return { sessionId, modelResponse };
}
