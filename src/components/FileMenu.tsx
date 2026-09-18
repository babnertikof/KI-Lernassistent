import React, { useState } from 'react';
import { Card, Button, List, ListItem, Typography } from '@mui/material';
import { useQandAStore } from '../store/useQandAStore';

const cardSx = {
  p: 2,
  borderRadius: 3,
  border: '1px solid rgba(148, 163, 184, 0.18)',
  backgroundColor: 'background.paper',
};

const buttonSx = {
  borderRadius: 3,
  px: 2.2,
  py: 1,
  textTransform: 'none',
  minWidth: 120,
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

export default function FileMenu() {
  const files = useQandAStore((state) => state.files);
  const uploadFile = useQandAStore((state) => state.uploadFile);
  const removeFile = useQandAStore((state) => state.removeFile);
  const [isVisible, changeVisibility] = useState(false);

  function addFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (fileList == null) {
      return;
    }
    for (let i = 0; i < fileList.length; i++) {
      uploadFile(fileList[i]);
    }
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
        <input type="file" accept=".md,.txt" onChange={addFile} hidden multiple />
      </Button>
      <Button
        variant="outlined"
        sx={buttonSx}
        onClick={() => {
          if (files.length > 0) {
            changeVisibility(!isVisible);
          }
        }}
        disabled={files.length === 0}
      >
        Toggle file Menu
      </Button>
      {isVisible && files.length > 0 ? (
        <List sx={fileListSx}>
          {files.map((file) => (
            <ListItem key={file.name + '-' + file.size} sx={fileItemSx} disableGutters>
              <Typography component="h3" sx={fileNameSx}>
                {file.name}
              </Typography>
              <Button variant="outlined" onClick={() => removeFile(file)} sx={fileButtonSx}>
                Delete File
              </Button>
            </ListItem>
          ))}
        </List>
      ) : null}
    </Card>
  );
}
