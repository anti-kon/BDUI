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

export const studentName = Session<string>('studentName', 'Иван Петров');
export const studentGroup = Session<string>('studentGroup', 'ПИ-23-01');
export const campusName = Session<string>(
  'campusName',
  'Северо-Волжский технологический университет',
);
export const appMode = Session<string>('appMode', 'Учебный день');
export const notificationsEnabled = Session<boolean>('notificationsEnabled', true);

export const selectedDay = Flow<string>('selectedDay', 'Сегодня');
export const nextClass = Flow<string>('nextClass', 'Математический анализ');
export const classRoom = Flow<string>('classRoom', 'Аудитория 204');
export const nextClassTime = Flow<string>('nextClassTime', '09:00');
export const attendancePercent = Flow<number>('attendancePercent', 92);
export const deadlineCount = Flow<number>('deadlineCount', 3);
export const libraryHoldCount = Flow<number>('libraryHoldCount', 1);

export const assignmentTitle = Flow<string>('assignmentTitle', 'Лабораторная работа N 4');
export const assignmentCourse = Flow<string>('assignmentCourse', 'Программирование');
export const assignmentDue = Flow<string>('assignmentDue', 'Пятница, 18:00');
export const assignmentProgress = Flow<number>('assignmentProgress', 60);
export const assignmentNotes = Flow<boolean>('assignmentNotes', true);
export const assignmentUploaded = Flow<boolean>('assignmentUploaded', false);
export const teacherChecked = Flow<boolean>('teacherChecked', false);

export const requestNumber = Flow<string>('requestNumber', 'DK-2026-018');
export const requestType = Flow<string>('requestType', 'Справка об обучении');
export const requestUrgency = Flow<string>('requestUrgency', 'Обычная');
export const requestComment = Flow<string>(
  'requestComment',
  'Нужна справка для участия в олимпиаде',
);
export const requestStatus = Flow<string>('requestStatus', 'Черновик');
export const dormitoryNeed = Flow<boolean>('dormitoryNeed', false);

export const passActive = Flow<boolean>('passActive', true);
export const passZone = Flow<string>('passZone', 'Учебный корпус и библиотека');
export const passUntil = Flow<string>('passUntil', 'Сегодня до 21:00');
export const qrVisible = Flow<boolean>('qrVisible', false);
export const qrVersion = Flow<number>('qrVersion', 1);

export const statusMessage = Flow<string>('statusMessage', '');
export const validationError = Flow<string>('validationError', '');

const page = { gap: 16, margin: '0 auto', maxWidth: '960px', padding: 20 };
const card = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
  gap: 10,
  padding: 16,
};
const title = { color: '#0f172a', fontSize: 28, fontWeight: 700 };
const sectionTitle = { color: '#0f172a', fontSize: 18, fontWeight: 700 };
const muted = { color: '#64748b' };
const success = { color: '#047857', fontWeight: 700 };
const warning = { color: '#b45309', fontWeight: 700 };
const danger = { color: '#b91c1c', fontWeight: 700 };
const qrLine = { color: '#0f172a', fontFamily: 'monospace', fontSize: 18, fontWeight: 700 };

const Header = () => (
  <Row modifiers={{ alignItems: 'center', gap: 12 }}>
    <Image
      src="campus-mark.svg"
      alt="Campus"
      width={44}
      height={44}
      modifiers={{ background: '#e0f2fe', borderRadius: 12 }}
    />
    <Column modifiers={{ gap: 6 }}>
      <Text modifiers={title}>Кампус</Text>
      <Text modifiers={muted}>Расписание занятий, задания, деканат и цифровой пропуск.</Text>
    </Column>
  </Row>
);

const Nav = () => (
  <Row modifiers={{ flexWrap: 'wrap', gap: 8, padding: 0 }}>
    <Button title="Главная" onAction={[{ navigate: ['home', { mode: 'replace' }] }]} />
    <Button title="Расписание" onAction={[{ navigate: ['schedule', { mode: 'replace' }] }]} />
    <Button title="Задания" onAction={[{ navigate: ['assignments', { mode: 'replace' }] }]} />
    <Button title="Деканат" onAction={[{ navigate: ['deanery', { mode: 'replace' }] }]} />
    <Button title="Пропуск" onAction={[{ navigate: ['pass', { mode: 'replace' }] }]} />
    <Button title="Настройки" onAction={[{ navigate: ['settings', { mode: 'replace' }] }]} />
  </Row>
);

const AppShell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Header />
    <Nav />
    <Divider />
    {children}
  </Column>
);

const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={success}>{use(statusMessage)}</Text>
  </If>
);

