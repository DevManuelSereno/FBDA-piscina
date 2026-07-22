const TIME_PATTERN = /^(?:(\d{1,2}):)?(\d{1,2})\.(\d{2})$/;

export function formatTime(centiseconds: number): string {
  if (!Number.isInteger(centiseconds) || centiseconds < 0) {
    throw new Error(`Invalid centiseconds value: ${centiseconds}`);
  }

  const totalSeconds = Math.floor(centiseconds / 100);
  const cc = centiseconds % 100;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const centi = String(cc).padStart(2, "0");

  return `${mm}:${ss}.${centi}`;
}

export function parseTime(input: string): number {
  const match = TIME_PATTERN.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid time format: ${input}`);
  }

  const [, minutesPart, secondsPart, centiPart] = match;
  const minutes = minutesPart ? Number(minutesPart) : 0;
  const seconds = Number(secondsPart);
  const centi = Number(centiPart);

  if (seconds >= 60) {
    throw new Error(`Invalid seconds value: ${secondsPart}`);
  }

  return (minutes * 60 + seconds) * 100 + centi;
}
