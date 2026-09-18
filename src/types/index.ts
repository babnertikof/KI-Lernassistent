import * as z from 'zod';

export const QandASchema = z.object({
  question: z.string(),
  answer: z.string().optional(),
  correctanswer: z.string().optional(),
  correctness: z.number().min(0).max(10).optional(),
  completeness: z.number().min(0).max(10).optional(),
  score: z.number().min(0).max(10).optional(),
  id: z.string(),
});

export type QandA = z.infer<typeof QandASchema>;

export const ollamaGenerateResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  done: z.boolean(),
  done_reason: z.string().optional(),
  context: z.number().array().optional(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
});

export type OllamaGenerateResponse = z.infer<typeof ollamaGenerateResponseSchema>;

export type GenerationStatus = {
  status: 'SUCCES' | 'NO FILES' | 'GENERATION_ERROR' | 'UNDER_CONSTRUCTION' | 'LOADING';
};

// ─── LLM Provider Types ──────────────────────────────────────────────────────

export type LLMProvider = 'ollama' | 'openai' | 'anthropic' | 'gemini';

export interface LLMProviderConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;    // Not needed for Ollama
  baseUrl?: string;   // For Ollama custom URL
}

export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  ollama:    'Ollama (Local)',
  openai:    'OpenAI (ChatGPT)',
  anthropic: 'Anthropic (Claude)',
  gemini:    'Google (Gemini)',
};

export const DEFAULT_MODELS: Record<LLMProvider, string[]> = {
  ollama:    ['gemma4:e4b', 'gemma3:4b', 'llama3.2', 'mistral', 'phi4'],
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'],
  gemini:    ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
};
