# Архитектура BDUI

Проект организован как слоистый монорепозиторий. Каждый слой зависит только от
нижестоящих слоев; циклические зависимости запрещены.

```text
+----------------------------+  Web DOM plugin, Android Compose app,
| Renderers                  |  and iOS SwiftUI app
+----------------------------+
| @bdui/runtime              |  State, navigation, flow, actions, HTTP
+----------------------------+
| @bdui/transpiler           |  TSX to JSON via esbuild and Ajv
+----------------------------+
| @bdui/dsl  @bdui/schema    |  Author-time DSL and schema validator
+----------------------------+
| @bdui/defs @bdui/expr      |  Component manifests and safe expressions
+----------------------------+
| @bdui/core                 |  Contract types, action union, primitives
+----------------------------+
```

## Роли пакетов

- **`@bdui/core`** - чистые типы и легкие вспомогательные функции без побочных
  эффектов во время выполнения.
- **`@bdui/expr`** - lexer/parser/interpreter для мини-языка `{{...}}`.
  Используется вместо подходов на основе `new Function(...)`.
- **`@bdui/defs`** - манифесты компонентов (`Button`, `Input`, `If` и другие),
  DOM-реализации рендеринга, точки расширения рендерера и валидатор дерева.
- **`@bdui/schema`** - генерация JSON Schema во время сборки и проверка через
  Ajv 2020.
- **`@bdui/dsl`** - TSX runtime, билдеры, сокращенные формы действий и паттерн
  `StateCollector` для начального состояния.
- **`@bdui/transpiler`** - собирает входной TSX-модуль, проверяет полученный
  объект и формирует канонический детерминированный JSON.
- **`@bdui/runtime`** - платформенно-независимый runtime: состояние, event bus,
  навигация, flow resolver, action runner, валидаторы, toast/modal hosts, HTTP
  client, data-source fetching и загрузка контрактов stale-while-revalidate.
- **`@bdui/renderer-web`** - DOM-плагин поверх `@bdui/runtime`. Он отвечает
  только за отображение; состояние и действия остаются в runtime.
- **`@bdui/registry`** - Fastify-сервер реестра. Поддерживает подключаемое
  хранилище, SemVer-резолвинг, `If-None-Match`/`304`, bearer auth, CORS и
  единый формат JSON-ошибок.
- **`@bdui/sdk`** - HTTP-клиент и адаптеры Fastify/Express для встраивания BDUI
  в серверные приложения.
- **`@bdui/cli`** - команды `bdui build`, `watch`, `gen`, `validate` и
  `registry`.

## Ключевые инварианты

1. **В контрактах нет произвольного кода** - используются только типизированные
   SAL-действия и выражения мини-языка.
2. **Детерминированный JSON** - транспайлер сортирует ключи объектов и удаляет
   `undefined`, чтобы хеши контрактов были стабильными.
3. **Единый источник истины** - JSON Schema генерируется из TypeScript-типов.
   Добавление действия или компонента выполняется в авторитетном месте и
   сопровождается пересозданием артефактов.
4. **Плагинная модель рендереров** - все, кроме платформенного отображения,
   находится в `@bdui/runtime`. Нативные рендереры используют тот же контракт и
   реализуют нужное подмножество компонентов и действий через платформенные
   виджеты.
5. **Проверяемые артефакты** - сгенерированная схема, DSL-связки, контракты
   примеров, нативные копии контрактов и vendored web demo проверяются
   скриптами репозитория и CI.

## Поток данных во время выполнения

```text
Contract JSON -> ContractLoader -> RuntimeState -> NavigationController
                      |                |                  |
                 StorageAdapter    ActionRunner      RendererPlugin
                                       |
                               HttpClient / validators
                                       |
                               EventBus -> Toast / Modal
```

События проходят через event bus. Рендереры наблюдают за состоянием и навигацией
и преобразуют текущий маршрут в DOM, Compose, SwiftUI или интерфейс другой
платформы.
