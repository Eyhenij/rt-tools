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
    OnInit,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, map } from 'rxjs';

import { translateSignal, TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { searchDebounce } from '../../util';

import { RtInfiniteScrollDirective } from '../../scroll/infinite-scroll.directive';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtInputComponent } from '../input/rt-input.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { RtSkeletonComponent } from '../skeleton/rt-skeleton.component';
import { RtThreadListFiltersDirective, RtThreadListRowDirective, RtThreadListSearchDirective } from './rt-thread-list.directives';
import { IRtThreadList } from './rt-thread-list.model';

const BEM_BLOCK: string = 'rt-thread-list';

/** Кол-во скелетон-строк на первичной загрузке (пока `rows` пусты). */
const SKELETON_ROWS_COUNT: number = 6;

/**
 * Презентационный список тредов для воркспейсов:
 * поиск с дебаунсом, фильтр-поповер и бесконечная прокрутка. Данные и оркестрация
 * — на вызывающем; список стора/api не видит.
 *
 * Строку рисует потребитель через `<ng-template rtThreadListRow let-row>` (body +
 * meta); оболочка владеет кнопкой строки (active/unread/overdue), поиском, кнопкой
 * фильтров (точка-индикатор при `filtersActive`) и скроллом. Фильтры потребитель
 * кладёт в `<ng-template rtThreadListFilters>` — они рендерятся в поповере.
 */
@Component({
    selector: 'rt-thread-list',
    templateUrl: './rt-thread-list.component.html',
    styleUrls: ['./rt-thread-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,
        ReactiveFormsModule,

        // standalone components / directives
        RtEmptyStateComponent,
        RtIconComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtPopoverDirective,
        RtSkeletonComponent,
        BlockDirective,
        ElemDirective,
        RtInfiniteScrollDirective,
        ModDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtThreadListComponent<TRow extends IRtThreadList.Row> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #t_uiSearch: Signal<string> = translateSignal('rtKit.uiSearch');
    readonly #t_uiNothingFound: Signal<string> = translateSignal('rtKit.uiNothingFound');

    protected readonly searchPlaceholderText: Signal<string> = computed((): string => this.searchPlaceholder() || this.#t_uiSearch());
    protected readonly emptyTitle: Signal<string> = computed((): string => this.emptyText() || this.#t_uiNothingFound());

    protected readonly skeletonRows: number[] = Array.from({ length: SKELETON_ROWS_COUNT }, (_: unknown, i: number): number => i);

    /** Декоративные строки-превью для иллюстрации пустого состояния списка. */
    protected readonly emptyPreviewRows: readonly {
        id: number;
        icon: IRtIcon.Name;
        offset: boolean;
    }[] = [
        { id: 1, icon: 'user', offset: false },
        { id: 2, icon: 'users', offset: true },
        { id: 3, icon: 'user', offset: false },
    ];

    protected readonly searchControl: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
    });

    protected readonly rowTemplate: Signal<RtThreadListRowDirective<TRow> | undefined> = contentChild(RtThreadListRowDirective<TRow>);

    protected readonly filtersTemplate: Signal<RtThreadListFiltersDirective | undefined> = contentChild(RtThreadListFiltersDirective);

    protected readonly searchTemplate: Signal<RtThreadListSearchDirective | undefined> = contentChild(RtThreadListSearchDirective);

    public readonly rows: InputSignal<readonly TRow[]> = input<readonly TRow[]>([]);

    public readonly activeId: InputSignal<number | null> = input<number | null>(null);

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly searchPlaceholder: InputSignal<string> = input<string>('');

    public readonly emptyText: InputSignal<string> = input<string>('');

    public readonly loading: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    public readonly fetching: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    public readonly hasMore: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    public readonly filtersActive: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    // Имя `select` зарезервировано под нативное DOM-событие
    // (@angular-eslint/no-output-native), поэтому output переименован.
    public readonly selectRow: OutputEmitterRef<number> = output<number>();

    // Ctrl/⌘+клик по строке: потребитель открывает строку в новой вкладке.
    // Обычный клик остаётся на `selectRow`.
    public readonly openInNewTab: OutputEmitterRef<number> = output<number>();

    public readonly searchChange: OutputEmitterRef<string> = output<string>();

    public readonly loadMore: OutputEmitterRef<void> = output<void>();

    public ngOnInit(): void {
        // Дебаунс непустого ввода; очистка крестиком применяется сразу (searchDebounce).
        this.searchControl.valueChanges
            .pipe(
                map((value: string): string => value.trim()),
                searchDebounce(),
                distinctUntilChanged(),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: string): void => this.searchChange.emit(value));
    }

    protected onSelect(id: number, event: MouseEvent): void {
        // Ctrl (Win/Linux) или ⌘ (macOS) — «открыть в новой вкладке», как у
        // нативных ссылок. Иначе — обычный выбор строки в текущей вкладке.
        if (event.ctrlKey || event.metaKey) {
            this.openInNewTab.emit(id);
            return;
        }
        this.selectRow.emit(id);
    }

    protected onLoadMore(): void {
        this.loadMore.emit();
    }
}
