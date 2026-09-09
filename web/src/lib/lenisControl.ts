/** Управление Lenis: стоп при модалках (счётчик, если открыто несколько). */

type Listener = (stopped: boolean) => void;

let lockCount = 0;
const listeners = new Set<Listener>();

function emit() {
  const stopped = lockCount > 0;
  listeners.forEach((fn) => fn(stopped));
}

export function isLenisStopped() {
  return lockCount > 0;
}

/** Заблокировать скролл страницы (модалка открыта). */
export function acquireLenisLock() {
  lockCount += 1;
  emit();
}

/** Снять блокировку (модалка закрыта). */
export function releaseLenisLock() {
  lockCount = Math.max(0, lockCount - 1);
  emit();
}

export function subscribeLenisStopped(fn: Listener) {
  listeners.add(fn);
  fn(lockCount > 0);
  return () => {
    listeners.delete(fn);
  };
}
