import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    OnInit,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, map } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IPageModel, TNullable } from '@rt-tools/utils';

import { RT_KIT_LABELS, rtKitLabel, TRtKitLabelMap, TRtKitLabelParams } from '../../i18n';
import { searchDebounce } from '../../util';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtCheckboxComponent } from '../checkbox/rt-checkbox.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtInputComponent } from '../input/rt-input.component';
import { RtPaginationComponent } from '../pagination/rt-pagination.component';
import { RtSpinnerComponent } from '../spinner/rt-spinner.component';
import { RtDynamicListActionsDirective, RtDynamicListSelectorsDirective } from './rt-dynamic-list.directives';
import { IRtDynamicList } from './rt-dynamic-list.model';

const BEM_BLOCK: string = 'rt-dynamic-list';

/** Меньше этого числа страниц ряд номеров не рисуется: под списком из трёх записей он — шум. */
const MIN_PAGES_TO_SHOW: number = 2;

/**
 * Список записей со своей панелью инструментов.
 *
 * Полосу панели семья раскладывает сама, а не зовёт `rt-toolbar`: у того стороны объявлены
 * нешринкующимися, и на хозяине уже́ содержимого полоса раздаётся шире него и уезжает за край.
 * Семья кладёт в полосу готовые части кита — поле, кнопки, флажок, — а строит её сама.
 *
 * Семья ничего не рисует сама: поиск — поле кита, действия — его кнопки со значком, пустое место —
 * его пустое состояние, страницы — его нумерация. Сами записи проецируются: таблица между панелью
 * и страницами — потребителя, с его колонками, ячейками и действиями строки.
 *
 * Договорённость — `docs/specs/ui-kit-v2/dynamic-list/`.
 */
@Component({
    selector: 'rt-dynamic-list',
    templateUrl: './rt-dynamic-list.component.html',
    styleUrls: ['./rt-dynamic-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,
        FormsModule,
        ReactiveFormsModule,

        // standalone components / directives
        RtButtonDirective,
        RtCheckboxComponent,
        RtEmptyStateComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtPaginationComponent,
        RtSpinnerComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtDynamicListComponent implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly searchControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

    protected readonly selectorsTpl: Signal<TNullable<RtDynamicListSelectorsDirective>> = contentChild(RtDynamicListSelectorsDirective);

    protected readonly actionsTpl: Signal<TNullable<RtDynamicListActionsDirective>> = contentChild(RtDynamicListActionsDirective);

    /** «Выбрано: N» — подпись с подстановкой, потому её берут не из карты, а вызовом. */
    protected readonly selectedLabel: Signal<string> = rtKitLabel(
        'uiSelectedCount',
        computed((): TRtKitLabelParams => ({ count: this.selectedCount() }))
    );

    /** Отчего пусто. Отбор стоит — значит, записи убрал он, и человеку показывают дорогу назад. */
    protected readonly emptyReason: Signal<IRtDynamicList.EmptyReason> = computed((): IRtDynamicList.EmptyReason =>
        this.filtered() ? 'filter' : 'section'
    );

    /** Значок пустого места: под отбором — лупа, у пустого раздела — лоток. */
    protected readonly emptyIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name =>
        this.emptyReason() === 'filter' ? 'search' : 'inbox'
    );

    /** Подпись пустого места. Своя подпись потребителя сильнее обеих подписей кита. */
    protected readonly emptyTitleText: Signal<string> = computed((): string => {
        if (this.emptyTitle()) {
            return this.emptyTitle();
        }

        return this.emptyReason() === 'filter' ? this.t().uiNothingFound : this.t().uiNoRows;
    });

    /** Ряд номеров рисуется только там, где страниц больше одной. */
    protected readonly isPaginationShown: Signal<boolean> = computed((): boolean => {
        const page: TNullable<IPageModel> = this.pageModel();

        if (!page || this.empty()) {
            return false;
        }

        return Math.ceil(page.totalCount / Math.max(page.pageSize, 1)) >= MIN_PAGES_TO_SHOW;
    });

    /**
     * Есть ли в панели хоть что-нибудь. Полоса без единой части — это отступ над записями, и
     * место она забирает у них.
     */
    protected readonly isToolbarShown: Signal<boolean> = computed((): boolean =>
        [
            this.showSearch(),
            this.showRefresh(),
            this.showClearFilters(),
            this.showColumnSettings(),
            this.selectable(),
            !!this.selectorsTpl(),
            !!this.actionsTpl(),
        ].some((part: boolean): boolean => part)
    );

    /** Записи проецируются, и о числе страниц семья узнаёт только из модели страницы. */
    public readonly pageModel: InputSignal<TNullable<IPageModel>> = input<TNullable<IPageModel>>(null);

    /** Первая загрузка: вместо всего содержимого стоит вертушка. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Подгрузка поверх нарисованного: записи остаются на месте, вертушка стоит над ними. */
    public readonly fetching: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Записей нет вовсе. От пустого ответа под отбором отличается входом `filtered`. */
    public readonly empty: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Отбор стоит. Вместе с `empty` даёт вторую причину пустоты — ту, у которой есть дорога назад. */
    public readonly filtered: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Кнопка сброса отбора: показана у раздела с отбором, выключена, пока сбрасывать нечего. */
    public readonly showClearFilters: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly showRefresh: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly showColumnSettings: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly showSearch: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Выбор записей: флажок «выбрать все» и счётчик выбранного на левой стороне панели. */
    public readonly selectable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly allSelected: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly someSelected: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly selectAllDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly selectedCount: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(0, {
        transform: numberAttribute,
    });

    public readonly emptyTitle: InputSignal<string> = input<string>('');

    public readonly emptyDescription: InputSignal<string | null> = input<string | null>(null);

    public readonly searchChange: OutputEmitterRef<string> = output<string>();

    public readonly refreshed: OutputEmitterRef<void> = output<void>();

    public readonly filtersCleared: OutputEmitterRef<void> = output<void>();

    public readonly columnSettingsOpened: OutputEmitterRef<void> = output<void>();

    public readonly pageChange: OutputEmitterRef<number> = output<number>();

    public readonly perPageChange: OutputEmitterRef<number> = output<number>();

    public readonly allSelectedChange: OutputEmitterRef<boolean> = output<boolean>();

    public ngOnInit(): void {
        // Дебаунс непустого ввода; очистка крестиком применяется сразу — так же, как в списке
        // переписок: оператор один на кит, и два разных ожидания разошлись бы молча.
        this.searchControl.valueChanges
            .pipe(
                map((value: string): string => value.trim()),
                searchDebounce(),
                distinctUntilChanged(),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: string): void => this.searchChange.emit(value));
    }

    protected onSelectAll(checked: boolean): void {
        this.allSelectedChange.emit(checked);
    }
}
