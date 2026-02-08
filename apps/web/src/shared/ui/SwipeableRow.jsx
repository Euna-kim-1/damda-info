import { Box } from '@mui/material';
import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = -80;
const SWIPE_MAX_OFFSET = -120;

const SwipeableRow = ({ onSwipeDelete, disabled = false, children }) => {
  const startXRef = useRef(0);
  const deltaRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startGesture = (clientX) => {
    if (disabled) return;
    draggingRef.current = true;
    setIsDragging(true);
    startXRef.current = clientX;
    deltaRef.current = 0;
  };

  const moveGesture = (clientX, event) => {
    if (!draggingRef.current || disabled) return;
    const delta = clientX - startXRef.current;
    if (delta > 0) return;
    deltaRef.current = delta;
    setOffset(Math.max(delta, SWIPE_MAX_OFFSET));
    if (Math.abs(delta) > 6 && event?.cancelable) {
      event.preventDefault();
    }
  };

  const finishGesture = () => {
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
    if (delta < SWIPE_THRESHOLD && !disabled) onSwipeDelete?.();
  };

  const handlePointerDown = (event) => {
    if (event.pointerType && event.pointerType !== 'touch') return;
    startGesture(event.clientX);
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    if (event.pointerType && event.pointerType !== 'touch') return;
    moveGesture(event.clientX, event);
  };

  return (
    <Box
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') finishGesture();
      }}
      onTouchStart={(event) => {
        if (event.touches?.[0]) startGesture(event.touches[0].clientX);
      }}
      onTouchMove={(event) => {
        if (event.touches?.[0]) moveGesture(event.touches[0].clientX, event);
      }}
      onTouchEnd={finishGesture}
      onTouchCancel={finishGesture}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          event.preventDefault();
          event.stopPropagation();
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
};

export default SwipeableRow;
