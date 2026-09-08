import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EMPTY, Observable, Subject, catchError, map, mergeMap, tap } from 'rxjs';

import { PlatformService } from '@rt-tools/core';

import {
    RT_ICON_MATERIAL_PRESET_SELECTOR,
    RT_ICON_MATERIAL_SYMBOL_ID_PREFIX,
    RT_ICON_SPRITE_ID,
    RT_ICON_SYMBOL_ID_PREFIX,
} from './rt-icon.const';
import { IRtIcon } from './rt-icon.model';

/**
 * Адрес, по которому приложение публикует набор из `assets/icons` пакета.
 * Умолчание годится, когда сборка кладёт набор в корень статики; свой адрес
 * задаётся аргументом `provideRtIcons()`.
 */
export const RT_ICONS_BASE_URL: InjectionToken<string> = new InjectionToken<string>('RT_ICONS_BASE_URL', {
    providedIn: 'root',
    factory: (): string => '/icons',
});

/**
 * Адрес материального набора значков. Отдельный от своего: два набора стоят рядом, и приложение
 * кладёт их двумя папками.
 */
export const RT_ICONS_MATERIAL_BASE_URL: InjectionToken<string> = new InjectionToken<string>('RT_ICONS_MATERIAL_BASE_URL', {
    providedIn: 'root',
    factory: (): string => '/icons-material',
});

@Injectable({ providedIn: 'root' })
export class RtIconRegistry {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #baseUrl: string = inject(RT_ICONS_BASE_URL);
    readonly #materialBaseUrl: string = inject(RT_ICONS_MATERIAL_BASE_URL);
    readonly #platform: PlatformService = inject(PlatformService);

    /**
     * Имена, за которыми уже сходили: второй раз в сеть за ними не ходят. Ключ несёт набор —
     * одно имя приезжает двумя разными рисунками, и общий ключ отдал бы второму первый.
     */
    readonly #requested: Set<string> = new Set<string>();

    /** Имена, которые попросила разметка. Загрузку по ним ведёт подписка из конструктора. */
    readonly #requestSource: Subject<IRtIconRequest> = new Subject<IRtIconRequest>();

    constructor() {
        // Потоки складываются, а не вытесняют друг друга: странице нужны все спрошенные
        // значки, а не последний из них.
        this.#requestSource
            .pipe(
                mergeMap((asked: IRtIconRequest): Observable<void> => this.#load(asked)),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /**
     * Имя symbol для `<use href="#X">`. Возвращает строку с ведущим `#`.
     *
     * Набор назван явно, а не выведен из страницы: одна и та же страница держит оба набора
     * рядом — признак стоит и на корне, и на контейнере, — и вывод по странице дал бы обоим
     * один ответ.
     */
    public symbolHref(name: IRtIcon.Name, preset: IRtIcon.Preset = 'base'): string {
        return `#${this.#symbolId(name, preset)}`;
    }

    /**
     * Есть ли на странице материальный набор. Спрашивается у разметки, потому что признак ставит
     * приложение разметкой: своей службы у набора нет — этим он и отличается от темы.
     */
    public hasMaterialPreset(): boolean {
        return this.#platform.isPlatformBrowser && this.#doc.querySelector(RT_ICON_MATERIAL_PRESET_SELECTOR) !== null;
    }

    /**
     * Просит значок по имени: грузит файл и дописывает `<symbol>` в спрайт страницы.
     *
     * Ответа зовущий не ждёт и потока не получает: разметка рисует ссылку на символ сразу, а
     * браузер дорисовывает её, когда символ приезжает. Подписка живёт здесь и только здесь —
     * иначе каждая разметка гасила бы её сама, а таких мест у значка два.
     */
    public request(name: IRtIcon.Name, preset: IRtIcon.Preset = 'base'): void {
        const id: string = this.#symbolId(name, preset);
        // На сервере относительных запросов к статике нет вовсе: значок дорисуется после
        // гидрации, когда разметка попросит его снова уже в браузере.
        if (!this.#platform.isPlatformBrowser || this.#requested.has(id)) {
            return;
        }
        this.#requested.add(id);
        // Символ уже лежит в спрайте страницы: его положила соседняя история витрины или
        // сама страница до старта приложения. Запроса не уходит вовсе.
        if (this.#doc.getElementById(id)) {
            return;
        }
        this.#requestSource.next({ name, preset });
    }

    #load(asked: IRtIconRequest): Observable<void> {
        const base: string = asked.preset === 'material' ? this.#materialBaseUrl : this.#baseUrl;
        return this.#http.get(`${base}/${asked.name}.svg`, { responseType: 'text' }).pipe(
            tap((raw: string): void => this.#mountSymbol(asked, raw)),
            map((): void => undefined),
            // Отказ одного имени гасит только его значок: иначе один промах в наборе ронял бы
            // всю страницу, а соседние значки уже приехали.
            catchError((): typeof EMPTY => EMPTY)
        );
    }

    #symbolId(name: IRtIcon.Name, preset: IRtIcon.Preset): string {
        const prefix: string = preset === 'material' ? RT_ICON_MATERIAL_SYMBOL_ID_PREFIX : RT_ICON_SYMBOL_ID_PREFIX;
        return `${prefix}${name}`;
    }

    #mountSymbol(asked: IRtIconRequest, raw: string): void {
        const symbol: SVGSymbolElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'symbol');
        symbol.id = this.#symbolId(asked.name, asked.preset);
        symbol.setAttribute('viewBox', this.#viewBox(raw));
        symbol.innerHTML = this.#inner(raw);
        this.#sprite().appendChild(symbol);
    }

    #viewBox(raw: string): string {
        const viewBoxMatch: RegExpExecArray | null = /viewBox="([^"]+)"/.exec(raw);
        return viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
    }

    #inner(raw: string): string {
        // Тело корневого `<svg>` без него самого: оно и становится телом `<symbol>`.
        return raw
            .replace(/<\?xml[\s\S]*?\?>/g, '')
            .replace(/<!DOCTYPE[\s\S]*?>/g, '')
            .replace(/<svg\b[^>]*>/i, '')
            .replace(/<\/svg>\s*$/i, '')
            .trim();
    }

    #sprite(): SVGSVGElement {
        const existing: SVGSVGElement | null = this.#doc.querySelector<SVGSVGElement>(`svg#${RT_ICON_SPRITE_ID}`);
        if (existing) {
            return existing;
        }
        const sprite: SVGSVGElement = this.#doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sprite.id = RT_ICON_SPRITE_ID;
        sprite.setAttribute('aria-hidden', 'true');
        sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');
        this.#doc.body.insertBefore(sprite, this.#doc.body.firstChild);
        return sprite;
    }
}

/** Что просит разметка: имя значка и набор, из которого берётся рисунок. */
interface IRtIconRequest {
    readonly name: IRtIcon.Name;
    readonly preset: IRtIcon.Preset;
}
