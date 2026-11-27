import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject, Service, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject, catchError, defer, map, mergeMap, of, tap } from 'rxjs';

import { PlatformService } from '@rt-tools/core';

import { RT_ICON_SPRITE_ID } from './rt-icon.const';
import { rtIconCleanDrawing, SVG_NS } from './rt-icon-drawing.logic';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtIconRef, IRtIconSetsConfig, RT_ICON_KIT_SET, rtIconIsSvgFile, rtIconRef, rtIconSetsConfig } from './rt-icon-sets.logic';

/* Значение задаёт сборка приложения: в рабочей сборке оно `false`, и тексты предупреждений из неё
   выпадают. Поведение от него не зависит. */
declare const ngDevMode: boolean | undefined;

/**
 * Наборы значков приложения. Умолчание — только встроенные; свои наборы и свой адрес приложение
 * называет в `provideRtIcons()`.
 */
export const RT_ICON_SETS_CONFIG: InjectionToken<IRtIconSetsConfig> = new InjectionToken<IRtIconSetsConfig>('RT_ICON_SETS_CONFIG', {
    providedIn: 'root',
    factory: (): IRtIconSetsConfig => rtIconSetsConfig(),
});

/** Адрес, за которым идут в сеть, и то, что по нему пришло. */
interface IIconFetch {
    readonly url: string;
    /** Первый ответ по адресу. `undefined` — ответа ещё не было, `null` — отказ. */
    raw?: string | null;
    /** Ответ тем, кто спросил, пока его не было. */
    readonly arrival: Subject<string | null>;
}

@Service()
export class RtIconRegistry {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #config: IRtIconSetsConfig = inject(RT_ICON_SETS_CONFIG);
    readonly #platform: PlatformService = inject(PlatformService);

    /** Символы, за которыми уже сходили: второй раз за ними не ходят. */
    readonly #requested: Set<string> = new Set<string>();

    /**
     * Скачанное по адресу, отказ тоже: один адрес идёт в сеть один раз, сколько бы наборов и
     * символов его ни спросили. Отказ запоминается пустым ответом.
     */
    readonly #files: Map<string, Observable<string | null>> = new Map<string, Observable<string | null>>();

    /** Нарисован ли символ. По этому сигналу значок меняет старый рисунок на новый. */
    readonly #ready: Map<string, WritableSignal<boolean>> = new Map<string, WritableSignal<boolean>>();

    /** Рисунки, которые попросила разметка. Загрузку по ним ведёт подписка из конструктора. */
    readonly #requestSource: Subject<IRtIconRef> = new Subject<IRtIconRef>();

    /**
     * Адреса, за которыми пора идти в сеть. Первый ответ запоминается в записи адреса, и поздний
     * спросивший получает его же. Оператор повтора и субъект с памятью из rxjs не берутся: любой из
     * них утяжеляет стартовый набор приложения, у которого его ещё нет.
     */
    readonly #fetchSource: Subject<IIconFetch> = new Subject<IIconFetch>();

    /** Набор приложения из `provideRtIcons()`. */
    public readonly defaultSet: string = this.#config.defaultSet;

