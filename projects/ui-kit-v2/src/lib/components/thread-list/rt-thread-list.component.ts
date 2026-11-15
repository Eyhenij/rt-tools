import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, map } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { searchDebounce } from '@rt-tools/ui-kit-v2/core';

import { RtInfiniteScrollDirective } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtServiceLogoComponent } from '@rt-tools/ui-kit-v2/service-logo';
import { RtSkeletonComponent } from '@rt-tools/ui-kit-v2/skeleton';
import {
    RtThreadListEmptyDirective,
    RtThreadListErrorDirective,
    RtThreadListFiltersDirective,
    RtThreadListRowActionsDirective,
    RtThreadListRowDirective,
    RtThreadListSearchDirective,
    RtThreadListTabsDirective,
} from './rt-thread-list.directives';
import { IRtThreadList } from './rt-thread-list.model';

const BEM_BLOCK: string = 'rt-thread-list';

/** Кол-во скелетон-строк на первичной загрузке (пока `rows` пусты). */
const SKELETON_ROWS_COUNT: number = 6;

/** Значки строк-превью пустого списка по умолчанию: люди переписки. */
const PREVIEW_ICONS: readonly IRtIcon.Name[] = ['user', 'users', 'user'];

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
    styleUrls: ['./rt-thread-list.component.scss', './rt-thread-list-messenger.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,
        ReactiveFormsModule,

        // standalone components / directives
        RtButtonDirective,
        RtEmptyStateComponent,
        RtIconComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtPopoverDirective,
        RtServiceLogoComponent,
        RtSkeletonComponent,
        BlockDirective,
        ElemDirective,
        RtInfiniteScrollDirective,
        ModDirective,
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-thread-list--messenger]': 'messenger()',
    },
})
export class RtThreadListComponent<TRow extends IRtThreadList.Row> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #t_uiSearch: Signal<string> = rtKitLabel('uiSearch');
    readonly #t_uiNothingFound: Signal<string> = rtKitLabel('uiNothingFound');
    readonly #t_uiThreadListEmpty: Signal<string> = rtKitLabel('uiThreadListEmpty');
    readonly #t_uiThreadListEmptyHint: Signal<string> = rtKitLabel('uiThreadListEmptyHint');
    readonly #t_uiThreadListNothingFoundHint: Signal<string> = rtKitLabel('uiThreadListNothingFoundHint');
    readonly #t_uiLoadError: Signal<string> = rtKitLabel('uiLoadError');
    readonly #t_uiLoadErrorHint: Signal<string> = rtKitLabel('uiLoadErrorHint');

    /** Строка поиска после дебаунса: по ней пустой список отличается от «ничего не найдено». */
    readonly #query: WritableSignal<string> = signal<string>('');

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly searchPlaceholderText: Signal<string> = computed((): string => this.searchPlaceholder() || this.#t_uiSearch());

    /** Включён поиск или фильтры: пустой список значит «ничего не найдено», а не «пока пусто». */
    protected readonly filtered: Signal<boolean> = computed((): boolean => this.filtersActive() || this.#query() !== '');

    protected readonly placeholderTitle: Signal<string> = computed((): string =>
        this.filtered() ? this.nothingFoundTitle() || this.#t_uiNothingFound() : this.emptyText() || this.#t_uiThreadListEmpty()
    );

    protected readonly placeholderDescription: Signal<string> = computed((): string =>
        this.filtered()
            ? this.nothingFoundDescription() || this.#t_uiThreadListNothingFoundHint()
            : this.emptyDescription() || this.#t_uiThreadListEmptyHint()
    );

    protected readonly emptyContext: Signal<IRtThreadList.EmptyContext> = computed((): IRtThreadList.EmptyContext => ({
        $implicit: this.filtered(),
        filtered: this.filtered(),
    }));

    /** Ошибка есть: `error` не null. Пустая строка — ошибка без своего текста. */
    protected readonly hasError: Signal<boolean> = computed((): boolean => this.error() !== null);

    protected readonly errorTitle: Signal<string> = computed((): string => this.error() || this.#t_uiLoadError());

    protected readonly errorHint: Signal<string> = computed((): string => this.errorDescription() || this.#t_uiLoadErrorHint());

    protected readonly errorContext: Signal<IRtThreadList.ErrorContext> = computed((): IRtThreadList.ErrorContext => ({
        $implicit: this.error() ?? '',
        retry: (): void => this.retry.emit(),
    }));

    protected readonly skeletonRows: number[] = Array.from({ length: SKELETON_ROWS_COUNT }, (_: unknown, i: number): number => i);

    /** Декоративные строки-превью пустого состояния: значок строки из `emptyPreviewIcons`, каждая вторая сдвинута. */
    protected readonly emptyPreviewRows: Signal<readonly IRtThreadList.PreviewRow[]> = computed((): readonly IRtThreadList.PreviewRow[] =>
        this.emptyPreviewIcons().map((icon: IRtIcon.Name, index: number): IRtThreadList.PreviewRow => ({
            icon,
            id: index,
            offset: index % 2 === 1,
        }))
    );

    protected readonly searchControl: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
    });

    protected readonly rowTemplate: Signal<RtThreadListRowDirective<TRow> | undefined> = contentChild(RtThreadListRowDirective<TRow>);

    protected readonly rowActionsTemplate: Signal<RtThreadListRowActionsDirective<TRow> | undefined> = contentChild(
        RtThreadListRowActionsDirective<TRow>
    );

    protected readonly filtersTemplate: Signal<RtThreadListFiltersDirective | undefined> = contentChild(RtThreadListFiltersDirective);

    protected readonly searchTemplate: Signal<RtThreadListSearchDirective | undefined> = contentChild(RtThreadListSearchDirective);

    protected readonly tabsTemplate: Signal<RtThreadListTabsDirective | undefined> = contentChild(RtThreadListTabsDirective);

    protected readonly emptyTemplate: Signal<RtThreadListEmptyDirective | undefined> = contentChild(RtThreadListEmptyDirective);

    protected readonly errorTemplate: Signal<RtThreadListErrorDirective | undefined> = contentChild(RtThreadListErrorDirective);

    public readonly rows: InputSignal<readonly TRow[]> = input<readonly TRow[]>([]);

    public readonly activeId: InputSignal<IRtThreadList.TRowId | null> = input<IRtThreadList.TRowId | null>(null);

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly searchPlaceholder: InputSignal<string> = input<string>('');

    /** Заголовок пустого списка без поиска и фильтров; пусто — подпись кита */
    public readonly emptyText: InputSignal<string> = input<string>('');

    /** Пояснение пустого списка; пусто — подпись кита */
    public readonly emptyDescription: InputSignal<string> = input<string>('');

    /** Заголовок «ничего не найдено» при поиске или фильтрах; пусто — подпись кита */
    public readonly nothingFoundTitle: InputSignal<string> = input<string>('');

    /** Пояснение «ничего не найдено»; пусто — подпись кита */
    public readonly nothingFoundDescription: InputSignal<string> = input<string>('');

    /** Ошибка загрузки: не null — список рисует ошибку; текст становится заголовком, пустой — подпись кита */
    public readonly error: InputSignal<string | null> = input<string | null>(null);

    /** Пояснение под заголовком ошибки; пусто — подпись кита */
    public readonly errorDescription: InputSignal<string> = input<string>('');

    /** Значки декоративных строк-превью пустого состояния, по строке на значок */
    public readonly emptyPreviewIcons: InputSignal<readonly IRtIcon.Name[]> = input<readonly IRtIcon.Name[]>(PREVIEW_ICONS);

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

    /** Вид мессенджера: колонка с полями, строки карточками со скруглением, без левой полосы */
    public readonly messenger: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    // Имя `select` зарезервировано под нативное DOM-событие
    // (@angular-eslint/no-output-native), поэтому output переименован.
    public readonly selectRow: OutputEmitterRef<IRtThreadList.TRowId> = output<IRtThreadList.TRowId>();

    // Ctrl/⌘+клик по строке: потребитель открывает строку в новой вкладке.
    // Обычный клик остаётся на `selectRow`.
    public readonly openInNewTab: OutputEmitterRef<IRtThreadList.TRowId> = output<IRtThreadList.TRowId>();

    public readonly searchChange: OutputEmitterRef<string> = output<string>();

    public readonly loadMore: OutputEmitterRef<void> = output<void>();

    /** Кнопка «Повторить» у ошибки: список сам не перезагружает, данные у потребителя */
    public readonly retry: OutputEmitterRef<void> = output<void>();

    public ngOnInit(): void {
        // Дебаунс непустого ввода; очистка крестиком применяется сразу (searchDebounce).
        this.searchControl.valueChanges
            .pipe(
                map((value: string): string => value.trim()),
                searchDebounce(),
                distinctUntilChanged(),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: string): void => {
                this.#query.set(value);
                this.searchChange.emit(value);
            });
    }

    protected onRetry(): void {
        this.retry.emit();
    }

    protected onSelect(id: IRtThreadList.TRowId, event: MouseEvent): void {
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
