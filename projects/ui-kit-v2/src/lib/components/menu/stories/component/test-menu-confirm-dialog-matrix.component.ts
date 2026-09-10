import { OverlayRef } from '@angular/cdk/overlay';
import { NgComponentOutlet } from '@angular/common';
import { inject, ChangeDetectionStrategy, Component, Injector, Type } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { RtMenuConfirmDialogComponent } from '../../rt-menu-confirm-dialog.component';
import { IRtMenu } from '../../rt-menu.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TMenuConfirmDialogMatrixPart = 'tone' | 'heading' | 'presets' | 'themes';

/** Случай матрицы: подпись ячейки и данные, которые окно получает при открытии. */
interface IMenuConfirmCase {
    readonly name: string;
    readonly data: IRtMenu.ConfirmData;
}

/**
 * Ручка окна для витрины: закрывать здесь нечего — окно нарисовано прямо на странице, а не
 * поднято наложением. Настоящая ручка сносит наложение, которого нет.
 */
function storyDialogRef(): RtDialogRef<boolean> {
    return new RtDialogRef<boolean>({ dispose: (): void => undefined } as OverlayRef);
}

/** Данные окна с умолчаниями: случаи матрицы отличаются одним-двумя полями, а не всем набором. */
function confirmData(patch: Partial<IRtMenu.ConfirmData>): IRtMenu.ConfirmData {
    return {
        message: 'Заявка будет удалена без возможности восстановления.',
        title: 'Удалить заявку?',
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        tone: 'danger',
        ...patch,
    };
}

/**
 * Матрицы `rt-menu-confirm-dialog` для витрины.
 *
 * Окно подтверждения открывает пункт меню перед деструктивным действием; наружу компонент не
 * экспортируется, и до этой истории он попадал в кадр только вместе с меню, которое его открыло.
 *
 * Данные окно берёт из инжектора, а не из входов, поэтому каждая ячейка ряда поднимается своим
 * инжектором: один общий на весь ряд дал бы четыре одинаковых окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-menu-confirm-dialog-matrix',
    template: `
        @switch (part) {
            @case ('tone') {
                <app-story-row caption="Тон подтверждающей кнопки" [items]="toneCases" [itemLabel]="caseLabel" [slotWidth]="dialogWidth">
                    <ng-template let-toneCase>
                        <ng-container *ngComponentOutlet="dialog; injector: injectorFor(toneCase)" />
                    </ng-template>
                </app-story-row>
            }

            @case ('heading') {
                <app-story-row
                    caption="Заголовок и длина сообщения"
                    [items]="headingCases"
                    [itemLabel]="caseLabel"
                    [slotWidth]="dialogWidth">
                    <ng-template let-headingCase>
                        <ng-container *ngComponentOutlet="dialog; injector: injectorFor(headingCase)" />
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Окно подтверждения в обоих наборах оформления">
                    <ng-template>
                        <ng-container *ngComponentOutlet="dialog; injector: injectorFor(toneCases[0])" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Окно подтверждения в обеих темах">
                    <ng-template>
                        <ng-container *ngComponentOutlet="dialog; injector: injectorFor(toneCases[0])" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgComponentOutlet,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMenuConfirmDialogMatrixComponent {
    public part: TMenuConfirmDialogMatrixPart = 'tone';

    /** Ширина ячейки: окно объявляет свою ширину само, и ячейка должна её вместить. */
    public readonly dialogWidth: string = '23rem';

    public readonly dialog: Type<RtMenuConfirmDialogComponent> = RtMenuConfirmDialogComponent;

    public readonly toneCases: readonly IMenuConfirmCase[] = [
        { name: 'опасное действие', data: confirmData({ tone: 'danger' }) },
        {
            name: 'предупреждение',
            data: confirmData({ tone: 'warning', title: 'Снять с публикации?', confirmLabel: 'Снять' }),
        },
        {
            name: 'обычное подтверждение',
            data: confirmData({ tone: 'primary', title: 'Отправить заявку?', confirmLabel: 'Отправить' }),
        },
    ];

    public readonly headingCases: readonly IMenuConfirmCase[] = [
        { name: 'с заголовком', data: confirmData({}) },
        { name: 'без заголовка', data: confirmData({ title: null }) },
        {
            name: 'длинное сообщение',
            data: confirmData({
                message:
                    'Заявка будет удалена без возможности восстановления вместе с перепиской, вложенными документами и историей изменений по ней.',
            }),
        },
    ];

    public readonly caseLabel: (value: IMenuConfirmCase) => string = (value: IMenuConfirmCase): string => value.name;

    readonly #injector: Injector = inject(Injector);

    /** Свой инжектор ячейки: данные окно берёт из инжектора, а не из входов. */
    public injectorFor(item: IMenuConfirmCase): Injector {
        return Injector.create({
            parent: this.#injector,
            providers: [
                { provide: RT_DIALOG_DATA, useValue: item.data },
                { provide: RtDialogRef, useFactory: storyDialogRef },
            ],
        });
    }
}
