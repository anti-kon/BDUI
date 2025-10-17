import { E } from './expr';
import type { InitialState, Scope } from './types';

type Var<T> = { scope: Scope; path: string; name: string };

type FlowVar<T> = Var<T> & { _kind: 'flow' };
type SessionVar<T> = Var<T> & { _kind: 'session' };
type LocalVar<T> = Var<T> & { _kind: 'local' };

const initial: InitialState = { flow: {}, session: {} };

function makeVar<T>(scope: Scope, name: string, initialValue?: T): Var<T> {
  if ((scope === 'flow' || scope === 'session') && initialValue !== undefined) {
    (initial as any)[scope]![name] = initialValue;
  }
  return { scope, path: name, name };
}

export function Flow<T = any>(name: string, initialValue?: T): FlowVar<T> {
  return Object.assign(makeVar<T>('flow', name, initialValue), { _kind: 'flow' as const });
}
export function Session<T = any>(name: string, initialValue?: T): SessionVar<T> {
  return Object.assign(makeVar<T>('session', name, initialValue), { _kind: 'session' as const });
}
export function Local<T = any>(name: string): LocalVar<T> {
  return Object.assign(makeVar<T>('local', name), { _kind: 'local' as const });
}

export function use<T>(v: Var<T>) {
  return E(`${v.scope}.${v.path}`);
}

export function __collectInitial(): InitialState {
  return initial;
}
