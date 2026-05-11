import text from "./assets/notizen.md?raw";
import * as z from "zod";

const QandASchema = z.object({
  question: z.string(),
  answer: z.string().optional(),
  correctanswer: z.string().optional(),
  correctnes: z.number().min(1).max(10).optional(),
  completeness: z.number().min(1).max(10).optional(),
  score: z.number().min(1).max(10).optional(),
});

export const ollamaGenerateResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  done: z.boolean(),
  done_reason: z.string(),
  context: z.number().array(), // Array of numbers
  total_duration: z.number(),
  load_duration: z.number(),
  prompt_eval_count: z.number(),
  prompt_eval_duration: z.number(),
  eval_count: z.number(),
  eval_duration: z.number(),
});

export type OllamaGenerateResponse = z.infer<
  typeof ollamaGenerateResponseSchema
>;
export type QandA = z.infer<typeof QandASchema>;

const questions: QandA[] = [];

async function callOllama(
  prompt: string,
  system: string,
  model: string,
): Promise<OllamaGenerateResponse> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      system: system,
      stream: false,
    }),
  });

  const data: OllamaGenerateResponse = await response.json();
  return data;
}

export async function getQuestions(): Promise<string> {
  //return "under construction";
  const system = `You are a tutor asking open short answer questions on the provided study material. Provide only one question and a short correct solution in a specified json schema.
  Use the language used in the document.
  You will get a list of questions that you already asked.
  Do not include any markdown syntax. Give just the table.

  <studymaterial>
  ${text}
  </studymaterial>
  <returnscema>
  {question:string,
  correctanswer:string}</returnscema>`;
  const prompt =
    questions.length > 0 ? questions.toString() : "No previus questions";
  const data = (await callOllama(prompt, system, "gemma4:e4b")).response;
  let JsonData: Object;
  try {
    JsonData = JSON.parse(data);
  } catch (e) {
    console.error(`Result could not be parsed. Error: ${e}`);
    return "Result could not be parsed. View console for more info.";
  }
  const newQuestionData = JsonData;
  const result = QandASchema.safeParse(newQuestionData);
  if (result.success) {
    questions.push(result.data);
  } else {
    console.error(`Question was not valid. Error: ${result.error}`);
    return "Question could not be saved. Check error console for more info.";
  }
  return result.data.question;
}

export function storeAnswer(AiQuestion: string, UserAnswer: string) {
  for (const q of questions) {
    if (q.question == AiQuestion) {
      q.answer = UserAnswer;
      return;
    }
  }
  console.error("Question not in Database");
}

export async function getGrades() {
  const dataToGrade: QandA[] = [];
  for (const q of questions) {
    if (q.score == null) {
      dataToGrade.push(q);
    }
  }
  if (dataToGrade.length > 0) {
    const system = `
    Your job is to grade the answers to questions based on notes. You will recieve the notes, the questions and the answers and will have to grade every answer based on the following paramiters:
    correctnis: Is the answer correct? (scale of 1 to 10)
    completenes: Is the question completely answered? (scale of 1 to 10)
    score: (correctnis-completenes)/2. Round up or down as you see fit.
    <notes>${text}</notes}
    <retunrscema>{
  "properties": {
    "question": { "type": "string" },
    "answer": { "type": ["string", "null"] },
    "correctanswer":{"type":"string"}
    "corectnes": { "type": ["number", "null"] },
    "completens": { "type": ["number", "null"] },
    "score": { "type": ["number", "null"] }
  } </returnscema>
   return the given answers in a JSON List in the return scema.
    `;
    const rawGraids = await callOllama(
      dataToGrade.toString(),
      system,
      "gemma4:e4b",
    );
    let GraidList: [];
    try {
      GraidList = JSON.parse(rawGraids.response);
    } catch (error) {
      console.error(
        `Parced data is not a correct array. Data: ${rawGraids.response}. Error:${error}`,
      );
      return;
    }
    const validGraids: QandA[] = [];
    for (const item in GraidList) {
      try {
        const validItem = QandASchema.parse(item);
        validGraids.push(validItem);
      } catch (e) {
        console.error(`Item did not fit scema. ${e}`);
      }
    }
    validGraids.forEach((validGraid) => {
      const matchquestion = validGraid.question;
      const indexToUpdate = questions.findIndex(
        (question) => question.question == matchquestion,
      );
      if (indexToUpdate !== -1) {
        const questionToUpdate = questions[indexToUpdate];
        questionToUpdate.completeness = validGraid.completeness;
        questionToUpdate.correctnes = validGraid.correctnes;
        questionToUpdate.score = validGraid.score;
      } else {
        console.warn(`No matching question found. Question: ${validGraid}`);
      }
    });
  }
}
