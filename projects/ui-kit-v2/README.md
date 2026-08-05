# @rt-tools/ui-kit-v2

Набор компонентов Angular и дизайн-система к ним: шкалы оформления, светлая и тёмная темы,
восемь языков подписей. Компоненты сигнальные и `OnPush`, разметка размечена BEM-директивами из
`@rt-tools/core`, каждый интерактивный элемент несёт `qa-dataid`.

Пакет живёт рядом с `@rt-tools/ui-kit`, а не вместо него: селекторы (`rt-*` против `rtui-*`),
свойства оформления и наборы компонентов у них не пересекаются, поэтому одно приложение может
держать оба.

## Установка

```bash
pnpm add @rt-tools/ui-kit-v2 @rt-tools/core @rt-tools/utils @jsverse/transloco
```

`quill` нужен только тем, кто ставит `rt-rich-editor`: редактор грузит его динамически, и без
пакета остальной кит работает.

## Подключение

```typescript
import { provideRtIcons, provideRtKitTranslations } from '@rt-tools/ui-kit-v2';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideTransloco({ config, loader }),
        provideRtKitTranslations(),
        provideRtIcons(),
    ],
};
```

Оформление — одной строкой в точке входа приложения; в пакете лежит и собранный CSS со всеми
свойствами, и исходники партиалов:

```scss
@use '@rt-tools/ui-kit-v2/styles/tokens.css';
```

Иконки лежат отдельными файлами в `node_modules/@rt-tools/ui-kit-v2/src/assets/icons`: сборка
копирует каталог в свою статику, а `provideRtIcons('/icons')` называет адрес, по которому он
опубликован. Реестр забирает их одним проходом на подъёме и склеивает в inline-sprite, поэтому
дальше `<rt-icon>` рисуется без запросов.

```json
{
    "glob": "**/*.svg",
    "input": "node_modules/@rt-tools/ui-kit-v2/src/assets/icons",
    "output": "icons"
}
```

## Что внутри

**Компоненты** — 72 семейства: поля формы (`rt-input`, `rt-select`, `rt-multiselect`,
`rt-date-picker`, `rt-file-input`, `rt-rich-editor`, `rt-field`), таблица с настройкой колонок и
пагинацией, панель правки записи с маршрутом и защитой несохранённого, диалоги, чат с композером,
календарь, шапка страницы с навигацией, тосты, просмотрщик фотографий и остальное.

**Дизайн-система** — `src/styles`:

- `_primitives.scss` — шкалы: нейтральные и цветные ряды, отступы, радиусы, тени, типографика;
- `_semantic.scss` — назначения поверх шкал (`--rt-color-bg-surface`, `--rt-color-text-muted`);
- `_theme-dark.scss` — переопределения назначений для `[data-theme='dark']`;
- `_scrollbar.scss` — оформление полос прокрутки;
- `_breakpoints.scss` — SCSS-переменные порогов: свойства оформления в `@media` не работают,
  поэтому пороги остаются переменными препроцессора;
- `_mixins.scss` — миксины поверхности карточки и её заголовка;
- `_login.scss` — раскладка страницы входа.

Всё, кроме `_breakpoints.scss`, собирает `_index.scss` — из него и собран `tokens.css`. Пороги и
миксины подключаются партиалами напрямую:

```scss
@use 'pkg:@rt-tools/ui-kit-v2/styles/breakpoints' as bp;
@use 'pkg:@rt-tools/ui-kit-v2/styles/mixins';
```

**Среда исполнения** — `ThemeService` (тема на `<html data-theme>`, переживает перезагрузку),
`BreakpointsService` (сигналы совпадения по ширине), `NotificationBus` (шина тостов).

**Подписи** — 131 ключ в неймспейсе `rtKit` на восьми языках (en, ru, de, ko, th, hi, zh-Hans,
zh-Hant); везут их `RT_KIT_TRANSLATIONS` и `provideRtKitTranslations()`. Свою подпись приложение
кладёт поверх, передав словарь тем же провайдером; им же добавляется язык, которого в пакете нет.

Читаются только языки, заявленные в `availableLangs` приложения: язык вне этого списка Transloco
считает не языком, а именем скоупа, и подписи по нему не найдёт.

## Свой логотип

`rt-logo` рисует то, что даст приложение: своих начертаний кит не везёт.

```css
:root {
    --rt-logo-wordmark: url('/logo/wordmark.svg');
    --rt-logo-tagline: url('/logo/tagline.svg');
    --rt-logo-wordmark-dark: url('/logo/wordmark-inverse.svg');
    --rt-logo-tagline-dark: url('/logo/tagline-inverse.svg');
}
```

Пропорции своего файла компоненту сообщает вход `aspect` — без него ширина считается по
умолчанию варианта и узкое начертание обрастёт пустотой.

## Разработка

```bash
pnpm run build:ui-kit-v2          # сборка пакета и CSS с токенами
pnpm exec nx test @rt-tools/ui-kit-v2
pnpm exec nx lint @rt-tools/ui-kit-v2
pnpm exec stylelint "projects/ui-kit-v2/**/*.scss"
```
