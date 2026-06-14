# Операционный пульт

Операционный пульт — production-style пример BDUI-приложения. Он намеренно
оставлен отдельным npm-проектом, чтобы показать, как внешний продукт подключает
публичные пакеты `@bdui/*`.

## Что Демонстрирует

| Область            | Возможность BDUI                                                      |
| ------------------ | --------------------------------------------------------------------- |
| Доставка контракта | `createContractLoader`, stale-while-revalidate кэш и ETag             |
| Загрузка данных    | Contract-level `dataSources`, REST-источники и статические источники  |
| Серверные эффекты  | `call` actions, rollback handlers и атомарный `batch`                 |
| Состояние          | `Flow` state для экранных данных и `Session` state с persistence      |
| Формы              | Трёхшаговый `FlowRoute` с `flow.goTo`, `flow.complete`, `flow.abort`  |
| Валидация          | Подключаемые renderer validators, вызываемые через `validate`         |
| Оверлеи            | Modal descriptor внутри контракта, открытие и закрытие через SAL      |
| UX-обратная связь  | `toast`, guarded `when` branches, статусные строки и route navigation |
| Кастомизация       | Platform modifiers и web escape hatch через `modifiers.style`         |

## Структура

```text
examples/task-manager/
  package.json
  tsconfig.json
  tsconfig.server.json
  public/
    brand-mark.svg
    index.html
    contract.json      # generated
    client.js          # generated
  src/
    app.tsx            # исходник BDUI-контракта
    client.ts          # bootstrap, cache loader, mount
    meta.json
  server/
    index.ts           # Fastify static server + mock API
```

## Требования

- Node.js 22 или новее.
- Собранный BDUI workspace из корня репозитория:

```bash
npm install
npm run build:full
```

## Сборка

```bash
cd examples/task-manager
npm install
npm run build
```

Команда собирает контракт, клиентский bundle и сервер:

```bash
npm run build:contract
npm run build:client
npm run build:server
```

## Запуск

```bash
npm start
```

Откройте `http://localhost:4000`.

Рекомендуемый сценарий проверки:

1. Откройте дашборд и нажмите **Обновить данные**.
2. Нажмите **Загрузить каталог**.
3. Сохраните задачу, чтобы проверить `call`, `batch` и обновление state.
4. Откройте **Новая заявка**, поменяйте значения в select и пройдите три шага формы.
5. Откройте **Настройки**, измените профиль, тариф и тему, затем сохраните.
6. Обновите страницу и проверьте статус источника контракта: `network`, `cache` или `stale`.

## API Endpoints

| Endpoint                      | Назначение                   |
| ----------------------------- | ---------------------------- |
| `GET /healthz`                | Проверка живости сервера     |
| `GET /api/workspace?plan=...` | Срез рабочего пространства   |
| `POST /api/profile`           | Синхронизация профиля        |
| `POST /api/task`              | Сохранение задачи            |
| `POST /api/settings`          | Синхронизация настроек       |
| `POST /api/request`           | Отправка многошаговой заявки |

## Скрипты

| Скрипт                   | Описание                                       |
| ------------------------ | ---------------------------------------------- |
| `npm run build`          | Собрать контракт, клиентский bundle и сервер   |
| `npm start`              | Запустить предварительно собранный сервер      |
| `npm run dev`            | Собрать и запустить одной командой             |
| `npm run typecheck`      | Проверить типы клиента, DSL и сервера          |
| `npm run build:contract` | Собрать `src/app.tsx` в `public/contract.json` |
| `npm run build:client`   | Собрать `src/client.ts` в `public/client.js`   |
| `npm run build:server`   | Скомпилировать Fastify-сервер                  |

## После Публикации Пакетов

Когда BDUI-пакеты будут опубликованы, замените локальные `file:` dependencies в
`package.json` на semver-диапазоны вроде `^0.6.0`. Исходный код приложения менять
не потребуется.
