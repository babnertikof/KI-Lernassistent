import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QandA, GenerationStatus, LLMProvider, LLMProviderConfig } from '../types';
import { DEFAULT_MODELS } from '../types';
import {
  generateQuestion,
  gradeAnswer,
  DEFAULT_GENERATION_PROMPT,
  DEFAULT_GRADING_PROMPT,
} from '../services/aiClient';
import { saveFileToIndexedDB, deleteFileFromIndexedDB } from '../services/storage';

interface QandAStore {
  questions: QandA[];
  files: File[];
  currentQandA: QandA | null;
  generationStatus: GenerationStatus;
  isFetchingQuestion: boolean;

  // Prompt customization
  customInstructions: string;
  generationPrompt: string;
  gradingPrompt: string;

  // LLM provider config
  providerConfig: LLMProviderConfig;
  apiKeys: Record<LLMProvider, string>;

  // File actions
  uploadFile: (file: File) => Promise<void>;
  removeFile: (file: File) => Promise<void>;

  // Question & grading actions
  fetchNextQuestion: () => Promise<void>;
  submitAnswer: (answerText: string) => void;
  gradeAnswers: () => Promise<void>;

  // Customization actions
  setCustomInstructions: (instructions: string) => void;
  setGenerationPrompt: (prompt: string) => void;
  setGradingPrompt: (prompt: string) => void;
  resetPrompts: () => void;

  // Provider actions
  setProvider: (provider: LLMProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (provider: LLMProvider, key: string) => void;
  setOllamaBaseUrl: (url: string) => void;
}

async function getFileContents(files: File[]): Promise<string> {
  const parts: string[] = [];
  for (const file of files) {
    const content = await file.text();
    parts.push(`File: ${file.name}\n${content}`);
  }
  return parts.join('\n\n');
}

const DEFAULT_PROVIDER_CONFIG: LLMProviderConfig = {
  provider: 'ollama',
  model: DEFAULT_MODELS.ollama[0],
  baseUrl: 'http://localhost:11434',
};

export const useQandAStore = create<QandAStore>()(
  persist(
    (set, get) => ({
      questions: [],
      files: [],
      currentQandA: null,
      generationStatus: { status: 'LOADING' },
      isFetchingQuestion: false,

      customInstructions: '',
      generationPrompt: DEFAULT_GENERATION_PROMPT,
      gradingPrompt: DEFAULT_GRADING_PROMPT,

      providerConfig: DEFAULT_PROVIDER_CONFIG,
      apiKeys: { ollama: '', openai: '', anthropic: '', gemini: '' },

      // ── File actions ────────────────────────────────────────────────────────

      uploadFile: async (newFile: File) => {
        const { files } = get();
        if (files.some((f) => f.name === newFile.name)) return;

        try {
          await saveFileToIndexedDB(newFile);
        } catch (error) {
          console.error('Failed to save file to IndexedDB:', error);
        }

        set({ files: [...files, newFile] });

        const status = get().generationStatus.status;
        if (status === 'NO FILES' || status === 'LOADING') {
          get().fetchNextQuestion();
        }
      },

      removeFile: async (fileToRemove: File) => {
        const { files } = get();
        const updatedFiles = files.filter((f) => f.name !== fileToRemove.name);

        try {
          await deleteFileFromIndexedDB(fileToRemove.name);
        } catch (error) {
          console.error('Failed to delete file from IndexedDB:', error);
        }

        if (updatedFiles.length === 0) {
          set({ files: updatedFiles, currentQandA: null, generationStatus: { status: 'NO FILES' } });
        } else {
          set({ files: updatedFiles });
        }
      },

      // ── Question / grading actions ──────────────────────────────────────────

      fetchNextQuestion: async () => {
        if (get().currentQandA || get().isFetchingQuestion) return;

        set({ isFetchingQuestion: true, generationStatus: { status: 'LOADING' } });

        const files = get().files;
        if (files.length < 1) {
          set({ isFetchingQuestion: false, generationStatus: { status: 'NO FILES' } });
          return;
        }

        try {
          const fileContents = await getFileContents(files);
          const { generationPrompt, customInstructions, providerConfig, apiKeys } = get();

          const activeConfig: LLMProviderConfig = {
            ...providerConfig,
            apiKey: apiKeys[providerConfig.provider] || undefined,
          };

          const result = await generateQuestion(
            fileContents,
            get().questions,
            generationPrompt,
            customInstructions,
            activeConfig,
          );

          if (result.status === 'SUCCES' && result.question) {
            set((state) => ({
              questions: [...state.questions, result.question!],
              currentQandA: result.question,
              generationStatus: { status: 'SUCCES' },
              isFetchingQuestion: false,
            }));
          } else {
            set({ generationStatus: { status: 'GENERATION_ERROR' }, isFetchingQuestion: false });
          }
        } catch (error) {
          console.error('Failed to fetch next question:', error);
          set({ generationStatus: { status: 'GENERATION_ERROR' }, isFetchingQuestion: false });
        }
      },

      submitAnswer: (answerText: string) => {
        const currentQandA = get().currentQandA;
        if (!currentQandA) return;

        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === currentQandA.id ? { ...q, answer: answerText } : q,
          ),
          currentQandA: null,
        }));

        get().fetchNextQuestion();
      },

      gradeAnswers: async () => {
        const files = get().files;
        const dataToGrade = get().questions.filter((q) => q.score == null && q.answer != null);
        if (dataToGrade.length === 0) return;

        try {
          const fileContents = await getFileContents(files);
          const { gradingPrompt, providerConfig, apiKeys } = get();

          const activeConfig: LLMProviderConfig = {
            ...providerConfig,
            apiKey: apiKeys[providerConfig.provider] || undefined,
          };

          for (const q of dataToGrade) {
            const gradeResult = await gradeAnswer(fileContents, q, gradingPrompt, activeConfig);
            if (gradeResult) {
              set((state) => ({
                questions: state.questions.map((item) =>
                  item.id === q.id
                    ? { ...item, ...gradeResult }
                    : item,
                ),
              }));
            }
          }
        } catch (error) {
          console.error('Failed grading questions:', error);
        }
      },

      // ── Prompt customization ────────────────────────────────────────────────

      setCustomInstructions: (instructions) => set({ customInstructions: instructions }),
      setGenerationPrompt:   (prompt)       => set({ generationPrompt: prompt }),
      setGradingPrompt:      (prompt)       => set({ gradingPrompt: prompt }),

      resetPrompts: () =>
        set({
          generationPrompt: DEFAULT_GENERATION_PROMPT,
          gradingPrompt: DEFAULT_GRADING_PROMPT,
          customInstructions: '',
        }),

      // ── Provider actions ────────────────────────────────────────────────────

      setProvider: (provider) => {
        set((state) => ({
          providerConfig: {
            ...state.providerConfig,
            provider,
            model: DEFAULT_MODELS[provider][0],
          },
        }));
      },

      setModel: (model) =>
        set((state) => ({ providerConfig: { ...state.providerConfig, model } })),

      setApiKey: (provider, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),

      setOllamaBaseUrl: (url) =>
        set((state) => ({ providerConfig: { ...state.providerConfig, baseUrl: url } })),
    }),
    {
      name: 'ki-lernassistent-store',
      partialize: (state) => ({
        questions:          state.questions,
        currentQandA:       state.currentQandA,
        generationStatus:   state.generationStatus,
        customInstructions: state.customInstructions,
        generationPrompt:   state.generationPrompt,
        gradingPrompt:      state.gradingPrompt,
        providerConfig:     state.providerConfig,
        apiKeys:            state.apiKeys,
      }),
    },
  ),
);
