# Спецификация контракта

Документ описывает wire-формат BDUI-контракта. Авторитетная схема находится в
`packages/schema/src/generated/schema.generated.ts` и формируется из
TypeScript-типов пакета `@bdui/core`.

## Верхний уровень

```json
{
  "meta": {
    "contractId": "string",
    "version": "semver",
    "schemaVersion": "semver",
    "generatedAt": "ISO-8601",
    "appId": "string?",
    "features": ["flow", "actions/call", "..."]
  },
  "initial": {
    "flow": { "counter": 0 },
    "session": { "userId": null }
  },
  "navigation": {
    "initialRoute": "home",
    "urlSync": false,
    "routes": [{ "id": "home", "node": { "type": "Column", "children": [] } }]
  },
  "dataSources": {
    "users": { "url": "https://api/users", "method": "GET" }
  }
}
```

Для структурированных объектов контракта, например `meta` и `navigation`,
действует `additionalProperties: false`. Узлы компонентов остаются расширяемыми
через props манифеста и открытый объект `modifiers`.

## Узлы

Каждый узел содержит `type`, необязательные `modifiers`, необязательные
`children` и свойства конкретного компонента.

```json
{
  "type": "Button",
  "title": "Submit",
  "modifiers": { "variant": "primary", "minHeight": 40 },
  "onAction": [{ "type": "navigate", "params": { "to": "next" } }]
}
```

Генератор создает определение `Node_<Component>` для каждого манифеста и
объединяет их через `oneOf` в корневом типе `Node`.

## Модификаторы

`modifiers` - кросс-платформенная поверхность дизайна. Рендереры должны
поддерживать платформенно-нейтральное подмножество, когда это возможно:

- layout: `padding`, `margin`, `gap`, `width`, `minHeight`, `align`,
  `justify`, `flexWrap`;
- surface: `background`, `color`, `border`, `borderRadius`, `boxShadow`,
  `opacity`;
- typography: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`,
  `textAlign`;
- semantics: `role`, `variant`, `testId`, `accessibilityLabel`.

Веб-рендереры могут дополнительно пропускать camelCase CSS-ключи и вложенный
`modifiers.style`. Нативные рендереры могут игнорировать web-only ключи,
сохраняя ту же форму контракта.

## Маршруты

Поддерживаются два вида маршрутов:

- **Screen route** - статическое дерево `node`.
- **Flow route** - `type: "flow"`, `startStep`, `steps[]` и guarded
  `transitions`.

## Выражения

Выражения сериализуются как строки `"{{ ... }}"`. Значения типа
`Expression<T>` принимают литерал `T` или такую строку. Схема проверяет строки
выражений по консервативному шаблону; фактическая грамматика применяется во
время разбора пакетом `@bdui/expr`.

## Действия

Действия строго типизированы через union `Action`; см. [`actions.md`](./actions.md).
Событийные props вроде `onAction`, `onEnter` и `onSubmit` всегда содержат
массив действий, а не строку произвольного JavaScript.

## Канонизация

Контракты, созданные `@bdui/transpiler`, канонизируются:

- ключи объектов сортируются по алфавиту;
- значения `undefined` удаляются;
- порядок массивов сохраняется как у автора;
- завершающие пробелы и BOM отсутствуют.

Это гарантирует стабильные хеши и детерминированные ETag в реестре.
