import { v4 as uuidv4 } from "uuid";

import getOpenAIResponse from "../ai/openAIHttp.js";
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
import { insertDocument, updateDocument } from "../db/db.js";
import messages from "../prompts/messages.js";

import findMember from "../api-implmentation/member-finder.js";

import createMember from "../api-implmentation/member-create.js";

import appointmentSlots from "../api-implmentation/appointment-slots.js";

import confirmAppointment from "../api-implmentation/confirm-appointment.js";

export async function conversationController(req, res, _) {
  console.log("start - controller-openai(req,res,_)");
  let modelResponse = null;
  let sessionId = null;
  let tempId = req.headers["x-temp-id"];

  const { caller, callercity, callerstate, callerzip } = req.headers;
  if (caller) {
    messages.push({
      role: "system",
      content: `User phone number is ${caller}`,
    });
    messages.push({
      role: "system",
      content: `User is calling from  ${callercity} city`,
    });
    messages.push({
      role: "system",
      content: `User is calling from ${callerstate} state`,
    });
    messages.push({
      role: "system",
      content: `User is calling from zipcode ${callerzip}`,
    });
    messages.push({
      role: "system",
      content: `The user is inquiring from a phone or email to the scheduler hospital appointmnet service. 
      You can use the caller location details like member id find hospital appointment open slots.
      Once you find the open slots, use the member infomation to create an appointment and confirm the details.
      You dont have to ask back. But DO confirm with the user before using that`,
    });
  }

  try {
    let { query } = req.body;
    console.log("start - controller-openai() query: ", query);

    if (query !== null && query !== undefined) {
      sessionId = req.headers["sessionid"];
      if (!sessionId || sessionId == "null" || sessionId == "undefined") {
        sessionId = uuidv4();
      }
      if (!tempId || tempId == "null") {
        //tempId = uuidv4();
        tempId = await insertDocument({ messages });
      }
      let aiResponse = "";
      let finishReason = "function_call";

      do {
        aiResponse = (await getOpenAIResponse(tempId, query)) || [];

        let choice = aiResponse[0];
        finishReason = choice.finish_reason;
        if (finishReason == "function_call") {
          let fnName = choice.message["function_call"].name || "";
          console.log("Its a function call and function name is " + fnName);
          let functionResponse = "";
          switch (fnName) {
            case "create_member":
              console.log(choice.message["function_call"].arguments);
              let myFunctionResponse = await createMember(
                JSON.parse(choice.message["function_call"].arguments)
              );
              functionResponse = JSON.stringify(myFunctionResponse);
              break;

            case "find_member":
              console.log(choice.message["function_call"].arguments);
              let member = await findMember(
                JSON.parse(choice.message["function_call"].arguments)
              );
              functionResponse = JSON.stringify(member);
              break;

            case "find_appointments":
              console.log(choice.message["function_call"].arguments);
              let slots = await appointmentSlots(
                JSON.parse(choice.message["function_call"].arguments)
              );
              functionResponse = JSON.stringify(slots);
              break;

            case "confirm_appointment":
              console.log(choice.message["function_call"].arguments);
              let confirmation = await confirmAppointment(
                JSON.parse(choice.message["function_call"].arguments)
              );
              functionResponse = JSON.stringify(confirmation);
              break;

            case "create_appointment":
              console.log(choice.message["function_call"].arguments);
              let confirm = await confirmAppointment(
                JSON.parse(choice.message["function_call"].arguments)
              );
              functionResponse = JSON.stringify(confirm);
              break;

            default:
              console.log("No mans land");
              break;
          }

          await updateDocument(tempId, {
            role: "function",
            name: fnName,
            content: functionResponse,
          });

          aiResponse = await getOpenAIResponse(tempId);
          finishReason = aiResponse[0].finish_reason;
        }
        if (finishReason == "stop") {
          console.dir(choice.message);
          res.json({ response: aiResponse[0].message.content, tempId });
          return;
        }
      } while (finishReason === "function_call");
    } else {
      res.status(400).send("missing payload term");
      return;
    }
  } catch (error) {
    console.error(error);
  }
  return { sessionId, modelResponse };
}
