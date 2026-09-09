import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCollapsibleTextComponent } from '../../rt-collapsible-text.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TCollapsibleTextMatrixPart = 'clamp' | 'paragraphs' | 'width' | 'edges' | 'presets' | 'themes';

/** Случай текста: имя для подписи ячейки, абзацы и предел строк. */
interface ICollapsibleTextCase {
    readonly name: string;
    readonly paragraphs: readonly string[];
    readonly clampLines: number;
}

const LONG: string =
    'Договор вступает в силу с момента подписания обеими сторонами и действует до конца календарного ' +
    'года. Продление происходит автоматически, если ни одна из сторон не заявила об отказе за тридцать ' +
    'дней до окончания срока.';

const SHORT: string = 'Подписан 14 марта.';

/**
 * Матрицы состояний `rt-collapsible-text` для витрины.
 *
 * Своя ось у компонента одна — предел строк, — но показать её мало: **кнопка «ещё» появляется
 * по замеру, а не по длине текста**. Компонент сравнивает высоту содержимого с высотой обрезки
 * и следит за шириной, поэтому один и тот же текст в узкой колонке переполняет обрезку, а в
 * широкой — нет. Отсюда ряд по ширине ячейки: без него ось предела читалась бы как решающая.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-collapsible-text-matrix',
    template: `
        @switch (part) {
            @case ('clamp') {
                <app-story-row caption="Предел строк" slotWidth="18rem" [items]="clamps" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-collapsible-text [paragraphs]="item.paragraphs" [clampLines]="item.clampLines" />
                    </ng-template>
                </app-story-row>
            }

            @case ('paragraphs') {
                <app-story-row caption="Число абзацев" slotWidth="18rem" [items]="paragraphCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-collapsible-text [paragraphs]="item.paragraphs" [clampLines]="item.clampLines" />
                    </ng-template>
                </app-story-row>
            }

            @case ('width') {
                <app-story-row caption="Ширина колонки решает, будет ли кнопка" [items]="widths">
                    <ng-template let-width>
                        <div [style.width]="width">
                            <rt-collapsible-text [paragraphs]="longParagraph" [clampLines]="3" />
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="18rem" [items]="edges" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-collapsible-text [paragraphs]="item.paragraphs" [clampLines]="item.clampLines" />
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Текст в обоих наборах">
                    <ng-template>
                        <div style="width: 18rem">
                            <rt-collapsible-text [paragraphs]="longParagraph" [clampLines]="3" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Текст в обеих темах">
                    <ng-template>
                        <div style="width: 18rem">
                            <rt-collapsible-text [paragraphs]="longParagraph" [clampLines]="3" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCollapsibleTextComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCollapsibleTextMatrixComponent {
    public part: TCollapsibleTextMatrixPart = 'clamp';

    public readonly longParagraph: readonly string[] = [LONG];

    public readonly clamps: readonly ICollapsibleTextCase[] = [
        { name: 'две строки', paragraphs: [LONG], clampLines: 2 },
        { name: 'три строки', paragraphs: [LONG], clampLines: 3 },
        { name: 'шесть строк — умолчание', paragraphs: [LONG], clampLines: 6 },
    ];

    /** Текст приходит массивом абзацев, а не одной строкой: разбивать разметку компонент не умеет. */
    public readonly paragraphCases: readonly ICollapsibleTextCase[] = [
        { name: 'один абзац', paragraphs: [LONG], clampLines: 3 },
        { name: 'два абзаца', paragraphs: [LONG, LONG], clampLines: 3 },
        { name: 'три абзаца', paragraphs: [SHORT, LONG, SHORT], clampLines: 3 },
    ];

    /** Кнопка появляется по замеру: в узкой колонке текст переполняет обрезку, в широкой — нет. */
    public readonly widths: readonly string[] = ['12rem', '24rem', '44rem'];

    public readonly edges: readonly ICollapsibleTextCase[] = [
        { name: 'короткий текст — кнопки нет', paragraphs: [SHORT], clampLines: 3 },
        { name: 'пустой набор', paragraphs: [], clampLines: 3 },
        { name: 'предел в одну строку', paragraphs: [LONG], clampLines: 1 },
    ];

    public readonly caseLabel: (value: ICollapsibleTextCase) => string = (value: ICollapsibleTextCase): string => value.name;
}
