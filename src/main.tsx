import { createContext, StrictMode, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getQuestion } from './main';
import { storeAnswer } from './main';
import { getQandAs } from './main';
import type { QandA } from './main';
import { create } from 'zustand';
import './index.css';
import { getGrades } from './main';

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
    const neQuestions = getQandAs();
    set({ allQandAs: [...neQuestions] });
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
      <AnswersContainer />
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
      </form>
    </div>
  );
}

function CurrentQuestion() {
  const currentQandA = useQandA((state) => state.currentQandA);

  const currentQuestion = currentQandA ? currentQandA.question : 'There is no current question.';

  if (currentQandA?.answer != null || currentQandA == null) {
    return <p className="loading-text">New Question is loading</p>;
  } else {
    return (
      <div className="current-question-container">
        <p className="current-question">{currentQuestion}</p>
      </div>
    );
  }
}

function AnswersContainer() {
  const [isRevealed, toggleReveal] = useState(false);

  const handleToggle = () => {
    if (useQandA.getState().allQandAs.length > 0) {
      toggleReveal(!isRevealed);
    } else {
      toggleReveal(false);
    }
  };

  return (
    <div className="answers-container">
      <button className="reveal-answers-button" onClick={handleToggle}>
        Reveal Answers
      </button>
      <GradeAnswersButton />
      <AnswersDisplay isVisible={isRevealed} />
    </div>
  );
}

function GradeAnswersButton() {
  const [isGrading, toggleGrading] = useState(false);
  async function gradeAnswers() {
    await getGrades();
    useQandA.getState().updateAllQandAs();
    toggleGrading(false);
  }
  const handlePress = async () => {
    if (isGrading == false) {
      toggleGrading(true);
      await gradeAnswers();
    }
  };
  return <button onClick={handlePress}>{isGrading ? 'Is grading' : 'Grade Answers'}</button>;
}

function AnswersDisplay({ isVisible }: { isVisible: boolean }) {
  const questionlist: QandA[] = useQandA((state) => {
    return state.allQandAs;
  });

  if (isVisible) {
    return <ul>{questionlist.map((item, index) => AnswerCard(item, index))}</ul>;
  }

  return null;
}

function AnswerCard(item: QandA, number: number) {
  return (
    <li key={item.id}>
      <div>
        <span className="question-cell">{item.question}</span>
        <span className="user-answer-cell">{item.answer}</span>
        <span className="correct-answer-cell">
          {item.correctanswer ? item.correctanswer : 'No correct answer provided'}
        </span>
        <span className="corectness-cell">
          {item.completeness ? `Corectness: ${item.correctness}` : ''}
        </span>
        <span className="completness-cell">
          {item.completeness ? `Completnes: ${item.completeness}` : ''}
        </span>
        <span className="score-cell">{item.score ? `Score: ${item.score}` : ''}</span>
      </div>
    </li>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