const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.validationError) > 0')}>
    <Text modifiers={danger}>{use(validationError)}</Text>
  </If>
);

const StudentCard = () => (
  <Column modifiers={card}>
    <Text modifiers={sectionTitle}>Студент</Text>
    <Text>ФИО: {use(studentName)}</Text>
    <Text>Группа: {use(studentGroup)}</Text>
    <Text>Вуз: {use(campusName)}</Text>
    <Text>Режим: {use(appMode)}</Text>
  </Column>
);

const ScheduleSummary = () => (
  <Column modifiers={card}>
    <Text modifiers={sectionTitle}>Ближайшая пара</Text>
    <Text>Пара: {use(nextClass)}</Text>
    <Text>Начало: {use(nextClassTime)}</Text>
    <Text>Место: {use(classRoom)}</Text>
    <Text>Посещаемость: {use(attendancePercent)}%</Text>
    <If condition={E<boolean>('flow.deadlineCount > 0')}>
      <Text modifiers={warning}>Есть дедлайны на этой неделе: {use(deadlineCount)}</Text>
    </If>
  </Column>
);

const AssignmentsSummary = () => (
  <Column modifiers={card}>
    <Text modifiers={sectionTitle}>Ближайшее задание</Text>
    <Text>{use(assignmentTitle)}</Text>
    <Text>Дисциплина: {use(assignmentCourse)}</Text>
    <Text>Срок: {use(assignmentDue)}</Text>
    <Text>Готовность: {use(assignmentProgress)}%</Text>
    <If condition={E<boolean>('flow.assignmentUploaded == false || flow.teacherChecked == false')}>
      <Text modifiers={warning}>Нужно отправить файл и дождаться проверки преподавателя.</Text>
    </If>
  </Column>
);

const RequestSummary = () => (
  <Column modifiers={card}>
    <Text modifiers={sectionTitle}>Заявка {use(requestNumber)}</Text>
    <Text>Тип: {use(requestType)}</Text>
    <Text>Срочность: {use(requestUrgency)}</Text>
    <Text>Статус: {use(requestStatus)}</Text>
    <Text>Комментарий: {use(requestComment)}</Text>
    <If condition={E<boolean>('flow.dormitoryNeed == true')}>
      <Text>Нужно приложить данные общежития.</Text>
    </If>
  </Column>
);

const TodaySchedule = () => (
  <If condition={E<boolean>("flow.selectedDay == 'Сегодня'")}>
    <Column modifiers={card}>
      <Text modifiers={sectionTitle}>Сегодня</Text>
      <Text>09:00 - Математический анализ, аудитория 204</Text>
      <Text>10:45 - История России, аудитория 118</Text>
      <Text>13:30 - Английский язык, аудитория 307</Text>
      <Text>15:10 - Лабораторная работа, компьютерный класс</Text>
    </Column>
  </If>
);

const TomorrowSchedule = () => (
  <If condition={E<boolean>("flow.selectedDay == 'Завтра'")}>
    <Column modifiers={card}>
      <Text modifiers={sectionTitle}>Завтра</Text>
      <Text>10:00 - Дискретная математика, аудитория 215</Text>
      <Text>11:45 - Физическая культура, спортзал</Text>
      <Text>14:20 - Программирование, лаборатория 3</Text>
      <Text>16:00 - Консультация, аудитория 401</Text>
    </Column>
  </If>
);

const WeekSchedule = () => (
  <If condition={E<boolean>("flow.selectedDay == 'Неделя'")}>
    <Column modifiers={card}>
      <Text modifiers={sectionTitle}>Неделя</Text>
      <Text>Понедельник - 4 пары, первая в 09:00</Text>
      <Text>Вторник - 3 пары, первая в 10:00</Text>
      <Text>Среда - 2 пары и консультация</Text>
      <Text>Четверг - лабораторный день</Text>
      <Text>Пятница - семинар и сдача задания</Text>
    </Column>
  </If>
);

const QrBlock = () => (
  <Column modifiers={{ ...card, alignItems: 'center' }}>
    <Text modifiers={sectionTitle}>QR-код пропуска</Text>
    <Text modifiers={qrLine}>███████░█░███████</Text>
    <Text modifiers={qrLine}>█░░░░░█░█░█░░░░░█</Text>
    <Text modifiers={qrLine}>█░███░█░░░█░███░█</Text>
    <Text modifiers={qrLine}>█░███░█░█░█░███░█</Text>
    <Text modifiers={qrLine}>█░░░░░█░░░█░░░░░█</Text>
    <Text modifiers={qrLine}>███████░█░███████</Text>
    <Text>Версия QR: {use(qrVersion)}</Text>
  </Column>
);

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
