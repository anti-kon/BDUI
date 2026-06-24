# Server Action Language (SAL)

SAL - discriminated union, используемый для всех обработчиков событий в
BDUI-контракте. Автор приложения может использовать короткие формы в TSX; DSL
нормализует их в канонический вид `Action` во время сборки.

## Краткий справочник

| Канонический тип           | Пример короткой формы                          | Значение                                 |
| -------------------------- | ---------------------------------------------- | ---------------------------------------- |
| `navigate`                 | `{ navigate: ['home', { mode: 'replace' }] }`  | Переход на другой маршрут                |
| `back`                     | `{ back: true }`                               | Возврат по navigation stack              |
| `popToRoot`                | `{ popToRoot: true }`                          | Сброс к `initialRoute`                   |
| `replace`                  | `{ replace: 'home' }`                          | Замена текущего маршрута                 |
| `set`                      | `{ set: ['flow.name', 'Ann'] }`                | Запись значения в состояние              |
| `reset`                    | `{ reset: ['flow.x', 0] }`                     | Сброс состояния к значению               |
| `update.inc`               | `{ inc: 'flow.x' }` / `{ inc: ['flow.x', 2] }` | Увеличение числа                         |
| `update.dec`               | `{ dec: 'flow.x' }`                            | Уменьшение числа                         |
| `update.toggle`            | `{ toggle: 'flow.isOpen' }`                    | Переключение boolean                     |
| `update.append`            | `{ append: ['flow.items', 'a'] }`              | Добавление элемента в массив             |
| `update.merge`             | `{ merge: ['flow.obj', { a: 1 }] }`            | Поверхностное слияние объекта            |
| `fetch`                    | `{ fetch: { sourceId, saveTo } }`              | Выполнение именованного источника данных |
| `call`                     | `{ call: { url, method, saveTo, rollback } }`  | Типизированный HTTP-вызов с rollback     |
| `toast`                    | `{ toast: ['Saved'] }`                         | Отображение уведомления                  |
| `modal.open`/`modal.close` | `{ modalOpen: 'confirm' }`                     | Управление модальными окнами по id       |
| `sync`                     | `{ sync: {} }`                                 | Принудительная синхронизация состояния   |
| `validate`                 | `{ validate: ['schema/x', 'flow.data'] }`      | Проверка состояния по именованной схеме  |
| `prefetchScreens`          | `{ prefetch: ['checkout'] }`                   | Предзагрузка маршрутов                   |
| `batch`                    | `{ batch: [...], atomic: true }`               | Выполнение вложенных действий            |
| `when`                     | `{ when: { if, then, else } }`                 | Условное ветвление                       |
| `flow.start`               | `{ flowStart: { routeId, params? } }`          | Начало flow                              |
| `flow.advance`             | `{ flowAdvance: true }`                        | Проверка переходов и переход вперед      |
| `flow.goTo`                | `{ flowGoTo: { stepId } }`                     | Переход к шагу flow                      |
| `flow.resume`              | `{ flowResume: true }`                         | Возврат в прерванный flow                |
| `flow.abort`               | `{ flowAbort: { reason? } }`                   | Отмена flow                              |
| `flow.complete`            | `{ flowComplete: true }`                       | Завершение flow                          |

## Цели состояния

Любое действие, изменяющее состояние, принимает одну из трех форм цели:

- строковый путь: `"flow.counter"`, `"session.user.name"`;
- объект `{ scope, path }`;
- дескриптор `StateVar`, созданный через `Flow()`, `Session()` или `Local()`.

## Atomic batch и rollback

- `batch` с `atomic: true` откатывает уже примененные записи в состояние, если
  одно из вложенных действий завершилось ошибкой.
- `call` с полем `rollback` компенсирует ранее примененные изменения состояния
  при ошибке HTTP-запроса.

## Источники данных и валидация

- `fetch` находит запись в `contract.dataSources[]` по `sourceId`.
- Источники типа `static` вычисляются локально; `rest` и `graphql` используют
  runtime `HttpClient`.
- `fetch.saveTo` сохраняет результат в цель состояния. Если поле не указано,
  runtime записывает результат в `local.dataSources.<sourceId>`.
- `validate` вызывает валидатор, зарегистрированный в
  `createRuntime({ validators })` или `createActionRunner({ validators })`.
  Результаты сохраняются в `local.__validation[schemaRef]`; неуспешная проверка
  также публикует событие `error`.

## Guard-выражения в `when`

Поле `if` принимает строку или `ExprRef`. Строковая форма автоматически
оборачивается DSL.

## Безопасность

Действия не содержат исполняемый JavaScript. Выражения выполняются через
`@bdui/expr` со строгим allow-list идентификаторов и встроенных функций.
