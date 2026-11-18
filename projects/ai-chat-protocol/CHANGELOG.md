# [0.4.0](https://github.com/Eyhenij/rt-tools/compare/rt-ai-chat-protocol%400.3.0...rt-ai-chat-protocol%400.4.0) (2026-11-18)

### Features

- **rt:ai-chat-protocol:** контроллер запуска чата и реестр браузерных инструментов ([7b970ba](https://github.com/Eyhenij/rt-tools/commit/7b970ba480d386d6d3135091fbd49bbb55edd777)), closes [#3382](https://github.com/Eyhenij/rt-tools/issues/3382)

# [0.3.0](https://github.com/Eyhenij/rt-tools/compare/rt-ai-chat-protocol%400.2.1...rt-ai-chat-protocol%400.3.0) (2026-11-18)

### Bug Fixes

- **rt:agent-kit:** выпуск пакета без фреймворка отказан, пока собранный пакет не загружается как у потребителя ([5332f7a](https://github.com/Eyhenij/rt-tools/commit/5332f7adafb36436fb96e3efd5b7bed861661208))

## [0.2.1](https://github.com/Eyhenij/rt-tools/compare/rt-ai-chat-protocol%400.2.0...rt-ai-chat-protocol%400.2.1) (2026-11-18)

### Bug Fixes

- **rt:ai-chat-protocol:** относительные импорты пакета с расширением .js, чтобы собранный esm загружался в Node ([b22ac4d](https://github.com/Eyhenij/rt-tools/commit/b22ac4d9924a3bb94d1e38ce2de1a45e096fa372))

# 0.2.0 (2026-11-18)

### Features

- **rt:ui-kit-v2:** выпуск пакета запускается отдельным workflow ([bc1429a](https://github.com/Eyhenij/rt-tools/commit/bc1429a991e3d863397aa9f41bec88c7a1402a30)), closes [#3368](https://github.com/Eyhenij/rt-tools/issues/3368)
- **rt:ui-kit-v2:** пакет протокола чата ассистента без Angular ([954b193](https://github.com/Eyhenij/rt-tools/commit/954b1933c2915c0f829918e13785af95dc3628ab)), closes [#3368](https://github.com/Eyhenij/rt-tools/issues/3368)

* Первый выпуск пакета протокола чата ассистента: типы событий AG-UI, читатель события, редьюсер запуска, порт запуска и порт бесед, классификация ошибок по кодам.
