import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Checkbox,
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
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';

const NAV_HEIGHT = 64;

const ListDetailPage = () => {
  const navigate = useNavigate();
  const { listId } = useParams();

  const { data: lists } = useLists();
  const { data: items, isLoading, isError, error } = useListItems(listId);
  const createItemMut = useCreateListItem(listId);
  const updateItemMut = useUpdateListItem(listId);
  const deleteItemMut = useDeleteListItem(listId);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [name, setName] = useState('');

  const canAdd = name.trim().length > 0 && !createItemMut.isPending;

  const onAdd = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    await createItemMut.mutateAsync({ name: n, note: null });
    setName('');
  };

  const toggle = (item) => {
    updateItemMut.mutate({
      itemId: item.id,
      patch: { checked: !item.checked },
    });
  };

  const sorted = useMemo(() => items ?? [], [items]);

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

  const openConfirm = (item) => {
    setConfirmTarget(item);
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmTarget) return;
    deleteItemMut.mutate(confirmTarget.id, { onSettled: closeConfirm });
  };

  const openBulkConfirm = () => {
    if (checkedItems.length === 0) return;
    setConfirmBulk(true);
  };

  const openResetConfirm = () => {
    if (checkedItems.length === 0) return;
    setConfirmReset(true);
  };

  const closeBulkConfirm = () => {
    setConfirmBulk(false);
  };

  const closeResetConfirm = () => {
    setConfirmReset(false);
  };

  const handleBulkDelete = async () => {
    if (checkedItems.length === 0) {
      closeBulkConfirm();
      return;
    }
    await Promise.all(
      checkedItems.map((item) => deleteItemMut.mutateAsync(item.id)),
    );
    closeBulkConfirm();
  };

  const handleResetChecked = async () => {
    if (checkedItems.length === 0) return;
    await Promise.all(
      checkedItems.map((item) =>
        updateItemMut.mutateAsync({
          itemId: item.id,
          patch: { checked: false },
        }),
      ),
    );
    closeResetConfirm();
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        pb: checkedItems.length >= 2 ? 12 : 2,
        maxWidth: 720,
        mx: 'auto',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ mb: 1.5, width: '100%', justifyContent: 'space-between' }}
      >
        <Box sx={{ width: 40, display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={() => navigate('/lists')} />
        </Box>
        <Typography variant="h5" sx={{ flex: 1, textAlign: 'center' }}>
          {listTitle}
        </Typography>
        <Box sx={{ width: 40 }} />
      </Stack>

      <Box
        component="form"
        onSubmit={onAdd}
        sx={(theme) => ({
          mb: 1.25,
          p: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          gap: 0.75,
          alignItems: 'center',
          boxShadow: `0 6px 14px ${theme.palette.primary.main}12`,
        })}
      >
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an item…"
          size="small"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 32,
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />
        <PrimaryButton
          type="submit"
          variantStyle="primary3"
          disabled={!canAdd}
          aria-label="Add item"
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
            p: 0,
            borderRadius: 1,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          +
        </PrimaryButton>
      </Box>
      {isLoading && <Typography>Loading...</Typography>}
      {isError && (
        <Typography color="error">
          Failed to load items: {String(error?.message || error)}
        </Typography>
      )}

      <List sx={{ p: 0, display: 'grid', gap: 1.25 }}>
        {sorted.map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            sx={{
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <ListItemButton
              onClick={() => toggle(item)}
              disableRipple
              disableTouchRipple
              sx={(theme) => ({
                alignItems: 'center',
                bgcolor: item.checked
                  ? theme.palette.secondary.light
                  : theme.palette.background.paper,
                color: item.checked
                  ? theme.palette.secondary.contrastText
                  : theme.palette.secondary.dark,
                borderRadius: 999,
                border: item.checked
                  ? '1px solid transparent'
                  : `1px solid ${theme.palette.secondary.light}`,
                px: 2,
                py: 1.1,
                boxShadow: item.checked
                  ? `0 10px 22px ${theme.palette.secondary.light}33`
                  : `0 6px 14px ${theme.palette.primary.main}12`,
                '&:hover': {
                  bgcolor: item.checked
                    ? theme.palette.secondary.light
                    : theme.palette.background.paper,
                },
                '&.Mui-focusVisible': {
                  bgcolor: item.checked
                    ? theme.palette.secondary.light
                    : theme.palette.background.paper,
                },
                '&:active': {
                  bgcolor: item.checked
                    ? theme.palette.secondary.light
                    : theme.palette.background.paper,
                },
              })}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={!!item.checked}
                  tabIndex={-1}
                  disableRipple
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggle(item)}
                  sx={(theme) => ({
                    color: item.checked
                      ? theme.palette.secondary.contrastText
                      : theme.palette.secondary.dark,
                    '&.Mui-checked': {
                      color: theme.palette.secondary.contrastText,
                    },
                  })}
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
                secondary={
                  item.note ? (
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        color: item.checked
                          ? 'rgba(255,255,255,0.75)'
                          : theme.palette.secondary.dark,
                      })}
                    >
                      {item.note}
                    </Typography>
                  ) : null
                }
              />
              <DeleteItemButton
                onDelete={() => openConfirm(item)}
                disabled={false}
                iconColor={item.checked ? 'common.white' : 'secondary.dark'}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {checkedItems.length >= 2 && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: NAV_HEIGHT + 8,
            zIndex: (theme) => theme.zIndex.appBar + 9,
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, pointerEvents: 'auto' }}>
            <Stack direction="row" spacing={1}>
              <PrimaryButton
                variantStyle="primary3"
                count={checkedItems.length}
                onClick={openBulkConfirm}
                disabled={checkedItems.length === 0}
                startIcon={<DeleteSweepOutlinedIcon fontSize="small" />}
                sx={{ p: 1, flex: 1 }}
              >
                Delete checked ({checkedItems.length})
              </PrimaryButton>
              <PrimaryButton
                variantStyle="primary3"
                onClick={openResetConfirm}
                disabled={checkedItems.length === 0}
                startIcon={<RestartAltOutlinedIcon fontSize="small" />}
                sx={{ p: 1, flex: 1 }}
              >
                Reset checked ({checkedItems.length})
              </PrimaryButton>
            </Stack>
          </Box>
        </Box>
      )}
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
      <ListConfirmDialog
        open={confirmReset}
        title="Reset checked items"
        message={`Reset ${checkedItems.length} checked item${
          checkedItems.length === 1 ? '' : 's'
        }?`}
        onClose={closeResetConfirm}
        onConfirm={handleResetChecked}
      />
    </Box>
  );
};

export default ListDetailPage;
