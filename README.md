# KI Lernassistent

A small study assistant for learning from your own notes and documents.

You can upload text files such as `.txt` or `.md`, let an AI generate questions from the material, answer the questions, and then get an automatic evaluation of your answer.

This project is built with React, TypeScript, Vite, and Material UI.

## What this app does

- Upload one or more study files
- Turn the content into short questions
- Show one question at a time
- Let the user answer in the browser
- Grade the answer with AI
- Work with different AI providers
- Save files locally in the browser

![alt text](image.png)

## Main features

### 1. File-based learning

The app accepts local text files and uses them as study material. Uploaded files are stored in IndexedDB, so they stay available in the browser without a backend database.

### 2. AI-generated questions

The app sends the uploaded material to the selected AI provider and generates questions based on it. It does not repeat questions that were already asked.

### 3. Answer and grading

After you answer a question, the app can grade the response using the same study content and compare it to the expected answer.

### 4. Multiple AI providers

The app supports:

- Ollama
- OpenAI
- Anthropic
- Gemini

You can choose the provider and model in the UI.

### 5. Custom prompts

You can edit the generation and grading prompts in the settings panel. This helps you adapt the questions to your own learning style.

## Tech stack

- React 19
- TypeScript
- Vite
- Material UI
- Zustand
- IndexedDB

## Requirements

Before starting the project, make sure you have:

- Node.js installed
- npm installed

## Installation

1. Open the project folder.
2. Run:

```bash
npm install
```

## Run locally

Start the app with:

```bash
npm run dev
```

Then open the local address shown by Vite, usually:

```text
http://localhost:5173
```

## AI setup

### Option 1: Ollama (local)

This is the default setup.

1. Install Ollama.
2. Start the Ollama server.
3. Make sure the base URL points to:

```text
http://localhost:11434
```

4. Select a model in the app.

### Option 2: Cloud providers

For OpenAI, Anthropic, or Gemini, add your API key in the app settings.

The app stores the key in browser local storage only.

## How to use

1. Upload your `.txt` or `.md` learning material.
2. Choose an AI provider and model.
3. Let the app generate the next question.
4. Type your answer.
5. Submit the answer.
6. Review the AI grading.
7. Repeat until you have worked through the material.

## Project structure

```text
src/
  components/       UI parts such as settings, file upload, and question view
  services/         AI provider logic, storage, and Wikipedia import
  store/            app state and question flow
  types/            shared TypeScript types
App.tsx             main app layout
main.tsx            app entry point
```

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
