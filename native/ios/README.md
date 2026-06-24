# iOS SwiftUI BDUI-рендерер

`Campus.xcodeproj` содержит iOS-приложение для SwiftUI-рендерера BDUI.

Приложение по умолчанию загружает
`OpsControl/Resources/campus.contract.json` и отображает мобильный личный
кабинет студента Campus. Контракт `retail.contract.json` и PNG-ресурсы Luma
Market также включены в bundle приложения. Для запуска Luma Market необходимо
заменить имя контракта в `OpsControl/OpsControlApp.swift` с `campus.contract`
на `retail.contract`.

## Запуск

Для запуска необходимо открыть `native/ios/Campus.xcodeproj` в Xcode 15 или
новее, выбрать общую схему `Campus`, указать симулятор iOS 16+ или
подключенное устройство и выполнить запуск схемы.

Сборка из командной строки на macOS:

```bash
xcodebuild -project native/ios/Campus.xcodeproj -scheme Campus -destination 'platform=iOS Simulator,name=iPhone 15' build
```

## Покрытие рендерера

SwiftUI-рендерер поддерживает набор компонентов и действий, используемый
контрактами Campus и Luma Market:

- компоненты: `Column`, `Row`, `Text`, `Button`, `Input`, `Checkbox`,
  `Select`, `Image`, `If`, `Divider`;
- области состояния: `flow`, `session`, `local`;
- выражения: интерполяция, булевы условия, арифметика, `len`, `max`, `min`,
  `abs`, `round`, `floor`, `ceil`, `not`, `isEmpty`, `coalesce`;
- действия: навигация, изменение состояния, счетчики, переключатели, `batch`,
  `when`, уведомления и переходы между шагами flow;
- переносимые модификаторы: расстояния, отступы, размер/начертание/цвет
  текста, фон, граница, радиус, перенос строк и локальные PNG-изображения.

После изменения TSX-приложений необходимо обновить общие контракты и ресурсы:

```powershell
npm.cmd run build:contracts
```
