import { ChatPromptTemplate } from "@langchain/core/prompts";

export function getQuestionPrompt() {
  const questionTemplate = `
    Answer the user asked question
    Context: {context}
    Question: {input}
    `;

  return ChatPromptTemplate.fromTemplate(questionTemplate);
}

export function getAnswerPrompt() {
  const answerTemplateTemp = `
    You are acting as an assistant to a diagnostician in a clinic.
    Your role is assist the diagnostician in diagnosing the patient. 
    You dont have to output the session_history.
  context: {context}
  patient_history: {patient_history}
  symptoms: {symptoms}
  session_history: {session_history}
  question:
`;

  const answerTemplatev1 = `
You are acting as an advanced assistant to answer the user questions.
`;
  return PromptTemplate.fromTemplate(answerTemplatev1);
}