    constructor() {
        this.#fetchSource
            .pipe(
                mergeMap((asked: IIconFetch): Observable<string | null> =>
                    this.#http.get(asked.url, { responseType: 'text' }).pipe(
                        map((raw: string): string | null => (rtIconIsSvgFile(raw) ? raw : null)),
                        catchError((): Observable<null> => of(null)),
                        // Ответ уходит спросившим сразу. Поток запроса может не завершиться или
                        // завершиться без ответа: это решают перехватчики приложения.
                        tap({
                            next: (raw: string | null): void => {
                                if (asked.raw === undefined) {
                                    asked.raw = raw;
                                    asked.arrival.next(raw);
                                    asked.arrival.complete();
                                }
                            },
                            complete: (): void => asked.arrival.complete(),
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
        // Потоки складываются, а не вытесняют друг друга: странице нужны все спрошенные
        // значки, а не последний из них.
        this.#requestSource
            .pipe(
                mergeMap((asked: IRtIconRef): Observable<string | null> => this.#load(asked)),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Что значок берёт из набора: `id` символа и адреса рисунка по порядку запасных. */
    public drawing(name: IRtIcon.Name, set: string = RT_ICON_KIT_SET, fill: boolean = false): IRtIconRef {
        return rtIconRef(this.#config, set, name, fill);
    }

    /** Лежит ли символ в спрайте страницы. */
    public ready(id: string): Signal<boolean> {
        return this.#readiness(id);
    }

    /**
     * Имя symbol для `<use href="#X">`. Возвращает строку с ведущим `#`.
     *
     * Набор назван явно, а не выведен из страницы: одна и та же страница держит несколько
     * наборов рядом, и вывод по странице дал бы им один ответ.
     */
    public symbolHref(name: IRtIcon.Name, set: string = RT_ICON_KIT_SET, fill: boolean = false): string {
        return `#${this.drawing(name, set, fill).id}`;
    }

    /**
     * Просит значок по имени: грузит файл и дописывает `<symbol>` в спрайт страницы.
     *
     * Ответа зовущий не ждёт и потока не получает: разметка рисует ссылку на символ сразу, а
     * браузер дорисовывает её, когда символ приезжает. Подписка живёт здесь и только здесь —
     * иначе каждая разметка гасила бы её сама, а таких мест у значка два.
     */
    public request(name: IRtIcon.Name, set: string = RT_ICON_KIT_SET, fill: boolean = false): void {
        const asked: IRtIconRef = this.drawing(name, set, fill);
        // На сервере относительных запросов к статике нет вовсе: значок дорисуется после
        // гидрации, когда разметка попросит его снова уже в браузере.
        if (!this.#platform.isPlatformBrowser || this.#requested.has(asked.id)) {
            return;
        }
        this.#requested.add(asked.id);
        // Символ уже лежит в спрайте страницы: его положила соседняя история витрины или
        // сама страница до старта приложения. Запроса не уходит вовсе.
        if (this.#doc.getElementById(asked.id)) {
            this.#readiness(asked.id).set(true);
            return;
        }
        this.#requestSource.next(asked);
    }

    /**
     * Первый приехавший рисунок по адресам запасных под именем символа, которое просила разметка:
     * подмена ссылки разметке не нужна. Отказ одного имени гасит только его значок.
     */
    #load(asked: IRtIconRef): Observable<string | null> {
        return this.#firstFile(asked.urls, 0).pipe(
            tap((raw: string | null): void => {
                if (raw === null) {
                    this.#reportMissing(asked);
                } else {
                    this.#mountSymbol(asked.id, raw);
                    this.#readiness(asked.id).set(true);
                }
            })
        );
    }

    #readiness(id: string): WritableSignal<boolean> {
        let ready: WritableSignal<boolean> | undefined = this.#ready.get(id);

        if (ready === undefined) {
            ready = signal<boolean>(false);
            this.#ready.set(id, ready);
        }

        return ready;
    }

    #firstFile(urls: ReadonlyArray<string>, index: number): Observable<string | null> {
        if (index >= urls.length) {
            return of(null);
        }

        return this.#file(urls[index]).pipe(
            mergeMap((raw: string | null): Observable<string | null> => (raw === null ? this.#firstFile(urls, index + 1) : of(raw)))
        );
    }

    #file(url: string): Observable<string | null> {
        let file: Observable<string | null> | undefined = this.#files.get(url);

        if (file === undefined) {
            const fetch: IIconFetch = { url, arrival: new Subject<string | null>() };
            // Что отдать, решается в миг подписки: ответ мог прийти раньше неё.
            file = defer((): Observable<string | null> => (fetch.raw === undefined ? fetch.arrival : of(fetch.raw)));
            this.#files.set(url, file);
            this.#fetchSource.next(fetch);
        }

        return file;
    }

    /* Предупреждение одно на символ: за ним не ходят второй раз. */
    #reportMissing(asked: IRtIconRef): void {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
            console.warn(`rt-icon: рисунка «${asked.name}» нет ни в наборе «${asked.set}», ни в его запасных.`);
        }
    }

    /**
     * Тело корневого `<svg>` файла становится телом `<symbol>` спрайта. Файл разбирается как SVG,
     * а не вклеивается строкой: адрес набора задаёт токен, и потребитель может направить его на
     * свои файлы. Скрипты, вложенный HTML и обработчики событий в спрайт не попадают.
     */
    #mountSymbol(id: string, raw: string): void {
        const symbol: SVGSymbolElement = this.#doc.createElementNS(SVG_NS, 'symbol');
        symbol.id = id;
        const root: Element | null = this.#parsedRoot(raw);
        symbol.setAttribute('viewBox', root?.getAttribute('viewBox') ?? '0 0 24 24');
        if (root) {
            rtIconCleanDrawing(root);
            symbol.append(...Array.from(root.childNodes, (node: Node): Node => this.#doc.importNode(node, true)));
        }
        this.#sprite().appendChild(symbol);
    }

    /**
     * Корень `<svg>` файла, или `null`, когда в файле его нет. Разбор идёт разборщиком HTML, как шла
     * прежняя запись разметки: он кладёт `<svg>` и его детей в пространство SVG и тогда, когда файл
     * не объявил `xmlns`, а разборщик XML оставил бы такие узлы без пространства, и они не рисуются.
     * Документ разбора не исполняет скриптов.
     */
    #parsedRoot(raw: string): Element | null {
        const Parser: typeof DOMParser | undefined = this.#doc.defaultView?.DOMParser;
        if (!Parser) {
            return null;
        }
        const root: Element | null = new Parser().parseFromString(raw, 'text/html').body.querySelector('svg');
        return root?.namespaceURI === SVG_NS ? root : null;
    }

    #sprite(): SVGSVGElement {
        const existing: SVGSVGElement | null = this.#doc.querySelector<SVGSVGElement>(`svg#${RT_ICON_SPRITE_ID}`);
        if (existing) {
            return existing;
        }
        const sprite: SVGSVGElement = this.#doc.createElementNS(SVG_NS, 'svg');
        sprite.id = RT_ICON_SPRITE_ID;
        sprite.setAttribute('aria-hidden', 'true');
        sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');
        this.#doc.body.insertBefore(sprite, this.#doc.body.firstChild);
        return sprite;
    }
}
