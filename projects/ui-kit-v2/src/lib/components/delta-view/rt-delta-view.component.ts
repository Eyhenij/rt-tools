import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { IQuillDelta, IQuillDeltaAttributes } from '../../util';

const BEM_BLOCK: string = 'rt-delta-view';

/** Inline-атрибут → оборачивающий тег. Порядок задаёт вложенность обёрток. */
const INLINE_TAGS: ReadonlyArray<[keyof IQuillDeltaAttributes, string]> = [
    ['bold', 'strong'],
    ['italic', 'em'],
    ['underline', 'u'],
    ['strike', 's'],
];

/** Одна строка треда: накопленные inline-узлы + атрибуты завершающего перевода строки. */
interface IDeltaLine {
    nodes: Node[];
    attrs?: IQuillDeltaAttributes;
}

/**
 * Безопасный рендер Quill delta: обход ops со сборкой DOM через нативный API
 * (`createElement`/`createTextNode` — текст экранируется автоматически). Никакого
 * `innerHTML`: содержимое `insert` — произвольный пользовательский текст. Блочные
 * атрибуты (list/header/blockquote/code-block) Quill вешает на op перевода строки —
 * накопленный inline-буфер закрывается этим блоком.
 */
@Component({
    selector: 'rt-delta-view',
    template: '',
    styleUrl: './rt-delta-view.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDeltaViewComponent {
    readonly #doc: Document = inject(DOCUMENT);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    public readonly delta: InputSignal<IQuillDelta | null> = input<IQuillDelta | null>(null);

    constructor() {
        effect((): void => {
            const value: IQuillDelta | null = this.delta();
            const host: HTMLElement = this.#host.nativeElement;
            host.textContent = '';
            if (value !== null) {
                host.appendChild(this.#build(value));
            }
        });
    }

    /** Собирает фрагмент из строк delta, группируя подряд идущие list-элементы. */
    #build(delta: IQuillDelta): DocumentFragment {
        const fragment: DocumentFragment = this.#doc.createDocumentFragment();
        let list: HTMLElement | null = null;
        for (const line of this.#splitLines(delta)) {
            const listType: 'ordered' | 'bullet' | undefined = line.attrs?.list;
            if (listType !== undefined) {
                list = this.#appendListItem(fragment, list, line, listType);
                continue;
            }
            list = null;
            fragment.appendChild(this.#blockElement(line));
        }
        return fragment;
    }

    /** Разбивает ops на строки по `\n`: inline-текст копится, `\n` закрывает строку. */
    #splitLines(delta: IQuillDelta): IDeltaLine[] {
        const lines: IDeltaLine[] = [];
        let buffer: Node[] = [];
        for (const op of delta.ops) {
            const parts: string[] = op.insert.split('\n');
            parts.forEach((part: string, index: number): void => {
                if (part.length > 0) {
                    buffer.push(this.#inlineNode(part, op.attributes));
                }
                if (index < parts.length - 1) {
                    lines.push({ nodes: buffer, attrs: op.attributes });
                    buffer = [];
                }
            });
        }
        if (buffer.length > 0) {
            lines.push({ nodes: buffer });
        }
        return lines;
    }

    /** Текстовый узел, обёрнутый в inline-теги по whitelist-атрибутам. */
    #inlineNode(text: string, attrs: IQuillDeltaAttributes | undefined): Node {
        let node: Node = this.#doc.createTextNode(text);
        for (const [attr, tag] of INLINE_TAGS) {
            if (attrs?.[attr] === true) {
                const wrapper: HTMLElement = this.#doc.createElement(tag);
                wrapper.appendChild(node);
                node = wrapper;
            }
        }
        return node;
    }

    /** Блочный элемент строки (header/blockquote/code-block/абзац). */
    #blockElement(line: IDeltaLine): HTMLElement {
        if (line.attrs?.['code-block'] === true) {
            const pre: HTMLElement = this.#doc.createElement('pre');
            const code: HTMLElement = this.#doc.createElement('code');
            this.#fill(code, line.nodes);
            pre.appendChild(code);
            return pre;
        }
        const element: HTMLElement = this.#doc.createElement(this.#blockTag(line.attrs));
        this.#fill(element, line.nodes);
        return element;
    }

    /** Тег блока по whitelist-атрибутам перевода строки. */
    #blockTag(attrs: IQuillDeltaAttributes | undefined): string {
        if (attrs?.header !== undefined) {
            return `h${attrs.header}`;
        }
        if (attrs?.blockquote === true) {
            return 'blockquote';
        }
        return 'p';
    }

    /** Обеспечивает список нужного типа и добавляет в него элемент строки. */
    #appendListItem(
        fragment: DocumentFragment,
        current: HTMLElement | null,
        line: IDeltaLine,
        listType: 'ordered' | 'bullet'
    ): HTMLElement {
        const tag: string = listType === 'ordered' ? 'ol' : 'ul';
        let list: HTMLElement | null = current;
        if (list === null || list.tagName.toLowerCase() !== tag) {
            list = this.#doc.createElement(tag);
            fragment.appendChild(list);
        }
        const item: HTMLElement = this.#doc.createElement('li');
        this.#fill(item, line.nodes);
        list.appendChild(item);
        return list;
    }

    #fill(element: HTMLElement, nodes: Node[]): void {
        for (const node of nodes) {
            element.appendChild(node);
        }
    }
}
