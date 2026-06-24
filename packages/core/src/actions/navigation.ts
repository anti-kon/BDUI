/**
 * Navigation actions: imperative routing between screens.
 */
export type NavigateMode = 'push' | 'replace' | 'popToRoot';

export interface NavigateAction {
  readonly type: 'navigate';
  readonly params: {
    readonly to: string;
    readonly mode?: NavigateMode;
    readonly params?: Readonly<Record<string, unknown>>;
  };
}

export interface BackAction {
  readonly type: 'back';
}

export interface PopToRootAction {
  readonly type: 'popToRoot';
}

export interface ReplaceAction {
  readonly type: 'replace';
  readonly params: { readonly to: string };
}
