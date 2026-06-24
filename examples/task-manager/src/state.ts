import { Flow, Session } from '@bdui/dsl';

/* ------------------------------ Session ------------------------------ */
export const userName = Session<string>('userName', 'Анна Смирнова');
export const userEmail = Session<string>('userEmail', 'anna.smirnova@example.ru');
export const workspaceName = Session<string>('workspaceName', 'Северный контур');
export const plan = Session<string>('plan', 'Рост');
export const themeMode = Session<string>('themeMode', 'Системная');
export const notifications = Session<boolean>('notifications', true);
export const compactMode = Session<boolean>('compactMode', false);
export const settingsSaved = Session<string>('settingsSaved', 'Ещё не синхронизировано');

/* ------------------------------- Flow -------------------------------- */
export const contractCacheSource = Flow<string>('contractCacheSource', 'сеть');
export const statusMessage = Flow<string>('statusMessage', '');
export const saveError = Flow<string>('saveError', '');
export const activeView = Flow<string>('activeView', 'Командный центр');

export const workspaceSnapshot = Flow<Record<string, unknown>>('workspaceSnapshot', {
  health: 'Не загружено',
  utilization: 0,
  risk: 'Неизвестно',
  revenue: '0 ₽',
  sla: 'Нет данных',
  nextReview: 'Не запланировано',
  updatedAt: 'никогда',
  activeProjects: 0,
  blockerCount: 0,
});

export const starterCatalog = Flow<Record<string, unknown>>('starterCatalog', {
  templateName: 'Не загружено',
  sections: 0,
  guardrails: 'Загрузите каталог, чтобы увидеть контрольные точки',
  defaultOwner: 'Не назначен',
});

export const draftTask = Flow<string>('draftTask', '');
export const lastTask = Flow<string>('lastTask', 'Проверить панель готовности запуска');
export const taskDone = Flow<boolean>('taskDone', false);
export const taskCount = Flow<number>('taskCount', 4);

export const requestType = Flow<string>('requestType', 'Проверка запуска');
export const requestPriority = Flow<string>('requestPriority', 'Высокий');
export const requestSummary = Flow<string>('requestSummary', '');
export const requestImpact = Flow<string>('requestImpact', '');
export const requestBudget = Flow<number>('requestBudget', 25000);
export const requestNeedsDesign = Flow<boolean>('requestNeedsDesign', true);
export const requestNeedsLegal = Flow<boolean>('requestNeedsLegal', false);
export const requestTicket = Flow<Record<string, unknown>>('requestTicket', {
  id: 'Не отправлено',
  owner: 'Не назначен',
  eta: 'Ожидает оценки',
});
export const requestStatus = Flow<string>('requestStatus', 'Черновик');
export const requestValidationNote = Flow<string>('requestValidationNote', '');
