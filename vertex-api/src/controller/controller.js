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

export async function interactionController(req, _) {
  console.log("start - interactionController()");
  let { query } = req.body;
  console.log("start - interactionController() query: ", query);

  if (query == undefined || query == null || query == "") {
    query = "what is the attention is all about?";
  }
  let sessionId = req.headers["sessionid"];
  if (!sessionId || sessionId == "null" || sessionId == "undefined") {
    sessionId = uuidv4();
  }

  await insertIntoList(sessionId, `session: ${query}`);

  const patientHistory = await getKey("patient-history");
  const sessionHistory = (await getFromList(sessionId, 0, -1)).join("\n");

  const model = new VertexAI({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "gemini-1.0",
    authOptions: {
      credentials: {
        type: process.env.type,
        project_id: process.env.project_id,
        private_key_id: process.env.private_key_id,
        private_key: process.env.private_key,
        client_email: process.env.client_email,
        client_id: process.env.client_id,
        auth_uri: process.env.auth_uri,
        token_uri: process.env.token_uri,
        auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
        client_x509_cert_url: process.env.client_x509_cert_url,
        universe_domain: process.env.universe_domain,
      },
    },
  });

  const vectorstore = await getMongoVectorStore();

  const retriever = vectorstore.asRetriever();

  const questionPrompt = getQuestionPrompt();
  const questionChain = questionPrompt
    .pipe(model)
    .pipe(new StringOutputParser());
  const answerPrompt = getAnswerPrompt();
  const answerChain = answerPrompt.pipe(model).pipe(new StringOutputParser());
  const retrieverChain = RunnableSequence.from([
    (prevResult) => prevResult.relevant_symptoms,
    retriever,
    combineDocuments,
  ]);

  const chain = RunnableSequence.from([
    {
      relevant_symptoms: questionChain,
      original_input: new RunnablePassthrough(),
    },
    {
      context: retrieverChain,
      symptoms: ({ original_input }) => original_input.symptoms,
      patient_history: ({ original_input }) => original_input.patient_history,
      session_history: ({ original_input }) => original_input.session_history,
    },
    answerChain,
  ]);

  const response = await chain.invoke({
    patient_history: patientHistory,
    session_history: sessionHistory,
    symptoms: query,
  });
  console.dir(response, { depth: null });
  await insertIntoList(sessionId, `Doctor: ${response}`);
  return { sessionId, response };
}
