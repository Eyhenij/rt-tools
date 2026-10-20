import {
    afterRenderEffect,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    linkedSignal,
    Signal,
    signal,
    untracked,
    WritableSignal,
} from '@angular/core';

import { RtTabDirective } from './rt-tab.directive';
import { IRtTabs } from './rt-tabs.model';

/** Признак, по которому пользователь просит обходиться без движения. */
const REDUCED_MOTION_QUERY: string = '(prefers-reduced-motion: reduce)';

/** Куда сдвигается содержимое: к вкладке правее (`forward`) или левее (`backward`). */
export type TRtTabsPanelShift = 'forward' | 'backward';

/** Панель прежней вкладки, пока её уход не кончился, и место, с которого она уходит (px от хоста). */
export interface IRtTabsLeavingPanel {
    readonly id: IRtTabs.Id;
    readonly shift: TRtTabsPanelShift;
    readonly top: number;
    readonly left: number;
}

/** Смена выбора: с какой вкладки, на какую и длительность из входа (`null` — из токена). */
export interface IRtTabsMove {
    readonly previous: IRtTabs.Id | null;
    readonly next: IRtTabs.Id | null;
    readonly duration: string | null;
}

/**
 * Панель в области содержимого: активная, уходящая (`leaving`) или сохранённая скрытой (`idle`) —
 * тело посещённой вкладки при `preserveContent`.
 */
export interface IRtTabsPanel {
    readonly tab: RtTabDirective;
    readonly leaving: IRtTabsLeavingPanel | null;
    readonly idle: boolean;
}

/** Что показывает область содержимого: активная вкладка, длительность и сохранение посещённых. */
export interface IRtTabsShown {
    readonly active: Signal<RtTabDirective | null>;
    readonly duration: () => IRtTabs.AnimationDuration;
    readonly preserve: () => boolean;
}

/** Вкладки компонента: все объявленные, видимые и выбранная. */
export interface IRtTabsSet {
    readonly all: Signal<readonly RtTabDirective[]>;
    readonly visible: Signal<readonly RtTabDirective[]>;
    readonly selectedId: Signal<IRtTabs.Id | null>;
}

/** Место полосы выбранной вкладки внутри полосы вкладок: левый край, низ вкладки и ширина (px). */
interface IInkBox {
    readonly x: number;
    readonly bottom: number;
    readonly width: number;
}

/** Длительность из входа в значение CSS: число и строка из одних цифр — миллисекунды. */
export function rtTabsCssDuration(value: IRtTabs.AnimationDuration): string | null {
    const text: string = value === null ? '' : String(value).trim();

    if (!text) {
        return null;
    }

    return /^\d+(\.\d+)?$/.test(text) ? `${text}ms` : text;
}

/** Длительность CSS в миллисекундах; то, что не читается как время, — ноль. */
export function rtTabsDurationMs(value: string): number {
    const text: string = value.trim();
    const amount: number = parseFloat(text);

    if (Number.isNaN(amount)) {
        return 0;
    }

    if (text.endsWith('ms')) {
        return amount;
    }

    return text.endsWith('s') ? amount * 1000 : amount;
}

/** Сдвиг полосы вкладок на ширину её видимой области назад или вперёд, не дальше края. */
export function rtTabsScrollPage(list: HTMLElement, back: boolean): void {
    const max: number = Math.max(0, list.scrollWidth - list.clientWidth);
    const shift: number = back ? -list.clientWidth : list.clientWidth;

    list.scrollLeft = Math.min(max, Math.max(0, list.scrollLeft + shift));
}

/** Набор посещённых вкладок с вкладкой `id`: тот же набор, если она в нём уже есть. */
function withVisited(visited: ReadonlySet<IRtTabs.Id>, id: IRtTabs.Id | null): ReadonlySet<IRtTabs.Id> {
    return id === null || visited.has(id) ? visited : new Set([...visited, id]);
}

/** Прокрутка полосы так, чтобы вкладка встала в видимую область целиком; видная целиком не двигает полосу. */
export function rtTabsScrollIntoView(list: HTMLElement, tab: HTMLElement): void {
    if (tab.offsetLeft < list.scrollLeft) {
        list.scrollTo({ left: tab.offsetLeft });
    } else if (tab.offsetLeft + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
        list.scrollTo({ left: tab.offsetLeft + tab.offsetWidth - list.clientWidth });
    } else {
        // вкладка целиком в зоне видимости — прокрутка не нужна
    }
}

function sameInkBox(a: IInkBox | null, b: IInkBox | null): boolean {
    if (a === null || b === null) {
        return a === b;
    }

    return a.x === b.x && a.bottom === b.bottom && a.width === b.width;
}

/**
 * Уходящая панель при смене выбора. Место берётся у панели прежней вкладки, пока она ещё в потоке:
 * уходя, она встаёт поверх области содержимого в ту же точку. Без движения — нулевая длительность
 * или `prefers-reduced-motion` — уходящей панели нет.
 */
