import type { DataSource } from '@bdui/core';
import type { ShortAction } from '@bdui/dsl';
import {
  Button,
  Checkbox,
  Column,
  Contract,
  Divider,
  FlowRoute,
  If,
  Image,
  Input,
  Navigation,
  Route,
  Row,
  Select,
  Step,
  Text,
  ThemeConfig as Theme,
} from '@bdui/dsl';
import { bind, E, Flow, Session, use } from '@bdui/dsl';

import meta from './meta.json';

const apiBase = '/api';

const dataSources: readonly DataSource[] = [
  {
    id: 'workspaceSnapshot',
    kind: 'rest',
    url: `${apiBase}/workspace?plan={{session.plan}}`,
    method: 'GET',
    headers: { accept: 'application/json' },
  },
  {
    id: 'starterCatalog',
    kind: 'static',
    value: {
      templateName: 'Шаблон готовности запуска',
      sections: 7,
      guardrails: 'Данные, право, бренд, откат',
      defaultOwner: 'Операции',
    },
  },
];

/* ----------------------------- State ----------------------------- */
export const userName = Session<string>('userName', 'Анна Смирнова');
export const userEmail = Session<string>('userEmail', 'anna.smirnova@example.ru');
export const workspaceName = Session<string>('workspaceName', 'Северный контур');
export const plan = Session<string>('plan', 'Рост');
export const themeMode = Session<string>('themeMode', 'Системная');
export const notifications = Session<boolean>('notifications', true);
export const compactMode = Session<boolean>('compactMode', false);
export const settingsSaved = Session<string>('settingsSaved', 'Ещё не синхронизировано');

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

/* --------------------------- Actions ----------------------------- */
const refreshWorkspace = [
  { fetch: { sourceId: 'workspaceSnapshot', saveTo: bind(workspaceSnapshot) } },
  { set: [bind(statusMessage), 'Срез рабочего пространства обновлён через источник данных BDUI'] },
  { toast: ['Данные обновлены', { level: 'success' as const }] },
] satisfies readonly ShortAction[];

const loadStarterCatalog = [
  { fetch: { sourceId: 'starterCatalog', saveTo: bind(starterCatalog) } },
  { set: [bind(statusMessage), 'Статический источник данных загружен во flow-состояние'] },
  { toast: ['Каталог загружен', { level: 'success' as const }] },
] satisfies readonly ShortAction[];

const profileCall = {
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

const taskCall = {
  call: {
    url: `${apiBase}/task`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: { title: '{{flow.draftTask}}', workspace: '{{session.workspaceName}}' },
    saveTo: bind(lastTask),
    rollback: { set: [bind(saveError), 'Не удалось сохранить задачу'] },
  },
} satisfies ShortAction;

const settingsCall = {
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

const requestCall = {
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

/* ---------------------------- Styles ----------------------------- */
const page = {
  minHeight: '100vh',
  background: '#fbfcfe',
  color: '#182230',
  padding: 0,
  gap: 0,
};

const shell = {
  maxWidth: '1180px',
  width: '100%',
  margin: '0 auto',
  padding: '0 24px 36px',
  gap: 0,
};

const topBar = {
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '20px 0',
  background: 'transparent',
  borderBottom: '1px solid #d7dee8',
  flexWrap: 'wrap',
};

const brandMark = {
  width: 42,
  height: 42,
  borderRadius: 6,
  border: '1px solid #b8c7d9',
  background: '#2563eb',
};

const navRow = {
  gap: 8,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const statusStrip = {
  gap: 10,
  flexWrap: 'wrap',
  padding: '10px 0',
  borderBottom: '1px solid #e3e8ef',
};

const panel = {
  background: 'transparent',
  borderTop: '1px solid #d7dee8',
  padding: '22px 0',
  gap: 14,
};

const quietPanel = {
  background: '#ffffff',
  borderLeft: '3px solid #94a3b8',
  borderTop: '1px solid #e3e8ef',
  padding: '12px 14px',
  gap: 8,
};

const grid = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  gap: 14,
};

const twoColumnGrid = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  },
  columnGap: 32,
  rowGap: 18,
};

const title = { fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1.14 };
const subtitle = { color: '#5b677a', lineHeight: 1.55, maxWidth: 720 };
const eyebrow = {
  color: '#0f766e',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0,
  textTransform: 'uppercase',
};
const sectionTitle = { fontSize: 18, fontWeight: 800, color: '#101827' };
const metricValue = { fontSize: 26, fontWeight: 800, color: '#16213a' };
const muted = { color: '#6b7688' };
const success = { color: '#047857', fontWeight: 700 };
const warning = { color: '#b45309', fontWeight: 700 };
const danger = { color: '#b91c1c', fontWeight: 700 };
const pill = {
  borderLeft: '3px solid #0f766e',
  borderRadius: 0,
  padding: '5px 10px',
  background: '#eef7f5',
  color: '#1f3f3a',
  fontSize: 12,
  fontWeight: 700,
};
const fieldGroup = { gap: 6 };
const inputStyle = {
  width: '100%',
  minHeight: 42,
  borderRadius: 4,
  border: '1px solid #aebccd',
  padding: '9px 11px',
  background: '#ffffff',
  color: '#16213a',
};
const primaryButton = {
  variant: 'primary',
  minHeight: 40,
  borderRadius: 4,
  border: '1px solid #0f766e',
  background: '#0f766e',
  color: '#ffffff',
  padding: '9px 14px',
  fontWeight: 800,
  boxShadow: 'none',
};
const secondaryButton = {
  variant: 'secondary',
  minHeight: 40,
  borderRadius: 4,
  border: '1px solid #aebccd',
  background: '#ffffff',
  color: '#16213a',
  padding: '9px 14px',
  fontWeight: 800,
  boxShadow: 'none',
};

/* --------------------------- Shared UI --------------------------- */
const CacheBadge = () => <Text modifiers={pill}>Кэш контракта: {use(contractCacheSource)}</Text>;

const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={success}>{use(statusMessage)}</Text>
  </If>
);

