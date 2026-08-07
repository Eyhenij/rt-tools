import { afterNextRender, ChangeDetectionStrategy, Component, Signal, viewChildren } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtPopoverDirective } from '../../rt-popover.directive';
import { IRtPopover } from '../../rt-popover.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type PopoverMatrixPart = 'align' | 'width' | 'offset';

/** Выравнивание панели относительно триггера. */
interface IPopoverAlignCase {
    readonly name: string;
    readonly align: IRtPopover.Align;
}

/** Стратегия ширины: по триггеру (списки) или по содержимому (подсказки). */
interface IPopoverWidthCase {
    readonly name: string;
    readonly width: IRtPopover.Width;
}

/** Отступ панели от триггера — по обеим осям. */
interface IPopoverOffsetCase {
    readonly name: string;
    readonly offsetY: number;
    readonly offsetX: number;
}

/**
 * Матрицы состояний `[rtPopover]` для витрины.
 *
 * **Панели открыты все сразу, и открывает их не жест, а вызов `open()`.** Это единственный
 * способ показать выравнивание и ширину рядом: любой жест по второму триггеру для CDK —
 * указатель за пределами первой панели, и та закрывается. Режим `manual` для того и есть:
 * автоматических слушателей он не вешает, а `open()` работает во всех режимах.
 *
 * Ряды оставляют под панели запас снизу: панель встаёт под триггером и без запаса налезала бы
 * на соседний ряд.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-popover-matrix',
    template: `
        <ng-template #panelTpl>
            <div class="app-popover-matrix__panel">Содержимое панели</div>
        </ng-template>

        <ng-template #widePanelTpl>
            <div class="app-popover-matrix__panel">Панель шире своего триггера — по содержимому</div>
        </ng-template>

        <div class="app-popover-matrix__room">
            @switch (part) {
                @case ('align') {
                    <app-story-row caption="Выравнивание" [items]="alignCases" [itemLabel]="caseLabel">
                        <ng-template let-alignCase>
                            <button
                                rtButton
                                type="button"
                                theme="secondary"
                                rtPopoverTrigger="manual"
                                [label]="alignCase.name"
                                [attr.aria-label]="alignCase.name"
                                [rtPopover]="widePanelTpl"
                                [rtPopoverAlign]="alignCase.align"></button>
                        </ng-template>
                    </app-story-row>
                }

                @case ('width') {
                    <app-story-row caption="Ширина панели" [items]="widthCases" [itemLabel]="caseLabel">
                        <ng-template let-widthCase>
                            <button
                                rtButton
                                type="button"
                                theme="secondary"
                                rtPopoverTrigger="manual"
                                label="Триггер пошире"
                                aria-label="Триггер пошире"
                                [rtPopover]="panelTpl"
                                [rtPopoverWidth]="widthCase.width"></button>
                        </ng-template>
                    </app-story-row>
                }

                @case ('offset') {
                    <app-story-row caption="Отступ от триггера" [items]="offsetCases" [itemLabel]="caseLabel">
                        <ng-template let-offsetCase>
                            <button
                                rtButton
                                type="button"
                                theme="secondary"
                                rtPopoverTrigger="manual"
                                [label]="offsetCase.name"
                                [attr.aria-label]="offsetCase.name"
                                [rtPopover]="panelTpl"
                                [rtPopoverOffsetY]="offsetCase.offsetY"
                                [rtPopoverOffsetX]="offsetCase.offsetX"></button>
                        </ng-template>
                    </app-story-row>
                }
            }
        </div>
    `,
    styles: `
        /* Панель встаёт под триггером: без запаса она налезала бы на соседний ряд. */
        .app-popover-matrix__room {
            padding-bottom: 10rem;
        }

        /* Своего оформления у директивы нет — панель красит содержимое, и здесь оно
           демонстрационное: рамка и фон взяты из свойств кита, чтобы панель было видно. */
        .app-popover-matrix__panel {
            padding: var(--rt-space-sm) var(--rt-space-md);
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            background: var(--rt-color-bg-surface);
            box-shadow: var(--rt-shadow-md);
            color: var(--rt-color-text-primary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtPopoverDirective,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtPopoverMatrixComponent {
    /** Директивы ряда: панели открываются вызовом, а не жестом. */
    protected readonly popovers: Signal<readonly RtPopoverDirective[]> = viewChildren(RtPopoverDirective);

    public part: PopoverMatrixPart = 'align';

    public readonly alignCases: readonly IPopoverAlignCase[] = [
        { name: 'start', align: 'start' },
        { name: 'end', align: 'end' },
    ];

    public readonly widthCases: readonly IPopoverWidthCase[] = [
        { name: 'по триггеру', width: 'trigger' },
        { name: 'по содержимому', width: 'auto' },
    ];

    public readonly offsetCases: readonly IPopoverOffsetCase[] = [
        { name: 'умолчание', offsetY: 4, offsetX: 0 },
        { name: 'вниз на 24', offsetY: 24, offsetX: 0 },
        { name: 'вбок на 24', offsetY: 4, offsetX: 24 },
    ];

    constructor() {
        // После первой отрисовки, а не в хуке вью: `open()` пишет сигнал и создаёт оверлей —
        // делать это посреди обхода дерева значит менять то, что уже отрисовано.
        afterNextRender((): void => {
            for (const popover of this.popovers()) {
                popover.open();
            }
        });
    }

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
