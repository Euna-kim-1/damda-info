import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import {
  useCreateListItem,
  useDeleteListItem,
  useListItems,
  useLists,
  useUpdateListItem,
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
    if (e.pointerType === 'mouse' && e.button !== 0) return;
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

export default function ListDetailPage() {
  const navigate = useNavigate();
  const { listId } = useParams();

  const { data: lists } = useLists();
  const { data: items, isLoading, isError, error } = useListItems(listId);
  const createItemMut = useCreateListItem(listId);
  const updateItemMut = useUpdateListItem(listId);
  const deleteItemMut = useDeleteListItem(listId);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [name, setName] = useState('');

  const canAdd = name.trim().length > 0 && !createItemMut.isPending;

  async function onAdd(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    await createItemMut.mutateAsync({ name: n, note: null });
    setName('');
  }

  async function toggle(item) {
    await updateItemMut.mutateAsync({
      itemId: item.id,
      patch: { checked: !item.checked },
    });
  }

  const sorted = useMemo(() => items ?? [], [items]);
  const listTitle = useMemo(() => {
    if (!listId) return 'List';
    const fromLists = lists?.find(
      (list) => String(list.id) === String(listId),
    )?.title;
    const fromItems = items?.[0]?.list?.title;
    return fromLists || fromItems || 'List';
  }, [items, listId, lists]);

  function openConfirm(item) {
    setConfirmTarget(item);
  }

  function closeConfirm() {
    setConfirmTarget(null);
  }

  function handleConfirmDelete() {
    if (!confirmTarget) return;
    deleteItemMut.mutate(confirmTarget.id, { onSettled: closeConfirm });
  }

  return (
    <Box sx={{ px: 2, py: 2, maxWidth: 720, mx: 'auto' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h5">{listTitle}</Typography>
        <Button size="small" variant="text" onClick={() => navigate('/lists')}>
          ← Back
        </Button>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1.5, display: 'block' }}
      >
        listId: {listId}
      </Typography>

      <Box component="form" onSubmit={onAdd} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add item… (e.g. green onion)"
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={!canAdd}>
            {createItemMut.isPending ? 'Adding...' : 'Add'}
          </Button>
        </Stack>
      </Box>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && (
        <Typography color="error">
          Failed to load items: {String(error?.message || error)}
        </Typography>
      )}

      <List sx={{ p: 0, display: 'grid', gap: 1 }}>
        {sorted.map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <SwipeableRow
              onSwipeDelete={() => {
                openConfirm(item);
              }}
              disabled={deleteItemMut.isPending}
            >
              <ListItemButton
                onClick={() => toggle(item)}
                disabled={updateItemMut.isPending}
                sx={{ alignItems: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={!!item.checked}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        textDecoration: item.checked ? 'line-through' : 'none',
                      }}
                    >
                      {item.name}
                    </Typography>
                  }
                />
                <Box
                  sx={{
                    minWidth: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <DeleteSweepIcon fontSize="small" color="error" />
                </Box>
              </ListItemButton>
            </SwipeableRow>
          </ListItem>
        ))}
      </List>
      <Dialog open={!!confirmTarget} onClose={closeConfirm}>
        <DialogTitle>Delete item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete "{confirmTarget?.name || 'this item'}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
