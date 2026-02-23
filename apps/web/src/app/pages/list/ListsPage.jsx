import { useMemo, useState } from 'react';
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
import LoadingState from '../../../shared/ui/LoadingState';
import {
  useCreateList,
  useDeleteList,
  useLists,
} from '../../../features/lists/hooks';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATE_TITLE_FORMAT = 'MMM/DD/YYYY';
const DATE_TITLE_REGEX = /^[A-Z][a-z]{2}\/\d{2}\/\d{4}$/;
const DAY_CELL_SIZE = 36;

const buildCalendarCells = (monthCursor) => {
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
};

const getCreatedDateSet = (lists) => {
  const set = new Set();
  (lists ?? []).forEach((list) => {
    const title = String(list.title || '').trim();
    if (!DATE_TITLE_REGEX.test(title)) return;
    const d = dayjs(title, DATE_TITLE_FORMAT, true);
    if (!d.isValid()) return;
    set.add(d.format('YYYY-MM-DD'));
  });
  return set;
};

const ListsPage = () => {
  const navigate = useNavigate();
  const { data: lists, isLoading, isError } = useLists();
  const createMut = useCreateList();
  const deleteMut = useDeleteList();
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [monthCursor, setMonthCursor] = useState(() =>
    dayjs().startOf('month'),
  );
  const [selectedDate, setSelectedDate] = useState(null);

  const sorted = useMemo(() => lists ?? [], [lists]);
  const today = dayjs();

  const calendarCells = useMemo(
    () => buildCalendarCells(monthCursor),
    [monthCursor],
  );
  const createdDateSet = useMemo(() => getCreatedDateSet(lists), [lists]);

  const openConfirm = (list) => {
    setConfirmTarget(list);
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmTarget) return;
    deleteMut.mutate(confirmTarget.id, { onSettled: closeConfirm });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleCreateSelected = async () => {
    if (!selectedDate || createMut.isPending) return;
    const title = dayjs(selectedDate).format(DATE_TITLE_FORMAT);
    await createMut.mutateAsync(title);
    setSelectedDate(null);
  };

  return (
    <Box sx={{ px: 2, py: 2, maxWidth: 720, mx: 'auto' }}>
      <Typography
        variant="overline"
        sx={{
          display: 'block',
          color: 'text.secondary',
          px: 0.5,
          mb: 1.5,
          letterSpacing: 1.2,
          fontSize: 12,
        }}
      >
        Plan your shopping list by date.
      </Typography>
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
              onClick={() => setMonthCursor((m) => dayjs(m).add(1, 'month'))}
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
          {WEEKDAYS.map((d) => (
            <Box key={d}>{d}</Box>
          ))}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            justifyItems: 'center',
          }}
        >
          {calendarCells.map((cell) => {
            if (cell.type === 'empty') {
              return <Box key={cell.key} sx={{ height: DAY_CELL_SIZE }} />;
            }
            const isToday = dayjs(cell.date).isSame(today, 'day');
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
                  width: DAY_CELL_SIZE,
                  height: DAY_CELL_SIZE,
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
              Create list ({dayjs(selectedDate).format(DATE_TITLE_FORMAT)})
            </Box>
          </Box>
        )}
      </Box>

      {isLoading && <LoadingState />}
      {isError && (
        <Box
          sx={{
            mt: 3,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1.25,
          }}
        >
          <Box
            component="img"
            src="/no-result.png"
            alt="No results"
            sx={{
              width: { xs: 250, sm: 350 },
              height: 'auto',
              opacity: 0.92,
            }}
          />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.secondary' }}>
            Failed to load
          </Typography>
        </Box>
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
                    <Typography fontWeight={700} noWrap lineHeight={1.2}>
                      {list.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', lineHeight: 1.1 }}
                    >
                      Updated{' '}
                      {dayjs(list.updated_at || list.created_at).format(
                        'MMM D',
                      )}
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
};

export default ListsPage;