export function rtTabsLeavingPanel(
    host: HTMLElement,
    win: Window | null,
    ids: readonly IRtTabs.Id[],
    move: IRtTabsMove
): IRtTabsLeavingPanel | null {
    const { previous, next } = move;

    if (previous === null || next === null || previous === next || !win) {
        return null;
    }

    if (win.matchMedia?.(REDUCED_MOTION_QUERY).matches) {
        return null;
    }

    const duration: string = move.duration ?? win.getComputedStyle(host).getPropertyValue('--rt-tabs-panel-duration');
    const panel: HTMLElement | undefined = Array.from(host.querySelectorAll<HTMLElement>(':scope > .rt-tabs__content')).find(
        (node: HTMLElement): boolean => node.id === `rt-tabpanel-${previous}`
    );

    if (!panel || rtTabsDurationMs(duration) <= 0) {
        return null;
    }

    const hostBox: DOMRect = host.getBoundingClientRect();
    const panelBox: DOMRect = panel.getBoundingClientRect();

    return {
        id: previous,
        shift: ids.indexOf(next) > ids.indexOf(previous) ? 'forward' : 'backward',
        top: panelBox.top - hostBox.top - host.clientTop,
        left: panelBox.left - hostBox.left - host.clientLeft,
    };
}

/**
 * Панели при сохранении посещённых: тело вкладки появляется при первом открытии и дальше живёт
 * скрытым. Порядок — порядок вкладок, чтобы вид панели не переставлялся в разметке при смене.
 */
export function rtTabsPreservedPanels(
    all: readonly RtTabDirective[],
    visited: ReadonlySet<IRtTabs.Id>,
    active: RtTabDirective,
    leaving: IRtTabsLeavingPanel | null
): IRtTabsPanel[] {
    return all
        .filter((tab: RtTabDirective): boolean => tab === active || visited.has(tab.id()))
        .map((tab: RtTabDirective): IRtTabsPanel => {
            if (tab === active) {
                return { leaving: null, idle: false, tab };
            }

            const isLeaving: boolean = leaving !== null && leaving.id === tab.id();

            return { leaving: isLeaving ? leaving : null, idle: !isLeaving, tab };
        });
}

/**
 * Смена панелей: уходящая панель прежней вкладки и въезжающая новая. Уходящая считается от смены
 * выбора и гасится концом её движения. Создаётся в контексте внедрения компонента.
 */
export class RtTabsPanels {
    /** Панель прежней вкладки, пока она уходит; без движения её нет вовсе. */
    public readonly leaving: WritableSignal<IRtTabsLeavingPanel | null>;

    /**
     * Панели области содержимого: активная и, пока она уходит, прежняя. Прежняя стоит первой, и
     * `track` по id сохраняет её вид — уходит та же панель, а не её новая копия. При сохранении
     * посещённых панели стоят в порядке вкладок, и неактивные остаются скрытыми.
     */
    public readonly list: Signal<readonly IRtTabsPanel[]>;

    /** Вкладки, которые открывались хоть раз: их тела живут при `preserveContent`. */
    readonly #visited: Signal<ReadonlySet<IRtTabs.Id>>;

    /** Направление идущей смены панели; `null` — панель стоит на месте. */
    public readonly shift: Signal<TRtTabsPanelShift | null>;

    /** Длительность из входа `animationDuration` в виде CSS; `null` — длительности из токенов. */
    public readonly duration: Signal<string | null>;

    constructor(host: HTMLElement, win: Window | null, tabs: IRtTabsSet, shown: IRtTabsShown) {
        this.duration = computed((): string | null => rtTabsCssDuration(shown.duration()));
        const ids: () => IRtTabs.Id[] = (): IRtTabs.Id[] => tabs.visible().map((tab: RtTabDirective): IRtTabs.Id => tab.id());

        this.leaving = linkedSignal<IRtTabs.Id | null, IRtTabsLeavingPanel | null>({
            source: tabs.selectedId,
            computation: (id: IRtTabs.Id | null, previous: { source: IRtTabs.Id | null } | undefined): IRtTabsLeavingPanel | null =>
                untracked((): IRtTabsLeavingPanel | null =>
                    rtTabsLeavingPanel(host, win, ids(), { previous: previous?.source ?? null, next: id, duration: this.duration() })
                ),
        });

        this.#visited = linkedSignal<IRtTabs.Id | null, ReadonlySet<IRtTabs.Id>>({
            source: tabs.selectedId,
            computation: (id: IRtTabs.Id | null, previous: { value: ReadonlySet<IRtTabs.Id> } | undefined): ReadonlySet<IRtTabs.Id> =>
                withVisited(previous?.value ?? new Set(), id),
        });

        this.list = computed((): readonly IRtTabsPanel[] => {
            const active: RtTabDirective | null = shown.active();
            const leaving: IRtTabsLeavingPanel | null = this.leaving();

            if (!active) {
                return [];
            }

            if (shown.preserve()) {
                return rtTabsPreservedPanels(tabs.all(), this.#visited(), active, leaving);
            }

            const current: IRtTabsPanel = { tab: active, leaving: null, idle: false };
            const leavingTab: RtTabDirective | undefined =
                leaving === null || leaving.id === active.id()
                    ? undefined
                    : tabs.visible().find((tab: RtTabDirective): boolean => tab.id() === leaving.id);

            return leaving && leavingTab ? [{ leaving, idle: false, tab: leavingTab }, current] : [current];
        });

        this.shift = computed((): TRtTabsPanelShift | null =>
            this.list().some((panel: IRtTabsPanel): boolean => panel.leaving !== null) ? (this.leaving()?.shift ?? null) : null
        );
    }

    /** Конец движения панели убирает уходящую. Движение вложенных узлов сюда не считается. */
    public animationEnd(event: AnimationEvent): void {
        if (event.target === event.currentTarget) {
            this.leaving.set(null);
        }
    }
}

