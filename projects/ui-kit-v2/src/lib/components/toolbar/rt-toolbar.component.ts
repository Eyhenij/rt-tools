import { InteractivityChecker } from '@angular/cdk/a11y';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    untracked,
    ViewEncapsulation,
} from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { isNil } from '@rt-tools/utils';

import { BreakpointsService, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtAsideRef, RtAsideService } from '@rt-tools/ui-kit-v2/aside';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtToolbarFiltersAsideComponent } from './filters-aside/rt-toolbar-filters-aside.component';
import { RtToolbarFiltersHub } from './rt-toolbar-filters-hub';
import { IRtToolbar } from './rt-toolbar.model';

/**
 * Маркер-директива для контента в левой секции тулбара.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarLeft>
 *         <button rtButton label="Создать" />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarLeft]',
})
export class RtToolbarLeftDirective {}

/**
 * Маркер-директива для контента в центральной секции тулбара.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarCenter>
 *         <span>Заголовок страницы</span>
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarCenter]',
})
export class RtToolbarCenterDirective {}

/**
 * Маркер-директива для контента в правой секции тулбара.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarRight>
 *         <input type="search" placeholder="Поиск" />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarRight]',
})
export class RtToolbarRightDirective {}

/**
 * Маркер-директива для отборов списка. На широком экране они стоят в левой секции после её
 * содержимого, на узком — за кнопкой фильтров, которая открывает панель отборов. Контекст шаблона
 * — место, где он нарисован: `bar` или `panel`.
 *
 * @example
 * ```html
 * <rt-toolbar [filtersActive]="hasFilter()" (filtersReset)="reset()">
 *     <ng-template rtToolbarFilters let-place>
 *         <rt-select [label]="place === 'panel' ? 'Статус' : null" … />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarFilters]',
})
export class RtToolbarFiltersDirective {
    public static ngTemplateContextGuard(
        _directive: RtToolbarFiltersDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtToolbar.IFiltersContext {
        return true;
    }
}

/**
 * Универсальный тулбар с тремя секциями: left, center, right.
 * Секции задаются `<ng-template>` с директивами-маркерами и подставляются через `ngTemplateOutlet`.
 * Каждый модуль/фича подключает `rt-toolbar` в своём layout и наполняет нужные секции.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarLeft>
 *         <button rtButton label="Создать" />
 *         <button rtButton label="Удалить" appearance="text" />
 *     </ng-template>
 *
 *     <ng-template rtToolbarCenter>
 *         <span>Заявки</span>
 *     </ng-template>
 *
 *     <ng-template rtToolbarRight>
 *         <input type="search" [formControl]="searchCtrl" />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
const BEM_BLOCK: string = 'rt-toolbar';

@Component({
    selector: 'rt-toolbar',
    templateUrl: './rt-toolbar.component.html',
    styleUrls: ['./rt-toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconButtonComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-toolbar--dense]': 'dense()',
        '[class.rt-toolbar--filters-collapsed]': 'collapsed()',
    },
})
export class RtToolbarComponent {
    /** Отборы уходят за кнопку на месте уже 1080: на ровно 1080 они ещё стоят в строке. */
    readonly #narrow: Signal<boolean> = inject(BreakpointsService).belowNarrow;
    readonly #hub: RtToolbarFiltersHub = inject(RtToolbarFiltersHub);
    readonly #asideService: RtAsideService = inject(RtAsideService);
    readonly #injector: Injector = inject(Injector);
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly #doc: Document = inject(DOCUMENT);
    readonly #interactivity: InteractivityChecker = inject(InteractivityChecker);
    readonly #filtersActiveLabel: Signal<string> = rtKitLabel('uiFiltersActive');

    /** Открытая панель отборов: на широком месте её закрывают, чтобы поля не жили в двух местах. */
    #filtersRef: RtAsideRef | null = null;

    protected readonly filtersLabel: Signal<string> = rtKitLabel('uiFilters');

    /** Имя кнопки для скринридера: точку в углу он не видит, и включённый отбор назван словами. */
    protected readonly filtersAriaLabel: Signal<string> = computed((): string =>
        this.filtersActive() ? this.#filtersActiveLabel() : this.filtersLabel()
    );

    protected readonly filtersTpl: Signal<TemplateRef<IRtToolbar.IFiltersContext> | undefined> = contentChild(RtToolbarFiltersDirective, {
        read: TemplateRef,
    });

    /** Отборы ушли за кнопку: они объявлены, а место узкое. */
    protected readonly collapsed: Signal<boolean> = computed((): boolean => this.filtersTpl() !== undefined && this.#narrow());

    /** Отборы стоят в левой секции: они объявлены, а место широкое. */
    protected readonly filtersInBar: Signal<boolean> = computed((): boolean => this.filtersTpl() !== undefined && !this.#narrow());

    protected readonly leftTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtToolbarLeftDirective, { read: TemplateRef });

    protected readonly centerTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtToolbarCenterDirective, { read: TemplateRef });

    protected readonly rightTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtToolbarRightDirective, { read: TemplateRef });

    /**
     * Компактная шапка (заголовок + иконки-действия): зоны остаются в одну строку
     * даже на мобилке. Без этого трёхзонный list-тулбар стекается в колонку на
     * ≤768px, что для узкой шапки (напр. rt-chat) неверно.
     */
    public readonly dense: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    /** Включён хотя бы один отбор: кнопка фильтров узкого экрана несёт точку в углу значка. */
    public readonly filtersActive: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    /**
     * Кто открывает панель отборов по кнопке: `kit` — сама полоса панелью кита, `app` — приложение
     * своим маршрутом по выходу `filtersOpen`, с `rt-toolbar-filters-panel` внутри.
     */
    public readonly filtersPanel: InputSignal<IRtToolbar.TFiltersPanel> = input<IRtToolbar.TFiltersPanel>('kit');

    /** Нажата кнопка фильтров при `filtersPanel="app"`: приложение открывает панель своим маршрутом. */
    public readonly filtersOpen: OutputEmitterRef<void> = output<void>();

    /** Нажата «Применить» панели отборов; панель после этого закрыта. */
    public readonly filtersApply: OutputEmitterRef<void> = output<void>();

    /** Нажата «Сбросить» панели отборов; панель остаётся открытой. */
    public readonly filtersReset: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Место расширилось при открытой панели: отборы вернулись в полосу, и второй экземпляр
        // полей в панели закрывается, иначе одни и те же отборы показаны дважды
        effect((): void => {
            if (this.filtersInBar()) {
                untracked((): void => this.#closeFilters());
            }
        });

        // Панель приложения стоит в другом месте страницы и полосы не видит: полоса отдаёт ей
        // отборы через связку кита, пока живёт и пока панель открывает приложение
        effect((onCleanup: (cleanup: () => void) => void): void => {
            const template: TemplateRef<IRtToolbar.IFiltersContext> | undefined = this.filtersTpl();
            if (this.filtersPanel() !== 'app' || template === undefined) {
                return;
            }
            const release: () => void = untracked((): (() => void) =>
                this.#hub.register({
                    template,
                    collapsed: this.collapsed,
                    reset: (): void => this.filtersReset.emit(),
                    apply: (): void => this.filtersApply.emit(),
                    // Поля возвращаются в полосу со следующей отрисовкой: фокус ставится после неё
                    focusBar: (): void => {
                        afterNextRender({ write: (): void => this.#focusBar() }, { injector: this.#injector });
                    },
                })
            );
            onCleanup(release);
        });
    }

    protected openFilters(): void {
        if (this.filtersPanel() === 'app') {
            this.filtersOpen.emit();
            return;
        }
        const template: TemplateRef<IRtToolbar.IFiltersContext> | undefined = this.filtersTpl();
        // Подложка ловит нажатия только со следующего кадра: второе нажатие до него открыло бы
        // вторую панель поверх первой
        if (template === undefined || this.#filtersRef !== null) {
            return;
        }

        // Инжектор полосы — хозяин панели: уничтожение полосы закрывает и панель
        const ref: RtAsideRef = this.#asideService.open<RtToolbarFiltersAsideComponent, IRtToolbar.IFiltersPanelData>(
            RtToolbarFiltersAsideComponent,
            {
                injector: this.#injector,
                data: {
                    template,
                    reset: (): void => this.filtersReset.emit(),
                    apply: (): void => this.filtersApply.emit(),
                },
                position: 'right',
                backdropClass: 'rt-aside-backdrop',
            }
        );
        this.#filtersRef = ref;
        // Панель закрывается и сама — «Применить», стрелкой, подложкой: ссылка гаснет вместе с ней
        void firstValueFrom(ref.afterClosed(), { defaultValue: null }).then((): void => {
            if (this.#filtersRef === ref) {
                this.#filtersRef = null;
            }
        });
    }

    #closeFilters(): void {
        if (this.#filtersRef === null) {
            return;
        }
        // Кнопка, с которой панель открыли, на широком месте уже снята, и вернуть фокус панели
        // некуда: он уходит в левую секцию полосы, куда вернулись поля отборов
        const focusInPanel: boolean = !isNil(this.#doc.activeElement?.closest('rt-toolbar-filters-aside'));
        this.#filtersRef.close();
        this.#filtersRef = null;
        if (focusInPanel) {
            afterNextRender({ write: (): void => this.#focusBar() }, { injector: this.#injector });
        }
    }

    #focusBar(): void {
        const place: HTMLElement = this.#host.querySelector<HTMLElement>('[data-slot="left"]') ?? this.#host;
        const target: HTMLElement | undefined = Array.from(place.querySelectorAll<HTMLElement>('*')).find(
            (node: HTMLElement): boolean => this.#interactivity.isFocusable(node) && this.#interactivity.isTabbable(node)
        );
        target?.focus();
    }
}
