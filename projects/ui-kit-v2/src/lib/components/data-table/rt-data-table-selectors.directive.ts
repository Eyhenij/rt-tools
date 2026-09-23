import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    Injector,
    input,
    InputSignalWithTransform,
    OnInit,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, take } from 'rxjs/operators';

import { transformArrayInput } from '@rt-tools/utils';

import { RtDataTableComponent } from './rt-data-table.component';
import {
    dataTableAllOnPage,
    dataTableAnyOnPage,
    dataTableKeysOf,
    dataTablePresetEntities,
    dataTableWithEntity,
    dataTableWithoutPageEntities,
    dataTableWithPageEntities,
} from './rt-data-table-selection.logic';

/**
 * Выбор строк таблицы `rt-data-table` — колонка выбора первого кита.
 *
 * Директива ведёт отметки и ставит таблице всё, что та рисует: ключи отмеченных, состояние
 * флажка страницы и признаки колонки выбора. Приложение читает отмеченные записи целиком —
 * запись, отмеченная на странице, которой уже нет на экране, остаётся отмеченной.
 */
@Directive({
    selector: 'rt-data-table[rtDataTableSelectors]',
})
export class RtDataTableSelectorsDirective<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #table: RtDataTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY> =
        inject<RtDataTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtDataTableComponent);

    readonly #selectedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    readonly #isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    readonly #isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);

    public readonly isMultiSelect: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isSelectorColumnShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly isSelectorsColumnDisabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Ключи записей, отмеченных заранее; они применяются один раз — к первым пришедшим строкам. */
    public readonly selectedEntitiesKeys: InputSignalWithTransform<ENTITY_TYPE[KEY][], ENTITY_TYPE[KEY][] | null | undefined> = input<
        ENTITY_TYPE[KEY][],
        ENTITY_TYPE[KEY][] | null | undefined
    >([], { transform: transformArrayInput });

    /** Отмеченные записи целиком. */
    public readonly selectedEntities: Signal<ENTITY_TYPE[]> = this.#selectedEntities.asReadonly();

    public readonly selectedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() =>
        dataTableKeysOf(this.selectedEntities(), this.#keyExp())
    );

    public readonly isPageEntitiesSelected: Signal<boolean> = this.#isPageEntitiesSelected.asReadonly();
    public readonly isPageEntitiesIndeterminate: Signal<boolean> = this.#isPageEntitiesIndeterminate.asReadonly();

    constructor() {
        this.#table.onToggleEntity = (entity: ENTITY_TYPE, checked: boolean): void => this.toggleEntity(entity, checked);
        this.#table.onTogglePageEntities = (checked: boolean): void => this.togglePageEntities(checked);

        /* Отметки ведёт директива, а рисует их таблица: каждое значение переливается в её поле.
           Обратного хода нет — таблица сама их не меняет. */
        effect(() => this.#table.selectedEntitiesIds.set(this.selectedEntitiesIds()));
        effect(() => this.#table.isPageEntitiesSelected.set(this.isPageEntitiesSelected()));
        effect(() => this.#table.isPageEntitiesIndeterminate.set(this.isPageEntitiesIndeterminate()));
        effect(() => this.#table.isMultiSelect.set(this.isMultiSelect()));
        effect(() => this.#table.isSelectorsColumnShown.set(this.isSelectorColumnShown()));
        effect(() => this.#table.isSelectorsColumnDisabled.set(this.isSelectorsColumnDisabled()));
    }

    public ngOnInit(): void {
        /** Отметки, названные заранее, ставятся один раз: к первым непустым строкам. */
        toObservable(this.#table.entities, { injector: this.#injector })
            .pipe(
                filter((entities: ENTITY_TYPE[]) => !!entities.length),
                take(1),
                switchMap(() =>
                    toObservable(this.selectedEntitiesKeys, { injector: this.#injector }).pipe(
                        filter((keys: ENTITY_TYPE[KEY][]) => !!keys.length),
                        take(1)
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe(() => {
                this.#selectedEntities.set(dataTablePresetEntities(this.#table.entities(), this.selectedEntitiesKeys(), this.#keyExp()));
                this.setExistingEntitiesState();
            });
    }

    /** Отметить или снять все строки показанной страницы; других отметок это не трогает. */
    public togglePageEntities(checked: boolean): void {
        const page: ENTITY_TYPE[] = this.#table.entities();

        this.#isPageEntitiesSelected.set(checked);
        this.#selectedEntities.update((selected: ENTITY_TYPE[]) =>
            checked
                ? dataTableWithPageEntities(selected, page, this.#keyExp())
                : dataTableWithoutPageEntities(selected, page, this.#keyExp())
        );
        this.#isPageEntitiesIndeterminate.set(dataTableAnyOnPage(page, this.selectedEntitiesIds(), this.#keyExp()));
    }

    /** Отметить или снять одну запись; при выборе по одной прежняя отметка уходит. */
    public toggleEntity(entity: ENTITY_TYPE, checked: boolean): void {
        if (!this.isMultiSelect()) {
            this.#selectedEntities.set([entity]);

            return;
        }

        this.#selectedEntities.update((selected: ENTITY_TYPE[]) => dataTableWithEntity(selected, entity, checked, this.#keyExp()));

        const page: ENTITY_TYPE[] = this.#table.entities();
        const keys: ENTITY_TYPE[KEY][] = this.selectedEntitiesIds();

        if (keys.length) {
            this.#isPageEntitiesSelected.set(dataTableAllOnPage(page, keys, this.#keyExp()));
            this.#isPageEntitiesIndeterminate.set(true);
        } else {
            this.#isPageEntitiesSelected.set(false);
            this.#isPageEntitiesIndeterminate.set(dataTableAnyOnPage(page, keys, this.#keyExp()));
        }
    }

    /** Снять все отметки. */
    public clearSelectedList(): void {
        this.#selectedEntities.set([]);
        this.#isPageEntitiesSelected.set(false);
        this.#isPageEntitiesIndeterminate.set(false);
    }

    /** Пересчитать флажок страницы по показанным строкам. */
    public setExistingEntitiesState(): void {
        const page: ENTITY_TYPE[] = this.#table.entities();
        const keys: ENTITY_TYPE[KEY][] = this.selectedEntitiesIds();

        this.#isPageEntitiesSelected.set(dataTableAllOnPage(page, keys, this.#keyExp()));
        this.#isPageEntitiesIndeterminate.set(dataTableAnyOnPage(page, keys, this.#keyExp()));
    }

    #keyExp(): KEY {
        return this.#table.keyExp();
    }
}
