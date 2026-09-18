/**
 * Unified AI Client – routes requests to the selected LLM provider.
 *
 * All providers expose the same two-argument contract:
 *   callProvider(system: string, userMessage: string, config: LLMProviderConfig): Promise<string>
 *
 * Higher-level helpers (generateQuestion / gradeAnswer) call this unified
 * function so the rest of the app never needs to know which provider is active.
 */

import { QandASchema } from '../types';
import type { QandA, LLMProviderConfig } from '../types';

// ─── Prompt Templates ────────────────────────────────────────────────────────

export const DEFAULT_GENERATION_PROMPT = `You are a tutor asking open short answer questions on the provided study material.

Provide only one question.

Use the language used in the document.
You will get a list of questions you have already asked — do not repeat them.

Return ONLY a valid JSON object. No markdown, no code fences, no explanation, no extra text — just the raw JSON object.

<studymaterial>
{{studyMaterial}}
</studymaterial>

<schema>
{"question": "What is the main idea?", "correctanswer": "A concise answer based on the study material."}
</schema>`;

export const DEFAULT_GRADING_PROMPT = `Your job is to grade the answer to a question based on notes. You will receive the notes, the question and the answer and will have to grade every answer based on the following parameters:
  correctness: Is the answer correct? (scale of 0 to 10)
  completeness: Is the question completely answered? (scale of 0 to 10)
  score: (correctness+completeness)/2. Round up or down as you see fit.

  <notes>{{studyMaterial}}</notes>

  <example_returnschema>
  {
    "correctness": 10,
    "completeness": 6,
    "score": 8
  }
  </example_returnschema>

  Return ONLY a valid JSON object. No markdown, no code fences, no explanation, no extra text — just the raw JSON object.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match) cleaned = match[1].trim();

  if (!cleaned.startsWith('{')) {
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart !== -1 && objectEnd > objectStart) {
      cleaned = cleaned.slice(objectStart, objectEnd + 1);
    }
  }

  return cleaned;
}

// ─── Provider implementations ────────────────────────────────────────────────

async function callOllama(
  system: string,
  userMessage: string,
  config: LLMProviderConfig,
): Promise<string> {
  const baseUrl = config.baseUrl || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: userMessage,
      system,
      keep_alive: '10m',
      stream: false,
      format: 'json',
    }),
  });
  if (!response.ok) throw new Error(`Ollama request failed: ${response.status}`);
  const data = await response.json();
  return data.response as string;
}

async function callOpenAI(
  system: string,
  userMessage: string,
  config: LLMProviderConfig,
): Promise<string> {
  if (!config.apiKey) throw new Error('OpenAI API key is required.');
  // Routed through Vite dev-server proxy → https://api.openai.com
  const response = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} – ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content as string;
}

async function callAnthropic(
  system: string,
  userMessage: string,
  config: LLMProviderConfig,
): Promise<string> {
  if (!config.apiKey) throw new Error('Anthropic API key is required.');
  // Routed through Vite dev-server proxy → https://api.anthropic.com
  // (Anthropic blocks direct browser requests via CORS by design)
  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic request failed: ${response.status} – ${err}`);
  }
  const data = await response.json();
  return data.content[0].text as string;
}

async function callGemini(
  system: string,
  userMessage: string,
  config: LLMProviderConfig,
): Promise<string> {
  if (!config.apiKey) throw new Error('Gemini API key is required.');
  // Routed through Vite dev-server proxy → https://generativelanguage.googleapis.com
  const path = `/api/gemini/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini request failed: ${response.status} – ${err}`);
  }
  const data = await response.json();
  return data.candidates[0].content.parts[0].text as string;
}

// ─── Unified entry point ─────────────────────────────────────────────────────

export async function callProvider(
  system: string,
  userMessage: string,
  config: LLMProviderConfig,
): Promise<string> {
  switch (config.provider) {
    case 'ollama':    return callOllama(system, userMessage, config);
    case 'openai':    return callOpenAI(system, userMessage, config);
    case 'anthropic': return callAnthropic(system, userMessage, config);
    case 'gemini':    return callGemini(system, userMessage, config);
    default:
      throw new Error(`Unknown provider: ${(config as LLMProviderConfig).provider}`);
  }
}

// ─── High-level helpers ───────────────────────────────────────────────────────

export async function generateQuestion(
  fileContents: string,
  previousQuestions: QandA[],
  systemPromptTemplate: string = DEFAULT_GENERATION_PROMPT,
  customInstructions: string = '',
  providerConfig: LLMProviderConfig,
): Promise<{ question: QandA | null; status: 'SUCCES' | 'GENERATION_ERROR' }> {
  let system = systemPromptTemplate.replace('{{studyMaterial}}', fileContents);
  if (customInstructions.trim()) {
    system += `\n\nCRITICAL USER GUIDELINES: ${customInstructions.trim()}`;
  }

  const userMessage =
    previousQuestions.length > 0
      ? JSON.stringify(previousQuestions.map((q) => ({ question: q.question, answer: q.answer })))
      : 'No previous questions';

  try {
    const raw = await callProvider(system, userMessage, providerConfig);
    const cleaned = cleanJsonResponse(raw);
    const jsonData = { ...JSON.parse(cleaned), id: crypto.randomUUID() };

    const parsed = QandASchema.safeParse(jsonData);
    if (parsed.success) return { question: parsed.data, status: 'SUCCES' };
    console.error('Question validation failed:', parsed.error, jsonData);
    return { question: null, status: 'GENERATION_ERROR' };
  } catch (error) {
    console.error('Failed to generate question:', error);
    return { question: null, status: 'GENERATION_ERROR' };
  }
}

export async function gradeAnswer(
  fileContents: string,
  question: QandA,
  systemPromptTemplate: string = DEFAULT_GRADING_PROMPT,
  providerConfig: LLMProviderConfig,
): Promise<{ correctness: number; completeness: number; score: number } | null> {
  const system = systemPromptTemplate.replace('{{studyMaterial}}', fileContents);
  const userMessage = JSON.stringify({
    question: question.question,
    answer: question.answer,
    correctanswer: question.correctanswer,
  });

  try {
    const raw = await callProvider(system, userMessage, providerConfig);
    const cleaned = cleanJsonResponse(raw);
    const p = JSON.parse(cleaned);

    const correctness =
      typeof p.correctness === 'number' ? p.correctness :
      typeof p.correctnes === 'number'  ? p.correctnes  : 0;
    const completeness =
      typeof p.completeness === 'number' ? p.completeness :
      typeof p.completenes === 'number'  ? p.completenes  : 0;
    const score =
      typeof p.score === 'number' ? p.score : Math.round((correctness + completeness) / 2);

    return { correctness, completeness, score };
  } catch (error) {
    console.error('Failed to grade answer:', error);
    return null;
  }
}
