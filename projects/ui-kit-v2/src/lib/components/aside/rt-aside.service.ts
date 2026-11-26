import { ComponentType, Overlay, OverlayConfig, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { inject, untracked, DestroyRef, Injector, Renderer2, RendererFactory2, Signal, Service, StaticProvider } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EMPTY, exhaustMap, map, merge, mergeMap, Observable, of, Subject, Subscriber, takeUntil } from 'rxjs';

import { BreakpointsService, IRtKitConfig } from '@rt-tools/ui-kit-v2/core';
import { rtKitDefault } from '@rt-tools/ui-kit-v2/core';
import { applyIconSetScope, carryThemeScopeOfFocus, iconSetScopeOfFocus, materialPresetClassesOfFocus } from '@rt-tools/ui-kit-v2/core';
import { IRtIconSetScope, RT_ICON_SET_SCOPE, rtIconSetProviders, RtIconSetService } from '@rt-tools/ui-kit-v2/icon';
import { RtAsideRef, TRtAsideCloseRequest } from './rt-aside-ref';
import { IRtAsideSheetCloseRequest, RT_ASIDE_SHEET, RtAsideSheet } from './rt-aside-sheet';
import { ERtAsideUnsavedOutcome } from './unsaved-dialog/rt-aside-unsaved.logic';
import { RT_ASIDE_DATA } from './rt-aside.tokens';

/** Набор значков одного открытия: что написать на коробку и что дать содержимому. */
interface IRtAsideIconSet {
    readonly set: string | null;
    readonly providers: StaticProvider[];
}

/**
 * Названный набор, затем набор части с фокусом, затем набор части из `injector`. Зовётся до того,
 * как панель заберёт фокус.
 */
function asideIconSet(doc: Document, asked: string | null | undefined, injector: Injector | undefined): IRtAsideIconSet {
    const owner: IRtIconSetScope | null = injector?.get(RT_ICON_SET_SCOPE, null) ?? null;
    // Без `untracked` панель, открытая из `effect`, открылась бы снова на смене набора части.
    const set: string | null =
        asked === undefined ? (iconSetScopeOfFocus(doc) ?? untracked((): string | null => owner?.set() ?? null)) : asked;
    // `null` при части в `injector` закрывает её: иначе содержимое взяло бы её набор.
    const providers: StaticProvider[] = set === null && owner ? [{ provide: RT_ICON_SET_SCOPE, useValue: null }] : rtIconSetProviders(set);

    return { set, providers };
}

/**
 * Позиционирование side-sheet — у какого края viewport "приклеена" панель.
 */
export type TRtAsidePosition = 'right' | 'left';

/**
 * Конфигурация открытия side-sheet через `RtAsideService.open()`.
 */
export interface IRtAsideConfig<TData = unknown> {
    /** Данные, доступные внутри aside'а через `inject(RT_ASIDE_DATA)`. */
    data?: TData;

    /** Дополнительный CSS-класс для backdrop (поверх стандартного `rt-aside-backdrop`). */
    backdropClass?: string | string[];

    /** Дополнительный CSS-класс для panel-обёртки overlay (поверх `rt-aside-overlay`). */
    panelClass?: string | string[];

    /** Закрывать aside по клику на backdrop. По дефолту `true`. */
    closeOnBackdropClick?: boolean;

    /** Закрывать aside по ESC. По дефолту `true`. */
    closeOnEscape?: boolean;

    /** К какому краю viewport "приклеить" панель. По дефолту `"right"`. */
    position?: TRtAsidePosition;

    /**
     * Injector хозяина панели — обычно `inject(Injector)` открывающего компонента. Он становится
     * родителем портала: содержимое видит провайдеры хозяина. Уничтожение хозяина закрывает
     * панель через `close()`. Без него родитель — корневой injector, и панель живёт сама по себе.
     */
    injector?: Injector;

    /**
     * Набор значков панели. Без него панель берёт набор части, где стоит фокус, а когда фокус вне
     * частей — набор части из `injector`. `null` — без части: набор решают `use()` и настройка.
     */
    iconSet?: string | null;

    /**
     * Снимать панель при переходе по адресу. По умолчанию `true`; `false` оставляет её открытой —
     * для панели, которая сама ведёт навигацию и должна пережить смену адреса.
     */
    disposeOnNavigation?: boolean;
}

/**
 * Контекст одного открытия aside'а — payload для per-open close-подписок в конструкторном
 * стриме. `asideRef` сужен до используемых handler'ами членов (`RtAsideRef<T>` инвариантен
 * по `T`, целиком в generic-agnostic контекст не влезает).
 */
