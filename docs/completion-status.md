# Статус реализации BDUI

Дата статуса: 2026-06-23.

Документ фиксирует состояние реализации платформы, приложений и проверок в
репозитории.

## Реализованные области

| Область                                                | Статус                                   | Подтверждение                                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Формат JSON-контракта, метаданные, начальное состояние | Реализовано                              | `@bdui/core`, `@bdui/schema`, сгенерированная схема, `npm run verify:contracts`                                                    |
| Компиляция TSX в JSON                                  | Реализовано                              | `@bdui/dsl`, `@bdui/transpiler`, `bdui build`, sandbox- и example-контракты                                                        |
| Детерминированный вывод контрактов                     | Реализовано                              | канонический сериализатор в `@bdui/transpiler`, стабильный `generatedAt`, тесты сборки, проверки сгенерированных контрактов        |
| Веб-рендеринг                                          | Реализовано локально, настроены CI smoke | `@bdui/runtime`, `@bdui/renderer-web`, интеграционные тесты рендерера, `sandbox/web-demo`, `npm run verify:browser`                |
| Производственное демонстрационное приложение Taskly    | Реализовано локально, настроены CI smoke | `examples/task-manager`, `npm run verify:examples`, `npm run verify:taskly-browser`                                                |
| Android- и iOS-рендереры                               | Реализовано                              | `native/android`, `native/ios/Campus.xcodeproj`, `docs/native-renderers.md`, `npm run verify:native`, Android Studio, Xcode        |
| Flow-сценарии                                          | Реализовано                              | типы flow, DSL-билдеры, runtime flow controller, sandbox flow-контракты, тесты                                                     |
| SAL-действия для клиента, сервера и flow               | Реализовано                              | типизированный union `Action`, DSL-сокращения, runtime action runner, `fetch`, `call`, `validate`, flow-действия                   |
| Модульная архитектура                                  | Реализовано                              | разделение workspace-пакетов, `docs/architecture.md`, `npm run build:full`                                                         |
| Надежность и диагностика                               | Реализовано                              | проверка схемы, типизированные ошибки, fallback-поведение рендерера, унифицированные ошибки реестра                                |
| Безопасность                                           | Реализовано локально                     | безопасный интерпретатор выражений, отсутствие `eval`/`new Function`, bearer auth и CORS в реестре, `npm run audit:prod`           |
| Внешние API и SDK                                      | Реализовано                              | `docs/registry-api.md`, `@bdui/sdk`, CLI-параметры реестра                                                                         |
| Интерфейсы разработчика                                | Реализовано                              | TSX DSL, CLI, README пакетов, getting started guide                                                                                |
| Набор документации                                     | Реализовано                              | `README.md`, `docs/spec.md`, `docs/actions.md`, `docs/expr.md`, `docs/registry-api.md`, `docs/native-renderers.md`, `CHANGELOG.md` |
| Процесс сопровождения open-source проекта              | Реализовано                              | лицензия Apache 2.0, changeset config, changelog, contribution guide, release CI                                                   |
| Автоматизированная локальная проверка                  | Реализовано                              | `npm run verify:all`, отдельный браузерный smoke Taskly через `npm run verify:taskly-browser`                                      |

## Локальная проверка

Основная команда комплексной проверки:

```bash
npm run verify:all
```

Она покрывает генерацию и сборку, проверку типов, lint, форматирование, unit- и
интеграционные тесты, пороги покрытия, синхронизацию контрактов, покрытие
нативных контрактов и audit production-зависимостей.

Отдельная проверка Taskly в браузере:

```bash
npm run verify:taskly-browser
```

Команда запускает собранное Fastify-приложение на свободном локальном порту и
проверяет состояние кеша контрактов, открытие и закрытие модального окна,
обновление REST-источника данных, загрузку статического каталога и прохождение
трехшагового flow через Chromium.

## Проверки среды выполнения

Некоторые проверки требуют внешней среды, недоступной в текущем Windows
workspace. Для них указаны команды или действия, которые выполняются в
подходящей среде.

| Проверка                                    | Статус в репозитории                                                                   | Команда или действие                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Android build и запуск на устройстве        | Проект Android и варианты сборки присутствуют; локальная сборка зависит от Android SDK | `gradle -p native/android :app:assembleDebug`, запуск в Android Studio или на устройстве                                    |
| iOS build и запуск на симуляторе/устройстве | Xcode-проект присутствует; локальная сборка требует macOS и Xcode                      | `xcodebuild -project native/ios/Campus.xcodeproj -scheme Campus -destination 'platform=iOS Simulator,name=iPhone 15' build` |
| Cross-browser smoke                         | Chromium проверен локально; полный набор браузеров выполняется в среде с Playwright    | `npm run verify:browsers`                                                                                                   |

## Политика audit

`npm run verify:all` использует `npm run audit:prod`, так как release-toolchain
подтягивает известное dev-only предупреждение через `@changesets/cli`. Эта
зависимость не попадает в runtime-пакеты BDUI и production-приложение Taskly.
Команда `npm run audit:dev` оставлена для сопровождающих и должна быть
пересмотрена после совместимого исправления в Changesets/Manypkg.
