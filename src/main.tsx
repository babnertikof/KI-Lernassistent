import { createContext, StrictMode, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  getQuestion,
  getIsFetchingQuestion,
  storeAnswer,
  getQandAs,
  getGrades,
  uploadFile,
  getFileArray,
  removeFile,
} from './main';
import type { QandA, GenerationStatus } from './main';
import { create } from 'zustand';
import './index.css';
import type {} from './main';
import { ThemeProvider, createTheme } from '@mui/material/styles';

let hasInitializedQuestions = false;

interface QandAStore {
  currentQandA: QandA | null;
  allQandAs: QandA[];
  generationStatus: GenerationStatus;
  setCurrentQandA: (q: QandA | null) => void;
  updateAllQandAs: () => void;
  changeStatus: (s: GenerationStatus) => void;
}

const useQandA = create<QandAStore>((set) => ({
  currentQandA: null,
  allQandAs: [],
  generationStatus: { status: 'LOADING' },
  setCurrentQandA: (q) => set({ currentQandA: q }),
  updateAllQandAs() {
    const newQuestions = getQandAs();
    set({ allQandAs: [...newQuestions] });
  },
  changeStatus: (s) => set({ generationStatus: s }),
}));
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2', // Your desired primary color
    },
    secondary: {
      main: '#FFC107', // Your desired secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Set a global font
  },
});

async function manageQuestionRetrival() {
  if (useQandA.getState().currentQandA || getIsFetchingQuestion()) {
    return;
  }
  useQandA.getState().changeStatus({ status: 'LOADING' });
  const request = await getQuestion();
  const q = request.question;
  const s = request.Gstatus;
  if (request.Gstatus.status == 'SUCCES') {
    useQandA.getState().changeStatus(s);
    useQandA.getState().setCurrentQandA(q);
    useQandA.getState().updateAllQandAs();
  } else {
    useQandA.getState().changeStatus(s);
    console.warn(`Question Retriveal has not been succesful. Status: ${s.status}`);
  }
}

function App() {
  useEffect(() => {
    if (!hasInitializedQuestions) {
      hasInitializedQuestions = true;
      manageQuestionRetrival();
    }
  }, []);
  return (
    <div className="root-div">
      <StatButton />
      <FileMenu />
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
        manageQuestionRetrival();
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
  const currentStatus = useQandA((state) => state.generationStatus.status);

  const textToDisplay = (): string => {
    if (currentStatus == 'SUCCES') {
      if (currentQandA) {
        return currentQandA?.question;
      } else {
        console.error('no question although status is succes');
        return 'No question to display. Check console';
      }
    } else if (currentStatus == 'LOADING') {
      return 'Question is loading';
    } else if (currentStatus == 'NO FILES') {
      return 'No files to generate question.';
    } else if (currentStatus == 'GENERATION_ERROR') {
      return 'Error generating Question';
    } else if (currentStatus == 'UNDER_CONSTRUCTION') {
      return 'Under Construction';
    }
    return 'No Status, check console.';
  };
  return (
    <div className="current-question-container">
      <p className="current-question">{textToDisplay()}</p>
    </div>
  );
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

function AnswerCard(item: QandA, _number: number) {
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
          {item.completeness ? `Completenes: ${item.completeness}` : ''}
        </span>
        <span className="score-cell">{item.score ? `Score: ${item.score}` : ''}</span>
      </div>
    </li>
  );
}

function FileMenu() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isVisisble, changeVisibilety] = useState(false);

  function addFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files == null) {
      return;
    }
    for (const file of files) {
      uploadFile(file);
    }
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) {
      input.value = '';
    } else {
      console.warn('Could not find file-input');
    }
    setUploadedFiles(getFileArray());
    if (useQandA.getState().generationStatus.status == 'NO FILES') {
      manageQuestionRetrival();
    }
  }

  function deleteFile(file: File) {
    removeFile(file);
    setUploadedFiles(getFileArray());
  }

  return (
    <div className="file-menu-container">
      <input
        className="file-input"
        type="file"
        accept=".md,.txt"
        onChange={addFile}
        id="file-input"
      ></input>
      <button
        className="file-menu-button"
        onClick={() => {
          changeVisibilety(!isVisisble);
        }}
      >
        Toggle file Menut
      </button>
      {isVisisble ? (
        <ul className="file-list">{uploadedFiles.map((item) => FileItem(item, deleteFile))}</ul>
      ) : null}
    </div>
  );
}

function FileItem(file: File, onDelete: (file: File) => void) {
  return (
    <li key={file.size}>
      <h3>{file.name}</h3>
      <button onClick={() => onDelete(file)}>Delete File</button>
    </li>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {' '}
      {/* <-- WRAP <App /> HERE */}
      <App />
    </ThemeProvider>
  </StrictMode>,
);
