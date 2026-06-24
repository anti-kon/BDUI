import {
  bind,
  Button,
  Checkbox,
  Column,
  Contract,
  E,
  FlowRoute,
  If,
  Navigation,
  Route,
  Row,
  Select,
  Step,
  Text,
  ThemeConfig as Theme,
  use,
} from '@bdui/dsl';

import { requestCall } from './actions.js';
import {
  AppShell,
  Dashboard,
  ErrorLine,
  FieldLabel,
  MetricTile,
  RequestsRoute,
  SettingsRoute,
  TextField,
} from './components.js';
import { dataSources } from './data.js';
import meta from './meta.json';
import {
  requestBudget,
  requestImpact,
  requestNeedsDesign,
  requestNeedsLegal,
  requestPriority,
  requestStatus,
  requestSummary,
  requestType,
  requestValidationNote,
  saveError,
  statusMessage,
} from './state.js';
import {
  danger,
  eyebrow,
  fieldGroup,
  grid,
  inputStyle,
  panel,
  primaryButton,
  quietPanel,
  secondaryButton,
  sectionTitle,
  subtitle,
  title,
  warning,
} from './styles.js';

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
