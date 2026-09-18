import React, { useState } from 'react';
import { TextField } from '@mui/material';
import { useQandAStore } from '../store/useQandAStore';

const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: '#f8fafc',
    minHeight: 48,
  },
};

export default function AnswerBar() {
  const [answer, setAnswer] = useState('');
  const currentQandA = useQandAStore((state) => state.currentQandA);
  const submitAnswer = useQandAStore((state) => state.submitAnswer);

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (answer.trim() && currentQandA) {
      submitAnswer(answer.trim());
      setAnswer('');
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
          disabled={!currentQandA}
        />
      </form>
    </div>
  );
}
