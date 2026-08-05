// Events store startTime/endTime as 24-hour "HH:MM" (native <input type="time"> format).
// These helpers turn that into display strings — no server-only dependencies,
// safe to import from client components too.

function parseTimeToMinutes(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function formatTime12h(value: string | undefined | null): string {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return '';
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// Assumes the event doesn't cross midnight; if endTime is earlier than
// startTime it's treated as running into the next day.
export function formatEventDuration(startTime: string | undefined | null, endTime: string | undefined | null): string {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return '';
  let total = end - start;
  if (total <= 0) total += 24 * 60;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatEventTimeRange(startTime: string | undefined | null, endTime: string | undefined | null): string {
  const start = formatTime12h(startTime);
  const end = formatTime12h(endTime);
  if (start && end) return `${start} – ${end}`;
  return start || end;
}
