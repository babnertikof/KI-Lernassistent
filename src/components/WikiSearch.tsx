import { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Divider,
} from '@mui/material';
import { searchWikipedia, fetchWikipediaArticle } from '../services/wiki';
import type { WikiSearchResult } from '../services/wiki';
import { useQandAStore } from '../store/useQandAStore';
import { saveFileToIndexedDB } from '../services/storage';

const cardSx = {
  p: 3,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: 'background.paper',
  display: 'grid',
  gap: 2,
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#f8fafc',
  },
};

const buttonSx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  px: 2.5,
  flexShrink: 0,
};

export default function WikiSearch() {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<WikiSearchResult[]>([]);
  const [searching, setSearching]   = useState(false);
  const [importing, setImporting]   = useState<string | null>(null);
  const [importedTitles, setImportedTitles] = useState<string[]>([]);
  const [error, setError]           = useState<string | null>(null);

  const uploadFile   = useQandAStore((s) => s.uploadFile);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const res = await searchWikipedia(q);
      setResults(res);
      if (res.length === 0) setError('No results found. Try a different query.');
    } catch (e) {
      setError('Wikipedia search failed. Check your network connection.');
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (result: WikiSearchResult) => {
    if (importedTitles.includes(result.title)) return;
    setImporting(result.key);
    setError(null);
    try {
      const article = await fetchWikipediaArticle(result.key);

      // Build a text File object from the article content
      const blob = new Blob([`# ${article.title}\n\n${article.content}`], { type: 'text/plain' });
      const file = new File([blob], `Wikipedia – ${article.title}.txt`, { type: 'text/plain' });

      // Persist to IndexedDB and Zustand
      await saveFileToIndexedDB(file);
      await uploadFile(file);

      setImportedTitles((prev) => [...prev, result.title]);
    } catch (e) {
      setError(`Failed to import "${result.title}". Try again.`);
      console.error(e);
    } finally {
      setImporting(null);
    }
  };

  return (
    <Card variant="outlined" sx={cardSx}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
        🌐 Import from Wikipedia
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mt: -1 }}>
        Search for a topic and add its article as study material.
      </Typography>

      {/* Search Row */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="e.g. Photosynthesis, World War II, Python (programming)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          sx={inputSx}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          sx={buttonSx}
        >
          {searching ? <CircularProgress size={18} color="inherit" /> : 'Search'}
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Typography variant="caption" sx={{ color: '#ef4444' }}>
          {error}
        </Typography>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />
          <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
            {results.map((r) => {
              const isImported = importedTitles.includes(r.title);
              const isLoading  = importing === r.key;
              return (
                <ListItemButton
                  key={r.key}
                  onClick={() => handleImport(r)}
                  disabled={isImported || isLoading}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(148,163,184,0.15)',
                    backgroundColor: isImported ? 'rgba(34,197,94,0.06)' : '#f8fafc',
                    '&:hover': { backgroundColor: 'rgba(15,23,42,0.04)' },
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={r.title}
                    secondary={r.description || undefined}
                    slotProps={{
                      primary: { style: { fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' } },
                      secondary: { style: { fontSize: '0.78rem', color: '#64748b' }, noWrap: true },
                    }}
                  />
                  <Box sx={{ flexShrink: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    {isLoading  ? <CircularProgress size={16} /> :
                     isImported ? '✅ Added' : '＋ Import'}
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        </>
      )}
    </Card>
  );
}
