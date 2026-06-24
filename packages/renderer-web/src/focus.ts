/**
 * Focus preservation across re-renders. The DOM is rebuilt wholesale on every
 * render, so we snapshot which focusable control was active (plus its text
 * selection) and restore it by index afterwards.
 */
const FOCUSABLE_SELECTOR = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';

export interface FocusSnapshot {
  readonly index: number;
  readonly selectionStart?: number | null;
  readonly selectionEnd?: number | null;
}

export function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled'),
  );
}

export function captureFocus(doc: Document, container: HTMLElement): FocusSnapshot | null {
  const active = doc.activeElement;
  if (!(active instanceof doc.defaultView!.HTMLElement)) return null;
  if (!container.contains(active)) return null;
  const elements = focusableElements(container);
  const index = elements.indexOf(active);
  if (index < 0) return null;

  const control = active as HTMLInputElement | HTMLTextAreaElement;
  let selectionStart: number | null | undefined;
  let selectionEnd: number | null | undefined;
  try {
    selectionStart = control.selectionStart;
    selectionEnd = control.selectionEnd;
  } catch {
    selectionStart = undefined;
    selectionEnd = undefined;
  }
  return { index, selectionStart, selectionEnd };
}

export function restoreFocus(container: HTMLElement, snapshot: FocusSnapshot | null): void {
  if (!snapshot) return;
  const target = focusableElements(container)[snapshot.index];
  if (!target) return;
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
  if (
    snapshot.selectionStart != null &&
    snapshot.selectionEnd != null &&
    'setSelectionRange' in target
  ) {
    try {
      (target as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        snapshot.selectionStart,
        snapshot.selectionEnd,
      );
    } catch {
      /* ignore controls that do not support text selections */
    }
  }
}
