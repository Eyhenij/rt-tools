import {
    booleanAttribute,
    computed,
    contentChildren,
    effect,
    inject,
    input,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { BreakpointsService, IButton, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RT_ASIDE_SHEET, RtAsideSheet } from '../rt-aside-sheet';

const BEM_BLOCK: string = 'rt-aside-footer';

/** Селектор слота главной кнопки. */
const PRIMARY_SLOT: string = '[asidePrimary]';

/** Вид кнопки слота `[asidePrimary]`: залитая, основного цвета, без значка. */
const PRIMARY_LOOK: IButton.PlaceLook = { appearance: 'filled', theme: 'primary', icon: null };

/**
 * Вид главной кнопки, ушедшей в шапку шторки: шаг `sm`, как у действия шапки самой шторки
 * («Применить» отборов страницы и периода). Высота подвала шапке не подходит: заголовок резался бы.
 */
const SHEET_MAIN_LOOK: IButton.PlaceLook = { ...PRIMARY_LOOK, size: 'sm' };

/** Вид кнопки по слоту, в котором она стоит сама или внутри его обёртки; вне слотов вида нет. */
function slotLook(host: HTMLElement | undefined, dismissLook: IButton.PlaceLook): IButton.PlaceLook | null {
    if (host?.closest('[asideDismiss]')) {
        return dismissLook;
    }
    if (host?.closest(PRIMARY_SLOT)) {
        return PRIMARY_LOOK;
    }

    return null;
}

/** Узел слота, в котором стоит кнопка: она сама или её обёртка с атрибутом слота. */
function slotNode(host: HTMLElement, slot: string): HTMLElement | null {
    return host.closest<HTMLElement>(`[${slot}]`);
}

/**
 * Footer-слот для композиции внутри `<rt-aside>`. Две зоны через именованные
 * слоты: `[asideDismiss]` (слева — «Закрыть») и `[asidePrimary]` (справа —
 * единственный позитивный глагол: Сохранить / Отправить / Опубликовать, если
 * есть). Раскладка `justify-content: space-between`, кнопки стоят в одну строку
 * на любой ширине. Доменные/деструктивные действия в футер не кладём — они
 * проецируются иконками в `<rt-aside-header>` слот `[asideActions]`.
 *
 * Вид кнопок задаёт подвал, а не разметка потребителя: «Закрыть» в рамке темы
 * secondary, позитивный глагол залитый и без значка. Кнопка с темой `danger` остаётся красной
 * в любом слоте и на любой ширине: место меняет её вид, но не цвет. На телефоне первая кнопка
 * подписана коротко — «Закрыть» из подписей кита. Кнопка может стоять в слоте
 * не сама, а внутри обёртки с атрибутом слота: так ставят подсказку на кнопку.
 *
 * Только две именованные зоны — безатрибутный контент НЕ проецируется (контент
 * без `asideDismiss`/`asidePrimary` не отрендерится).
 *
 * В шторке телефона последняя кнопка слота `[asidePrimary]` встаёт справа в шапку шторки, а кнопка
 * слота `[asideDismiss]` с короткой подписью «Закрыть» не рисуется: её роль у «×» шапки. Кнопка
 * этого слота со своим смыслом — подвал выключил короткую подпись или кнопка опасная, с темой
 * `danger`, — остаётся в подвале. Опасная кнопка и на телефоне держит свою подпись.
 *
 * `ViewEncapsulation.None` — для единообразия с rt-aside.
 *
 * @example
 * \`\`\`html
 * <rt-aside-footer>
 *   <button rtButton asideDismiss label="Закрыть и не сохранять" (click)="onClose()"></button>
 *   <button rtButton asidePrimary label="Сохранить" (click)="save()"></button>
 * </rt-aside-footer>
 * \`\`\`
 */
@Component({
    selector: 'rt-aside-footer',
    templateUrl: './rt-aside-footer.component.html',
    styleUrl: './rt-aside-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
        '[class.rt-aside-footer--sheet]': 'sheetMode()',
        '[class.rt-aside-footer--close-hidden]': 'closeOnlyHidden()',
    },
})
export class RtAsideFooterComponent {
    readonly #phone: Signal<boolean> = inject(BreakpointsService).phone;
    readonly #closeLabel: Signal<string> = rtKitLabel('uiClose');
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly #sheet: RtAsideSheet | null = inject(RT_ASIDE_SHEET, { optional: true });

    /** Узлы слотов в порядке документа, каждый один раз: кнопка и её обёртка — один узел. */
    readonly #slots: Signal<{ dismiss: number; primary: number }> = computed((): { dismiss: number; primary: number } => {
        const nodes: HTMLElement[] = this.hosts().map((host: ElementRef<HTMLElement>): HTMLElement => host.nativeElement);
        const count: (slot: string) => number = (slot: string): number =>
            new Set(nodes.map((node: HTMLElement): HTMLElement | null => slotNode(node, slot)).filter(Boolean)).size;

