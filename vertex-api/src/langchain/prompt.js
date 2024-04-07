import { PromptTemplate } from "@langchain/core/prompts";

export function getQuestionPrompt() {
  const questionTemplate = `
    Given a description of symptoms from a patient visitng a doctors office 
    and possible patient_history, convert it to a simplified, 
    medically relevant_symptoms. 
    symptoms: {symptoms} 
    patient_history: {patient_history}
    relevant_symptoms:`;

  return PromptTemplate.fromTemplate(questionTemplate);
}

export function getAnswerPrompt() {
  const answerTemplate = `
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
You are acting as an advanced assistant to a diagnostician in a clinic. Your role is to support the diagnostician by facilitating a thorough diagnostic process for the patient present in the room.

The diagnostician will input symptoms and ailments as described by the patient. Based on this information, you will assist by providing a structured analysis that includes potential questions for further clarification, a list of differential diagnoses, and recommendations for diagnostic tests if necessary. As each converation progresses, you will refine the differential diagnosis and further tailor the recommendations for diagnostic testing.
`;
  return PromptTemplate.fromTemplate(answerTemplatev1);
}
