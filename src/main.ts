import text from './assets/notizen.md?raw';
import * as z from 'zod';

const QandASchema = z.object({
  question: z.string(),
  answer: z.string().optional(),
  correctanswer: z.string().optional(),
  correctness: z.number().min(0).max(10).optional(),
  completeness: z.number().min(0).max(10).optional(),
  score: z.number().min(0).max(10).optional(),
  id: z.string(),
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

export type OllamaGenerateResponse = z.infer<typeof ollamaGenerateResponseSchema>;
export type QandA = z.infer<typeof QandASchema>;

const questions: QandA[] = [];

async function callOllama(
  prompt: string,
  system: string,
  model: string,
): Promise<OllamaGenerateResponse> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      system: system,
      keep_alive: '10m',
      stream: false,
    }),
  });

  const data: OllamaGenerateResponse = await response.json();
  return data;
}

export let isFetchingQuestion = false;

export async function getQuestion(): Promise<QandA | null> {
  const underConstruction = false;
  isFetchingQuestion = true;
  const system = `You are a tutor asking open short answer questions on the provided study material.

Provide only one question.

Use the language used in the document.
You will get a list of questions you have already asked — do not repeat them.

Return ONLY a valid JSON object. No markdown, no code fences, no explanation, no extra text — just the raw JSON object.

<studymaterial>
${text}
</studymaterial>

<schema>
{"question": string, "correctanswer": string}
</schema>`;
  const prompt = questions.length > 0 ? JSON.stringify(questions) : 'No previus questions';
  const data = underConstruction
    ? 'Under construction'
    : (await callOllama(prompt, system, 'gemma4:e4b')).response;
  let JsonData: Object;
  try {
    JsonData = JSON.parse(data);
  } catch (e) {
    console.error(`Result could not be parsed. Error: ${e}. Data: ${data}`);
    return null;
  }
  JsonData = { ...JsonData, id: crypto.randomUUID() };
  const newQuestionData = JsonData;
  const result = QandASchema.safeParse(newQuestionData);
  if (result.success) {
    questions.push(result.data);
  } else {
    console.error(`Question was not valid. Error: ${result.error}`);
    return null;
  }
  isFetchingQuestion = false;
  return result.data;
}

export function storeAnswer(AiQuestion: string, UserAnswer: string) {
  for (const q of questions) {
    if (q.question == AiQuestion) {
      q.answer = UserAnswer;
      return;
    }
  }
  console.error('Question not in Database');
}

export async function getGrades() {
  const dataToGrade: QandA[] = [];
  for (const q of questions) {
    if (q.score == null && q.answer != null) {
      dataToGrade.push(q);
    }
  }
  if (dataToGrade.length > 0) {
    const system = `
    Your job is to grade the answer to a question based on notes. You will recieve the notes, the question and the answer and will have to grade every answer based on the following paramiters:
    correctnes: Is the answer correct? (scale of 0 to 10)
    completenes: Is the question completely answered? (scale of 0 to 10)
    score: (correctnes+completenes)/2. Round up or down as you see fit.
    <notes>${text}</notes}
    <example_retunrscema> {
    "correctness": 10,
    "completeness": 6,
    "score": 8
  } </example_returnscema>
   Return ONLY a valid JSON object. No markdown, no code fences, no explanation, no extra text — just the raw JSON object.
    `;
    for (const q of dataToGrade) {
      const rawGraid = await callOllama(JSON.stringify(q), system, 'gemma4:e4b');
      if (!rawGraid || typeof rawGraid.response !== 'string') {
        console.error(
          `Skipping Graid processing because rawGraid or its response field is invalid.`,
        );
        continue;
      }

      let parsedGraid: Partial<QandA>;
      try {
        parsedGraid = JSON.parse(rawGraid.response);
      } catch (e) {
        console.error(
          `Graid could not be parsed. Graid data: ${rawGraid.response}. Error: ${(e as Error).message}`,
        );
        continue;
      }
      const newMocGrade = {
        ...q,
        correctness: parsedGraid.correctness,
        completeness: parsedGraid.completeness,
        score: parsedGraid.score,
      };
      const newGrade = QandASchema.safeParse(newMocGrade);
      if (newGrade.success) {
        const index = questions.findIndex((item) => item.id == q.id);
        if (index !== -1) {
          questions[index] = newGrade.data;
        } else {
          console.warn(`Question(${q.question}) was not found in questions:${questions}.
            Searchquestion: ${newGrade.data}`);
        }
      } else {
        console.error(
          `New Grade could not be parsed as QandA. Error: ${newGrade.error} Grade${newMocGrade}`,
        );
      }
    }
  } else {
    return;
  }
}

export function getQandAs(): QandA[] {
  return questions;
}