interface IRtAsideOpenContext {
    overlayRef: OverlayRef;
    asideRef: {
        disableClose: Signal<boolean>;
        unsaved: Signal<boolean>;
        close: () => void;
        requestSave: () => void;
    };
    closeRequests: Subject<TRtAsideCloseRequest>;
    /** Вид открытия: на телефоне шторка, и её жесты закрытия приходят отсюда. */
    sheet: RtAsideSheet;
    /** DestroyRef хозяина из `config.injector`; его уничтожение закрывает панель. */
    ownerDestroyRef: DestroyRef | null;
    closeOnBackdropClick: boolean;
    closeOnEscape: boolean;
}

/**
 * Программный API для открытия side-sheet поверх CDK Overlay.
 *
 * Архитектурно зеркалит `RtDialogService`, отличаясь только positionStrategy
 * (edge-anchored: `right('0')` / `left('0')` + `top('0')`) и slide-in анимацией,
 * которая триггерится через CSS-классы на overlay host (`Renderer2` инжектится
 * через `RendererFactory2`, потому что в service нет ComponentRef).
 *
 * Lifecycle:
 *  1. `overlay.create({ panelClass: [..., '--entering'] })` — host получает initial
 *     CSS-стейт (translateX(±100%)).
 *  2. `overlayRef.attach(portal)` — контент-компонент монтируется в host.
 *  3. На следующий paint (`requestAnimationFrame`) сервис снимает `--entering` и
 *     добавляет `--open` — CSS-transition сделает slide-in.
 *  4. На `ref.close(result)` ref добавляет `--leaving`, эмиттит result синхронно,
 *     deferred `dispose()` через 200ms (длительность анимации).
 *
 * Альтернатива rt-dialog — для длинных форм / мастеров / side-panels, где
 * центрированная модалка ощущается тесной. Не предназначено для подтверждений
 * или коротких диалогов (для этого — `RtDialogService`).
 *
 * @example
 * \`\`\`ts
 * private readonly asideService = inject(RtAsideService);
 *
 * openProfile(userId: number): void {
 *   const ref = this.asideService.open<GuestProfileAsideComponent, { userId: number }, void>(
 *     GuestProfileAsideComponent,
 *     { data: { userId }, position: "right" }
 *   );
 *   ref.afterClosed().subscribe(() => this.reloadList());
 * }
 *
 * // контент-компонент
 * @Component({ ... })
 * export class GuestProfileAsideComponent {
 *   readonly data = inject(RT_ASIDE_DATA) as { userId: number };
 *   readonly #ref = inject(RtAsideRef);
 *   close(): void { this.#ref.close(); }
 * }
 * \`\`\`
 */
@Service()
export class RtAsideService {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #injector: Injector = inject(Injector);
    readonly #iconSets: RtIconSetService = inject(RtIconSetService);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #phone: Signal<boolean> = inject(BreakpointsService).phone;
    // Renderer2 нужен для манипуляции CSS-классами на overlay.hostElement.
    // В service нет ComponentRef, поэтому Renderer2 берём через factory.
    readonly #renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

    readonly #openSource: Subject<IRtAsideOpenContext> = new Subject<IRtAsideOpenContext>();

    /* Закрывает ли `Escape` штору, когда вызов об этом промолчал. Умолчание кита — закрывает;
       приложению, которому это мешает, иначе пришлось бы писать отказ на каждом вызове, и
       забытый вызов отличался бы от остальных. */
    readonly #closeOnEscape: boolean = rtKitDefault('aside', (it: IRtKitConfig.Aside): boolean | undefined => it.closeOnEscape, true);

