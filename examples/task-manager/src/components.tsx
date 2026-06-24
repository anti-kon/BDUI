import {
  bind,
  Button,
  Checkbox,
  Column,
  Divider,
  E,
  If,
  Image,
  Input,
  Row,
  Select,
  Text,
  use,
} from '@bdui/dsl';

import {
  loadStarterCatalog,
  profileCall,
  refreshWorkspace,
  settingsCall,
  taskCall,
} from './actions.js';
import {
  activeView,
  compactMode,
  contractCacheSource,
  draftTask,
  lastTask,
  notifications,
  plan,
  requestImpact,
  requestPriority,
  requestStatus,
  requestSummary,
  requestType,
  saveError,
  settingsSaved,
  statusMessage,
  taskCount,
  taskDone,
  themeMode,
  userEmail,
  userName,
  workspaceName,
} from './state.js';
import {
  brandMark,
  danger,
  eyebrow,
  fieldGroup,
  grid,
  inputStyle,
  metricValue,
  muted,
  navRow,
  page,
  panel,
  pill,
  primaryButton,
  quietPanel,
  secondaryButton,
  sectionTitle,
  shell,
  statusStrip,
  subtitle,
  success,
  title,
  topBar,
  twoColumnGrid,
} from './styles.js';

/* --------------------------- Shared UI --------------------------- */
const CacheBadge = () => <Text modifiers={pill}>Кэш контракта: {use(contractCacheSource)}</Text>;

const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={success}>{use(statusMessage)}</Text>
  </If>
);

export const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.saveError) > 0')}>
    <Text modifiers={danger}>{use(saveError)}</Text>
  </If>
);

export const FieldLabel = ({ label }: { label: string }) => <Text modifiers={muted}>{label}</Text>;

export const TextField = ({
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

export const AppShell = ({ children }: { children: unknown }) => (
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

export const MetricTile = ({
  label,
  value,
  note,
}: {
  label: string;
  value: unknown;
  note: string;
}) => (
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

/* ----------------------------- Routes ---------------------------- */
export const Dashboard = () => (
  <AppShell>
    <Hero />
    <DashboardMetrics />
    <Column modifiers={twoColumnGrid}>
      <WorkPanel />
      <TaskPanel />
    </Column>
  </AppShell>
);

export const RequestsRoute = () => (
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

export const SettingsRoute = () => (
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
