import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ContainerSection from '../../shared/layout/ContainerSection';

const OPS = new Set(['+', '-', '×', '÷']);
const isOp = (v) => OPS.has(v);
const STORAGE_KEY = 'damda_calc_state_v1';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('');
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const keys = useMemo(
    () => [
      ['', '7', '8', '9', '÷'],
      ['', '4', '5', '6', '×'],
      ['', '1', '2', '3', '-'],
      ['', '0', '.', '=', '+'],
    ],
    [],
  );

  const append = (v) => {
    setDisplay((prev) => {
      if (!v) return prev;
      if (prev === 'Error') return v === 'C' ? '' : v;
      if (v === '=') return prev;
      if (v === '.') {
        if (!prev || isOp(prev.slice(-1))) return `${prev}0.`;
        const lastToken = prev.split(/[+\-×÷]/).pop() || '';
        if (lastToken.includes('.')) return prev;
      }
      if (isOp(v)) {
        if (!prev) return v === '+' || v === '-' ? v : prev;
        if (prev.slice(-1) === '.') return `${prev}0${v}`;
        if (isOp(prev.slice(-1))) return prev;
      }
      return prev + v;
    });
  };

  const resetAll = () => {
    setDisplay('');
    setHistory([]);
  };

  const calc = () => {
    try {
      const trimmed = display.trim();
      if (!trimmed) return;
      if (!/[+\-×÷]/.test(trimmed)) return;
      if (/^[×÷]/.test(trimmed)) return;
      if (/[+\-×÷]$/.test(trimmed)) return;
      if (!/^[0-9.+\-×÷\s]+$/.test(trimmed)) return;

      const normalized = trimmed
        .replace(/(^|[+\-×÷])\./g, '$10.')
        .replace(/\.([+\-×÷])/g, '.0$1')
        .replace(/\.$/, '.0');
      const expr = normalized.replaceAll('×', '*').replaceAll('÷', '/');
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      if (!Number.isFinite(result)) {
        setDisplay('0');
        return;
      }
      const safeResult = String(result);
      setDisplay(safeResult);
      if (display.trim()) {
        setHistory((prev) => [{ expr: display, result: safeResult }, ...prev]);
      }
    } catch {
      setDisplay('0');
    }
  };

  const onKeyClick = (k) => {
    if (k === 'C') {
      setDisplay('');
      return;
    }
    if (k === '=') return calc();
    return append(k);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.display === 'string') setDisplay(parsed.display);
      if (Array.isArray(parsed?.history)) setHistory(parsed.history);
    } catch {
      // ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ display, history }));
    } catch {
      // ignore storage errors
    }
  }, [display, history]);

  return (
    <ContainerSection>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 3 },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: { xs: 'center', md: 'flex-start' },
        }}
      >
        {/* Calculator Wrapper */}
        <Box
          sx={{
            width: { xs: '100%', sm: 440, md: 520 },
            maxWidth: '100%',
            borderRadius: 1.5,
            bgcolor: 'primary.light',
            boxShadow: '0 16px 30px rgba(0,0,0,0.25)',
            p: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          {/* Top area */}
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, mb: 2 }}>
            {/* C button */}
            <Button
              onClick={() => onKeyClick('C')}
              sx={{
                width: { xs: 76, sm: 82, md: 90 },
                minHeight: { xs: 56, sm: 58, md: 60 },
                borderRadius: 1,
                bgcolor: 'secondary.main',
                color: '#fff',
                fontWeight: 800,
                fontSize: { xs: 21, sm: 22, md: 24 },
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.12)',
              }}
            >
              C
            </Button>

            {/* Screen (멀티라인) */}
            <Box
              sx={{
                flex: 1,
                minHeight: { xs: 64, sm: 66, md: 70 },
                borderRadius: 1,
                bgcolor: '#ffffff',
                px: { xs: 1.75, sm: 2, md: 2.5 },
                py: { xs: 1.25, sm: 1.25, md: 1.5 },
                boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.18)',
              }}
            >
              <Typography
                sx={{
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: { xs: 24, sm: 26, md: 30 },
                  letterSpacing: 0.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  textAlign: 'right',
                }}
              >
                {display || '0'}
              </Typography>
            </Box>
          </Box>

          {/* Keys */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: { xs: 1, sm: 1.5, md: 2 },
            }}
          >
            {keys.flat().map((k, i) => {
              if (k === '') return <Box key={`sp-${i}`} />;

              const isOperator = isOp(k);
              const isEqual = k === '=';

              return (
                <Button
                  key={`${k}-${i}`}
                  onClick={() => onKeyClick(k)}
                  sx={{
                    height: { xs: 56, sm: 60, md: 64 },
                    borderRadius: 1,
                    bgcolor: isEqual
                      ? 'primary.main'
                      : isOperator
                        ? 'secondary.light'
                        : '#ffffff',
                    color: '#2B2B2B',
                    fontWeight: 600,
                    fontSize: { xs: 19, sm: 19, md: 20 },
                    boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.12)',
                    '&:hover': {
                      bgcolor: isEqual
                        ? 'primary.main'
                        : isOperator
                          ? '#secondary.light'
                          : '#F3F3F3',
                    },
                  }}
                >
                  {k}
                </Button>
              );
            })}
          </Box>
        </Box>
        {/* Result */}
        <Box
          sx={{
            width: { xs: '100%', sm: 440, md: 450 },
            maxWidth: '100%',
            borderRadius: 1.5,
            bgcolor: '#ffffff',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            p: { xs: 2, sm: 2.5, md: 3.5 },
            minHeight: { xs: 140, md: 0 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mb: 1.5,
            }}
          >
            {history.length === 0 ? (
              <Box
                component="img"
                src="/empty.png"
                alt="Result"
                sx={{
                  height: { xs: 200, md: 350 },
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  mx: 'auto',
                }}
              />
            ) : (
              <Button
                onClick={resetAll}
                sx={{
                  minWidth: 72,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: 'secondary.main',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                  },
                }}
              >
                Reset
              </Button>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxHeight: { xs: 220, md: 350 },
              overflowY: 'auto',
              pr: 2,
            }}
          >
            {history.length === 0 ? (
              <Typography variant="overline">
                Calculation results will appear here
              </Typography>
            ) : (
              history.map((item, i) => (
                <Box
                  key={`${item.expr}-${item.result}-${i}`}
                  sx={{
                    p: { xs: 1.25, md: 1.5 },
                    borderRadius: 1,
                    bgcolor: '#F6F6F6',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 14, md: 15 },
                      color: '#4B4B4B',
                      wordBreak: 'break-all',
                    }}
                  >
                    {item.expr}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 16, md: 18 },
                      fontWeight: 700,
                      textAlign: 'right',
                    }}
                  >
                    {item.result}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </ContainerSection>
  );
}
