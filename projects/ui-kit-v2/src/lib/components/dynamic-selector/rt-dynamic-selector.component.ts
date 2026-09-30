import {
    booleanAttribute,
    computed,
    contentChild,
    forwardRef,
    input,
    model,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { RtDynamicSelectorListComponent } from './list/rt-dynamic-selector-list.component';
import { RtDynamicSelectorPopupComponent } from './popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorRowControlsDirective, RtDynamicSelectorRowTitleDirective } from './rt-dynamic-selector.directives';
import {
    clearDynamicKeys,
    dynamicSelectorLabel,
    moveDynamicKey,
    sameDynamicKeys,
    selectableDynamicItems,
} from './rt-dynamic-selector.logic';
import { IRtDynamicSelector } from './rt-dynamic-selector.model';

const BEM_BLOCK: string = 'rt-dynamic-selector';

/**
 * Динамический селектор: поле формы со списком выбранных записей. Значение — массив ключей в
 * порядке списка. Записи добавляются всплывающим выбором, убираются корзиной строки, список
 * возвращается к записанному формой сбросом и пустеет очисткой — кроме строк только для чтения.
 *
 * @example
 * ```html
 * <rt-dynamic-selector keyExp="id" displayExp="name" [entities]="people()" [formControl]="team" />
 * ```
 */
@Component({
    selector: 'rt-dynamic-selector',
    templateUrl: './rt-dynamic-selector.component.html',
    styleUrl: './rt-dynamic-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtDynamicSelectorListComponent,
        RtDynamicSelectorPopupComponent,
        RtEmptyStateComponent,
        RtPopoverDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtDynamicSelectorComponent) },
    ],
    host: { class: BEM_BLOCK },
})
export class RtDynamicSelectorComponent<TEntity extends object> extends RtFormControlBase<unknown[]> {
    /** Последнее значение, записанное формой: к нему возвращает сброс. */
    readonly #initial: WritableSignal<unknown[]> = signal<unknown[]>([]);

    protected readonly addLabel: Signal<string> = rtKitLabel('dynamicSelectorAdd');
    protected readonly nothingToChooseLabel: Signal<string> = rtKitLabel('dynamicSelectorNothingToChoose');

