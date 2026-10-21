import {
    booleanAttribute,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    ViewEncapsulation,
} from '@angular/core';

import { IRtInput } from '../../../input/rt-input.model';
import { TRtRadius } from '../../../radius/rt-radius.model';
import { RtDynamicSelectorPopupComponent } from '../../popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorPartsService } from '../../rt-dynamic-selector-parts.service';
import { IRtDynamicSelector } from '../../rt-dynamic-selector.model';

/**
 * Окно выбора без корня — для витрины и тестов окна. Окно читает настройки у корня, а рамка
 * встаёт на его место: принимает те же настройки входами и отдаёт действия окна событиями. В пакет
 * рамка не уезжает.
 */
@Component({
    selector: 'app-dynamic-selector-popup-frame',
    templateUrl: './test-dynamic-selector-popup-frame.component.html',
    styleUrl: './test-dynamic-selector-popup-frame.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtDynamicSelectorPopupComponent],
    providers: [RtDynamicSelectorPartsService],
})
export class TestDynamicSelectorPopupFrameComponent<TEntity extends object> {
    readonly #parts: RtDynamicSelectorPartsService<TEntity> = inject<RtDynamicSelectorPartsService<TEntity>>(RtDynamicSelectorPartsService);

    /** Предлагаемые записи: ещё не выбранные, отсортированные корнем. */
    public readonly entities: InputSignal<ReadonlyArray<TEntity>> = input<ReadonlyArray<TEntity>>([]);
    public readonly keyExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    public readonly displayExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    /** Подпись записи для строки, пункта окна и поиска; не задана — поле `displayExp`. */
    public readonly displayWith: InputSignal<((entity: TEntity) => string) | null> = input<((entity: TEntity) => string) | null>(null);
    public readonly mode: InputSignal<IRtDynamicSelector.Mode> = input<IRtDynamicSelector.Mode>('multi');
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
    public readonly pinnedKeys: InputSignal<ReadonlyArray<unknown>> = input<ReadonlyArray<unknown>>([]);
    public readonly navigateTitle: InputSignal<string> = input<string>('');
    public readonly navigateLink: InputSignal<string> = input<string>('');
    /** Запрос, с которым выбор открывается; событием поиска он не уходит — вызывающий его знает. */
    public readonly searchTerm: InputSignal<string> = input<string>('');
    /** Вид поля поиска — тот же вход, что у поля кита. */
    public readonly searchAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');
    /** Шаг скругления поля поиска; null — скругление самого поля. */
    public readonly searchRadius: InputSignal<TRtRadius | null> = input<TRtRadius | null>(null);
    /** Подпись пустого результата поиска; пустая строка оставляет подпись кита. */
    public readonly emptyResultsText: InputSignal<string> = input<string>('');
    /** Подпись кнопки применения; пустая строка оставляет подпись кита. */
    public readonly applyLabel: InputSignal<string> = input<string>('');
    /** Регистр подписи кнопки применения; `none` оставляет её как есть. */
    public readonly applyLabelCase: InputSignal<IRtDynamicSelector.LabelCase> = input<IRtDynamicSelector.LabelCase>('none');
    /** Поле поиска получает фокус при открытии окна; по умолчанию фокус остаётся там, где был. */
    public readonly autofocusSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Подпись пункта переносится; `false` ведёт её одной строкой с многоточием и подсказкой при обрезке. */
    public readonly titleWrap: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Символы подписи пункта, совпавшие со словами поиска, выделены. */
    public readonly highlightSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Применённые ключи в порядке отметок. */
    public readonly applied: OutputEmitterRef<unknown[]> = output<unknown[]>();
    public readonly cancelled: OutputEmitterRef<void> = output<void>();
    /** Запрос для поиска на сервере: через паузу после последней клавиши, стёртый — пустой строкой. */
    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly loadMore: OutputEmitterRef<void> = output<void>();
    /** Отмеченные записи: пустой список при открытии и текущие отметки после каждого поиска. */
    public readonly temporaryChoiceChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();

    constructor() {
        this.#parts.bindPopup({
            settings: this,
            entities: this.entities,
            apply: (keys: unknown[]): void => this.applied.emit(keys),
            cancel: (): void => this.cancelled.emit(),
            search: (query: string): void => this.searchChange.emit(query),
            loadMore: (): void => this.loadMore.emit(),
            temporaryChoice: (entities: TEntity[]): void => this.temporaryChoiceChange.emit(entities),
        });
    }
}
