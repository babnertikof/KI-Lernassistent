import { createContext, StrictMode, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getQuestion } from './main';
import { storeAnswer } from './main';
import { getQandAs } from './main';
import type { QandA } from './main';
import { create } from 'zustand';
import './index.css';

let hasInitializedQuestions = false;

interface QandAStore {
  currentQandA: QandA | null;
  allQandAs: QandA[];
  setCurrentQandA: (q: QandA | null) => void;
  updateAllQandAs: () => void;
}

const useQandA = create<QandAStore>((set) => ({
  currentQandA: null,
  allQandAs: [],
  setCurrentQandA: (q) => set({ currentQandA: q }),
  updateAllQandAs() {
    set({ allQandAs: getQandAs() });
  },
}));

function App() {
  useEffect(() => {
    if (!hasInitializedQuestions) {
      hasInitializedQuestions = true;
      const setupCurrentQuestion = async () => {
        const q = await getQuestion();
        if (q) {
          useQandA.getState().setCurrentQandA(q);
        } else {
          console.error('Failed to load initial question');
        }
        useQandA.getState().updateAllQandAs();
      };
      setupCurrentQuestion();
    }
  }, []);
  return (
    <div className="root-div">
      <StatButton />
      <AnswerBar />
      <CurrentQuestion />
    </div>
  );
}

function StatButton() {
  const [stats, changeStats] = useState({});

  function handlePress() {
    changeStats(getQandAs);
    console.log(stats);
  }

  return <button onClick={() => handlePress()}>Print Stats</button>;
}

function AnswerBar() {
  const [answer, setAnswer] = useState('');

  const handleSend = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if (answer.trim()) {
      const current = useQandA.getState().currentQandA?.question;
      if (current) {
        storeAnswer(current, answer);
        setAnswer('');
        useQandA.getState().setCurrentQandA(null);
        useQandA.getState().updateAllQandAs();
        const newQ = await getQuestion();
        if (newQ) {
          useQandA.getState().setCurrentQandA(newQ);
          useQandA.getState().updateAllQandAs();
        } else {
          console.error('Failed to fetch next question');
        }
      }
    }
  };
  return (
    <div className="answer-input-container">
      <form onSubmit={handleSend} className="answer-form">
        <input
          className="answer-input"
          type="text"
          placeholder="Type answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button type="submit" className="send-button" disabled={!answer.trim()}></button>
      </form>
    </div>
  );
}

function CurrentQuestion() {
  const currentQandA = useQandA((state) => state.currentQandA);

  const currentQuestion = currentQandA ? currentQandA.question : 'There is no current question.';

  if (currentQandA?.answer != null || currentQandA == null) {
    return <p>New Question is loading</p>;
  } else {
    return (
      <div className="current-question-container">
        <h1 className="current-question">{currentQuestion}</h1>
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
