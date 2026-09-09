import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtAsideSectionComponent } from '../../rt-aside-section.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAsideSectionMatrixPart = 'heading' | 'content' | 'stack' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-aside-section` для витрины.
 *
 * Вход у раздела один — заголовок, — и ось у него двоичная: он либо есть, либо его нет и
 * заголовок не рисуется вовсе. Всё остальное приходит проекцией, поэтому ряды показывают, чем
 * раздел наполнен и как несколько разделов стоят друг под другом: расстояние между ними — это
 * то, ради чего компонент и заведён.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-aside-section-matrix',
    template: `
        @switch (part) {
            @case ('heading') {
                <app-story-row caption="Заголовок" slotWidth="18rem" [items]="headings" [itemLabel]="headingLabel">
                    <ng-template let-value>
                        <rt-aside-section [heading]="value">Договор №2024-118 от 14 марта</rt-aside-section>
                    </ng-template>
                </app-story-row>
            }

            @case ('content') {
                <app-story-row caption="Чем наполнен" slotWidth="18rem" [items]="contents">
                    <ng-template let-content>
                        @switch (content) {
                            @case ('строка') {
                                <rt-aside-section heading="Договор">№2024-118</rt-aside-section>
                            }
                            @case ('несколько абзацев') {
                                <rt-aside-section heading="Условия">
                                    <p>Продление автоматическое.</p>
                                    <p>Отказ — за тридцать дней до конца срока.</p>
                                </rt-aside-section>
                            }
                            @case ('пусто') {
                                <rt-aside-section heading="Комментарий" />
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('stack') {
                <div style="width: 18rem">
                    <rt-aside-section heading="Договор">№2024-118</rt-aside-section>
                    <rt-aside-section heading="Стороны">ООО «Ромашка» и ИП Иванов</rt-aside-section>
                    <rt-aside-section>Раздел без заголовка идёт тем же отступом</rt-aside-section>
                </div>
            }

            @case ('presets') {
                <app-story-presets caption="Раздел в обоих наборах">
                    <ng-template>
                        <div style="width: 18rem">
                            <rt-aside-section heading="Договор">№2024-118 от 14 марта</rt-aside-section>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Раздел в обеих темах">
                    <ng-template>
                        <div style="width: 18rem">
                            <rt-aside-section heading="Договор">№2024-118 от 14 марта</rt-aside-section>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideSectionComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideSectionMatrixComponent {
    public part: TAsideSectionMatrixPart = 'heading';

    public readonly headings: readonly (string | null)[] = [null, 'Договор', 'Условия продления и расторжения'];
    public readonly contents: readonly string[] = ['строка', 'несколько абзацев', 'пусто'];

    public readonly headingLabel: (value: string | null) => string = (value: string | null): string => {
        if (value === null) {
            return 'без заголовка';
        }

        return value.length > 12 ? 'длинный заголовок' : 'короткий заголовок';
    };
}
