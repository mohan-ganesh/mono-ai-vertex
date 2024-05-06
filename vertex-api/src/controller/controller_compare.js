import { v4 as uuidv4 } from "uuid";

import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { VertexAI } from "@langchain/google-vertexai";

import { getKey, insertIntoList, getFromList } from "../db/redis.js";

import { getMongoVectorStore } from "../langchain/vectorStoreBenefitsPlan.js";

import { getQuestionPrompt, getAnswerPrompt } from "../langchain/prompt.js";
import combineDocuments from "../util/combineDocuments.js";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { response } from "express";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

export async function proCompareController(req, res, _) {
  console.log("start - proCompareController(req,res,_)");
  let modelResponse = null;
  let modelResponse2 = null;
  let sessionId = null;

  try {
    let { query } = req.body;
    console.log("start - proCompareController() query: ", query);

    if (query !== null && query !== undefined) {
      sessionId = req.headers["sessionid"];
      if (!sessionId || sessionId == "null" || sessionId == "undefined") {
        sessionId = uuidv4();
      }

      const model_1_5 = new ChatGoogleGenerativeAI({
        verbose: true,
        modelName: "gemini-1.5-pro-latest",
        maxOutputTokens: 8192,
        temperature: 0.7,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      });

      const vectorstore = await getMongoVectorStore();

      const retriever = vectorstore.asRetriever({ k: 20 });

      const questionPrompt = ChatPromptTemplate.fromTemplate(`
      You are an experienced medical, dental and vision health plans adviosor. 
      You are acting as a health insurance benefits expert to compare the different health plan benefits.
      Compare the health plan benefit details and recommended health plan suits better and reasoning with why .
      Highlight benefit health plan servcies, costs, visits, in-network and out of network costs.
      Be as descriptive as possible to differentiate the benefits and highlight them..
      List different servcies offered by the health plans.
      Answer the user's question from the following context to your best to describe as much as you can:
      {context}
      Question: {input}    
      `);

      const systemMessage =
        "At this time i don't have knowledge about the piece of information";

      /** First chain starts */

      const chain = await createStuffDocumentsChain({
        llm: model_1_5,
        prompt: questionPrompt,
      });

      const retrievalChain = await createRetrievalChain({
        combineDocsChain: chain,
        retriever: retriever,
      });

      const response = await retrievalChain.invoke({
        input: query,
      });

      //when safety settings are medium, answer will be empty.
      if (response && response.answer.length === 0) {
        response.answer = systemMessage;
      }

      modelResponse = response;

      console.log("model response " + modelResponse);
      /** First chain ends */
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