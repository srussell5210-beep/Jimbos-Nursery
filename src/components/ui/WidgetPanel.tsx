'use client';

import { useState, useRef, useEffect } from 'react';
import { GripHorizontal, Minus, Maximize2, X } from 'lucide-react';

const POS_KEY_PREFIX = 'widget-panel-pos';

export default function WidgetPanel({
  title = 'Dashboard',
  children,
  storageKey = 'default',
  defaultOpen = true,
  titleActions,
}: {
  title?: string;
  children: React.ReactNode;
  storageKey?: string;
  defaultOpen?: boolean;
  titleActions?: React.ReactNode;
}) {
  const posKey = `${POS_KEY_PREFIX}-${storageKey}`;

  const [open, setOpen] = useState(defaultOpen);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 12, y: 80 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(posKey);
      if (saved) {
        const next = clamp(JSON.parse(saved));
        setPos(next);
        savePos(next);
      }
    } catch {}
  }, [posKey]);

  useEffect(() => {
    function keepPanelOnScreen() {
      setPos((current) => {
        const next = clamp(current);
        savePos(next);
        return next;
      });
    }

    keepPanelOnScreen();
    window.addEventListener('resize', keepPanelOnScreen);
    return () => window.removeEventListener('resize', keepPanelOnScreen);
  }, [posKey]);

  function savePos(p: { x: number; y: number }) {
    try {
      localStorage.setItem(posKey, JSON.stringify(p));
    } catch {}
  }

  function clamp(p: { x: number; y: number }) {
    const panelWidth = Math.min(1100, Math.max(320, window.innerWidth - 24));
    const panelHeight = minimized ? 52 : Math.min(700, Math.max(320, window.innerHeight - 120));
    return {
      x: Math.max(12, Math.min(window.innerWidth - panelWidth - 12, p.x)),
      y: Math.max(12, Math.min(window.innerHeight - panelHeight - 12, p.y)),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDragging(true);
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPos(clamp({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragging(false);
    const p = clamp({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    setPos(p);
    savePos(p);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-lg bg-nursery-midnight px-4 py-2.5 text-sm font-bold text-nursery-ivory shadow-lg transition hover:bg-nursery-terracotta"
      >
        <Maximize2 className="h-4 w-4" />
        {title}
      </button>
    );
  }

  return (
    <div
      className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-nursery-sage/20 bg-[#f7f3ea] shadow-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        width: 'min(1100px, calc(100vw - 24px))',
        height: minimized ? 'auto' : 'min(700px, calc(100vh - 120px))',
      }}
    >
      {/* Title bar */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`flex shrink-0 items-center gap-3 bg-nursery-midnight px-4 py-3 select-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${minimized ? 'rounded-xl' : 'rounded-t-xl border-b border-white/10'}`}
      >
        <GripHorizontal className="h-4 w-4 shrink-0 text-nursery-ivory/35" />
        <span className="flex-1 font-serif text-base font-semibold text-nursery-ivory leading-none">
          {title}
        </span>
        {titleActions && (
          <div onPointerDown={(e) => e.stopPropagation()} className="flex items-center gap-2">
            {titleActions}
          </div>
        )}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setMinimized((m) => !m)}
          title={minimized ? 'Restore' : 'Minimize'}
          className="rounded p-1.5 text-nursery-ivory/50 transition hover:bg-white/10 hover:text-nursery-ivory"
        >
          {minimized ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen(false)}
          title="Close"
          className="rounded p-1.5 text-nursery-ivory/50 transition hover:bg-nursery-terracotta/80 hover:text-nursery-ivory"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      )}
    </div>
  );
}
