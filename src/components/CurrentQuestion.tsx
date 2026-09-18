import { Card, Typography } from '@mui/material';
import { useQandAStore } from '../store/useQandAStore';

const cardSx = {
  p: 2,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: 'background.paper',
};

export default function CurrentQuestion() {
  const currentQandA = useQandAStore((state) => state.currentQandA);
  const currentStatus = useQandAStore((state) => state.generationStatus.status);

  const textToDisplay = (): string => {
    if (currentStatus === 'SUCCES') {
      if (currentQandA) {
        return currentQandA.question;
      } else {
        console.error('No question although status is succes');
        return 'No question to display. Check console.';
      }
    } else if (currentStatus === 'LOADING') {
      return 'Question is loading...';
    } else if (currentStatus === 'NO FILES') {
      return 'No files to generate question. Please upload a study guide.';
    } else if (currentStatus === 'GENERATION_ERROR') {
      return 'Error generating Question';
    } else if (currentStatus === 'UNDER_CONSTRUCTION') {
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
          lineHeight: 1.3,
          maxWidth: 760,
        }}
      >
        {textToDisplay()}
      </Typography>
    </Card>
  );
}
