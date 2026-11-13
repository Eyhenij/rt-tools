import { BooleanInput } from '@angular/cdk/coercion';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    output,
    OutputEmitterRef,
    Renderer2,
    signal,
    Signal,
    TemplateRef,
    untracked,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { map, mergeMap, Observable, of, Subject, switchMap } from 'rxjs';

import { StorageService } from '@rt-tools/core';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtAsideRef, RtAsideService, TRtAsideContentLayout } from '@rt-tools/ui-kit-v2/aside';
import { BreakpointsService, RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtWorkspaceAsideOverlayComponent } from './rt-workspace-aside-overlay.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from './rt-workspace.directives';
import { IRtWorkspace } from './rt-workspace.model';

const BEM_BLOCK: string = 'rt-workspace';
const STORAGE_PREFIX: string = 'rt-workspace:';
const KEYBOARD_STEP: number = 16;
const ASIDE_OVERLAY_PANE: string = 'rt-workspace-aside-pane';

/** Что принимает вход порога: число, строка атрибута или `null` */
type TBreakpointInput = number | string | null;

/** Порог одной колонки из входа: пустое значение оставляет порог стилей. */
function breakpointAttribute(value: TBreakpointInput): number | null {
    return value === null || value === '' ? null : numberAttribute(value);
}

interface IDragState {
    kind: IRtWorkspace.PanelKind;
    startX: number;
    startWidth: number;
}

@Component({
    selector: 'rt-workspace',
    templateUrl: './rt-workspace.component.html',
    styleUrls: ['./rt-workspace.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-workspace--has-active]': 'hasActive()',
        '[class.rt-workspace--cards]': 'cards()',
        '[class.rt-workspace--breakpoint]': 'singleColumnBreakpoint() !== null',
        '[class.rt-workspace--single]': 'singleColumn()',
        '[class.rt-workspace--aside-collapsed]': 'asideCollapsed()',
        '[class.rt-workspace--resizing]': 'resizing()',
        '[style.--rt-workspace-list-size]': "listWidth() + 'px'",
        '[style.--rt-workspace-aside-size]': "asideWidth() + 'px'",
    },
})
export class RtWorkspaceComponent implements IRtWorkspace.PanelApi {
    readonly #storage: StorageService = inject(StorageService);

    readonly #renderer: Renderer2 = inject(Renderer2);

    readonly #hostRef: ElementRef<HTMLElement> = inject(ElementRef);

    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    readonly #observer: BreakpointObserver = inject(BreakpointObserver);

    readonly #asides: RtAsideService = inject(RtAsideService);

    readonly #injector: Injector = inject(Injector);

    /** Открытая поверх окна панель сведений: её закрытие догоняет состояние в конструкторе */
    readonly #overlayOpenedSource: Subject<RtAsideRef<void>> = new Subject<RtAsideRef<void>>();

