# [0.2.0](https://github.com/Eyhenij/rt-tools/compare/rt-ui-kit-v2@0.1.0...rt-ui-kit-v2@0.2.0) (2026-08-06)

### Bug Fixes

- **rt:ui-kit-v2:** выправить объявления для скринридера и потерянные входы ([c00887f](https://github.com/Eyhenij/rt-tools/commit/c00887f4fdc0980dc52470673fa9d2773f7b9903))
- **rt:ui-kit-v2:** починить четыре дефекта, вскрытых спеками ([2d8ac5e](https://github.com/Eyhenij/rt-tools/commit/2d8ac5e1326288a6153df4caeafc96f4eaf51c71))

### Features

- **rt:ui-kit-v2:** крупные ступени шкалы у кнопок и иконки ([7ae8600](https://github.com/Eyhenij/rt-tools/commit/7ae8600952b6eb2399b0dbf345a1324081473005))

# 0.1.0 (2026-08-05)

### Bug Fixes

- **rt:ui-kit-v2:** восстановить повреждённые байты в комментариях ([6a34336](https://github.com/Eyhenij/rt-tools/commit/6a34336797503efaea3f993f3673483798d0a1a2))
- **rt:ui-kit-v2:** довезти стили кнопки до потребителя ([b7e3bb3](https://github.com/Eyhenij/rt-tools/commit/b7e3bb3a3547545867fd328dccec6b4d94c6b926))
- **rt:ui-kit-v2:** проставить типы помощникам документации ([4321d26](https://github.com/Eyhenij/rt-tools/commit/4321d260e0246beffa9077a73bcaeb80f24232f8))

### Features

- **rt:ui-kit-v2:** второй набор компонентов и его дизайн-система ([2d63d3d](https://github.com/Eyhenij/rt-tools/commit/2d63d3d6e70de3df033df49e0fb285dbdfd8e496))
- **rt:ui-kit-v2:** завести витрину Storybook ([c3c6aa0](https://github.com/Eyhenij/rt-tools/commit/c3c6aa018859ea3114d3b72238270fbe73f7353e))
- **rt:ui-kit-v2:** истории компонентов на витрине ([3bc969a](https://github.com/Eyhenij/rt-tools/commit/3bc969a91df18876bbd3235507797607a1cc53b4))

# Changelog

Все заметные изменения пакета `@rt-tools/ui-kit-v2` записываются здесь.

## 0.1.0

Первый выпуск.

- 72 семейства компонентов с префиксом `rt-`: поля формы и `rt-field`, таблица с настройкой
  колонок и пагинацией, панель правки записи на маршруте с защитой несохранённого, диалоги,
  чат с композером и rich-редактором, календарь, шапка страницы с навигацией, тосты,
  просмотрщик фотографий.
- Дизайн-система в `src/styles`: шкалы, назначения, тёмная тема, полосы прокрутки, пороги
  ширины и миксины поверхности. Собранный CSS — `styles/tokens.css`.
- Набор из 335 иконок в `assets/icons`; `provideRtIcons(baseUrl)` собирает их в inline-sprite
  на подъёме приложения.
- Подписи кита — 131 ключ в неймспейсе `rtKit` на восьми языках; подключаются
  `provideRtKitTranslations()` и переопределяются своим словарём.
- Среда исполнения: `ThemeService`, `BreakpointsService`, `NotificationBus`.