const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.saveError) > 0')}>
    <Text modifiers={danger}>{use(saveError)}</Text>
  </If>
);

const FieldLabel = ({ label }: { label: string }) => <Text modifiers={muted}>{label}</Text>;

const TextField = ({
  label,
  binding,
  placeholder,
  inputType = 'text',
}: {
  label: string;
  binding: ReturnType<typeof bind>;
  placeholder: string;
  inputType?: 'text' | 'number' | 'email';
}) => (
  <Column modifiers={fieldGroup}>
    <FieldLabel label={label} />
    <Input
      binding={binding}
      placeholder={placeholder}
      inputType={inputType}
      modifiers={inputStyle}
    />
  </Column>
);

const Nav = () => (
  <Row modifiers={navRow}>
    <Button
      title="Дашборд"
      modifiers={secondaryButton}
      onAction={[{ navigate: ['dashboard', { mode: 'replace' }] }]}
    />
    <Button
      title="Заявки"
      modifiers={secondaryButton}
      onAction={[{ navigate: ['requests', { mode: 'replace' }] }]}
    />
    <Button
      title="Настройки"
      modifiers={secondaryButton}
      onAction={[{ navigate: ['settings', { mode: 'replace' }] }]}
    />
    <Button
      title="Новая заявка"
      modifiers={primaryButton}
      onAction={[{ flowStart: { routeId: 'launch-request' } }]}
    />
  </Row>
);

const AppShell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Column modifiers={shell}>
      <Row modifiers={topBar}>
        <Row modifiers={{ alignItems: 'center', gap: 12 }}>
          <Image
            src="/brand-mark.svg"
            alt="Операционный пульт"
            width={42}
            height={42}
            fit="cover"
            modifiers={brandMark}
          />
          <Column modifiers={{ gap: 2 }}>
            <Text modifiers={{ fontSize: 18, fontWeight: 800 }}>Операционный пульт</Text>
            <Text modifiers={muted}>{use(workspaceName)}</Text>
          </Column>
        </Row>
        <Nav />
      </Row>
      <Row modifiers={statusStrip}>
        <CacheBadge />
        <Text modifiers={pill}>Активный раздел: {use(activeView)}</Text>
        <Text modifiers={pill}>Тариф: {use(plan)}</Text>
      </Row>
      {children}
    </Column>
  </Column>
);

const MetricTile = ({ label, value, note }: { label: string; value: unknown; note: string }) => (
  <Column modifiers={quietPanel}>
    <Text modifiers={muted}>{label}</Text>
    <Text modifiers={metricValue}>{value}</Text>
    <Text modifiers={muted}>{note}</Text>
  </Column>
);

