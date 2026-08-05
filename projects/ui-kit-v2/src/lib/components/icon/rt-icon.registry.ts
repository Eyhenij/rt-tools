import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';

import { Observable, forkJoin, map, of, shareReplay, tap } from 'rxjs';

import { iconsName } from './rt-icon-names';
import { IRtIcon } from './rt-icon.model';

/** Префикс `id` для inline-sprite символов. Изолирует от внешних `id` на странице. */
const SYMBOL_ID_PREFIX: string = 'rt-icon-';

/**
 * Адрес, по которому приложение публикует набор из `assets/icons` пакета.
 * Умолчание годится, когда сборка кладёт набор в корень статики; свой адрес
 * задаётся аргументом `provideRtIcons()`.
 */
export const RT_ICONS_BASE_URL: InjectionToken<string> = new InjectionToken<string>('RT_ICONS_BASE_URL', {
    providedIn: 'root',
    factory: (): string => '/icons',
});

/** Селектор inline-sprite, создаваемого один раз при первом обращении. */
const SPRITE_ID: string = 'rt-icon-sprite';

@Injectable({ providedIn: 'root' })
export class RtIconRegistry {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #baseUrl: string = inject(RT_ICONS_BASE_URL);

    #preloadAll$: Observable<void> | null = null;

    /**
     * Имя symbol для `<use href="#X">`. Возвращает строку с ведущим `#`.
     */
    public symbolHref(name: IRtIcon.Name): string {
        return `#${SYMBOL_ID_PREFIX}${name}`;
    }

    /**
     * Загружает все SVG из реестра и склеивает их в inline-sprite в `<body>`.
     * Вызывается из `provideAppInitializer`. Повторные вызовы — no-op (shareReplay).
     */
    public preloadAll(): Observable<void> {
        if (this.#preloadAll$) {
            return this.#preloadAll$;
        }
        // Sprite уже в DOM (другая Angular app instance в той же странице,
        // e.g. Storybook между stories) — пропускаем 313 HTTP-запросов.
        if (this.#doc.getElementById(SPRITE_ID)) {
            this.#preloadAll$ = of(undefined).pipe(shareReplay(1));
            return this.#preloadAll$;
        }
        this.#preloadAll$ = forkJoin(iconsName.map((name: IRtIcon.Name) => this.#fetchSymbol(name))).pipe(
            tap((symbols: string[]): void => this.#mountSprite(symbols)),
            map((): void => undefined),
            shareReplay(1)
        );
        return this.#preloadAll$;
    }

    #fetchSymbol(name: IRtIcon.Name): Observable<string> {
        return this.#http
            .get(`${this.#baseUrl}/${name}.svg`, { responseType: 'text' })
            .pipe(map((raw: string): string => this.#extractSymbol(name, raw)));
    }

    #extractSymbol(name: IRtIcon.Name, raw: string): string {
        // Заменяем root `<svg>` на `<symbol id="rt-icon-NAME">`, сохраняя viewBox и содержимое.
        const viewBoxMatch: RegExpExecArray | null = /viewBox="([^"]+)"/.exec(raw);
        const viewBox: string = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
        const inner: string = raw
            .replace(/<\?xml[\s\S]*?\?>/g, '')
            .replace(/<!DOCTYPE[\s\S]*?>/g, '')
            .replace(/<svg\b[^>]*>/i, '')
            .replace(/<\/svg>\s*$/i, '')
            .trim();
        return `<symbol id="${SYMBOL_ID_PREFIX}${name}" viewBox="${viewBox}">${inner}</symbol>`;
    }

    #mountSprite(symbols: string[]): void {
        const existing: HTMLElement | null = this.#doc.getElementById(SPRITE_ID);
        if (existing) {
            existing.remove();
        }
        const sprite: SVGSVGElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sprite.id = SPRITE_ID;
        sprite.setAttribute('aria-hidden', 'true');
        sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');
        sprite.innerHTML = symbols.join('');
        this.#doc.body.insertBefore(sprite, this.#doc.body.firstChild);
    }
}