    /**
     * Окно не шире порога из входа: отвечает, когда место страницы не объявлено. Вход читается
     * через `computed`: поле стоит выше входа, и напрямую его ещё нет.
     */
    readonly #viewportSingle: Signal<boolean> = toSignal(
        toObservable(computed((): number | null => this.singleColumnBreakpoint())).pipe(
            switchMap((breakpoint: number | null): Observable<boolean> =>
                breakpoint === null
                    ? of(false)
                    : this.#observer.observe(`(max-width: ${breakpoint}px)`).pipe(map((state: BreakpointState): boolean => state.matches))
            )
        ),
        { initialValue: false }
    );

    #overlayRef: RtAsideRef<void> | null = null;

    readonly #listWidthOverride: WritableSignal<number | null> = signal<number | null>(null);

    readonly #asideWidthOverride: WritableSignal<number | null> = signal<number | null>(null);

    readonly #asideCollapsed: WritableSignal<boolean> = signal<boolean>(false);

    readonly #asideOpen: WritableSignal<boolean> = signal<boolean>(false);

    readonly #resizing: WritableSignal<boolean> = signal<boolean>(false);

    #restoredKey: string | null = null;

    #dragState: IDragState | null = null;

    #detachDragListeners: (() => void) | null = null;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly listSlot: Signal<RtWorkspaceListDirective | undefined> = contentChild(RtWorkspaceListDirective);

    protected readonly centerSlot: Signal<RtWorkspaceCenterDirective | undefined> = contentChild(RtWorkspaceCenterDirective);

    protected readonly asideSlot: Signal<RtWorkspaceAsideDirective | undefined> = contentChild(RtWorkspaceAsideDirective);

    protected readonly resizing: Signal<boolean> = this.#resizing.asReadonly();

    protected readonly slotContext: IRtWorkspace.SlotContext = { $implicit: this };

    /** Одна колонка по порогу из входа; без входа вид держат стили, и здесь всегда `false` */
    protected readonly singleColumn: Signal<boolean> = computed((): boolean => {
        const breakpoint: number | null = this.singleColumnBreakpoint();
        if (breakpoint === null) {
            return false;
        }
        const placeWidth: number | null = this.#breakpoints.placeWidth();

        return placeWidth === null ? this.#viewportSingle() : placeWidth <= breakpoint;
    });

    public readonly storageKey: InputSignal<string | null> = input<string | null>(null);

    public readonly hasActive: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Колонки стоят отдельными карточками с зазором, без линий между ними */
    public readonly cards: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly listMinWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(240, {
        transform: numberAttribute,
    });

    public readonly listMaxWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(480, {
        transform: numberAttribute,
    });

    public readonly listDefaultWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(320, {
        transform: numberAttribute,
    });

    public readonly asideMinWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(280, {
        transform: numberAttribute,
    });

    public readonly asideMaxWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(560, {
        transform: numberAttribute,
    });

    public readonly asideDefaultWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(360, {
        transform: numberAttribute,
    });

    public readonly centerMinWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(360, {
        transform: numberAttribute,
    });

    /**
     * Порог одной колонки, пиксели места страницы. Без входа порог держат стили: 768. С входом
     * выше порога список и середина стоят рядом, а панель сведений, которой не хватает места
     * третьей колонкой, открывается поверх окна. Порог выше 1080 смысла не имеет.
     */
    public readonly singleColumnBreakpoint: InputSignalWithTransform<number | null, TBreakpointInput> = input<
        number | null,
        TBreakpointInput
    >(null, { transform: breakpointAttribute });

    /** Ширина панели сведений, открытой поверх окна */
    public readonly asideOverlayWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(540, {
        transform: numberAttribute,
    });

    /**
     * Заголовок шапки панели сведений, открытой поверх окна: имя записи, чьи сведения открыты.
     * Без него в шапке остаются стрелка назад и надпись «Сведения». В колонке не показывается.
     */
    public readonly asideTitle: InputSignal<string | null> = input<string | null>(null);

    /**
     * Раскладка содержимого панели поверх окна, как у `rt-aside`: `tabs` для шаблона сведений из
     * вкладок — полоса вкладок стоит на месте, прокручивается содержимое вкладки.
     */
    public readonly asideContentLayout: InputSignal<TRtAsideContentLayout> = input<TRtAsideContentLayout>('default');

    public readonly backClicked: OutputEmitterRef<void> = output<void>();

    public readonly asideOverlay: Signal<boolean> = computed(
        (): boolean => this.singleColumnBreakpoint() !== null && this.#breakpoints.narrow() && !this.singleColumn()
    );

    public readonly listWidth: Signal<number> = computed((): number => this.#listWidthOverride() ?? this.listDefaultWidth());

    public readonly asideWidth: Signal<number> = computed((): number => this.#asideWidthOverride() ?? this.asideDefaultWidth());

    public readonly asideCollapsed: Signal<boolean> = this.#asideCollapsed.asReadonly();

    public readonly asideOpen: Signal<boolean> = this.#asideOpen.asReadonly();

    constructor() {
        effect((): void => {
            const key: string | null = this.storageKey();
            if (key === null || key === this.#restoredKey) {
                return;
            }
            this.#restoredKey = key;
            untracked((): void => this.#restoreFromStorage(key));
        });

        // Панель поверх окна живёт, пока она открыта и вид её требует: смена ширины её закрывает
        effect((): void => {
            const template: TemplateRef<IRtWorkspace.SlotContext> | undefined = this.asideSlot()?.templateRef;
            const shown: boolean = this.#asideOpen() && this.asideOverlay();
            untracked((): void => (shown && template ? this.#openOverlay(template) : this.#closeOverlay()));
        });

        // Затемнение, Esc и кнопка «Закрыть» закрывают панель сами: состояние догоняет их
        this.#overlayOpenedSource
            .pipe(
                mergeMap((ref: RtAsideRef<void>): Observable<RtAsideRef<void>> => ref.afterClosed().pipe(map((): RtAsideRef<void> => ref))),
                takeUntilDestroyed()
            )
            .subscribe((ref: RtAsideRef<void>): void => {
                if (this.#overlayRef === ref) {
                    this.#overlayRef = null;
                }
                this.#asideOpen.set(false);
            });

        this.#destroyRef.onDestroy((): void => this.#stopDragging());
    }

    public toggleAsideCollapsed(): void {
        this.#asideCollapsed.update((collapsed: boolean): boolean => !collapsed);
        this.#persist();
    }

    public openAside(): void {
        this.#asideOpen.set(true);
    }

    public closeAside(): void {
        this.#asideOpen.set(false);
    }

    public toggleAside(): void {
        this.#asideOpen.update((open: boolean): boolean => !open);
    }

    protected onBackClicked(): void {
        this.closeAside();
        this.backClicked.emit();
    }

    protected onHandlePointerDown(event: PointerEvent, kind: IRtWorkspace.PanelKind): void {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        this.#dragState = {
            kind,
            startX: event.clientX,
            startWidth: kind === 'list' ? this.listWidth() : this.asideWidth(),
        };
        this.#resizing.set(true);

        const detachMove: () => void = this.#renderer.listen('document', 'pointermove', (moveEvent: PointerEvent): void =>
            this.#onDragMove(moveEvent)
        );
        const detachUp: () => void = this.#renderer.listen('document', 'pointerup', (): void => {
            this.#persist();
            this.#stopDragging();
        });
        this.#detachDragListeners = (): void => {
            detachMove();
            detachUp();
        };
    }

    protected onHandleKeydown(event: KeyboardEvent, kind: IRtWorkspace.PanelKind): void {
        let delta: number;
        if (event.key === 'ArrowRight') {
            delta = kind === 'list' ? KEYBOARD_STEP : -KEYBOARD_STEP;
        } else if (event.key === 'ArrowLeft') {
            delta = kind === 'list' ? -KEYBOARD_STEP : KEYBOARD_STEP;
        } else {
            return;
        }
        event.preventDefault();
        const current: number = kind === 'list' ? this.listWidth() : this.asideWidth();
        this.#applyWidth(kind, current + delta);
        this.#persist();
    }

    protected onHandleReset(kind: IRtWorkspace.PanelKind): void {
        const override: WritableSignal<number | null> = kind === 'list' ? this.#listWidthOverride : this.#asideWidthOverride;
        override.set(null);
        this.#persist();
    }

    #openOverlay(template: TemplateRef<IRtWorkspace.SlotContext>): void {
        if (this.#overlayRef !== null) {
            return;
        }
        const data: IRtWorkspace.AsideOverlayData = {
            template,
            context: this.slotContext,
            width: this.asideOverlayWidth(),
            title: this.asideTitle,
            contentLayout: this.asideContentLayout,
        };
        const ref: RtAsideRef<void> = this.#asides.open<RtWorkspaceAsideOverlayComponent, IRtWorkspace.AsideOverlayData, void>(
            RtWorkspaceAsideOverlayComponent,
            { data, injector: this.#injector, panelClass: ASIDE_OVERLAY_PANE }
        );
        this.#overlayRef = ref;
        this.#overlayOpenedSource.next(ref);
    }

    #closeOverlay(): void {
        const ref: RtAsideRef<void> | null = this.#overlayRef;
        this.#overlayRef = null;
        ref?.close();
    }

    #onDragMove(event: PointerEvent): void {
        const drag: IDragState | null = this.#dragState;
        if (drag === null) {
            return;
        }
        const dx: number = event.clientX - drag.startX;
        const rawWidth: number = drag.kind === 'list' ? drag.startWidth + dx : drag.startWidth - dx;
        this.#applyWidth(drag.kind, rawWidth);
    }

    #applyWidth(kind: IRtWorkspace.PanelKind, rawWidth: number): void {
        const override: WritableSignal<number | null> = kind === 'list' ? this.#listWidthOverride : this.#asideWidthOverride;
        override.set(this.#clampWidth(kind, rawWidth));
    }

    #clampWidth(kind: IRtWorkspace.PanelKind, rawWidth: number): number {
        const min: number = kind === 'list' ? this.listMinWidth() : this.asideMinWidth();
        const configMax: number = kind === 'list' ? this.listMaxWidth() : this.asideMaxWidth();
        // Место соседней панели вычитается, только когда она объявлена: без её слота ширина
        // соседки — число из умолчаний, а места она не занимает вовсе.
        const otherWidth: number = this.#occupiedWidth(kind === 'list' ? 'aside' : 'list');
        const hostWidth: number = this.#hostRef.nativeElement.clientWidth;
        const available: number = hostWidth > 0 ? hostWidth - otherWidth - this.centerMinWidth() : Number.POSITIVE_INFINITY;
        const max: number = Math.max(min, Math.min(configMax, available));
        return Math.round(Math.min(max, Math.max(min, rawWidth)));
    }

    /** Сколько ширины занимает панель: необъявленная не занимает ничего. */
    #occupiedWidth(kind: IRtWorkspace.PanelKind): number {
        if (kind === 'list') {
            return this.listSlot() ? this.listWidth() : 0;
        }

        return this.asideSlot() ? this.asideWidth() : 0;
    }

    #stopDragging(): void {
        this.#detachDragListeners?.();
        this.#detachDragListeners = null;
        this.#dragState = null;
        this.#resizing.set(false);
    }

    #restoreFromStorage(key: string): void {
        const stored: IRtWorkspace.PersistedState | null =
            this.#storage.getItem<IRtWorkspace.PersistedState>(`${STORAGE_PREFIX}${key}`) ?? null;
        if (stored === null || typeof stored !== 'object') {
            return;
        }
        if (typeof stored.listWidth === 'number') {
            this.#listWidthOverride.set(this.#clampWidth('list', stored.listWidth));
        }
        if (typeof stored.asideWidth === 'number') {
            this.#asideWidthOverride.set(this.#clampWidth('aside', stored.asideWidth));
        }
        this.#asideCollapsed.set(stored.asideCollapsed === true);
    }

    #persist(): void {
        const key: string | null = this.storageKey();
        if (key === null) {
            return;
        }
        const state: IRtWorkspace.PersistedState = {
            listWidth: this.listWidth(),
            asideWidth: this.asideWidth(),
            asideCollapsed: this.asideCollapsed(),
        };
        this.#storage.setItem(`${STORAGE_PREFIX}${key}`, state);
    }
}