const Hero = () => (
  <Column modifiers={{ ...panel, gap: 16 }}>
    <Row modifiers={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <Column modifiers={{ gap: 6, maxWidth: 760 }}>
        <Text modifiers={eyebrow}>BDUI витрина возможностей</Text>
        <Text modifiers={title}>Продуктовое приложение, собранное из контракта</Text>
        <Text modifiers={subtitle}>
          Этот пример показывает кэш контракта, серверные действия, источники данных, сохранение
          сессии, защитные ветки, валидацию, уведомления, навигацию и многошаговые формы.
        </Text>
      </Column>
    </Row>
    <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
      <Button title="Обновить данные" modifiers={primaryButton} onAction={refreshWorkspace} />
      <Button title="Загрузить каталог" modifiers={secondaryButton} onAction={loadStarterCatalog} />
      <Button
        title="Предзагрузить форму"
        modifiers={secondaryButton}
        onAction={[
          { prefetch: ['launch-request', 'requests'] },
          { toast: ['Форма предзагружена'] },
        ]}
      />
      <Button
        title="Открыть описание"
        modifiers={secondaryButton}
        onAction={[{ modalOpen: 'showcase-brief' }]}
      />
    </Row>
    <If condition={false}>
      <Column id="showcase-brief" modifiers={{ ...panel, maxWidth: 520 }}>
        <Text modifiers={sectionTitle}>Кратко о возможностях BDUI</Text>
        <Text modifiers={subtitle}>
          Эта модалка описана в том же дереве контракта. Web-renderer находит её по node id,
          монтирует через modal host и закрывает сериализуемым SAL-действием.
        </Text>
        <Row modifiers={{ gap: 10, justifyContent: 'flex-end' }}>
          <Button
            title="Закрыть"
            modifiers={primaryButton}
            onAction={[{ modalClose: 'showcase-brief' }]}
          />
        </Row>
      </Column>
    </If>
    <StatusLine />
    <ErrorLine />
  </Column>
);

const DashboardMetrics = () => (
  <Column modifiers={grid}>
    <MetricTile
      label="Состояние пространства"
      value={E<string>('flow.workspaceSnapshot.health')}
      note="REST-источник"
    />
    <MetricTile
      label="Загрузка"
      value={E<string>("concat(flow.workspaceSnapshot.utilization, '%')")}
      note="Операционный сигнал"
    />
    <MetricTile
      label="Финансовый контур"
      value={E<string>('flow.workspaceSnapshot.revenue')}
      note="Расчёт сервера"
    />
    <MetricTile
      label="Открытые блокеры"
      value={E<number>('flow.workspaceSnapshot.blockerCount')}
      note="Контроль процесса"
    />
  </Column>
);

const WorkPanel = () => (
  <Column modifiers={panel}>
    <Text modifiers={sectionTitle}>Операционный ритм на сегодня</Text>
    <Column modifiers={grid}>
      <Column modifiers={quietPanel}>
        <Text modifiers={muted}>Следующий разбор</Text>
        <Text modifiers={{ fontWeight: 800 }}>
          {E<string>('flow.workspaceSnapshot.nextReview')}
        </Text>
        <Text modifiers={muted}>
          Последняя синхронизация: {E<string>('flow.workspaceSnapshot.updatedAt')}
        </Text>
      </Column>
      <Column modifiers={quietPanel}>
        <Text modifiers={muted}>Риск-профиль</Text>
        <Text modifiers={{ fontWeight: 800 }}>{E<string>('flow.workspaceSnapshot.risk')}</Text>
        <Text modifiers={muted}>SLA: {E<string>('flow.workspaceSnapshot.sla')}</Text>
      </Column>
      <Column modifiers={quietPanel}>
        <Text modifiers={muted}>Стартовый каталог</Text>
        <Text modifiers={{ fontWeight: 800 }}>{E<string>('flow.starterCatalog.templateName')}</Text>
        <Text modifiers={muted}>
          Контрольные точки: {E<string>('flow.starterCatalog.guardrails')}
        </Text>
      </Column>
    </Column>
  </Column>
);

const TaskPanel = () => (
  <Column modifiers={panel}>
    <Text modifiers={sectionTitle}>Фиксация действия</Text>
    <Text modifiers={subtitle}>
      Сохранение проходит через серверный вызов, локальное состояние обновляется атомарной пачкой, а
      ошибка откатывается в видимое состояние при сбое запроса.
    </Text>
    <TextField
      label="Следующая задача"
      binding={bind(draftTask)}
      placeholder="Опишите следующее операционное действие"
    />
    <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
      <Button
        title="Сохранить задачу"
        modifiers={primaryButton}
        onAction={[
          {
            when: {
              if: 'len(flow.draftTask) == 0',
              then: [{ toast: ['Введите задачу перед сохранением', { level: 'warning' }] }],
              else: [
                {
                  batch: [
                    { set: [bind(saveError), ''] },
                    taskCall,
                    { set: [bind(draftTask), ''] },
                    { set: [bind(taskDone), false] },
                    { inc: bind(taskCount) },
                    { set: [bind(statusMessage), 'Задача сохранена через API'] },
                    { toast: ['Задача сохранена', { level: 'success' }] },
                  ],
                  atomic: true,
                },
              ],
            },
          },
        ]}
      />
      <Button
        title="Очистить"
        modifiers={secondaryButton}
        onAction={[{ set: [bind(draftTask), ''] }, { set: [bind(saveError), ''] }]}
      />
    </Row>
    <Divider />
    <Column modifiers={{ gap: 8 }}>
      <Text modifiers={muted}>Сохранённых задач: {use(taskCount)}</Text>
      <Checkbox binding={bind(taskDone)} label={use(lastTask) as unknown as string} />
    </Column>
  </Column>
);

const Dashboard = () => (
  <AppShell>
    <Hero />
    <DashboardMetrics />
    <Column modifiers={twoColumnGrid}>
      <WorkPanel />
      <TaskPanel />
    </Column>
  </AppShell>
);

const RequestsRoute = () => (
  <AppShell>
    <Column modifiers={panel}>
      <Row modifiers={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Column modifiers={{ gap: 6 }}>
          <Text modifiers={eyebrow}>Многошаговая форма</Text>
          <Text modifiers={title}>Стол заявок на запуск</Text>
          <Text modifiers={subtitle}>
            Flow собирает детали заявки, запускает подключаемый валидатор, ветвится через условие,
            отправляет данные на сервер и возвращает пользователя в этот раздел.
          </Text>
        </Column>
        <Button
          title="Начать заявку"
          modifiers={primaryButton}
          onAction={[{ flowStart: { routeId: 'launch-request' } }]}
        />
      </Row>
    </Column>
    <Column modifiers={grid}>
      <MetricTile label="Статус заявки" value={use(requestStatus)} note="Flow-состояние" />
      <MetricTile label="Тикет" value={E<string>('flow.requestTicket.id')} note="Ответ API" />
      <MetricTile
        label="Ответственный"
        value={E<string>('flow.requestTicket.owner')}
        note="Назначение сервера"
      />
      <MetricTile label="ETA" value={E<string>('flow.requestTicket.eta')} note="SLA сервера" />
    </Column>
    <Column modifiers={panel}>
      <Text modifiers={sectionTitle}>Последняя заявка</Text>
      <Text>Тип: {use(requestType)}</Text>
      <Text>Приоритет: {use(requestPriority)}</Text>
      <Text>Кратко: {use(requestSummary)}</Text>
      <Text>Влияние: {use(requestImpact)}</Text>
    </Column>
  </AppShell>
);

const SettingsRoute = () => (
  <AppShell>
    <Column modifiers={twoColumnGrid}>
      <Column modifiers={panel}>
        <Text modifiers={sectionTitle}>Профиль и пространство</Text>
        <TextField label="Имя" binding={bind(userName)} placeholder="Полное имя" />
        <TextField
          label="Почта"
          binding={bind(userEmail)}
          placeholder="email@example.ru"
          inputType="email"
        />
        <TextField
          label="Пространство"
          binding={bind(workspaceName)}
          placeholder="Название пространства"
        />
        <Column modifiers={fieldGroup}>
          <FieldLabel label="Тариф" />
          <Select
            binding={bind(plan)}
            placeholder="Тариф"
            modifiers={inputStyle}
            options={[
              { value: 'Старт', label: 'Старт' },
              { value: 'Рост', label: 'Рост' },
              { value: 'Корпоративный', label: 'Корпоративный' },
            ]}
          />
        </Column>
      </Column>
      <Column modifiers={panel}>
        <Text modifiers={sectionTitle}>Опыт работы</Text>
        <Column modifiers={fieldGroup}>
          <FieldLabel label="Тема интерфейса" />
          <Select
            binding={bind(themeMode)}
            placeholder="Тема"
            modifiers={inputStyle}
            options={[
              { value: 'Системная', label: 'Как в системе' },
              { value: 'Светлая', label: 'Светлая' },
              { value: 'Тёмная', label: 'Тёмная' },
            ]}
          />
        </Column>
        <Checkbox binding={bind(notifications)} label="Отправлять операционные уведомления" />
        <Checkbox binding={bind(compactMode)} label="Использовать компактную плотность" />
        <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
          <Button
            title="Сохранить настройки"
            modifiers={primaryButton}
            onAction={[
              {
                batch: [
                  { set: [bind(saveError), ''] },
                  settingsCall,
                  profileCall,
                  { sync: {} },
                  {
                    set: [
                      bind(statusMessage),
                      'Настройки синхронизированы и сохранены в session storage',
                    ],
                  },
                  { toast: ['Настройки сохранены', { level: 'success' }] },
                ],
                atomic: true,
              },
            ]}
          />
          <Button
            title="Обновить пространство"
            modifiers={secondaryButton}
            onAction={refreshWorkspace}
          />
        </Row>
        <Text modifiers={muted}>Последнее сохранение: {use(settingsSaved)}</Text>
        <StatusLine />
        <ErrorLine />
      </Column>
    </Column>
  </AppShell>
);

/* ---------------------------- Contract --------------------------- */
export default (
  <Contract meta={meta} dataSources={dataSources}>
    <Theme.Simple
      primary="#2f6fed"
      background="#f3f6fb"
      darkBackground="#101827"
      extendTokens={() => ({
        'surface.card': { radius: 8, border: '#d8e0ea' },
        'state.success': { color: '#047857' },
        'state.warning': { color: '#b45309' },
      })}
    />
    <Navigation initialRoute="dashboard" urlSync>
      <Route id="dashboard" title="Дашборд">
        <Dashboard />
      </Route>

      <Route id="requests" title="Заявки">
        <RequestsRoute />
      </Route>

      <Route id="settings" title="Настройки">
        <SettingsRoute />
      </Route>

      <FlowRoute
        id="launch-request"
        title="Новая заявка на запуск"
        startStep="basics"
        persistence={{ mode: 'session' }}
      >
        <Step id="basics" title="Основное">
          <AppShell>
            <Column modifiers={panel}>
              <Text modifiers={eyebrow}>Шаг 1 из 3</Text>
              <Text modifiers={title}>Опишите заявку</Text>
              <Text modifiers={subtitle}>
                Подключаемый валидатор пишет детали проверки в локальное состояние, а защищённые
                действия решают, может ли форма перейти дальше.
              </Text>
              <Column modifiers={grid}>
                <Column modifiers={fieldGroup}>
                  <FieldLabel label="Тип заявки" />
                  <Select
                    binding={bind(requestType)}
                    placeholder="Тип"
                    modifiers={inputStyle}
                    options={[
                      { value: 'Проверка запуска', label: 'Проверка запуска' },
                      { value: 'Миграция данных', label: 'Миграция данных' },
                      { value: 'Согласование эксперимента', label: 'Согласование эксперимента' },
                      { value: 'Разбор инцидента', label: 'Разбор инцидента' },
                    ]}
                  />
                </Column>
                <Column modifiers={fieldGroup}>
                  <FieldLabel label="Приоритет" />
                  <Select
                    binding={bind(requestPriority)}
                    placeholder="Приоритет"
                    modifiers={inputStyle}
                    options={[
                      { value: 'Обычный', label: 'Обычный' },
                      { value: 'Высокий', label: 'Высокий' },
                      { value: 'Срочный', label: 'Срочный' },
                    ]}
                  />
                </Column>
              </Column>
              <TextField
                label="Краткое описание"
                binding={bind(requestSummary)}
                placeholder="Например: согласовать запуск биллинга для пилотной группы"
              />
              <If condition={E<boolean>('local.__validation.requestIntake.ok == false')}>
                <Text modifiers={danger}>
                  {E<string>('local.__validation.requestIntake.errors[0]')}
                </Text>
              </If>
              <If condition={E<boolean>('len(flow.requestValidationNote) > 0')}>
                <Text modifiers={warning}>{use(requestValidationNote)}</Text>
              </If>
              <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title="Отмена"
                  modifiers={secondaryButton}
                  onAction={[{ flowAbort: { reason: 'cancelled' } }, { navigate: ['requests'] }]}
                />
                <Button
                  title="Продолжить"
                  modifiers={primaryButton}
                  onAction={[
                    { validate: ['requestIntake', bind(requestSummary)] },
                    {
                      when: {
                        if: 'len(flow.requestSummary) < 12',
                        then: [
                          {
                            set: [
                              bind(requestValidationNote),
                              'Добавьте минимум 12 символов, чтобы ревьюеры смогли разобрать заявку.',
                            ],
                          },
                          { toast: ['Описание слишком короткое', { level: 'warning' }] },
                        ],
                        else: [
                          { set: [bind(requestValidationNote), ''] },
                          { flowGoTo: { stepId: 'impact' } },
                        ],
                      },
                    },
                  ]}
                />
              </Row>
            </Column>
          </AppShell>
        </Step>

        <Step id="impact" title="Влияние">
          <AppShell>
            <Column modifiers={panel}>
              <Text modifiers={eyebrow}>Шаг 2 из 3</Text>
              <Text modifiers={title}>Добавьте влияние и контрольные точки</Text>
              <TextField
                label="Ожидаемое влияние"
                binding={bind(requestImpact)}
                placeholder="Кого затронет изменение, что меняется и как снижается риск"
              />
              <TextField
                label="Бюджетный контур"
                binding={bind(requestBudget)}
                placeholder="25000"
                inputType="number"
              />
              <Column modifiers={quietPanel}>
                <Checkbox binding={bind(requestNeedsDesign)} label="Нужен дизайн-ревью" />
                <Checkbox binding={bind(requestNeedsLegal)} label="Нужен юридический ревью" />
              </Column>
              <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title="Назад"
                  modifiers={secondaryButton}
                  onAction={[{ flowGoTo: { stepId: 'basics' } }]}
                />
                <Button
                  title="На проверку"
                  modifiers={primaryButton}
                  onAction={[
                    {
                      when: {
                        if: 'len(flow.requestImpact) < 20',
                        then: [
                          {
                            set: [
                              bind(requestValidationNote),
                              'Добавьте более ясное описание влияния перед проверкой.',
                            ],
                          },
                          { toast: ['Описание влияния слишком короткое', { level: 'warning' }] },
                        ],
                        else: [
                          { set: [bind(requestValidationNote), ''] },
                          { flowGoTo: { stepId: 'confirm' } },
                        ],
                      },
                    },
                  ]}
                />
              </Row>
              <If condition={E<boolean>('len(flow.requestValidationNote) > 0')}>
                <Text modifiers={warning}>{use(requestValidationNote)}</Text>
              </If>
            </Column>
          </AppShell>
        </Step>

        <Step id="confirm" title="Подтверждение">
          <AppShell>
            <Column modifiers={panel}>
              <Text modifiers={eyebrow}>Шаг 3 из 3</Text>
              <Text modifiers={title}>Проверьте и отправьте</Text>
              <Column modifiers={grid}>
                <MetricTile label="Тип" value={use(requestType)} note="Выбрано на шаге 1" />
                <MetricTile label="Приоритет" value={use(requestPriority)} note="Маршрутизация" />
                <MetricTile
                  label="Бюджет"
                  value={E<string>("concat(flow.requestBudget, ' ₽')")}
                  note="Контур"
                />
                <MetricTile
                  label="Дизайн-ревью"
                  value={E<string>("flow.requestNeedsDesign ? 'Нужно' : 'Не нужно'")}
                  note="Контроль"
                />
              </Column>
              <Column modifiers={quietPanel}>
                <Text modifiers={sectionTitle}>Кратко</Text>
                <Text>{use(requestSummary)}</Text>
                <Text modifiers={sectionTitle}>Влияние</Text>
                <Text>{use(requestImpact)}</Text>
              </Column>
              <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title="Назад"
                  modifiers={secondaryButton}
                  onAction={[{ flowGoTo: { stepId: 'impact' } }]}
                />
                <Button
                  title="Отправить заявку"
                  modifiers={primaryButton}
                  onAction={[
                    {
                      batch: [
                        { set: [bind(saveError), ''] },
                        requestCall,
                        { set: [bind(requestStatus), 'Отправлена'] },
                        {
                          set: [bind(statusMessage), 'Заявка на запуск отправлена через API'],
                        },
                        { flowComplete: true },
                        { navigate: ['requests'] },
                        { toast: ['Заявка отправлена', { level: 'success' }] },
                      ],
                      atomic: true,
                    },
                  ]}
                />
              </Row>
              <ErrorLine />
            </Column>
          </AppShell>
        </Step>
      </FlowRoute>
    </Navigation>
  </Contract>
);
