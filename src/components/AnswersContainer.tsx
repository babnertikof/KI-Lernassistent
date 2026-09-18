import { useState } from 'react';
import { Box, Button, Card, List, ListItem, Typography } from '@mui/material';
import { useQandAStore } from '../store/useQandAStore';
import type { QandA } from '../types';

const buttonSx = {
  borderRadius: 3,
  px: 2.2,
  py: 1,
  textTransform: 'none',
  minWidth: 120,
};

const answerListSx = {
  width: '100%',
  p: 0,
  mt: 2,
  display: 'grid',
  gap: 2,
};

const answerCardSx = {
  p: 3,
  borderRadius: 4,
  border: '1px solid rgba(148, 163, 184, 0.14)',
  backgroundColor: '#ffffff',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
  width: '100%',
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

export default function AnswersContainer() {
  const [isRevealed, toggleReveal] = useState(false);
  const questions = useQandAStore((state) => state.questions);

  const handleToggle = () => {
    if (questions.length > 0) {
      toggleReveal(!isRevealed);
    } else {
      toggleReveal(false);
    }
  };

  return (
    <div
      className="answers-container"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', width: '100%' }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
        <Button 
          variant="outlined" 
          sx={buttonSx} 
          onClick={handleToggle}
          disabled={questions.length === 0}
        >
          {isRevealed ? 'Hide Answers' : 'Reveal Answers'}
        </Button>
        <GradeAnswersButton />
      </Box>
      <AnswersDisplay isVisible={isRevealed} />
    </div>
  );
}

function GradeAnswersButton() {
  const [isGrading, toggleGrading] = useState(false);
  const gradeAnswers = useQandAStore((state) => state.gradeAnswers);
  const questions = useQandAStore((state) => state.questions);

  // Ungraded questions are ones that have answers but no score yet
  const hasUngradedAnswers = questions.some((q) => q.answer !== undefined && q.score === undefined);

  const handlePress = async () => {
    if (!isGrading && hasUngradedAnswers) {
      toggleGrading(true);
      await gradeAnswers();
      toggleGrading(false);
    }
  };

  return (
    <Button 
      variant="outlined" 
      onClick={handlePress} 
      sx={buttonSx}
      disabled={isGrading || !hasUngradedAnswers}
    >
      {isGrading ? 'Is Grading...' : 'Grade Answers'}
    </Button>
  );
}

function AnswersDisplay({ isVisible }: { isVisible: boolean }) {
  const questions = useQandAStore((state) => state.questions);

  if (isVisible && questions.length > 0) {
    return (
      <List sx={answerListSx}>
        {questions.map((item, index) => (
          <AnswerCard key={item.id || index} item={item} />
        ))}
      </List>
    );
  }

  return null;
}

function AnswerCard({ item }: { item: QandA }) {
  const meta: { key: string; label: string; value: unknown }[] = [];
  if (item.score !== undefined && item.score !== null)
    meta.push({ key: 'score', label: 'Score', value: item.score });
  if (item.correctness !== undefined && item.correctness !== null)
    meta.push({ key: 'correctness', label: 'Correctness', value: item.correctness });
  if (item.completeness !== undefined && item.completeness !== null)
    meta.push({ key: 'completeness', label: 'Completeness', value: item.completeness });

  return (
    <ListItem sx={{ p: 0, width: '100%' }} disableGutters>
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
          {item.correctanswer || 'No correct answer provided.'}
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
