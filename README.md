# BDUI

BDUI - монорепозиторий платформы Backend-Driven UI. Интерфейсы описываются в
TSX DSL, компилируются в канонические JSON-контракты и отображаются в вебе,
Android-приложении на Jetpack Compose и iOS-приложении на SwiftUI.

Текущая версия: `1.0.0`.

## Состав

| Пакет                | Назначение                                                                 |
| -------------------- | -------------------------------------------------------------------------- |
| `@bdui/core`         | Доменные типы контракта, компонентов, действий, состояния и навигации      |
| `@bdui/expr`         | Безопасный язык выражений без `eval` и `new Function`                      |
| `@bdui/defs`         | Описания компонентов и правила проверки дерева интерфейса                  |
| `@bdui/dsl`          | TSX DSL, построители, ссылки на состояние и сокращенная запись действий    |
| `@bdui/schema`       | Генерация JSON Schema и проверка контрактов во время выполнения            |
| `@bdui/transpiler`   | Компиляция TSX в канонический JSON-контракт                                |
| `@bdui/runtime`      | Платформенно-независимый runtime для состояния, навигации, flow и действий |
| `@bdui/renderer-web` | DOM-рендерер поверх `@bdui/runtime`                                        |
| `@bdui/registry`     | HTTP-реестр контрактов с SemVer, ETag, авторизацией и адаптерами хранения  |
| `@bdui/sdk`          | Клиент реестра и адаптеры для Fastify/Express                              |
| `@bdui/cli`          | CLI-команды `build`, `watch`, `gen`, `validate` и `registry`               |

## Приложения

- `examples/task-manager` - Taskly, самостоятельное веб-приложение с Fastify
  API, кешированием контрактов, источниками данных и многошаговым сценарием.
- `examples/ops-control` - Campus, мобильный личный кабинет студента,
  отображаемый в web preview, Android и iOS из общего контракта.
- `examples/retail-commerce` - Luma Market, сценарий интернет-магазина с
  каталогом, корзиной, промокодом и оформлением заказа.
- `sandbox/web-demo` - статический веб-просмотр контрактов Campus и Luma
  Market.

## Общие контракты

Campus и Luma Market используют единый канонический формат BDUI-контракта для
веба и мобильных платформ. Источником является TSX-описание приложения, из
которого формируется JSON-контракт; затем этот контракт копируется в ресурсы
web preview, Android и iOS.

Campus:

- исходник: `examples/ops-control/src/app.tsx`;
- основной контракт: `examples/ops-control/contract.json`;
- web preview: `sandbox/web-demo/contract.json`;
- Android: `native/android/app/src/main/assets/campus.contract.json`;
- iOS: `native/ios/OpsControl/Resources/campus.contract.json`.

Luma Market:

- исходник: `examples/retail-commerce/src/app.tsx`;
- основной контракт: `examples/retail-commerce/contract.json`;
- web preview: `sandbox/web-demo/retail.contract.json`;
- Android: `native/android/app/src/main/assets/retail.contract.json`;
- iOS: `native/ios/OpsControl/Resources/retail.contract.json`.

Taskly является отдельным веб-приложением. Оно использует тот же формат
BDUI-контракта и общие runtime-пакеты, но его контракт формируется из
`examples/task-manager/src/app.tsx` и обслуживается Fastify-приложением Taskly.

Обновление контрактов и платформенных копий выполняется командой:

```bash
npm run build:contracts
```

## Требования

- Node.js `24+`
- npm `11+`
- Android Studio, JDK 17 и Android SDK 35 для Android-приложения
- macOS, Xcode 15+ и симулятор или устройство с iOS 16+ для iOS-приложения

## Установка

```bash
npm install
npm run build:full
npm run build:contracts
```

Сборка и проверка контракта из TSX:

```bash
npm run bdui -- build examples/ops-control/src/app.tsx -o examples/ops-control/contract.json --mode prod
npm run bdui -- validate examples/ops-control/contract.json
```

Сборка и запуск Taskly:

```bash
npm --prefix examples/task-manager run build
npm --prefix examples/task-manager start
```

Taskly доступен по адресу `http://localhost:4000`.

## Веб-просмотр

```bash
npm run prepare:web-demo
npx serve sandbox/web-demo
```

Campus загружается по умолчанию. Luma Market доступен через параметр
`?demo=retail` при запуске preview через локальный статический сервер.

## Android

Проект Android расположен в каталоге `native/android`. Для запуска в Android
Studio необходимо открыть этот каталог как Android-проект и выбрать вариант
сборки приложения:

- `campusDebug` - приложение Campus;
- `retailDebug` - приложение Luma Market.

Сборка из командной строки:

```powershell
gradle -p native/android assembleCampusDebug
gradle -p native/android assembleRetailDebug
```

## iOS

Проект iOS расположен по пути:

```text
native/ios/Campus.xcodeproj
```

Для запуска в Xcode необходимо открыть проект, выбрать общую схему `Campus`,
указать симулятор iOS или подключенное устройство и выполнить запуск схемы.

Сборка из командной строки на macOS:

```bash
xcodebuild -project native/ios/Campus.xcodeproj -scheme Campus -destination 'platform=iOS Simulator,name=iPhone 15' build
```

iOS-приложение по умолчанию загружает `campus.contract.json`. Контракт и
PNG-ресурсы Luma Market также входят в bundle приложения. Для запуска Luma
Market необходимо указать `retail.contract` в
`native/ios/OpsControl/OpsControlApp.swift`.

## Проверка

Базовые локальные проверки:

```bash
npm run verify:generated-contracts
npm run verify:examples
npm run typecheck
npm run lint
npm test
npm run verify:contracts
npm run verify:native
```

Полная локальная проверка:

```bash
npm run verify:all
```

Browser smoke-тесты требуют установленного runtime браузеров Playwright:

```bash
npm run verify:browser
npm run verify:taskly-browser
```

## Документация

- `docs/architecture.md` - архитектура платформы
- `docs/spec.md` - формат JSON-контракта
- `docs/actions.md` - язык действий SAL
- `docs/expr.md` - безопасные выражения
- `docs/registry-api.md` - HTTP API реестра контрактов
- `docs/native-renderers.md` - Android- и iOS-рендереры
- `CONTRIBUTING.md` - процесс внесения изменений
- `CHANGELOG.md` - журнал изменений

## Лицензия

Apache-2.0. См. `LICENSE`.
