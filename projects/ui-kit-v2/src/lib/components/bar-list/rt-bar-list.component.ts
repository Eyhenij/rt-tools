import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { IRtLoadError, RtEmptyStateComponent, rtLoadErrorView } from '@rt-tools/ui-kit-v2/empty-state';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtBarListEmptyDirective, RtBarListErrorDirective } from './rt-bar-list-states.directive';
import { IRtBarList } from './rt-bar-list.model';

const BEM_BLOCK: string = 'rt-bar-list';

/**
 * Список «топ-N» со шкалой доли: заголовок, необязательное уточнение, значение
 * справа и полоса под строкой. Заменяет самодельные бары — третьей реализации
 * в проекте быть не должно.
 *
 * Компонент ничего не считает и не форматирует: доля приходит числом 0…100,
 * значение — готовой строкой. Так список одинаково годится и для денег, и для
 * счётчиков визитов.
 */
@Component({
    selector: 'rt-bar-list',
    templateUrl: './rt-bar-list.component.html',
    styleUrl: './rt-bar-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtButtonDirective,
        RtEmptyStateComponent,
        RtIconComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtBarListComponent {
    readonly #t_uiNoData: Signal<string> = rtKitLabel('uiNoData');

    /** Свой вид пустого списка (`<ng-template rtBarListEmpty>`). */
    protected readonly emptyTemplate: Signal<RtBarListEmptyDirective | undefined> = contentChild(RtBarListEmptyDirective);

    /** Свой вид ошибки загрузки (`<ng-template rtBarListError>`). */
    protected readonly errorTemplate: Signal<RtBarListErrorDirective | undefined> = contentChild(RtBarListErrorDirective);

    /** Вид ошибки загрузки: заголовок, подсказка и контекст своего шаблона; ошибка важнее строк. */
    protected readonly loadError: IRtLoadError.View = rtLoadErrorView(
        (): string | null => this.error(),
        (): string => this.errorDescription(),
        (): void => this.retry.emit()
    );

    /** Подпись кнопки повтора загрузки. */
    protected readonly retryLabel: Signal<string> = rtKitLabel('uiRetry');

    protected readonly emptyMessage: Signal<string> = computed((): string => this.emptyText() || this.#t_uiNoData());

    public readonly rows: InputSignal<ReadonlyArray<IRtBarList.Row>> = input.required<ReadonlyArray<IRtBarList.Row>>();

    public readonly title: InputSignal<string> = input<string>('');

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly emptyText: InputSignal<string> = input<string>('');

    /** Ошибка загрузки: не null — вместо строк заглушка ошибки, заголовок на месте; пустая строка — подпись кита. */
    public readonly error: InputSignal<string | null> = input<string | null>(null);

    /** Подсказка под ошибкой; пустая — подпись кита. */
    public readonly errorDescription: InputSignal<string> = input<string>('');

    /** Нажата «Повторить» на ошибке загрузки. Список сам ничего не загружает. */
    public readonly retry: OutputEmitterRef<void> = output<void>();
}
