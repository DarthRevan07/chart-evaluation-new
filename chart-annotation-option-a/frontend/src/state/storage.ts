const KEY = 'chart-annotation-ui:v1';

export function saveToLocalStorage(state: unknown) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadFromLocalStorage<T>(): T | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function makeParticipantId() {
  return crypto.randomUUID();
}
