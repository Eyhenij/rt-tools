import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, Signal, WritableSignal, inject, signal } from '@angular/core';

import { PlatformService } from '@rt-tools/core';

import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

/**
 * Как значки приложения рисуют имя Material. Задаётся третьим аргументом `provideRtIcons()`;
 * по умолчанию `map-first` — пара из перечня кита, а без пары шрифт.
 */
export const RT_ICON_GLYPH_STRATEGY: InjectionToken<IRtIcon.GlyphStrategy> = new InjectionToken<IRtIcon.GlyphStrategy>(
    'RT_ICON_GLYPH_STRATEGY',
    {
        providedIn: 'root',
        factory: (): IRtIcon.GlyphStrategy => 'map-first',
    }
);

/**
 * Готовность шрифтов страницы — одна на все значки.
 *
 * Лигатура до готовности шрифта рисуется словом в запасном шрифте: значок прячет её, пока страница
 * не сказала, что шрифты готовы. Кит шрифт не везёт и семью не знает, поэтому ждёт общую готовность,
 * а не загрузку одной семьи. На сервере шрифтов нет — лигатура там скрыта. Браузер без интерфейса
 * шрифтов ждать нечем, и лигатура показывается сразу.
 */
@Injectable({ providedIn: 'root' })
export class RtIconFontService {
    readonly #ready: WritableSignal<boolean> = signal<boolean>(false);

    readonly #isBrowser: boolean = inject(PlatformService).isPlatformBrowser;

    readonly #document: Document = inject(DOCUMENT);

    public readonly ready: Signal<boolean> = this.#ready.asReadonly();

    constructor() {
        this.#watchFonts();
    }

    #watchFonts(): void {
        if (!this.#isBrowser) {
            return;
        }
        const fonts: FontFaceSet | undefined = this.#document.fonts;
        if (!fonts) {
            this.#ready.set(true);
            return;
        }
        void fonts.ready.then((): void => this.#ready.set(true));
    }
}
