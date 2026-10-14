import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    Signal,
    signal,
    untracked,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtExpansionPanelActionsDirective } from './rt-expansion-panel-actions.directive';
import { RtExpansionPanelContentDirective } from './rt-expansion-panel-content.directive';
import { IRtExpansionPanelGroupHost, RT_EXPANSION_PANEL_GROUP } from './rt-expansion-panel-group.token';
import { IRtExpansionPanel } from './rt-expansion-panel.model';

const BEM_BLOCK: string = 'rt-expansion-panel';

let expansionPanelIdSeed: number = 0;

function nextExpansionPanelId(): number {
    expansionPanelIdSeed += 1;
    return expansionPanelIdSeed;
}

/**
 * Раскрывающаяся панель: заголовок-кнопка во всю ширину с шевроном у правого края и тело под ним.
 * Нажатие на заголовок раскрывает и сворачивает тело, раскрытие и сворачивание идут с движением.
 * Заменяет во втором ките панель раскрытия Material первого кита.
 *
 * Заголовок — содержимое панели без отметки. Тело — узел с `rtExpansionPanelBody`, созданный сразу,
 * или `<ng-template rtExpansionPanelContent>`, созданный при раскрытии.
 *
 * Состояние раскрытия — `expanded`, двусторонняя привязка: панель пишет в него сама, а владелец
 * может держать его в своём сигнале и менять извне.
 *
 * Действия заголовка — узел с `rtExpansionPanelActions`: он стоит в строке заголовка вне кнопки, и
 * нажатие по нему панель не раскрывает. В группе `rtExpansionPanelGroup` раскрытие панели
 * сворачивает соседей.
 */
@Component({
    selector: 'rt-expansion-panel',
    templateUrl: './rt-expansion-panel.component.html',
    styleUrl: './rt-expansion-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,

        // components
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-expansion-panel--plain]': 'appearance() === "plain"',
        '[class.rt-expansion-panel--expanded]': 'expanded()',
        '[class.rt-expansion-panel--disabled]': 'disabled()',
        '[class.rt-expansion-panel--with-actions]': '!!actions()',
    },
    // Тело панели закрыто от группы над ней: вложенная панель раскрывается независимо, как в Material.
    providers: [{ provide: RT_EXPANSION_PANEL_GROUP, useValue: null }],
})
export class RtExpansionPanelComponent {
    /** Основа id: две панели на одной странице не ссылаются на чужое тело. */
    readonly #idBase: string = `rt-expansion-panel-${nextExpansionPanelId()}`;
    /** Группа над панелью. Сама панель закрывает её от своего тела: вложенная панель в группу не встаёт. */
    readonly #group: IRtExpansionPanelGroupHost | null = inject(RT_EXPANSION_PANEL_GROUP, { optional: true, skipSelf: true });
    /** Панель хоть раз раскрывалась: сохраняемое тело создаётся при первом раскрытии, не раньше. */
    readonly #everExpanded: WritableSignal<boolean> = signal<boolean>(false);

    /** Ленивое тело: шаблон создаётся при раскрытии. */
    protected readonly lazyContent: Signal<RtExpansionPanelContentDirective | undefined> = contentChild(RtExpansionPanelContentDirective, {
        descendants: false,
    });
    protected readonly bodyId: string = `${this.#idBase}-body`;
    /**
     * Действия заголовка: есть они — шеврон выходит из кнопки и встаёт после них. Только свои: действия
     * панели, вложенной в тело, принадлежат ей.
     */
    protected readonly actions: Signal<RtExpansionPanelActionsDirective | undefined> = contentChild(RtExpansionPanelActionsDirective, {
        descendants: false,
    });
    /** Тело есть в разметке: раскрыто, или сохраняется свёрнутым после первого раскрытия. */
    protected readonly bodyRendered: Signal<boolean> = computed(
        (): boolean => this.expanded() || (this.preserveContent() && this.#everExpanded())
    );
    protected readonly headerDomId: Signal<string> = computed((): string => this.headerId() ?? `${this.#idBase}-header`);

    /** Тело раскрыто. Двусторонняя привязка: нажатие на заголовок пишет сюда. */
    public readonly expanded: ModelSignal<boolean> = model<boolean>(false);

    /** Заголовок не нажимается, тело остаётся как было. */
    public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    /** Шеврона нет: раскрытие читается по содержимому или его нечего раскрывать. */
    public readonly hideToggle: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public readonly appearance: InputSignal<IRtExpansionPanel.Appearance> = input<IRtExpansionPanel.Appearance>('card');

    /** Id кнопки заголовка. Нужен владельцу, который ищет заголовок по своему номеру; иначе — свой. */
    public readonly headerId: InputSignal<string | null> = input<string | null>(null);

    /** Имя кнопки заголовка для вспомогательных средств, когда видимой подписи мало. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /**
     * Тело не уходит при сворачивании, а прячется: внутри остаются набранный текст, прокрутка и
     * выбор. Ленивое тело создаётся при первом раскрытии и дальше живёт вместе с панелью.
     */
    public readonly preserveContent: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    constructor() {
        this.#group?.register(this);
        inject(DestroyRef).onDestroy((): void => this.#group?.unregister(this));

        effect((): void => {
            if (this.expanded()) {
                untracked((): void => {
                    this.#everExpanded.set(true);
                    this.#group?.opened(this);
                });
            }
        });
    }

    /** Нажатие на заголовок: раскрывает свёрнутую панель и сворачивает раскрытую. */
    public toggle(): void {
        if (!this.disabled()) {
            this.expanded.set(!this.expanded());
        }
    }
}
