import { useEffect, lazy, Suspense } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import FileMenu from './components/FileMenu';
import CurrentQuestion from './components/CurrentQuestion';
import AnswerBar from './components/AnswerBar';
import { useQandAStore } from './store/useQandAStore';
import { getAllFilesFromIndexedDB } from './services/storage';

// Heavy below-fold components loaded lazily for better initial bundle size
const SettingsPanel     = lazy(() => import('./components/SettingsPanel'));
const ProviderSettings  = lazy(() => import('./components/ProviderSettings'));
const WikiSearch        = lazy(() => import('./components/WikiSearch'));
const AnswersContainer  = lazy(() => import('./components/AnswersContainer'));

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

export default function App() {
  const fetchNextQuestion = useQandAStore((state) => state.fetchNextQuestion);
  const questions = useQandAStore((state) => state.questions);

  useEffect(() => {
    async function hydrateFiles() {
      try {
        const storedFiles = await getAllFilesFromIndexedDB();
        if (storedFiles.length > 0) {
          useQandAStore.setState({ files: storedFiles });
          
          // Hydration check: if no active question exists, fetch the next one
          const current = useQandAStore.getState().currentQandA;
          if (!current) {
            await fetchNextQuestion();
          }
        } else {
          useQandAStore.setState({
            generationStatus: { status: 'NO FILES' },
          });
        }
      } catch (error) {
        console.error('Failed to load files from IndexedDB on startup:', error);
      }
    }

    hydrateFiles();
  }, [fetchNextQuestion]);

  const handlePrintStats = () => {
    console.log('Current Q&A List:', questions);
  };

  return (
    <Box sx={layoutSx}>
      <Button variant="outlined" onClick={handlePrintStats} sx={buttonSx}>
        Print Stats
      </Button>
      <FileMenu />
      <CurrentQuestion />
      <AnswerBar />
      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>}>
        <SettingsPanel />
        <WikiSearch />
        <ProviderSettings />
        <AnswersContainer />
      </Suspense>
    </Box>
  );
}
