import { Flow, Session } from '@bdui/dsl';

/* ------------------------------ Session ------------------------------ */
export const studentName = Session<string>('studentName', 'Иван Петров');
export const studentGroup = Session<string>('studentGroup', 'ПИ-23-01');
export const campusName = Session<string>(
  'campusName',
  'Северо-Волжский технологический университет',
);
export const appMode = Session<string>('appMode', 'Учебный день');
export const notificationsEnabled = Session<boolean>('notificationsEnabled', true);

/* ------------------------------- Flow -------------------------------- */
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
