import { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  TextField, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip
} from '@mui/material';
import { useQandAStore } from '../store/useQandAStore';

const cardSx = {
  p: 3,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: 'background.paper',
  width: '100%',
  display: 'grid',
  gap: 2,
};

const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: '#f8fafc',
  },
};

const buttonSx = {
  borderRadius: 3,
  px: 2.2,
  py: 1,
  textTransform: 'none',
  minWidth: 100,
};

const suggestions = [
  { label: 'Ask in German 🇩🇪', text: 'Please generate the question and expected answer in German.' },
  { label: 'Ask in English 🇬🇧', text: 'Please generate the question and expected answer in English.' },
  { label: 'Focus on definitions 📝', text: 'Focus questions on key definitions, terms, and core concepts.' },
  { label: 'Multiple-choice format ❓', text: 'Format the question as a multiple-choice question with options A, B, C, D.' },
];

export default function SettingsPanel() {
  const customInstructions = useQandAStore((state) => state.customInstructions);
  const setCustomInstructions = useQandAStore((state) => state.setCustomInstructions);
  
  const generationPrompt = useQandAStore((state) => state.generationPrompt);
  const setGenerationPrompt = useQandAStore((state) => state.setGenerationPrompt);
  
  const gradingPrompt = useQandAStore((state) => state.gradingPrompt);
  const setGradingPrompt = useQandAStore((state) => state.setGradingPrompt);
  
  const resetPrompts = useQandAStore((state) => state.resetPrompts);

  const [localInstructions, setLocalInstructions] = useState(customInstructions);
  const [localGenPrompt, setLocalGenPrompt] = useState(generationPrompt);
  const [localGradPrompt, setLocalGradPrompt] = useState(gradingPrompt);

  const handleSaveInstructions = () => {
    setCustomInstructions(localInstructions);
  };

  const handleSaveDeveloperSettings = () => {
    setGenerationPrompt(localGenPrompt);
    setGradingPrompt(localGradPrompt);
  };

  const handleReset = () => {
    resetPrompts();
    setLocalInstructions('');
    setLocalGenPrompt(useQandAStore.getState().generationPrompt);
    setLocalGradPrompt(useQandAStore.getState().gradingPrompt);
  };

  const handleChipClick = (text: string) => {
    let updated = localInstructions.trim();
    if (updated.includes(text)) return;
    
    updated = updated ? `${updated}\n${text}` : text;
    setLocalInstructions(updated);
    setCustomInstructions(updated);
  };

  return (
    <Card variant="outlined" sx={cardSx}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
        ⚙️ Settings & Customization
      </Typography>

      {/* Guidelines text area */}
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569' }}>
          Tutor Guidelines (Instructions)
        </Typography>
        <TextField
          multiline
          rows={3}
          variant="outlined"
          placeholder="E.g., Ask only multiple-choice questions, ask in German, focus on definitions..."
          value={localInstructions}
          onChange={(e) => setLocalInstructions(e.target.value)}
          onBlur={handleSaveInstructions}
          sx={inputSx}
        />
        
        {/* Suggestion Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
          {suggestions.map((s, idx) => (
            <Chip 
              key={idx} 
              label={s.label} 
              onClick={() => handleChipClick(s.text)} 
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1.5, borderColor: 'rgba(148, 163, 184, 0.3)' }}
            />
          ))}
        </Box>
      </Box>

      {/* Developer Prompt Settings Accordion */}
      <Accordion variant="outlined" sx={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
        <AccordionSummary 
          expandIcon={<span>▼</span>} 
          sx={{ px: 0, '& .MuiAccordionSummary-content': { margin: 0 } }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569' }}>
            🛠️ Developer Prompt Settings
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
              System Generation Prompt Template (use <code>{"{{studyMaterial}}"}</code> placeholder)
            </Typography>
            <TextField
              multiline
              rows={6}
              variant="outlined"
              value={localGenPrompt}
              onChange={(e) => setLocalGenPrompt(e.target.value)}
              sx={{ ...inputSx, '& .MuiOutlinedInput-input': { fontFamily: 'monospace', fontSize: '0.82rem' } }}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
              System Grading Prompt Template (use <code>{"{{studyMaterial}}"}</code> placeholder)
            </Typography>
            <TextField
              multiline
              rows={6}
              variant="outlined"
              value={localGradPrompt}
              onChange={(e) => setLocalGradPrompt(e.target.value)}
              sx={{ ...inputSx, '& .MuiOutlinedInput-input': { fontFamily: 'monospace', fontSize: '0.82rem' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
            <Button variant="outlined" onClick={handleReset} sx={buttonSx} color="error">
              Reset Defaults
            </Button>
            <Button variant="contained" onClick={handleSaveDeveloperSettings} sx={buttonSx}>
              Save Templates
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}