        return { dismiss: count('asideDismiss'), primary: count('asidePrimary') };
    });

    /* Кнопки ищутся и внутри обёрток слота; оба списка идут в одном порядке документа. */
    protected readonly buttons: Signal<readonly RtButtonDirective[]> = contentChildren(RtButtonDirective, { descendants: true });
    protected readonly hosts: Signal<readonly ElementRef<HTMLElement>[]> = contentChildren(RtButtonDirective, {
        descendants: true,
        read: ElementRef,
    });

    /** Подвал стоит в шторке телефона. */
    protected readonly sheetMode: Signal<boolean> = computed((): boolean => this.#sheet?.active() ?? false);

    /** Главная кнопка уходит в шапку шторки; у панели без шапки кита ей некуда уйти, и она в подвале. */
    protected readonly mainMoves: Signal<boolean> = computed((): boolean => this.sheetMode() && (this.#sheet?.hasHeader() ?? false));

    /**
     * В слоте `[asideDismiss]` стоит опасная кнопка — тема `danger`: это действие со своим смыслом,
     * «Удалить», а не выход. Она остаётся в подвале со своей подписью.
     */
    protected readonly dismissDanger: Signal<boolean> = computed((): boolean =>
        this.buttons().some(
            (button: RtButtonDirective, index: number): boolean =>
                button.theme() === 'danger' && (this.hosts()[index]?.nativeElement.closest('[asideDismiss]') ?? null) !== null
        )
    );

    /**
     * Кнопка слота `[asideDismiss]` только закрывает панель: в шторке её место у «×» шапки. У панели
     * без шапки кита «×» нет, и кнопка остаётся в подвале.
     */
    protected readonly closeOnlyHidden: Signal<boolean> = computed(
        (): boolean => this.mainMoves() && this.phoneCloseLabel() && !this.dismissDanger()
    );

    /**
     * На телефоне кнопка слота `[asideDismiss]` читается «Закрыть»: так она названа у всех панелей.
     * `false` оставляет подпись потребителя — у панели фильтров эта кнопка «Сбросить», а не выход.
     */
    public readonly phoneCloseLabel: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(true, {
        transform: booleanAttribute,
    });

    /**
     * Узлы кнопок подвала: по ним панель заново ищет главную кнопку, когда кнопки меняются, — и когда
     * их столько же, но одна встала на место другой.
     */
    public readonly slotNodes: Signal<readonly HTMLElement[]> = computed((): readonly HTMLElement[] =>
        this.hosts().map((host: ElementRef<HTMLElement>): HTMLElement => host.nativeElement)
    );

    /**
     * В шторке подвалу есть что показать: кнопка со своим смыслом в слоте `[asideDismiss]` или
     * вторая кнопка слота `[asidePrimary]` — последняя ушла в шапку; у панели без шапки — любая
     * кнопка этого слота. Без них шторка без подвала.
     */
    public readonly sheetFilled: Signal<boolean> = computed(
        (): boolean => (this.#slots().dismiss > 0 && !this.closeOnlyHidden()) || this.#slots().primary > (this.mainMoves() ? 1 : 0)
    );

    constructor() {
        effect((): void => {
            const hosts: readonly ElementRef<HTMLElement>[] = this.hosts();
            // Опасная кнопка слота `[asideDismiss]` — не выход: короткая подпись «Закрыть» ей не даётся.
            const ownLook: IButton.PlaceLook = { appearance: 'outlined', theme: 'secondary' };
            const dismissLook: IButton.PlaceLook = {
                ...ownLook,
                ...(this.#phone() && this.phoneCloseLabel() ? { label: this.#closeLabel() } : {}),
            };

            // В шторке последняя кнопка слота `[asidePrimary]` стоит в шапке: её вид — вид шапки шторки.
            const main: number = this.mainMoves()
                ? hosts.map((host: ElementRef<HTMLElement>): boolean => host.nativeElement.closest(PRIMARY_SLOT) !== null).lastIndexOf(true)
                : -1;

            // В шторке кнопки, оставшиеся в подвале, того же шага `sm`, что главная кнопка в шапке.
            const sheet: boolean = this.sheetMode();

            this.buttons().forEach((button: RtButtonDirective, index: number): void => {
                const look: IButton.PlaceLook | null = slotLook(
                    hosts[index]?.nativeElement,
                    button.theme() === 'danger' ? ownLook : dismissLook
                );
                const inSlot: IButton.PlaceLook | null = look && sheet ? { ...look, size: 'sm' } : look;
                const placed: IButton.PlaceLook | null = index === main ? SHEET_MAIN_LOOK : inSlot;

                // Опасную кнопку приложение помечает темой `danger`: место меняет её вид и шаг, но не цвет.
                button.placeLook.set(placed && button.theme() === 'danger' ? { ...placed, theme: 'danger' } : placed);
            });
        });
    }

    /** Главная кнопка для шапки шторки: последний узел слота `[asidePrimary]`; нет его — `null`. */
    public mainActionNode(): HTMLElement | null {
        const nodes: NodeListOf<HTMLElement> = this.#host.querySelectorAll<HTMLElement>(PRIMARY_SLOT);

        return nodes.item(nodes.length - 1) ?? null;
    }
}
