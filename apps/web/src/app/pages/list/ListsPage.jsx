import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteItemButton from '../../../shared/ui/buttons/DeleteItemButton';
import ListConfirmDialog from './ListConfirmDialog';
import {
  useCreateList,
  useDeleteList,
  useLists,
} from '../../../features/lists/hooks';

function SwipeableRow({ onSwipeDelete, disabled, children }) {
  const startXRef = useRef(0);
  const deltaRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const threshold = -80;
  const maxOffset = -120;

  function handlePointerDown(e) {
    if (disabled) return;
    if (e.pointerType && e.pointerType !== 'touch') return;
    draggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    deltaRef.current = 0;
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e) {
    if (!draggingRef.current || disabled) return;
    if (e.pointerType && e.pointerType !== 'touch') return;
    const delta = e.clientX - startXRef.current;
    if (delta > 0) return;
    deltaRef.current = delta;
    setOffset(Math.max(delta, maxOffset));
  }

  function finishGesture() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    const delta = deltaRef.current;
    if (Math.abs(delta) > 10) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    setOffset(0);
    if (delta < threshold && !disabled) onSwipeDelete?.();
  }

  return (
    <Box
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      onPointerLeave={finishGesture}
      onClickCapture={(e) => {
        if (suppressClickRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      sx={{
        width: '100%',
        transform: `translateX(${offset}px)`,
        transition: isDragging ? 'none' : 'transform 120ms ease-out',
        touchAction: 'pan-y',
      }}
    >
      {children}
    </Box>
  );
}

export default function ListsPage() {
  const navigate = useNavigate();
  const { data: lists, isLoading, isError, error } = useLists();
  const createMut = useCreateList();
  const deleteMut = useDeleteList();
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [title, setTitle] = useState('');

  const canCreate = title.trim().length > 0 && !createMut.isPending;

  async function onCreate(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await createMut.mutateAsync(t);
    setTitle('');
  }

  const sorted = useMemo(() => lists ?? [], [lists]);

  function openConfirm(list) {
    setConfirmTarget(list);
  }

  function closeConfirm() {
    setConfirmTarget(null);
  }

  function handleConfirmDelete() {
    if (!confirmTarget) return;
    deleteMut.mutate(confirmTarget.id, { onSettled: closeConfirm });
  }

  return (
    <Box sx={{ px: 2, py: 2, maxWidth: 720, mx: 'auto' }}>
      <Box component="form" onSubmit={onCreate} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. This week, 2026/01/05 list..."
            size="small"
            fullWidth
          />
        </Stack>
        <Button
          type="submit"
          variant="contained"
          disabled={!canCreate}
          fullWidth
          sx={{ mt: 1 }}
        >
          {createMut.isPending ? 'Creating...' : 'Create'}
        </Button>
      </Box>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && (
        <Typography color="error">
          Failed to load lists: {String(error?.message || error)}
        </Typography>
      )}

      <List sx={{ p: 0, display: 'grid', gap: 1.25 }}>
        {sorted.map((list) => (
          <Box
            key={list.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <SwipeableRow
              onSwipeDelete={() => {
                openConfirm(list);
              }}
              disabled={deleteMut.isPending}
            >
              <ListItemButton
                onClick={() => navigate(`/lists/${list.id}`)}
                sx={{ alignItems: 'center' }}
              >
                <Box sx={{ flex: 1 }}>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600}>{list.title}</Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {list.id}
                      </Typography>
                    }
                  />
                </Box>
                <DeleteItemButton
                  onDelete={() => openConfirm(list)}
                  disabled={deleteMut.isPending}
                />
              </ListItemButton>
            </SwipeableRow>
          </Box>
        ))}
      </List>
      <ListConfirmDialog
        open={!!confirmTarget}
        title="Delete list"
        message={`Delete "${confirmTarget?.title || 'this list'}"?`}
        onClose={closeConfirm}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
