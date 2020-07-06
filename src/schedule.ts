export function createSchedule(fn: () => void, interval: number): number {
  return window.setInterval(fn, interval);
}

export function removeSchedule(id: number): void {
  window.clearInterval(id);
}
