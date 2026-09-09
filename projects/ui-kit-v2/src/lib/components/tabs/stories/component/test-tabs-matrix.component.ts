import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTabsMatrixPart = 'direction' | 'title' | 'tabState' | 'stretch' | 'edges' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-tabs` и `[rtTab]` для витрины.
 *
 * Вкладки объявляются разметкой, а не входом-набором, поэтому ось «состояние вкладки» показана
 * одной полосой, где стоят все виды сразу: обычная, активная, отключённая, с ошибкой, со
 * значком. Порознь их не сравнить — вид вкладки читается только рядом с соседями.
 *
 * Скрытая вкладка показана там же отсутствием: `hidden` убирает её из полосы вовсе, и ячейки
 * под неё нет — это и есть её вид.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tabs-matrix',
    template: `
        @switch (part) {
            @case ('direction') {
                <app-story-row caption="Раскладка" slotWidth="24rem" [items]="directions" [itemLabel]="directionLabel">
                    <ng-template let-direction>
                        <rt-tabs activeId="overview" [direction]="direction">
                            <ng-template rtTab="overview" label="Обзор">Сводка по договору</ng-template>
                            <ng-template rtTab="members" label="Участники">Список участников</ng-template>
                            <ng-template rtTab="history" label="История">Журнал изменений</ng-template>
                        </rt-tabs>
                    </ng-template>
                </app-story-row>
            }

            @case ('title') {
                <app-story-row caption="Заголовок вкладки" slotWidth="24rem" [items]="titles">
                    <ng-template let-title>
                        @switch (title) {
                            @case ('только подпись') {
                                <rt-tabs activeId="a">
                                    <ng-template rtTab="a" label="Обзор">Содержимое</ng-template>
                                    <ng-template rtTab="b" label="Участники">Содержимое</ng-template>
                                </rt-tabs>
                            }
                            @case ('с иконкой') {
                                <rt-tabs activeId="a">
                                    <ng-template rtTab="a" label="Обзор" icon="ico-listing">Содержимое</ng-template>
                                    <ng-template rtTab="b" label="Участники" icon="ico-users">Содержимое</ng-template>
                                </rt-tabs>
                            }
                            @case ('со значком') {
                                <rt-tabs activeId="a">
                                    <ng-template rtTab="a" label="Обзор" [badge]="3">Содержимое</ng-template>
                                    <ng-template rtTab="b" label="Участники" badge="99+">Содержимое</ng-template>
                                </rt-tabs>
                            }
                            @case ('иконка и значок') {
                                <rt-tabs activeId="a">
                                    <ng-template rtTab="a" label="Обзор" icon="ico-listing" [badge]="3">Содержимое</ng-template>
                                    <ng-template rtTab="b" label="Задачи" icon="list" iconColor="warning" badge="12">
                                        Содержимое
                                    </ng-template>
                                </rt-tabs>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('tabState') {
                <div style="width: 34rem">
                    <rt-tabs activeId="active">
                        <ng-template rtTab="active" label="Активная">Содержимое активной вкладки</ng-template>
                        <ng-template rtTab="plain" label="Обычная">Содержимое</ng-template>
                        <ng-template rtTab="off" disabled label="Отключённая">Сюда не попасть</ng-template>
                        <ng-template rtTab="bad" invalid label="С ошибкой" invalidMessage="Не заполнено два поля">Содержимое</ng-template>
                        <ng-template rtTab="badge" label="Со значком" [badge]="7">Содержимое</ng-template>
                        <ng-template rtTab="gone" hidden label="Скрытая — её в полосе нет">Содержимое</ng-template>
                    </rt-tabs>
                </div>
            }

            @case ('stretch') {
                <app-story-row caption="Растяжение по ширине" slotWidth="24rem" [items]="stretches" [itemLabel]="stretchLabel">
                    <ng-template let-value>
                        <rt-tabs activeId="a" [stretch]="value">
                            <ng-template rtTab="a" label="Обзор">Содержимое</ng-template>
                            <ng-template rtTab="b" label="Участники">Содержимое</ng-template>
                            <ng-template rtTab="c" label="История">Содержимое</ng-template>
                        </rt-tabs>
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="24rem" [items]="edges">
                    <ng-template let-edge>
                        @switch (edge) {
                            @case ('ни одной вкладки') {
                                <rt-tabs />
                            }
                            @case ('одна вкладка') {
                                <rt-tabs activeId="only">
                                    <ng-template rtTab="only" label="Обзор">Содержимое</ng-template>
                                </rt-tabs>
                            }
                            @case ('неизвестный activeId') {
                                <rt-tabs activeId="нет-такой">
                                    <ng-template rtTab="a" label="Обзор">Откат на первую доступную</ng-template>
                                    <ng-template rtTab="b" label="Участники">Содержимое</ng-template>
                                </rt-tabs>
                            }
                            @case ('активная отключена') {
                                <rt-tabs activeId="off">
                                    <ng-template rtTab="off" disabled label="Отключённая">Активной стать не может</ng-template>
                                    <ng-template rtTab="b" label="Участники">Содержимое</ng-template>
                                </rt-tabs>
                            }
                            @case ('вкладок больше ширины') {
                                <rt-tabs activeId="t1">
                                    @for (index of many; track index) {
                                        <ng-template [rtTab]="'t' + index" [label]="'Раздел ' + index">Содержимое</ng-template>
                                    }
                                </rt-tabs>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Вкладки в обоих наборах">
                    <ng-template>
                        <div style="width: 24rem">
                            <rt-tabs activeId="a">
                                <ng-template rtTab="a" label="Обзор" icon="ico-listing">Содержимое</ng-template>
                                <ng-template rtTab="b" label="Участники" [badge]="3">Содержимое</ng-template>
                                <ng-template rtTab="c" disabled label="Отключённая">Содержимое</ng-template>
                            </rt-tabs>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Вкладки в обеих темах">
                    <ng-template>
                        <div style="width: 24rem">
                            <rt-tabs activeId="a">
                                <ng-template rtTab="a" label="Обзор" icon="ico-listing">Содержимое</ng-template>
                                <ng-template rtTab="b" label="Участники" [badge]="3">Содержимое</ng-template>
                                <ng-template rtTab="c" disabled label="Отключённая">Содержимое</ng-template>
                            </rt-tabs>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsComponent,

        // directives
        RtTabDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTabsMatrixComponent {
    public part: TTabsMatrixPart = 'direction';

    public readonly directions: readonly string[] = ['horizontal', 'vertical'];
    public readonly titles: readonly string[] = ['только подпись', 'с иконкой', 'со значком', 'иконка и значок'];
    public readonly stretches: readonly boolean[] = [false, true];
    public readonly edges: readonly string[] = [
        'ни одной вкладки',
        'одна вкладка',
        'неизвестный activeId',
        'активная отключена',
        'вкладок больше ширины',
    ];

    /** Полоса, не влезающая в ширину: показывает стрелки прокрутки по краям. */
    public readonly many: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

    public readonly directionLabel: (value: string) => string = (value: string): string =>
        value === 'horizontal' ? 'горизонтальная' : 'вертикальная';

    public readonly stretchLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'stretch — во всю ширину' : 'по содержимому';
}
