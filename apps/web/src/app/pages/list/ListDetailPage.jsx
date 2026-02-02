import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BackButton from '../../../shared/ui/buttons/BackButton';
import DeleteItemButton from '../../../shared/ui/buttons/DeleteItemButton';
import PrimaryButton from '../../../shared/ui/buttons/PrimaryButton';
import ListConfirmDialog from './ListConfirmDialog';
import {
  useCreateListItem,
  useDeleteListItem,
  useListItems,
  useLists,
  useUpdateListItem,
} from '../../../features/lists/hooks';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';

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

export default function ListDetailPage() {
  const navigate = useNavigate();
  const { listId } = useParams();

  const { data: lists } = useLists();
  const { data: items, isLoading, isError, error } = useListItems(listId);
  const createItemMut = useCreateListItem(listId);
  const updateItemMut = useUpdateListItem(listId);
  const deleteItemMut = useDeleteListItem(listId);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

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
  const pendingItemId = updateItemMut.variables?.itemId;
  const checkedItems = useMemo(
    () => sorted.filter((item) => item.checked),
    [sorted],
  );
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

  function openBulkConfirm() {
    if (checkedItems.length === 0) return;
    setConfirmBulk(true);
  }

  function closeBulkConfirm() {
    setConfirmBulk(false);
  }

  async function handleBulkDelete() {
    if (checkedItems.length === 0) {
      closeBulkConfirm();
      return;
    }
    await Promise.all(
      checkedItems.map((item) => deleteItemMut.mutateAsync(item.id)),
    );
    closeBulkConfirm();
  }

  async function handleResetChecked() {
    if (checkedItems.length === 0) return;
    await Promise.all(
      checkedItems.map((item) =>
        updateItemMut.mutateAsync({
          itemId: item.id,
          patch: { checked: false },
        }),
      ),
    );
  }

  return (
    <Box sx={{ px: 2, py: 2, maxWidth: 720, mx: 'auto' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ mb: 1.5, width: '100%', justifyContent: 'space-between' }}
      >
        <Typography variant="h5">{listTitle}</Typography>
        <BackButton onClick={() => navigate('/lists')} />
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1.5, display: 'block' }}
      >
        listId: {listId}
      </Typography>

      <Box component="form" onSubmit={onAdd} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. green onions, milk, bread..."
            size="small"
            fullWidth
          />
        </Stack>
        <Button
          type="submit"
          variant="contained"
          disabled={!canAdd}
          fullWidth
          sx={{ mt: 1 }}
        >
          {createItemMut.isPending ? 'Adding...' : 'Add'}
        </Button>
      </Box>
      {checkedItems.length >= 2 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, mt: -1 }}>
          <PrimaryButton
            variantStyle="primary4"
            count={checkedItems.length}
            onClick={openBulkConfirm}
            disabled={checkedItems.length === 0}
            startIcon={<DeleteSweepOutlinedIcon fontSize="small" />}
            sx={{ p: 1 }}
          >
            Delete checked ({checkedItems.length})
          </PrimaryButton>
          <PrimaryButton
            variantStyle="primary4"
            onClick={handleResetChecked}
            disabled={checkedItems.length === 0 || updateItemMut.isPending}
            startIcon={<RestartAltOutlinedIcon fontSize="small" />}
            sx={{ p: 1 }}
          >
            Reset checked
          </PrimaryButton>
        </Stack>
      )}

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
                disabled={
                  updateItemMut.isPending &&
                  String(pendingItemId) === String(item.id)
                }
                sx={{
                  alignItems: 'center',
                  '&.Mui-disabled': { opacity: 1, color: 'inherit' },
                }}
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
                <DeleteItemButton
                  onDelete={() => openConfirm(item)}
                  disabled={deleteItemMut.isPending}
                />
              </ListItemButton>
            </SwipeableRow>
          </ListItem>
        ))}
      </List>
      <ListConfirmDialog
        open={!!confirmTarget}
        title="Delete item"
        message={`Delete "${confirmTarget?.name || 'this item'}"?`}
        onClose={closeConfirm}
        onConfirm={handleConfirmDelete}
      />
      <ListConfirmDialog
        open={confirmBulk}
        title="Delete checked items"
        message={`Delete ${checkedItems.length} checked item${
          checkedItems.length === 1 ? '' : 's'
        }?`}
        onClose={closeBulkConfirm}
        onConfirm={handleBulkDelete}
      />
    </Box>
  );
}
