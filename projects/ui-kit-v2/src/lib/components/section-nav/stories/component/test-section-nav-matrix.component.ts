import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtSectionNavComponent } from '../../rt-section-nav.component';
import { IRtSectionNav } from '../../rt-section-nav.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type SectionNavMatrixPart = 'active' | 'length' | 'states' | 'edges' | 'themes';

/** Случай набора плиток: имя для подписи ячейки и сам набор. */
interface ISectionNavCase {
    readonly name: string;
    readonly items: readonly IRtSectionNav.Item[];
}

const ITEMS: readonly IRtSectionNav.Item[] = [
    { id: 'overview', icon: 'ico-listing', label: 'Обзор', active: true },
    { id: 'members', icon: 'ico-users', label: 'Участники', active: false },
    { id: 'settings', icon: 'ico-settings', label: 'Настройки', active: false },
];

/**
 * Матрицы состояний `rt-section-nav` для витрины.
 *
 * Своя ось у компонента одна — активность плитки, — и приходит она снаружи, в самом наборе:
 * компонент состояния не держит. Поэтому ряды сложены из случаев: где стоит подсветка, сколько
 * плиток в наборе, что бывает на краях.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-section-nav-matrix',
    template: `
        @switch (part) {
            @case ('active') {
                <app-story-row caption="Где стоит подсветка" slotWidth="18rem" [items]="actives" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-section-nav [items]="item.items" />
                    </ng-template>
                </app-story-row>
            }

            @case ('length') {
                <app-story-row caption="Длина набора" slotWidth="18rem" [items]="lengths" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-section-nav [items]="item.items" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" slotWidth="18rem" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-section-nav [items]="itemsPlain" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="18rem" [items]="edges" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-section-nav [items]="item.items" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Навигация в обеих темах">
                    <ng-template>
                        <div style="width: 18rem">
                            <rt-section-nav [items]="items" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSectionNavComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSectionNavMatrixComponent {
    public part: SectionNavMatrixPart = 'active';

    public readonly items: readonly IRtSectionNav.Item[] = ITEMS;

    /** Набор без подсветки: на нём показываются состояния указателя, чтобы активная не мешала. */
    public readonly itemsPlain: readonly IRtSectionNav.Item[] = ITEMS.map((item: IRtSectionNav.Item): IRtSectionNav.Item => ({
        ...item,
        active: false,
    }));

    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Активность приходит снаружи: нажатие только просит открыть раздел, подсветку двигает новый набор. */
    public readonly actives: readonly ISectionNavCase[] = [
        { name: 'первая плитка', items: ITEMS },
        {
            name: 'средняя плитка',
            items: ITEMS.map((item: IRtSectionNav.Item, index: number): IRtSectionNav.Item => ({ ...item, active: index === 1 })),
        },
        { name: 'ни одной активной', items: ITEMS.map((item: IRtSectionNav.Item): IRtSectionNav.Item => ({ ...item, active: false })) },
    ];

    public readonly lengths: readonly ISectionNavCase[] = [
        { name: 'одна плитка', items: ITEMS.slice(0, 1) },
        { name: 'три плитки', items: ITEMS },
        {
            name: 'пять плиток',
            items: [
                ...ITEMS,
                { id: 'billing', icon: 'wallet', label: 'Оплата', active: false },
                { id: 'logs', icon: 'list', label: 'Журнал', active: false },
            ],
        },
    ];

    public readonly edges: readonly ISectionNavCase[] = [
        { name: 'пустой набор', items: [] },
        {
            name: 'длинная подпись',
            items: [{ id: 'long', icon: 'ico-settings', label: 'Настройки уведомлений и рассылок', active: true }],
        },
    ];

    public readonly caseLabel: (value: ISectionNavCase) => string = (value: ISectionNavCase): string => value.name;
}
