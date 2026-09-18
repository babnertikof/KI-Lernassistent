import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import type { LLMProvider } from '../types';
import { PROVIDER_LABELS, DEFAULT_MODELS } from '../types';
import { useQandAStore } from '../store/useQandAStore';

const cardSx = {
  p: 3,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: 'background.paper',
  display: 'grid',
  gap: 2,
};

const labelSx = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#64748b',
  mb: 0.5,
};

const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#f8fafc' },
};

export default function ProviderSettings() {
  const providerConfig = useQandAStore((s) => s.providerConfig);
  const apiKeys       = useQandAStore((s) => s.apiKeys);
  const setProvider   = useQandAStore((s) => s.setProvider);
  const setModel      = useQandAStore((s) => s.setModel);
  const setApiKey     = useQandAStore((s) => s.setApiKey);
  const setOllamaBaseUrl = useQandAStore((s) => s.setOllamaBaseUrl);

  const [showKey, setShowKey] = useState(false);
  const provider = providerConfig.provider as LLMProvider;
  const needsKey = provider !== 'ollama';
  const models   = DEFAULT_MODELS[provider];

  return (
    <Card variant="outlined" sx={cardSx}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
        🤖 AI Provider
      </Typography>

      {/* Provider selector */}
      <Box>
        <Typography sx={labelSx}>Provider</Typography>
        <Select
          size="small"
          fullWidth
          value={provider}
          onChange={(e) => setProvider(e.target.value as LLMProvider)}
          sx={{ borderRadius: 2, backgroundColor: '#f8fafc' }}
        >
          {(Object.entries(PROVIDER_LABELS) as [LLMProvider, string][]).map(([val, label]) => (
            <MenuItem key={val} value={val}>{label}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Model selector */}
      <Box>
        <Typography sx={labelSx}>Model</Typography>
        <Select
          size="small"
          fullWidth
          value={models.includes(providerConfig.model) ? providerConfig.model : models[0]}
          onChange={(e) => setModel(e.target.value)}
          sx={{ borderRadius: 2, backgroundColor: '#f8fafc' }}
        >
          {models.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Ollama base URL */}
      {provider === 'ollama' && (
        <Box>
          <Typography sx={labelSx}>Ollama Base URL</Typography>
          <TextField
            size="small"
            fullWidth
            value={providerConfig.baseUrl ?? 'http://localhost:11434'}
            onChange={(e) => setOllamaBaseUrl(e.target.value)}
            sx={inputSx}
            placeholder="http://localhost:11434"
          />
        </Box>
      )}

      {/* API Key for cloud providers */}
      {needsKey && (
        <>
          <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />
          <Box>
            <Typography sx={labelSx}>{PROVIDER_LABELS[provider]} API Key</Typography>
            <TextField
              size="small"
              fullWidth
              type={showKey ? 'text' : 'password'}
              placeholder="Paste your API key..."
              value={apiKeys[provider]}
              onChange={(e) => setApiKey(provider, e.target.value)}
              sx={inputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowKey((v) => !v)}
                        aria-label={showKey ? 'Hide API key' : 'Show API key'}
                      >
                        {showKey ? '🙈' : '👁️'}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
              Stored only in your browser's local storage. Never sent anywhere except the provider's API.
            </Typography>
          </Box>
        </>
      )}
    </Card>
  );
}
