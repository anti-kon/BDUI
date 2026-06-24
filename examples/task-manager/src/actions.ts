import { bind, type ShortAction } from '@bdui/dsl';

import { apiBase } from './data.js';
import {
  lastTask,
  requestTicket,
  saveError,
  settingsSaved,
  starterCatalog,
  statusMessage,
  workspaceSnapshot,
} from './state.js';

export const refreshWorkspace = [
  { fetch: { sourceId: 'workspaceSnapshot', saveTo: bind(workspaceSnapshot) } },
  { set: [bind(statusMessage), 'Срез рабочего пространства обновлён через источник данных BDUI'] },
  { toast: ['Данные обновлены', { level: 'success' as const }] },
] satisfies readonly ShortAction[];

export const loadStarterCatalog = [
  { fetch: { sourceId: 'starterCatalog', saveTo: bind(starterCatalog) } },
  { set: [bind(statusMessage), 'Статический источник данных загружен во flow-состояние'] },
  { toast: ['Каталог загружен', { level: 'success' as const }] },
] satisfies readonly ShortAction[];

export const profileCall = {
  call: {
    url: `${apiBase}/profile`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      name: '{{session.userName}}',
      email: '{{session.userEmail}}',
      workspace: '{{session.workspaceName}}',
      plan: '{{session.plan}}',
    },
    saveTo: bind(settingsSaved),
    rollback: { set: [bind(saveError), 'Не удалось синхронизировать профиль'] },
  },
} satisfies ShortAction;

export const taskCall = {
  call: {
    url: `${apiBase}/task`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: { title: '{{flow.draftTask}}', workspace: '{{session.workspaceName}}' },
    saveTo: bind(lastTask),
    rollback: { set: [bind(saveError), 'Не удалось сохранить задачу'] },
  },
} satisfies ShortAction;

export const settingsCall = {
  call: {
    url: `${apiBase}/settings`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      theme: '{{session.themeMode}}',
      notifications: '{{session.notifications}}',
      compact: '{{session.compactMode}}',
      plan: '{{session.plan}}',
    },
    saveTo: bind(settingsSaved),
    rollback: { set: [bind(saveError), 'Не удалось синхронизировать настройки'] },
  },
} satisfies ShortAction;

export const requestCall = {
  call: {
    url: `${apiBase}/request`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      type: '{{flow.requestType}}',
      priority: '{{flow.requestPriority}}',
      summary: '{{flow.requestSummary}}',
      impact: '{{flow.requestImpact}}',
      budget: '{{flow.requestBudget}}',
      design: '{{flow.requestNeedsDesign}}',
      legal: '{{flow.requestNeedsLegal}}',
    },
    saveTo: bind(requestTicket),
    rollback: { set: [bind(saveError), 'Не удалось отправить заявку'] },
  },
} satisfies ShortAction;
