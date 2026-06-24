# Android Compose BDUI-рендерер

Android-приложение содержит два варианта сборки:

- `campusDebug` загружает `app/src/main/assets/campus.contract.json` и
  отображает мобильный личный кабинет студента Campus.
- `retailDebug` загружает `app/src/main/assets/retail.contract.json` и
  отображает Luma Market с теми же PNG-изображениями товаров, которые
  используются в web preview.

Рендерер является автономным: он читает JSON-контракт, хранит runtime-состояние
и выполняет практическое подмножество SAL-действий.

Рендерер использует общий объект `modifiers` для переносимых отступов,
расстояний, переноса строк, цветов, скругленных панелей, начертаний текста и
оформления кнопок. PNG-изображения из контракта загружаются из assets
приложения; для SVG-марок используется компактное нативное fallback-отображение.

Для запуска необходимо открыть `native/android` в Android Studio как
Android-проект и выбрать вариант сборки:

```text
Build Variants -> app -> retailDebug
```

Конфигурация `app` запускает выбранный вариант приложения. Для Campus
используется вариант `campusDebug`, для Luma Market - `retailDebug`.

После изменения TSX-приложений необходимо обновить общие контракты:

```powershell
npm.cmd run build:contracts
```
