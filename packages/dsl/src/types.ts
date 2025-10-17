export type Scope = 'local' | 'session' | 'flow';

export type Binding = { path: string; scope?: Scope };

export type Action =
  | {
      type: 'navigate';
      params: {
        to: string;
        mode?: 'push' | 'replace' | 'popToRoot';
        params?: Record<string, unknown>;
      };
    }
  | { type: 'back' }
  | { type: 'popToRoot' }
  | { type: 'replace'; params: { to: string } }
  | { type: 'set'; params: { target: { scope: Scope; path: string }; value: unknown } }
  | { type: 'update'; params: { target: { scope: Scope; path: string }; reducer: string } }
  | { type: 'sync'; params?: unknown }
  | { type: 'validate'; params: { schemaRef: string; target: { scope: Scope; path: string } } }
  | { type: 'fetch'; params: { sourceId: string } }
  | {
      type: 'callApi';
      params: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: unknown;
        saveTo?: { scope: Scope; path: string };
      };
      rollbackAction?: Action;
    }
  | {
      type: 'toast';
      params: {
        message: string;
        level?: 'info' | 'success' | 'warning' | 'error';
        durationMs?: number;
      };
    }
  | { type: 'modal.open'; params: { id: string } }
  | { type: 'modal.close'; params: { id: string } }
  | { type: 'prefetchScreens'; params: { screens: string[] } };

export type Modifiers = Record<string, unknown>;

export interface NodeBase {
  type: string;
  id?: string;
  modifiers?: Modifiers;
  onAction?: Action[];
  children?: BDUIElement[];
}

export type TextNode = NodeBase & { type: 'Text'; text?: string };
export type ButtonNode = NodeBase & {
  type: 'Button';
  title: string;
  disabled?: boolean;
  loading?: boolean;
};
export type RowNode = NodeBase & { type: 'Row' };
export type ColumnNode = NodeBase & { type: 'Column' };

export type BDUIElement = RowNode | ColumnNode | TextNode | ButtonNode;

export type Theme = {
  followSystem?: boolean;
  allowUserOverride?: boolean;
  palette?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
};

export type InitialState = {
  flow?: Record<string, unknown>;
  session?: Record<string, unknown>;
};

export type RouteScreen = {
  id: string;
  title?: string;
  path?: string;
  cache?: Record<string, unknown>;
  node: BDUIElement;
};
export type Navigation = { initialRoute: string; urlSync?: boolean; routes: Array<RouteScreen> };

export type Meta = {
  contractId: string;
  version: string;
  schemaVersion: string;
  appId?: string;
  generatedAt?: string;
  signature?: string;
  features?: Record<string, unknown>;
};

export type Contract = {
  meta: Meta;
  theme?: Theme;
  dataSources?: any[];
  navigation: Navigation;
  initial?: InitialState;
};
