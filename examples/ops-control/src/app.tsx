import {
  bind,
  Button,
  Checkbox,
  Column,
  Contract,
  E,
  FlowRoute,
  If,
  Input,
  Navigation,
  Route,
  Row,
  Select,
  Step,
  Text,
  ThemeConfig as Theme,
  use,
} from '@bdui/dsl';

import {
  AppShell,
  AssignmentsSummary,
  ErrorLine,
  QrBlock,
  RequestSummary,
  ScheduleSummary,
  StatusLine,
  StudentCard,
  TodaySchedule,
  TomorrowSchedule,
  WeekSchedule,
} from './components.js';
import meta from './meta.json';
import {
  appMode,
  assignmentNotes,
  assignmentProgress,
  assignmentUploaded,
  attendancePercent,
  campusName,
  deadlineCount,
  dormitoryNeed,
  libraryHoldCount,
  notificationsEnabled,
  passActive,
  passUntil,
  passZone,
  qrVersion,
  qrVisible,
  requestComment,
  requestNumber,
  requestStatus,
  requestType,
  requestUrgency,
  selectedDay,
  statusMessage,
  studentGroup,
  studentName,
  teacherChecked,
  validationError,
} from './state.js';
import { card, danger, muted, page, sectionTitle, success, title } from './styles.js';

