import { useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
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

  function startGesture(clientX) {
    if (disabled) return;
    draggingRef.current = true;
    setIsDragging(true);
    startXRef.current = clientX;
    deltaRef.current = 0;
  }

  function moveGesture(clientX, e) {
    if (!draggingRef.current || disabled) return;
    const delta = clientX - startXRef.current;
    if (delta > 0) return;
    deltaRef.current = delta;
    setOffset(Math.max(delta, maxOffset));
    if (Math.abs(delta) > 6 && e?.cancelable) {
      e.preventDefault();
    }
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

  function handlePointerDown(e) {
    if (e.pointerType && e.pointerType !== 'touch') return;
    startGesture(e.clientX, e);
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e) {
    if (e.pointerType && e.pointerType !== 'touch') return;
    moveGesture(e.clientX, e);
  }

  return (
    <Box
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') finishGesture();
      }}
      onTouchStart={(e) => {
        if (e.touches?.[0]) startGesture(e.touches[0].clientX, e);
      }}
      onTouchMove={(e) => {
        if (e.touches?.[0]) moveGesture(e.touches[0].clientX, e);
      }}
      onTouchEnd={finishGesture}
      onTouchCancel={finishGesture}
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
        userSelect: 'none',
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

  const [monthCursor, setMonthCursor] = useState(() =>
    dayjs().startOf('month'),
  );
  const [selectedDate, setSelectedDate] = useState(null);

  const sorted = useMemo(() => lists ?? [], [lists]);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calendarCells = useMemo(() => {
    const start = monthCursor.startOf('month');
    const startOffset = (start.day() + 6) % 7; // monday-first
    const daysInMonth = monthCursor.daysInMonth();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ type: 'empty', key: `e-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({
        type: 'day',
        key: `d-${d}`,
        date: start.date(d),
      });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const pad = 7 - remainder;
      for (let i = 0; i < pad; i += 1) {
        cells.push({ type: 'empty', key: `p-${i}` });
      }
    }
    return cells;
  }, [monthCursor]);

  const createdDateSet = useMemo(() => {
    const set = new Set();
    (lists ?? []).forEach((list) => {
      const title = String(list.title || '').trim();
      if (!/^\d{4}\/\d{2}\/\d{2}$/.test(title)) return;
      const d = dayjs(title, 'YYYY/MM/DD', true);
      if (!d.isValid()) return;
      set.add(d.format('YYYY-MM-DD'));
    });
    return set;
  }, [lists]);

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

  function handleDateSelect(date) {
    setSelectedDate(date);
  }

  async function handleCreateSelected() {
    if (!selectedDate || createMut.isPending) return;
    const title = dayjs(selectedDate).format('YYYY/MM/DD');
    await createMut.mutateAsync(title);
    setSelectedDate(null);
  }

  return (
    <Box sx={{ px: 2, py: 2, maxWidth: 720, mx: 'auto' }}>
      <Box
        sx={(theme) => ({
          borderRadius: 1,
          p: 2,
          mb: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: `0 10px 24px ${theme.palette.primary.main}12`,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography fontWeight={700} sx={{ color: 'text.primary' }}>
            {monthCursor.format('MMMM YYYY')}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              component="button"
              type="button"
              onClick={() =>
                setMonthCursor((m) => dayjs(m).subtract(1, 'month'))
              }
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                cursor: 'pointer',
                px: 1,
                color: 'text.primary',
                fontSize: 18,
              }}
            >
              ‹
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() =>
                setMonthCursor((m) => dayjs(m).add(1, 'month'))
              }
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                cursor: 'pointer',
                px: 1,
                color: 'text.primary',
                fontSize: 18,
              }}
            >
              ›
            </Box>
          </Stack>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            mb: 0.5,
            color: 'text.secondary',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {weekdays.map((d) => (
            <Box key={d}>{d}</Box>
          ))}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
          }}
        >
          {calendarCells.map((cell) => {
            if (cell.type === 'empty') {
              return <Box key={cell.key} sx={{ height: 36 }} />;
            }
            const isToday = dayjs(cell.date).isSame(dayjs(), 'day');
            const isSelected =
              selectedDate && dayjs(cell.date).isSame(selectedDate, 'day');
            const hasList = createdDateSet.has(
              dayjs(cell.date).format('YYYY-MM-DD'),
            );
            return (
              <Box
                key={cell.key}
                component="button"
                type="button"
                onClick={() => handleDateSelect(cell.date)}
                sx={(theme) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  border: 'none',
                  bgcolor: isSelected
                    ? theme.palette.secondary.light
                    : isToday
                      ? 'transparent'
                      : hasList
                        ? theme.palette.primary.light
                        : 'transparent',
                  color: isSelected
                    ? theme.palette.secondary.contrastText
                    : isToday
                      ? theme.palette.primary.main
                      : hasList
                        ? theme.palette.primary.contrastText
                        : 'text.primary',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: isToday
                    ? `inset 0 0 0 2px ${theme.palette.primary.main}`
                    : 'none',
                  '&:hover': {
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  },
                })}
              >
                {cell.date.date()}
              </Box>
            );
          })}
        </Box>
        {selectedDate && (
          <Box sx={{ mt: 1.5 }}>
            <Box
              component="button"
              type="button"
              onClick={handleCreateSelected}
              disabled={createMut.isPending}
              sx={(theme) => ({
                width: '100%',
                borderRadius: 1.5,
                border: 'none',
                py: 1.2,
                px: 2,
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                boxShadow: `0 10px 22px ${theme.palette.primary.main}33`,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
              })}
            >
              Create list ({dayjs(selectedDate).format('YYYY/MM/DD')})
            </Box>
          </Box>
        )}
      </Box>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && (
        <Typography color="error">
          Failed to load lists: {String(error?.message || error)}
        </Typography>
      )}

      <List sx={{ p: 0, display: 'grid', gap: 1.5 }}>
        {sorted.map((list) => (
          <Box
            key={list.id}
            sx={{
              borderRadius: 999,
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
                sx={(theme) => ({
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.75,
                  borderRadius: 999,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  boxShadow: `0 10px 22px ${theme.palette.primary.main}33`,
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    color: 'primary.dark',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 14px ${theme.palette.primary.main}22`,
                    flexShrink: 0,
                  })}
                >
                  <ListAltOutlinedIcon fontSize="small" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ListItemText
                    primary={
                      <Typography fontWeight={700} noWrap>
                        {list.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        Updated {dayjs(list.updated_at || list.created_at).format('MMM D')}
                      </Typography>
                    }
                    sx={{ m: 0 }}
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
