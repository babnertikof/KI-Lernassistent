import { StrictMode, useEffect, useState } from 'react';
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
import { Box, Button, Card, List, ListItem, TextField, Typography } from '@mui/material';

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
      main: '#0f172a',
    },
    secondary: {
      main: '#64748b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
});

const layoutSx = {
  mx: 'auto',
  width: '100%',
  maxWidth: 920,
  display: 'grid',
  gap: 2,
  p: 3,
};

const buttonSx = {
  borderRadius: 3,
  px: 2.2,
  py: 1,
  textTransform: 'none',
  minWidth: 120,
};

const cardSx = {
  p: 2,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: 'background.paper',
};

const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: '#f8fafc',
    minHeight: 48,
  },
};

const fileListSx = {
  width: '100%',
  p: 0,
  m: 0,
  display: 'grid',
  gap: 1.5,
};

const fileItemSx = {
  p: 2,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
};

const fileButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 3,
  px: 2,
  py: 0.8,
};

const fileNameSx = {
  margin: 0,
  fontSize: '0.98rem',
  fontWeight: 700,
  color: '#0f172a',
  wordBreak: 'break-word',
};

const answerListSx = {
  width: '100%',
  p: 0,
  mt: 1,
  display: 'grid',
  gap: 2,
};

const answerCardSx = {
  p: 3,
  borderRadius: 4,
  border: '1px solid rgba(148, 163, 184, 0.14)',
  backgroundColor: '#ffffff',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
};

const answerSectionTitleSx = {
  margin: 0,
  fontSize: '0.96rem',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  mb: 1,
};

const answerTextSx = {
  margin: 0,
  color: '#0f172a',
  fontSize: '0.98rem',
  lineHeight: 1.75,
};

const answerDetailSx = {
  mt: 1,
  color: '#475569',
  fontSize: '0.88rem',
};

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
    <Box sx={layoutSx}>
      <StatButton />
      <FileMenu />
      <AnswerBar />
      <CurrentQuestion />
      <AnswersContainer />
    </Box>
  );
}

function StatButton() {
  const [stats, changeStats] = useState({});

  function handlePress() {
    changeStats(getQandAs);
    console.log(stats);
  }

  return (
    <Button variant="outlined" onClick={() => handlePress()} sx={buttonSx}>
      Print Stats
    </Button>
  );
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
    <div className="answer-input-container" style={{ width: '100%' }}>
      <form onSubmit={handleSend} className="answer-form">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Type answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          sx={inputSx}
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
    <Card
      variant="outlined"
      sx={{
        ...cardSx,
        minHeight: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 4,
        py: 3,
      }}
    >
      <Typography
        component="h3"
        variant="h6"
        sx={{
          margin: 0,
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '0.06em',
          lineHeight: 1.3,
          maxWidth: 760,
        }}
      >
        {textToDisplay()}
      </Typography>
    </Card>
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
    <div
      className="answers-container"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}
    >
      <Button variant="outlined" sx={buttonSx} onClick={handleToggle}>
        Reveal Answers
      </Button>
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
  return (
    <Button variant="outlined" onClick={handlePress} sx={buttonSx}>
      {isGrading ? 'Is grading' : 'Grade Answers'}
    </Button>
  );
}

function AnswersDisplay({ isVisible }: { isVisible: boolean }) {
  const questionlist: QandA[] = useQandA((state) => {
    return state.allQandAs;
  });

  if (isVisible) {
    return (
      <List sx={answerListSx}>{questionlist.map((item, index) => AnswerCard(item, index))}</List>
    );
  }

  return null;
}

function AnswerCard(item: QandA, _number: number) {
  // Build metadata entries in a predictable order
  const meta: { key: string; label: string; value: unknown }[] = [];
  if (item.score !== undefined && item.score !== null)
    meta.push({ key: 'score', label: 'Score', value: item.score });
  if (item.correctness !== undefined && item.correctness !== null)
    meta.push({ key: 'correctness', label: 'Correctness', value: item.correctness });
  if (item.completeness !== undefined && item.completeness !== null)
    meta.push({ key: 'completeness', label: 'Completeness', value: item.completeness });

  return (
    <ListItem key={item.id} sx={{ p: 0, width: '100%' }} disableGutters>
      <Card variant="outlined" sx={answerCardSx}>
        <Typography component="p" sx={answerSectionTitleSx}>
          Question
        </Typography>
        <Typography sx={answerTextSx}>{item.question}</Typography>

        <Typography component="p" sx={{ ...answerSectionTitleSx, mt: 2 }}>
          Your Answer
        </Typography>
        <Typography sx={answerTextSx}>{item.answer || 'No answer provided yet.'}</Typography>

        <Typography component="p" sx={{ ...answerSectionTitleSx, mt: 2 }}>
          Correct Answer
        </Typography>
        <Typography sx={answerTextSx}>
          {item.correctanswer || 'No correct answer provided'}
        </Typography>

        {meta.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {meta.map((m) => (
              <Box
                key={m.key}
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(15,23,42,0.04)',
                  border: '1px solid rgba(15,23,42,0.06)',
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Typography component="span" sx={{ fontSize: '0.82rem', color: '#475569' }}>
                  {m.label}:
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}
                >
                  {String(m.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </ListItem>
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
    <Card
      variant="outlined"
      sx={{
        ...cardSx,
        display: 'grid',
        gap: 1.5,
        alignItems: 'center',
        justifySelf: 'center',
        width: '100%',
        maxWidth: 720,
      }}
    >
      <Button variant="outlined" component="label" sx={buttonSx}>
        Upload File
        <input type="file" accept=".md,.txt" onChange={addFile} hidden />
      </Button>
      <Button
        variant="outlined"
        sx={buttonSx}
        onClick={() => {
          if (uploadedFiles.length > 0) {
            changeVisibilety(!isVisisble);
          }
        }}
      >
        Toggle file Menu
      </Button>
      {isVisisble ? (
        <List sx={fileListSx}>{uploadedFiles.map((item) => FileItem(item, deleteFile))}</List>
      ) : null}
    </Card>
  );
}

function FileItem(file: File, onDelete: (file: File) => void) {
  return (
    <ListItem key={file.size} sx={fileItemSx} disableGutters>
      <Typography component="h3" sx={fileNameSx}>
        {file.name}
      </Typography>
      <Button variant="outlined" onClick={() => onDelete(file)} sx={fileButtonSx}>
        Delete File
      </Button>
    </ListItem>
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
