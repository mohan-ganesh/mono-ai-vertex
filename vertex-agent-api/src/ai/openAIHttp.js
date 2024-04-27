import axios from "axios";
import dotenv from "dotenv";
import findMember from "../functions/member-finder.js";
import createMember from "../functions/member-create.js";
import lookupAppointments from "../functions/appointment-slots.js";
import confirmAppointment from "../functions/appointment-confirm.js";
import { findOneDocument, insertDocument, updateDocument } from "../db/db.js";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = `https://api.openai.com/v1/chat/completions`;

export default async function getOpenAIResponse(tempId, query) {
  try {
    let userMessage;
    if (query) {
      userMessage = {
        role: "user",
        content: `${query}`,
      };
      await updateDocument(tempId, userMessage);
    }
    let document = await findOneDocument(tempId);
    let requestBody = {
      model: "gpt-3.5-turbo-0613",
      messages: document.messages,
      functions: [
        findMember,
        createMember,
        lookupAppointments,
        confirmAppointment,
      ],
    };
    const response = await axios.post(`${API_URL}`, requestBody, {
      headers: { "Content-Type": "application/json" },
      auth: {
        username: `OPENAI_API_KEY`,
        password: `${OPENAI_API_KEY}`,
      },
    });
    if (response.data.choices) {
      console.log("response.data.choices-->" + response.data.choices);
      try {
        response.data.choices.forEach(async (choice) => {
          if (choice.finish_reason != "function_call") {
            console.log("choice.message  " + choice.message);
            await updateDocument(tempId, choice.message);
          } else {
            console.log("choice finish reason " + choice.finish_reason);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
    return response.data.choices;
  } catch (error) {
    console.error(error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
    throw new Error(error.message);
  }
}