/**
 * Полоса выбранной вкладки — один элемент на всю полосу: замер ставит её под выбранную вкладку, и
 * при смене выбора она переезжает. Слежение за размером полосы и вкладок ловит сдвиг без смены
 * выбора — подпись поменялась или шрифт догрузился.
 */
export class RtTabsInk {
    readonly #win: Window | null;

    readonly #list: Signal<ElementRef<HTMLElement> | undefined>;

    readonly #active: Signal<RtTabDirective | null>;

    #watch: ResizeObserver | null = null;

    /** Где стоит полоса; `null` — не измерена, и полосу рисует сама вкладка. */
    public readonly box: WritableSignal<IInkBox | null> = signal<IInkBox | null>(null, { equal: sameInkBox });

    /** Полоса уже стоит на месте и дальше переезжает: первое измерение ставит её без движения. */
    public readonly animated: WritableSignal<boolean> = signal(false);

    /** Сдвиг полосы к левому краю вкладки и к её низу. */
    public readonly translate: Signal<string | null> = computed((): string | null => {
        const box: IInkBox | null = this.box();

        return box ? `${box.x}px ${box.bottom}px` : null;
    });

    /** Полоса красится как ошибка, когда выбранная вкладка неверна. */
    public readonly invalid: Signal<boolean> = computed((): boolean => this.#active()?.invalid() ?? false);

    constructor(
        win: Window | null,
        list: Signal<ElementRef<HTMLElement> | undefined>,
        tabs: { readonly visible: Signal<readonly RtTabDirective[]>; readonly active: Signal<RtTabDirective | null> }
    ) {
        this.#win = win;
        this.#list = list;
        this.#active = tabs.active;

        // Новая вкладка в полосе — новый узел под слежение, новый выбор — новое место полосы.
        afterRenderEffect((): void => {
            tabs.visible();
            this.#active();
            this.#watchSizes();
            this.#place();
        });

        inject(DestroyRef).onDestroy((): void => this.#watch?.disconnect());
    }

    /** Перевешивает слежение за размером на вкладки, что сейчас стоят в полосе. */
    #watchSizes(): void {
        const list: HTMLElement | undefined = this.#list()?.nativeElement;

        if (!list || typeof ResizeObserver === 'undefined') {
            return;
        }

        if (!this.#watch) {
            this.#watch = new ResizeObserver((): void => this.#place());
        }

        const watch: ResizeObserver = this.#watch;
        watch.disconnect();
        watch.observe(list);
        list.querySelectorAll<HTMLElement>('[data-tabid]').forEach((node: HTMLElement): void => watch.observe(node));
    }

    /** Ставит полосу под выбранную вкладку. Дробные размеры сохраняются: полоса ложится ровно по вкладке. */
    #place(): void {
        const list: HTMLElement | undefined = this.#list()?.nativeElement;
        const id: IRtTabs.Id | undefined = this.#active()?.id();
        const tab: HTMLElement | null | undefined = id === undefined ? null : list?.querySelector<HTMLElement>(`[data-tabid="${id}"]`);

        if (!list || !tab) {
            this.box.set(null);
            return;
        }

        const listBox: DOMRect = list.getBoundingClientRect();
        const tabBox: DOMRect = tab.getBoundingClientRect();

        this.box.set({
            x: tabBox.left - listBox.left - list.clientLeft + list.scrollLeft,
            bottom: tabBox.bottom - listBox.top - list.clientTop + list.scrollTop,
            width: tabBox.width,
        });

        if (!untracked(this.animated)) {
            this.#win?.requestAnimationFrame((): void => this.animated.set(true));
        }
    }
}
