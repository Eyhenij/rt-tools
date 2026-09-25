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
    output,
    OutputEmitterRef,
    signal,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, timer } from 'rxjs';
import { debounce, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { IRtInput } from '../../input/rt-input.model';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';

import { rtKitLabel } from '../../../i18n';
import { RtCheckboxComponent } from '../../checkbox/rt-checkbox.component';
import { dataTableIconName } from '../../data-table/rt-data-table-cell.logic';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { IRtIcon } from '../../icon/rt-icon.model';
import { RtInputComponent } from '../../input/rt-input.component';
import { RtToolbarComponent, RtToolbarLeftDirective, RtToolbarRightDirective } from '../../toolbar/rt-toolbar.component';
import { RtDataListToolbarActionsDirective, RtDataListToolbarSelectorsDirective } from '../rt-data-list-toolbar.directive';

const BEM_BLOCK: string = 'rt-data-list-toolbar';

/** Набранное уходит приложению через эту задержку; очистка поля уходит сразу. */
const SEARCH_DELAY_MS: number = 500;

/** Значок кнопки — по имени первого кита: перечень соответствий кита даёт ему рисунок. */
function iconOf(glyph: string, fallback: IRtIcon.Name): IRtIcon.Name {
    return dataTableIconName(glyph) ?? fallback;
}

/**
 * Панель действий списка `rt-data-list` — панель первого кита без Material.
 *
 * Слева — «отметить все» либо счётчик отмеченных и селекторы приложения, справа — действия
 * приложения, снятие отбора, обновление, настройка колонок и поиск. Своего состояния панель не
 * ведёт: обо всём, кроме набранного в поиске, она просит приложение.
 */
@Component({
    selector: 'rt-data-list-toolbar',
    templateUrl: './rt-data-list-toolbar.component.html',
    styleUrl: './rt-data-list-toolbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtCheckboxComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtToolbarComponent,

        // directives
        BlockDirective,
        ElemDirective,
        FormsModule,
        ModDirective,
        NgTemplateOutlet,
        ReactiveFormsModule,
        RtToolbarLeftDirective,
        RtToolbarRightDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtDataListToolbarComponent {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    protected readonly clearFiltersLabel: Signal<string> = rtKitLabel('dataListClearFilters');
    protected readonly refreshLabel: Signal<string> = rtKitLabel('dataListRefresh');
    protected readonly tableConfigLabel: Signal<string> = rtKitLabel('dataListTableConfig');
    protected readonly searchPlaceholder: Signal<string> = rtKitLabel('dataListSearchPlaceholder');
    protected readonly selectAllLabel: Signal<string> = rtKitLabel('dataListSelectAll');

    protected readonly selectedLabel: Signal<string> = rtKitLabel(
        'dataListSelected',
        computed(() => ({ count: this.selectedEntitiesCount() }))
    );

    protected readonly clearFiltersIcon: IRtIcon.Name = iconOf('block', 'ban');
    protected readonly refreshIcon: IRtIcon.Name = iconOf('sync', 'sync');
    protected readonly tableConfigIcon: IRtIcon.Name = iconOf('view_column', 'table');
    protected readonly searchIcon: IRtIcon.Name = iconOf('search', 'search');

    /** Набранное в поиске: поле — не сигнал, и без этой записи пересчёта по нему не будет. */
    readonly #searchText: WritableSignal<string> = signal('');

    /** В поле уже набирали — тогда на заглушке оно остаётся видимым и пустым. */
    readonly #isSearchTouched: WritableSignal<boolean> = signal(false);

    /** Поле поиска видно, пока есть строки, а на заглушке — только когда в нём что-то было. */
    protected readonly isSearchShown: Signal<boolean> = computed(
        () => !this.isPlaceholderShown() || !!this.#searchText() || this.#isSearchTouched()
    );

    protected readonly hasSelectors: Signal<boolean> = computed(() => this.isMultiSelect() || !!this.toolbarSelectorsTpl());

    /** Вид поля поиска: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public readonly searchAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly isFiltersShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Условий отбора нет — снимать нечего, и кнопка недоступна. */
    public readonly isFiltersEmpty: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isRefreshButtonShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isTableConfigButtonShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isPlaceholderShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Что уже набрано в поиске: приложение ставит это при первом рисовании. */
    /** Контурные значки кнопок полосы — очистки отбора, обновления и настройки колонок, как у первого кита. */
    public readonly isToolbarActionsIconsOutlined: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly searchTerm: InputSignal<TNullable<string>> = input<TNullable<string>>('');

    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly refreshAction: OutputEmitterRef<void> = output<void>();
    public readonly clearFiltersAction: OutputEmitterRef<void> = output<void>();
    public readonly openConfigAction: OutputEmitterRef<void> = output<void>();

    public readonly toolbarSelectorsTpl: Signal<TNullable<TemplateRef<unknown>>> = contentChild(RtDataListToolbarSelectorsDirective, {
        read: TemplateRef,
    });

    public readonly toolbarActionsTpl: Signal<TNullable<TemplateRef<unknown>>> = contentChild(RtDataListToolbarActionsDirective, {
        read: TemplateRef,
    });

    /** Состояние выбора; его ставит директива выбора списка. */
    public readonly isMultiSelect: WritableSignal<boolean> = signal(false);
    public readonly isSelectAllSelectorShown: WritableSignal<boolean> = signal(true);
    public readonly isSelectAllSelectorDisabled: WritableSignal<boolean> = signal(false);
    public readonly isAllEntitiesSelected: WritableSignal<boolean> = signal(false);
    public readonly isAllEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    public readonly selectedEntitiesCount: WritableSignal<number> = signal(0);

    public readonly searchControl: FormControl<TNullable<string>> = new FormControl<TNullable<string>>(null);

    constructor() {
        this.searchControl.setValue(this.searchTerm(), { emitEvent: false });

        /* Набранное уходит приложению, когда человек перестал печатать; пустое — сразу, иначе
           очистка поля ждала бы полсекунды. Одно и то же дважды не спрашивается. */
        this.searchControl.valueChanges
            .pipe(
                tap((value: TNullable<string>) => {
                    this.#searchText.set(value ?? '');
                    this.#isSearchTouched.set(true);
                }),
                debounce((value: TNullable<string>): Observable<number> => timer(value ? SEARCH_DELAY_MS : 0)),
                map((value: TNullable<string>) => (value ?? '').trim()),
                distinctUntilChanged(),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: string) => this.searchChange.emit(value));
    }

    /** Отметить все записи; метод ставит директива выбора списка. */
    public onToggleAllEntities: (checked: boolean) => void = (): void => undefined;

    protected onRefresh(): void {
        this.refreshAction.emit();
    }

    protected onClearFilters(): void {
        this.clearFiltersAction.emit();
    }

    protected onOpenConfig(): void {
        this.openConfigAction.emit();
    }
}
