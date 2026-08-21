import { NgTemplateOutlet } from '@angular/common';
import { computed, input, ChangeDetectionStrategy, Component, InputSignal, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { parseMarkdown } from '../../util/markdown-parse';
import { ERtMarkdownBlock, ERtMarkdownInline, IRtMarkdownBlockNode } from '../../util/markdown.model';

const BEM_BLOCK: string = 'rt-markdown-text';

/**
 * Текст, написанный разметкой, показанный узлами.
 *
 * Перечень разметки зашит в разборщике и входом не задаётся: вход у компонента один — сам
 * текст. Настраивать нечего, значит нечем и ослабить.
 *
 * Присланная строка в страницу не отдаётся ни разу: компонент рисует дерево узлов, которое
 * вернул разбор, и другого пути у текста внутрь страницы нет. Поэтому сырой HTML, картинки и
 * адреса чужих схем показываются видимым текстом — узла для них разборщик не строит.
 *
 * Таблица рисуется своей разметкой, а не таблицей кита: та объявляет колонки заранее
 * директивами, а число столбцов здесь приходит из текста и заранее не известно никому.
 */
@Component({
    selector: 'rt-markdown-text',
    templateUrl: './rt-markdown-text.component.html',
    styleUrl: './rt-markdown-text.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        NgTemplateOutlet,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtMarkdownTextComponent {
    /** Роды блоков в шаблоне: сравнение идёт со значением перечисления, а не со строкой. */
    protected readonly blockKind: typeof ERtMarkdownBlock = ERtMarkdownBlock;

    /** Роды кусков строки в шаблоне. */
    protected readonly inlineKind: typeof ERtMarkdownInline = ERtMarkdownInline;

    protected readonly blocks: Signal<readonly IRtMarkdownBlockNode[]> = computed((): readonly IRtMarkdownBlockNode[] =>
        parseMarkdown(this.text())
    );

    public readonly text: InputSignal<string | null> = input.required<string | null>();
}
