# Язык выражений (`@bdui/expr`)

Выражения BDUI записываются внутри `{{ ... }}` и намеренно похожи на
JavaScript. Внутри они токенизируются, разбираются в AST и интерпретируются со
строгим allow-list: без `new Function` и без `eval`.

## Режимы вычисления

- `evalExpression(source, state)` - компиляция и однократное выполнение.
- `compile(source)` - создание мемоизированного `{ evaluate(state) }`.
- `evalExprRef(ref, state)` - прямое вычисление `ExprRef`.
- `interpolate(template, state)` - разрешение всех `{{ ... }}` внутри строки.
- `resolveValue(value, state)` - возврат строки без изменений, если в ней нет
  placeholders; иначе делегирование в `interpolate`.

## Грамматика

```text
Expression   = Ternary
Ternary      = Or ('?' Expression ':' Expression)?
Or           = And ('||' And)*
And          = Equality ('&&' Equality)*
Equality     = Comparison (('==' | '!=') Comparison)*
Comparison   = Additive (('<' | '<=' | '>' | '>=') Additive)*
Additive     = Multiplicative (('+' | '-') Multiplicative)*
Multiplicative = Unary (('*' | '/' | '%') Unary)*
Unary        = ('!' | '-') Unary | Postfix
Postfix      = Primary ( MemberAccess | Index | Call )*
Primary      = Number | String | Boolean | Null | Identifier | '(' Expression ')'
```

## Разрешенные идентификаторы

- Верхний уровень: `flow`, `session`, `local`, `params` - стандартные области
  состояния.
- Внутри этих областей: любой пользовательский путь, например `flow.counter`
  или `session.user.id`.
- Запрещены: `globalThis`, `window`, `process`, `eval`, `Function` и другие
  идентификаторы из `FORBIDDEN_IDENTIFIERS`.

## Встроенные функции

Чистые функции без побочных эффектов определены в
`packages/expr/src/builtins.ts`:

| Функция                            | Пример                               | Назначение                             |
| ---------------------------------- | ------------------------------------ | -------------------------------------- |
| `len(x)`                           | `len("abc") == 3`                    | длина строки, массива или объекта      |
| `has(obj, key)`                    | `has(flow.data, "id")`               | проверка собственного свойства         |
| `includes(h, n)`                   | `includes(flow.tags, "new")`         | поиск в массиве или подстроке          |
| `min`, `max`                       | `min(flow.a, flow.b, 0)`             | функции с переменным числом аргументов |
| `abs` / `round` / `floor` / `ceil` |                                      | числовые helpers                       |
| `lower`, `upper`, `trim`           |                                      | строковые helpers                      |
| `coalesce(...)`                    | `coalesce(flow.x, 0)`                | первый non-null аргумент               |
| `not(x)`                           | `not(flow.enabled)`                  | логическое отрицание                   |
| `isEmpty(x)`                       | `isEmpty(flow.items)`                | пустая строка, массив, объект или null |
| `concat(...)`                      | `concat(flow.first, " ", flow.last)` | конкатенация строк                     |

## Лимиты и безопасность

Каждая компиляция ограничена `DEFAULT_LIMITS`:

- максимальная глубина AST;
- максимальное число узлов;
- максимальная длина выражения.

Нарушения приводят к `ExpressionError` во время разбора, что предотвращает
патологические входные данные и неконтролируемую нагрузку.

## Ошибки

Ошибка разбора, обращение к запрещенному идентификатору или вызов неизвестной
функции приводят к `ExpressionError`. Потребители, например `ActionRunner` и
`resolveFlowStep`, перехватывают эти ошибки, чтобы не завершать работу
рендерера аварийно.
