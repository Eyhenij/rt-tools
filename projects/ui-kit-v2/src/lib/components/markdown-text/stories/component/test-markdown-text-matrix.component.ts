import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtMarkdownTextComponent } from '../../rt-markdown-text.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TMarkdownTextMatrixPart = 'blocks' | 'inline' | 'outside' | 'edges' | 'presets' | 'themes';

/** Случай показа: имя для подписи ячейки и текст, который в неё кладут. */
interface IMarkdownCase {
    readonly name: string;
    readonly text: string;
}

const TABLE: string = '| Что | Где |\n| --- | --- |\n| разбор | дерево |\n| груз | приём |';

const CODE: string = '```bash\nnpm run check:all\n```';

const LONG_CODE: string = '```\ndocker compose -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate\n```';

/**
 * Матрицы состояний `rt-markdown-text` для витрины.
 *
 * Ось у компонента одна и она же его предмет — род разметки, — поэтому матриц три: перечень
 * блоков, перечень кусков строки и то, чего в перечне нет. Третья показывает обещание
 * компонента с обратной стороны: сырой HTML, картинка и ссылка чужой схемы видны текстом, и
 * узла для них на странице не появляется вовсе.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-markdown-text-matrix',
    template: `
        @switch (part) {
            @case ('blocks') {
                <app-story-row caption="Блоки разметки" slotWidth="20rem" [items]="blocks" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-markdown-text [text]="item.text" />
                    </ng-template>
                </app-story-row>
            }

            @case ('inline') {
                <app-story-row caption="Разметка внутри строки" slotWidth="20rem" [items]="inlines" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-markdown-text [text]="item.text" />
                    </ng-template>
                </app-story-row>
            }

            @case ('outside') {
                <app-story-row
                    caption="Того, чего в перечне нет, видно текстом"
                    slotWidth="20rem"
                    [items]="outside"
                    [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-markdown-text [text]="item.text" />
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="20rem" [items]="edges" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-markdown-text [text]="item.text" />
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Разметка в обоих наборах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-markdown-text [text]="wholeText" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Разметка в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-markdown-text [text]="wholeText" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMarkdownTextComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMarkdownTextMatrixComponent {
    public part: TMarkdownTextMatrixPart = 'blocks';

    public readonly wholeText: string =
        '# Разбор происшествия\n\nПервый абзац с **жирным** и [ссылкой](https://example.test).\n\n' +
        `- первый пункт\n- второй пункт\n\n${TABLE}\n\n${CODE}`;

    public readonly blocks: readonly IMarkdownCase[] = [
        { name: 'заголовки трёх уровней', text: '# Первый\n\n## Второй\n\n### Третий' },
        { name: 'абзацы и переносы', text: 'Дано разбор приехал\nКогда владелец открыл\n\nВторой абзац.' },
        { name: 'списки', text: '- первое\n- второе\n  - вложенное\n\n1. шаг\n2. другой шаг' },
        { name: 'цитата', text: '> Слово владельца о том, как показывать текст.' },
        { name: 'таблица', text: TABLE },
        { name: 'блок кода', text: CODE },
    ];

    public readonly inlines: readonly IMarkdownCase[] = [
        { name: 'жирный и курсив', text: 'Стоит **жирно**, а рядом *косо* и ещё _так же косо_.' },
        { name: 'зачёркнутый', text: 'Решение ~~отменено~~ и заменено новым.' },
        { name: 'код строкой', text: 'Зовётся `pnpm run check:specs` и отвечает сводкой.' },
        { name: 'ссылка наружу', text: 'См. [разбор происшествия](https://example.test/one) целиком.' },
        { name: 'почтовый адрес', text: 'Писать на [почту](mailto:owner@example.test).' },
    ];

    public readonly outside: readonly IMarkdownCase[] = [
        { name: 'строка скрипта', text: '<script>window.ran = true;</script>' },
        { name: 'парный тег', text: '<b>жирным это не становится</b>' },
        { name: 'картинка', text: '![подпись](https://example.test/one.png)' },
        { name: 'ссылка чужой схемы', text: '[нажми](javascript:alert)' },
        { name: 'непарный знак', text: 'ставка **пять процентов' },
    ];

    public readonly edges: readonly IMarkdownCase[] = [
        { name: 'текст без разметки', text: 'Правило списка не называет, чем меряется пустота по отбору.' },
        { name: 'пустой текст', text: '   ' },
        { name: 'длинная строка кода', text: LONG_CODE },
        { name: 'таблица шире колонки', text: TABLE.replace('| Что | Где |', '| Что именно приехало | Где это лежит |') },
    ];

    public readonly caseLabel: (value: IMarkdownCase) => string = (value: IMarkdownCase): string => value.name;
}