    protected readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);
    protected readonly rowTitle: Signal<RtDynamicSelectorRowTitleDirective<TEntity> | undefined> =
        contentChild<RtDynamicSelectorRowTitleDirective<TEntity>>(RtDynamicSelectorRowTitleDirective);
    protected readonly rowControls: Signal<RtDynamicSelectorRowControlsDirective<TEntity> | undefined> = contentChild<
        RtDynamicSelectorRowControlsDirective<TEntity>
    >(RtDynamicSelectorRowControlsDirective);
    protected readonly titleTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null> = computed(
        (): TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null => this.rowTitle()?.templateRef ?? null
    );
    protected readonly controlsTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null> = computed(
        (): TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null => this.rowControls()?.templateRef ?? null
    );

    /** Выбранные записи в порядке значения; ключ, которого нет среди записей, строки не рисует. */
    protected readonly chosen: Signal<TEntity[]> = computed((): TEntity[] => this.#entitiesOf(this.value()));
    protected readonly rows: Signal<IRtDynamicSelector.ListRow<TEntity>[]> = computed((): IRtDynamicSelector.ListRow<TEntity>[] => {
        const locked: ReadonlyArray<unknown> = this.readonlyKeys();

        return this.chosen().map((item: TEntity): IRtDynamicSelector.ListRow<TEntity> => ({
            item,
            key: this.#keyOf(item),
            label: dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity)) ?? '',
            locked: locked.includes(this.#keyOf(item)),
        }));
    });
    /** Что предлагает всплывающий выбор: ещё не выбранное, в порядке вызывающего или по алфавиту. */
    protected readonly offered: Signal<TEntity[]> = computed((): TEntity[] =>
        selectableDynamicItems(
            this.entities(),
            this.value(),
            (item: TEntity): unknown => this.#keyOf(item),
            (item: TEntity): unknown => this.#labelOf(item),
            '',
            this.sortFn()
        )
    );
    protected readonly hasOffer: Signal<boolean> = computed((): boolean => this.offered().length > 0 || !this.localSearch());
    protected readonly isNothingToChoose: Signal<boolean> = computed((): boolean => this.value().length === 0 && !this.hasOffer());
    protected readonly isAddShown: Signal<boolean> = computed((): boolean => this.addShown() && this.hasOffer());
    protected readonly isResetDisabled: Signal<boolean> = computed((): boolean => sameDynamicKeys(this.value(), this.#initial()));
    protected readonly isClearDisabled: Signal<boolean> = computed(
        (): boolean => clearDynamicKeys(this.value(), this.readonlyKeys()).length === this.value().length
    );
    protected readonly addTitle: Signal<string> = computed((): string => this.buttonTitle() || this.addLabel());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value().length > 0);

    /** Записи, из которых выбирают; у каждой есть поле ключа и поле подписи. */
    public readonly entities: InputSignal<ReadonlyArray<TEntity>> = input<ReadonlyArray<TEntity>>([]);
    public readonly keyExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    public readonly displayExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    public readonly mode: InputSignal<IRtDynamicSelector.Mode> = input<IRtDynamicSelector.Mode>('multi');
    /** Название кнопки добавления; пустое — «Add» из словаря кита. */
    public readonly buttonTitle: InputSignal<string> = input<string>('');
    public readonly addShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Ключи, которые нельзя убрать из списка. */
    public readonly readonlyKeys: InputSignal<ReadonlyArray<unknown>> = input<ReadonlyArray<unknown>>([]);
    /** Ключи строк всплывающего выбора, под последней из которых стоит разделитель. */
    public readonly pinnedKeys: InputSignal<ReadonlyArray<unknown>> = input<ReadonlyArray<unknown>>([]);
    public readonly draggable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Приглашение вместо полосы кнопок: значок, описание и кнопка добавления. */
    public readonly invitation: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly invitationIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly invitationDescription: InputSignal<string> = input<string>('');
    public readonly multiToggleShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly selectAllShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly localSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly lazyLoad: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly loading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly fetching: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly navigateTitle: InputSignal<string> = input<string>('');
    public readonly navigateLink: InputSignal<string> = input<string>('');
    public readonly sortFn: InputSignal<((a: TEntity, b: TEntity) => number) | null> = input<((a: TEntity, b: TEntity) => number) | null>(
        null
    );

    /** Выбранные записи: те же, что уходят событием изменения выбора. */
    public readonly chosenEntities: ModelSignal<TEntity[]> = model<TEntity[]>([]);

    public readonly selectionChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();
    public readonly listReset: OutputEmitterRef<void> = output<void>();
    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly loadMore: OutputEmitterRef<void> = output<void>();
    public readonly temporaryChoiceChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();

    public readonly displayText: Signal<string> = computed((): string =>
        this.rows()
            .map((row: IRtDynamicSelector.ListRow<TEntity>): string => row.label)
            .join(', ')
    );

    /** Записанное формой становится и списком, и значением для сброса; пустой массив список опустошает. */
    public override writeValue(value: unknown[] | null): void {
        super.writeValue(value === null ? null : [...value]);
        this.#initial.set([...this.value()]);
    }

    protected onAdd(): void {
        if (!this.isDisabled()) {
            this.popover()?.open();
        }
    }

    protected onApplied(keys: unknown[]): void {
        this.popover()?.close();
        this.#change(
            this.mode() === 'single'
                ? keys.slice(0, 1)
                : [...this.value(), ...keys.filter((key: unknown): boolean => !this.value().includes(key))]
        );
    }

    protected onCancelled(): void {
        this.popover()?.close();
    }

    protected onRemoved(key: unknown): void {
        if (!this.isDisabled() && !this.readonlyKeys().includes(key)) {
            this.#change(this.value().filter((item: unknown): boolean => item !== key));
        }
    }

    protected onMoved(move: IRtDynamicSelector.Move): void {
        if (!this.isDisabled()) {
            this.#change(moveDynamicKey(this.value(), move.from, move.to));
        }
    }

    protected onReset(): void {
        if (this.isDisabled() || this.isResetDisabled()) {
            return;
        }

        this.#change([...this.#initial()]);
        this.listReset.emit();
    }

    protected onCleared(): void {
        if (!this.isDisabled() && !this.isClearDisabled()) {
            this.#change(clearDynamicKeys(this.value(), this.readonlyKeys()));
        }
    }

    protected onClosed(): void {
        this.markTouched();
    }

    protected getEmptyValue(): unknown[] {
        return [];
    }

    protected focusAfterClear(): void {
        // Очистка крестиком у поля не ставится: фокус остаётся там, где был.
    }

    #change(keys: unknown[]): void {
        const entities: TEntity[] = this.#entitiesOf(keys);

        this.value.set(keys);
        this.emitChange(keys);
        this.chosenEntities.set(entities);
        this.selectionChange.emit(entities);
    }

    #entitiesOf(keys: ReadonlyArray<unknown>): TEntity[] {
        return keys
            .map((key: unknown): TEntity | undefined => this.entities().find((item: TEntity): boolean => this.#keyOf(item) === key))
            .filter((item: TEntity | undefined): item is TEntity => item !== undefined);
    }

    /** Ключ записи — по имени поля, которое назвал вызывающий. */
    #keyOf(item: TEntity): unknown {
        return item[this.keyExp()];
    }

    /** Подпись записи — по имени поля, которое назвал вызывающий. */
    #labelOf(item: TEntity): unknown {
        return item[this.displayExp()];
    }
}