    constructor() {
        // Per-open close-подписки (backdrop / ESC) живут в одном постоянном
        // конструкторном стриме: open() эмитит контекст открытия, mergeMap
        // подписывает event-стримы конкретного OverlayRef до его dispose
        // (`detachments()` терминирует внутренний поток). mergeMap, а не
        // switchMap — одновременно может быть открыто несколько aside'ов.
        //
        // Runtime-guard через asideRef.disableClose() — те же правила, что в
        // rt-dialog: ESC / backdrop НЕ закрывают overlay, если disableClose=true;
        // программный ref.close() гейтом не задет.
        this.#openSource
            .pipe(
                mergeMap((openContext: IRtAsideOpenContext): Observable<() => void> => {
                    // Оба жеста слушаются всегда: отказ в закрытии — тоже ответ, и он уходит в
                    // `closeRequests()` хэндла, будь то `disableClose` или выключенный жест.
                    const backdropClose$: Observable<() => void> = openContext.overlayRef.backdropClick().pipe(
                        map((): (() => void) => (): void => {
                            this.#answerCloseGesture(openContext, 'backdrop', openContext.closeOnBackdropClick);
                        })
                    );
                    const escapeClose$: Observable<() => void> = openContext.overlayRef.keydownEvents().pipe(
                        map((event: KeyboardEvent): (() => void) => (): void => {
                            // Escape шторки телефона ведёт сама шторка: она знает, верхняя ли она.
                            if (event.key !== 'Escape' || openContext.sheet.active()) {
                                return;
                            }
                            if (openContext.closeOnEscape) {
                                event.preventDefault();
                            }
                            this.#answerCloseGesture(openContext, 'escape', openContext.closeOnEscape);
                        })
                    );
                    const ownerClose$: Observable<() => void> = this.#destroyed(openContext.ownerDestroyRef).pipe(
                        map((): (() => void) => (): void => openContext.asideRef.close())
                    );
                    // Шторка телефона закрывается полосой над собой, свайпом, Escape и «×»: жесты
                    // подчиняются тем же настройкам открытия, что подложка и Escape панели.
                    const sheetClose$: Observable<() => void> = openContext.sheet
                        .closeRequests()
                        .pipe(
                            exhaustMap((request: IRtAsideSheetCloseRequest): Observable<() => void> =>
                                this.#answerSheet(openContext, request)
                            )
                        );
                    return merge(backdropClose$, escapeClose$, ownerClose$, sheetClose$).pipe(
                        takeUntil(openContext.overlayRef.detachments())
                    );
                }),
                takeUntilDestroyed()
            )
            .subscribe((handleCloseIntent: () => void): void => handleCloseIntent());
    }

    public open<TComponent, TData = unknown, TResult = unknown>(
        component: ComponentType<TComponent>,
        config?: IRtAsideConfig<TData>
    ): RtAsideRef<TResult> {
        // Вид выбирается окном в миг открытия и держится до закрытия: окно, перешедшее порог при
        // открытой панели, шторку панелью не делает.
        const sheet: RtAsideSheet = new RtAsideSheet();
        sheet.activate(this.#phone());

        const overlayRef: OverlayRef = this.#overlay.create(sheet.active() ? this.#sheetConfig(config) : this.#sideConfig(config));
        // До attach: содержимое панели может забрать фокус, и кусок темы у кнопки будет потерян.
        const icons: IRtAsideIconSet = asideIconSet(this.#doc, this.#iconSets.asked(config?.iconSet), config?.injector);
        carryThemeScopeOfFocus(overlayRef.overlayElement, this.#doc);
        applyIconSetScope(overlayRef.overlayElement, icons.set);
        const closeRequests: Subject<TRtAsideCloseRequest> = new Subject<TRtAsideCloseRequest>();
        const asideRef: RtAsideRef<TResult> = new RtAsideRef<TResult>(overlayRef, this.#renderer, closeRequests, sheet);

        // Сами close-подписки объявлены один раз в конструкторе — здесь только
        // эмит контекста открытия (см. #openSource-стрим).
        this.#openSource.next({
            overlayRef,
            asideRef,
            closeRequests,
            sheet,
            ownerDestroyRef: config?.injector?.get(DestroyRef, null) ?? null,
            closeOnBackdropClick: config?.closeOnBackdropClick !== false,
            closeOnEscape: config?.closeOnEscape ?? this.#closeOnEscape,
        });

        const injector: Injector = Injector.create({
            parent: config?.injector ?? this.#injector,
            providers: [
                { provide: RtAsideRef, useValue: asideRef },
                { provide: RT_ASIDE_DATA, useValue: config?.data ?? null },
                { provide: RT_ASIDE_SHEET, useValue: sheet },
                ...icons.providers,
            ],
        });

        const portal: ComponentPortal<TComponent> = new ComponentPortal<TComponent>(component, null, injector);
        overlayRef.attach(portal);

        // Slide-in: на следующий paint снимаем --entering и добавляем --open.
        // CSS transition (см. rt-aside.component.scss) сделает анимацию.
        // Backdrop default hidden — toggle --visible одновременно со слайдом.
        // Шторка телефона в тот же кадр поднимается снизу: создана она опущенной.
        // Панель могли снять до кадра — `close()`, переходом или уничтожением хозяина в том же такте.
        requestAnimationFrame((): void => {
            if (!overlayRef.hasAttached()) {
                return;
            }
            this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--entering');
            this.#renderer.addClass(overlayRef.overlayElement, 'rt-aside-overlay--open');
            const backdropEl: HTMLElement | null = overlayRef.backdropElement;
            if (backdropEl !== null) {
                this.#renderer.addClass(backdropEl, 'rt-aside-backdrop--visible');
            }
            sheet.show(true);
        });

        return asideRef;
    }

    /** Панель у края окна: выезжает сбоку, подложка и блокировка прокрутки — у оверлея. */
    #sideConfig<TData>(config: IRtAsideConfig<TData> | undefined): OverlayConfig {
        const position: TRtAsidePosition = config?.position ?? 'right';
        const positionStrategy: PositionStrategy =
            position === 'right'
                ? this.#overlay.position().global().right('0').top('0')
                : this.#overlay.position().global().left('0').top('0');

        const panelClasses: string[] = [
            'rt-aside-overlay',
            `rt-aside-overlay--position-${position}`,
            'rt-aside-overlay--entering',
            ...materialPresetClassesOfFocus(this.#doc),
        ];

        return {
            positionStrategy,
            scrollStrategy: this.#overlay.scrollStrategies.block(),
            hasBackdrop: true,
            backdropClass: config?.backdropClass ?? 'rt-aside-backdrop',
            panelClass: config?.panelClass !== undefined ? [...panelClasses, ...this.#toArray(config.panelClass)] : panelClasses,
            disposeOnNavigation: config?.disposeOnNavigation ?? true,
        };
    }

    /**
     * Шторка телефона: оверлей во всё окно без своей подложки и блокировки. Затемнение, полосу над
     * шторкой и блокировку прокрутки держит сама шторка кита, край и ширина панели к ней не относятся.
     */
    #sheetConfig<TData>(config: IRtAsideConfig<TData> | undefined): OverlayConfig {
        const panelClasses: string[] = ['rt-aside-overlay', 'rt-aside-overlay--sheet', ...materialPresetClassesOfFocus(this.#doc)];

        return {
            positionStrategy: this.#overlay.position().global().left('0').top('0'),
            scrollStrategy: this.#overlay.scrollStrategies.noop(),
            hasBackdrop: false,
            panelClass: config?.panelClass !== undefined ? [...panelClasses, ...this.#toArray(config.panelClass)] : panelClasses,
            disposeOnNavigation: config?.disposeOnNavigation ?? true,
        };
    }

    /** Жест закрытия: закрывает панель, если жест включён и не держит `disableClose`, иначе сообщает об отказе. */
    #answerCloseGesture(openContext: IRtAsideOpenContext, gesture: TRtAsideCloseRequest, enabled: boolean): void {
        if (enabled && !openContext.asideRef.disableClose()) {
            openContext.asideRef.close();
            return;
        }
        openContext.closeRequests.next(gesture);
    }

    /**
     * Просьба шторки телефона закрыться. Выключенный жест и панель под `disableClose` отказывают до
     * вопроса, и отказ свайпа сообщается как отказ подложки. «×» идёт дорогой стрелки и не
     * отказывает. Признак несохранённого на хэндле сначала спрашивает внизу экрана: «Сохранить и
     * закрыть» сообщает просьбу записи и оставляет панель открытой, «Закрыть без сохранения»
     * закрывает, «Остаться» — ничего.
     */
    #answerSheet(openContext: IRtAsideOpenContext, request: IRtAsideSheetCloseRequest): Observable<() => void> {
        const close: () => void = request.road ?? ((): void => openContext.asideRef.close());
        if (request.gesture !== 'dismiss') {
            const enabled: boolean = request.gesture === 'escape' ? openContext.closeOnEscape : openContext.closeOnBackdropClick;
            if (!enabled || openContext.asideRef.disableClose()) {
                const gesture: TRtAsideCloseRequest = request.gesture;
                return of((): void => openContext.closeRequests.next(gesture));
            }
        }
        if (!openContext.asideRef.unsaved()) {
            return of(close);
        }
        // Пока вопрос показан, новые просьбы закрыться отбрасываются: `exhaustMap` ждёт ответа.
        return openContext.sheet.ask().pipe(
            map((outcome: ERtAsideUnsavedOutcome): (() => void) => {
                if (outcome === ERtAsideUnsavedOutcome.Save) {
                    return (): void => openContext.asideRef.requestSave();
                }
                return outcome === ERtAsideUnsavedOutcome.Discard ? close : (): void => undefined;
            })
        );
    }

    /**
     * Уничтожение хозяина как поток. Отписка — уход панели — снимает слушателя с хозяина, и его
     * позднее уничтожение панель уже не трогает.
     */
    #destroyed(ownerDestroyRef: DestroyRef | null): Observable<void> {
        if (ownerDestroyRef === null) {
            return EMPTY;
        }
        return new Observable<void>((subscriber: Subscriber<void>): (() => void) =>
            ownerDestroyRef.onDestroy((): void => subscriber.next())
        );
    }

    /** Нормализует `string | string[]` к массиву (panelClass поддерживает оба формата). */
    #toArray(value: string | string[]): string[] {
        return Array.isArray(value) ? value : [value];
    }
}
