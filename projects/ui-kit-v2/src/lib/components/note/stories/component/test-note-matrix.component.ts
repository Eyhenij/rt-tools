import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtNoteComponent } from '../../rt-note.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type NoteMatrixPart = 'content' | 'width' | 'edges' | 'themes';

/**
 * Матрицы состояний `rt-note` для витрины.
 *
 * Входов у заметки нет вовсе, поэтому осью служит содержимое и ширина места: от них зависит
 * всё, что у заметки видно.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-note-matrix',
    template: `
        @switch (part) {
            @case ('content') {
                <app-story-row caption="Чем наполнена" slotWidth="24rem" [items]="contents" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        @switch (item.kind) {
                            @case ('plain') {
                                <rt-note>Тариф меняется со следующего месяца.</rt-note>
                            }
                            @case ('multiline') {
                                <rt-note>
                                    Тариф меняется со следующего месяца. Пересчёт пройдёт первого числа, и в счёте появится отдельная строка
                                    с разницей.
                                </rt-note>
                            }
                            @case ('markup') {
                                <rt-note>
                                    Договор действует до
                                    <strong>14 марта 2027</strong>
                                    года.
                                </rt-note>
                            }
                            @case ('link') {
                                <rt-note>
                                    Условия описаны в
                                    <a href="https://example.org/terms" target="_blank" rel="noopener">регламенте</a>
                                    .
                                </rt-note>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('width') {
                <app-story-row caption="Ширина места" [items]="widths" [itemLabel]="widthLabel">
                    <ng-template let-width>
                        <div [style.inline-size]="width">
                            <rt-note>Пересчёт пройдёт первого числа следующего месяца.</rt-note>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="18rem" [items]="edges" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        @switch (item.kind) {
                            @case ('empty') {
                                <rt-note />
                            }
                            @case ('long-word') {
                                <rt-note>Реквизиты: 40702810900000012345678901234567890</rt-note>
                            }
                            @case ('long-text') {
                                <rt-note>
                                    Дополнительное соглашение номер четыре к договору от 14 марта 2024 года вступает в силу с момента
                                    подписания обеими сторонами и действует до конца календарного года.
                                </rt-note>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Заметка в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-note>
                                Договор действует до
                                <strong>14 марта 2027</strong>
                                года.
                            </rt-note>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNoteComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtNoteMatrixComponent {
    public part: NoteMatrixPart = 'content';

    public readonly contents: readonly { name: string; kind: string }[] = [
        { name: 'одна строка', kind: 'plain' },
        { name: 'несколько строк', kind: 'multiline' },
        { name: 'с выделением', kind: 'markup' },
        { name: 'со ссылкой', kind: 'link' },
    ];

    public readonly widths: readonly string[] = ['12rem', '20rem', '32rem'];

    public readonly edges: readonly { name: string; kind: string }[] = [
        { name: 'пустая — подложка остаётся', kind: 'empty' },
        { name: 'длинное число', kind: 'long-word' },
        { name: 'длинный текст', kind: 'long-text' },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly widthLabel: (value: string) => string = (value: string): string => value;
}
