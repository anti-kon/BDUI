# Нативные BDUI-рендереры

Каталог содержит нативные рендереры, которые используют единый канонический
JSON-контракт BDUI.

- `android/` - Jetpack Compose приложение с вариантами сборки Campus и Luma
  Market.
- `ios/` - SwiftUI приложение и Xcode-проект для Campus.

Обе реализации покрывают набор возможностей, необходимый для мобильных
BDUI-приложений:

- выбор маршрута из `navigation.routes`;
- области состояния `flow`, `session` и `local`;
- интерполяция выражений `{{scope.path}}`;
- условное отображение через `If`;
- отображение `Image` для контрактных изображений и локальных PNG-ресурсов;
- двусторонние привязки для `Input`, `Checkbox` и `Select`;
- переносимые `modifiers` для отступов, расстояний, переноса строк, цветов,
  текстовых параметров и вариантов кнопок;
- основные SAL-действия: `navigate`, `back`, `set`, `reset`, `update.inc`,
  `update.toggle`, `batch`, `when`, `toast`, `flow.start`, `flow.goTo`,
  `flow.complete` и `flow.abort`.

Контракты Campus и Luma Market формируются из
`examples/ops-control/src/app.tsx` и `examples/retail-commerce/src/app.tsx`.
Команда `npm.cmd run build:contracts` обновляет JSON-контракты и копирует их в
ресурсные каталоги нативных приложений.
