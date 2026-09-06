---
name: platform-access-di
kind: pattern
rule: platform-access
description: Pattern of rule platform-access. Load when the window, the document or an environment check enters the code — ready-made token injects, casting to Window & typeof globalThis, the window as a parameter of a pure function, DOM initialisation after the first render. Not under libs/api and apps/api.
---
<!-- rt-kit v0.25.0 · patterns/platform-access-di.md · 160330af89f4 · правится надстройкой, не здесь -->

# Окно, документ и проверка среды

Паттерн правила `platform-access`. Что при этом должно быть верно — закон
`docs/constitution/frontend-application.md`.

## Когда брать

- В компонент, сервис или директиву заходит `window`, `document` или проверка среды.
- Появляется работа с DOM, которой нельзя случиться до первой отрисовки.
- Чистой функции нужен доступ к окну.

## Инжекты

```typescript
import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import { PlatformService, WINDOW } from '@rt-tools/core';

@Injectable({ providedIn: 'root' })
export class SomeService {
    readonly #document: Document = inject(DOCUMENT);
    readonly #platform: PlatformService = inject(PlatformService);
    readonly #window: Window = inject(WINDOW);
}
```

## Когда нужен `Window & typeof globalThis`

Интерфейс `Window` не описывает глобальные конструкторы и неймспейсы —
`IntersectionObserver`, `ResizeObserver`, `google` из `@types/google.maps`. Токен отдаёт тот же
самый объект, поэтому тип уточняется приведением, и рядом ставится комментарий с причиной:

```typescript
// Конструкторы вроде IntersectionObserver объявлены на globalThis, а не на
// интерфейсе Window — токен отдаёт тот же объект, тип лишь уточняется.
readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;
```

## Чистая функция принимает окно параметром

В `*.logic.ts` и `*.util.ts` нет DI, и глобал внутрь не тянется:

```typescript
export function mapsReady(windowRef: Window & typeof globalThis): boolean {
    return typeof windowRef.google?.maps?.importLibrary === 'function';
}
```

Инжектит его вызывающий компонент.

## Проверка среды и первая отрисовка

```typescript
if (!this.#platform.isPlatformBrowser) {
    return;
}
```

```typescript
afterNextRender((): void => {
    // работа с DOM, которой не должно быть до первой отрисовки
});
```

`typeof window !== 'undefined'` не годится: проверка по наличию глобала верна случайно.

## Частые промахи

- `isPlatformBrowser(inject(PLATFORM_ID))` вместо `PlatformService`.
- Проверка среды вокруг чтения и записи в хранилище: `StorageService` и так уходит в память
  вне браузера, и такой `if` — мёртвый код.
- `WINDOW` полем класса в сервисе, который обязан работать без DOM вообще: там окно берётся
  внутри метода под проверкой среды.
- Правка добавила `WINDOW` в сервис, создающийся на подъёме, а проверили одной сборкой: падение
  видно только на поднятом сервере отдачи страниц.
- Приведение без комментария: в мапперах приведение запрещено, и строка читается как нарушение.
