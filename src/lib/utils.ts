import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getTimeDifferenceMinutes(ideal: string, actual: string): number {
  const [ih, im] = ideal.split(":").map(Number);
  const [ah, am] = actual.split(":").map(Number);
  return (ah * 60 + am) - (ih * 60 + im);
}

export function formatDifference(minutes: number): string {
  if (minutes === 0) return "On time";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return minutes > 0 ? `${timeStr} late` : `${timeStr} early`;
}

export function getAlignmentScore(deviation: number, flexibility: number): number {
  if (Math.abs(deviation) <= flexibility) return 100;
  const overBy = Math.abs(deviation) - flexibility;
  return Math.max(0, Math.round(100 - (overBy * 2)));
}