export * from './state.js';

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#0ea5e9" background="#f8fafc" darkBackground="#0f172a" />
    <Navigation initialRoute="home" urlSync>
      <Route id="home" title="Главная">
        <AppShell>
          <StudentCard />
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <Column modifiers={card}>
              <Text modifiers={{ color: '#0369a1', fontSize: 22, fontWeight: 700 }}>
                {use(deadlineCount)}
              </Text>
              <Text>Дедлайна на неделе</Text>
            </Column>
            <Column modifiers={card}>
              <Text modifiers={{ color: '#0369a1', fontSize: 22, fontWeight: 700 }}>
                {use(attendancePercent)}%
              </Text>
              <Text>Посещаемость</Text>
            </Column>
            <Column modifiers={card}>
              <Text modifiers={{ color: '#0369a1', fontSize: 22, fontWeight: 700 }}>
                {use(libraryHoldCount)}
              </Text>
              <Text>Книга к возврату</Text>
            </Column>
          </Row>
          <ScheduleSummary />
          <AssignmentsSummary />
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <Button
              title="Открыть расписание"
              modifiers={{ variant: 'primary' }}
              onAction={[{ navigate: ['schedule'] }]}
            />
            <Button title="Открыть задания" onAction={[{ navigate: ['assignments'] }]} />
            <Button title="Показать пропуск" onAction={[{ navigate: ['pass'] }]} />
          </Row>
          <StatusLine />
        </AppShell>
      </Route>

      <Route id="schedule" title="Расписание">
        <AppShell>
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Расписание</Text>
            <Select
              binding={bind(selectedDay)}
              placeholder="День"
              options={[
                { label: 'Сегодня', value: 'Сегодня' },
                { label: 'Завтра', value: 'Завтра' },
                { label: 'Неделя', value: 'Неделя' },
              ]}
            />
            <Text>Выбран период: {use(selectedDay)}</Text>
          </Column>
          <TodaySchedule />
          <TomorrowSchedule />
          <WeekSchedule />
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Учебные действия</Text>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button
                title="Отметить присутствие"
                modifiers={{ variant: 'primary' }}
                onAction={[
                  { set: [bind(statusMessage), 'Присутствие отмечено, расписание обновлено'] },
                  { toast: ['Присутствие отмечено', { level: 'success' }] },
                ]}
              />
              <Button
                title="Добавить напоминание"
                onAction={[
                  { set: [bind(statusMessage), 'Напоминание о следующей паре добавлено'] },
                  { toast: ['Напоминание добавлено'] },
                ]}
              />
            </Row>
          </Column>
          <StatusLine />
        </AppShell>
      </Route>

      <Route id="assignments" title="Задания">
        <AppShell>
          <AssignmentsSummary />
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Чек-лист задания</Text>
            <Checkbox binding={bind(assignmentNotes)} label="Конспект подготовлен" />
            <Checkbox binding={bind(assignmentUploaded)} label="Файл отправлен" />
            <Checkbox binding={bind(teacherChecked)} label="Преподаватель проверил работу" />
            <ErrorLine />
          </Column>
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <Button
              title="Проверить готовность"
              modifiers={{ variant: 'primary' }}
              onAction={[
                {
                  when: {
                    if: 'flow.assignmentNotes == false || flow.assignmentUploaded == false || flow.teacherChecked == false',
                    then: [
                      {
                        set: [
                          bind(validationError),
                          'Для закрытия задания нужны конспект, отправленный файл и проверка преподавателя.',
                        ],
                      },
                      { toast: ['Есть незакрытые пункты', { level: 'warning' }] },
                    ],
                    else: [
                      { set: [bind(validationError), ''] },
                      { set: [bind(assignmentProgress), 100] },
                      { set: [bind(statusMessage), 'Задание закрыто'] },
                      { toast: ['Задание закрыто', { level: 'success' }] },
                    ],
                  },
                },
              ]}
            />
            <Button
              title="Задать вопрос в деканат"
              onAction={[{ flowStart: { routeId: 'deanery-request' } }]}
            />
          </Row>
          <StatusLine />
        </AppShell>
      </Route>

      <Route id="deanery" title="Деканат">
        <AppShell>
          <RequestSummary />
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Быстрые сервисы</Text>
            <Text>
              Справка об обучении, академическая выписка, общежитие и вопросы по расписанию.
            </Text>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button
                title="Новая заявка"
                modifiers={{ variant: 'primary' }}
                onAction={[{ flowStart: { routeId: 'deanery-request' } }]}
              />
              <Button
                title="Отменить черновик"
                onAction={[
                  { set: [bind(requestStatus), 'Черновик'] },
                  { set: [bind(statusMessage), 'Черновик заявки очищен'] },
                ]}
              />
            </Row>
          </Column>
          <StatusLine />
        </AppShell>
      </Route>

      <Route id="pass" title="Пропуск">
        <AppShell>
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Цифровой пропуск</Text>
            <Text>Владелец: {use(studentName)}</Text>
            <Text>Группа: {use(studentGroup)}</Text>
            <Text>Зона доступа: {use(passZone)}</Text>
            <Text>Действует: {use(passUntil)}</Text>
            <If condition={E<boolean>('flow.passActive == true')}>
              <Text modifiers={success}>Пропуск активен</Text>
            </If>
            <If condition={E<boolean>('flow.passActive == false')}>
              <Text modifiers={danger}>Пропуск временно заблокирован</Text>
            </If>
          </Column>
          <If condition={E<boolean>('flow.qrVisible == false')}>
            <Column modifiers={card}>
              <Text>Нажмите «Обновить QR», чтобы показать код пропуска.</Text>
            </Column>
          </If>
          <If condition={E<boolean>('flow.qrVisible == true')}>
            <QrBlock />
          </If>
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <Button
              title="Обновить QR"
              modifiers={{ variant: 'primary' }}
              onAction={[
                { set: [bind(qrVisible), true] },
                { inc: bind(qrVersion) },
                { set: [bind(statusMessage), 'QR-код обновлен, действителен 60 секунд'] },
                { toast: ['QR-код обновлен'] },
              ]}
            />
            <Button
              title="Переключить доступ"
              onAction={[
                {
                  when: {
                    if: 'flow.passActive == true',
                    then: [
                      { set: [bind(passActive), false] },
                      { set: [bind(statusMessage), 'Пропуск заблокирован по запросу студента'] },
                    ],
                    else: [
                      { set: [bind(passActive), true] },
                      { set: [bind(statusMessage), 'Пропуск снова активен'] },
                    ],
                  },
                },
              ]}
            />
          </Row>
          <StatusLine />
        </AppShell>
      </Route>

      <Route id="settings" title="Настройки">
        <AppShell>
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Профиль</Text>
            <Input binding={bind(studentName)} placeholder="ФИО" inputType="text" />
            <Input binding={bind(studentGroup)} placeholder="Группа" inputType="text" />
            <Input binding={bind(campusName)} placeholder="Вуз" inputType="text" />
            <Select
              binding={bind(appMode)}
              placeholder="Режим"
              options={[
                { label: 'Учебный день', value: 'Учебный день' },
                { label: 'Зачетная неделя', value: 'Зачетная неделя' },
                { label: 'Сессия', value: 'Сессия' },
                { label: 'Каникулы', value: 'Каникулы' },
              ]}
            />
            <Checkbox
              binding={bind(notificationsEnabled)}
              label="Получать уведомления о парах и дедлайнах"
            />
          </Column>
          <Button
            title="Сохранить"
            modifiers={{ variant: 'primary' }}
            onAction={[
              { set: [bind(statusMessage), 'Настройки сохранены'] },
              { toast: ['Настройки сохранены', { level: 'success' }] },
              { navigate: ['home'] },
            ]}
          />
        </AppShell>
      </Route>

      <FlowRoute id="deanery-request" title="Заявка в деканат" startStep="choose">
        <Step id="choose" title="Тип заявки">
          <Column modifiers={page}>
            <Text modifiers={title}>Заявка в деканат</Text>
            <Text modifiers={muted}>Шаг 1 из 3. Выберите услугу, которую нужно получить.</Text>
            <Column modifiers={card}>
              <Select
                binding={bind(requestType)}
                placeholder="Тип заявки"
                options={[
                  { label: 'Справка об обучении', value: 'Справка об обучении' },
                  { label: 'Академическая выписка', value: 'Академическая выписка' },
                  { label: 'Вопрос по расписанию', value: 'Вопрос по расписанию' },
                  { label: 'Общежитие', value: 'Общежитие' },
                ]}
              />
              <Select
                binding={bind(requestUrgency)}
                placeholder="Срочность"
                options={[
                  { label: 'Обычная', value: 'Обычная' },
                  { label: 'Нужна сегодня', value: 'Нужна сегодня' },
                ]}
              />
            </Column>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button
                title="Отмена"
                onAction={[{ flowAbort: { reason: 'cancelled' } }, { navigate: ['deanery'] }]}
              />
              <Button
                title="Далее"
                modifiers={{ variant: 'primary' }}
                onAction={[{ flowGoTo: { stepId: 'details' } }]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="details" title="Детали">
          <Column modifiers={page}>
            <Text modifiers={title}>Детали заявки</Text>
            <Text modifiers={muted}>Шаг 2 из 3. Добавьте короткое описание.</Text>
            <Column modifiers={card}>
              <Input binding={bind(requestComment)} placeholder="Комментарий" inputType="text" />
              <Checkbox binding={bind(dormitoryNeed)} label="Связано с общежитием" />
              <ErrorLine />
            </Column>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button title="Назад" onAction={[{ flowGoTo: { stepId: 'choose' } }]} />
              <Button
                title="Далее"
                modifiers={{ variant: 'primary' }}
                onAction={[
                  {
                    when: {
                      if: 'len(flow.requestComment) == 0',
                      then: [
                        { set: [bind(validationError), 'Добавьте комментарий к заявке.'] },
                        { toast: ['Комментарий обязателен', { level: 'warning' }] },
                      ],
                      else: [
                        { set: [bind(validationError), ''] },
                        { flowGoTo: { stepId: 'confirm' } },
                      ],
                    },
                  },
                ]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="confirm" title="Подтверждение">
          <Column modifiers={page}>
            <Text modifiers={title}>Подтверждение</Text>
            <Text modifiers={muted}>Шаг 3 из 3. Проверьте данные перед отправкой.</Text>
            <RequestSummary />
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button title="Назад" onAction={[{ flowGoTo: { stepId: 'details' } }]} />
              <Button
                title="Отправить"
                modifiers={{ variant: 'primary' }}
                onAction={[
                  {
                    batch: [
                      { set: [bind(requestNumber), 'DK-2026-041'] },
                      { set: [bind(requestStatus), 'Отправлена'] },
                      { set: [bind(statusMessage), 'Заявка отправлена в деканат'] },
                      { flowComplete: true },
                      { navigate: ['deanery'] },
                    ],
                    atomic: true,
                  },
                ]}
              />
            </Row>
          </Column>
        </Step>
      </FlowRoute>
    </Navigation>
  </Contract>
);
