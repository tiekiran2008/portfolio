import { useEffect } from 'react';
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import type { PointerEvent } from 'react';

// Motion values batch pointer updates into animation frames without React renders.
export function useFloatingCard() {
  const reduced = useReducedMotion();
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const dx = useMotionValue(0), dy = useMotionValue(0), dz = useMotionValue(0), size = useMotionValue(1);
  const spring = { stiffness: 170, damping: 24, mass: 0.7 };
  const rotateX = useSpring(rx, spring), rotateY = useSpring(ry, spring);
  const x = useSpring(dx, spring), y = useSpring(dy, spring), z = useSpring(dz, spring), scale = useSpring(size, spring);
  const reset = () => { rx.set(0); ry.set(0); dx.set(0); dy.set(0); dz.set(0); size.set(1); };
  useEffect(() => { if (reduced) reset(); }, [reduced]);
  return {
    style: { rotateX, rotateY, x, y, z, scale, transformStyle: 'preserve-3d' as const },
    handlers: {
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (reduced || event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5));
        const py = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5));
        rx.set(-py * 10); ry.set(px * 10); dx.set(px * 4); dy.set(py * 2 - 4); dz.set(10); size.set(1.015);
      },
      onPointerLeave: reset,
      onPointerCancel: reset,
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!reduced && event.pointerType !== 'mouse') { rx.set(2); dy.set(-2); dz.set(3); size.set(1.005); }
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => { if (event.pointerType !== 'mouse') reset(); },
    },
  };
}
