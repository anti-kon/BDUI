import { Button, Column, Divider, E, If, Image, Row, Text, use } from '@bdui/dsl';

import {
  appMode,
  assignmentCourse,
  assignmentDue,
  assignmentProgress,
  assignmentTitle,
  attendancePercent,
  campusName,
  classRoom,
  deadlineCount,
  nextClass,
  nextClassTime,
  qrVersion,
  requestComment,
  requestNumber,
  requestStatus,
  requestType,
  requestUrgency,
  statusMessage,
  studentGroup,
  studentName,
  validationError,
} from './state.js';
import {
  card,
  danger,
  muted,
  page,
  qrLine,
  sectionTitle,
  success,
  title,
  warning,
} from './styles.js';

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

export const AppShell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Header />
    <Nav />
    <Divider />
    {children}
  </Column>
);

export const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={success}>{use(statusMessage)}</Text>
  </If>
);

export const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.validationError) > 0')}>
    <Text modifiers={danger}>{use(validationError)}</Text>
  </If>
);

export const StudentCard = () => (
  <Column modifiers={card}>
    <Text modifiers={sectionTitle}>Студент</Text>
    <Text>ФИО: {use(studentName)}</Text>
    <Text>Группа: {use(studentGroup)}</Text>
    <Text>Вуз: {use(campusName)}</Text>
    <Text>Режим: {use(appMode)}</Text>
  </Column>
);

export const ScheduleSummary = () => (
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

export const AssignmentsSummary = () => (
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

export const RequestSummary = () => (
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

export const TodaySchedule = () => (
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

export const TomorrowSchedule = () => (
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

export const WeekSchedule = () => (
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

export const QrBlock = () => (
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
