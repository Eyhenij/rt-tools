import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal, TemplateRef, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { ERtSectionSpan } from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../../rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat-section';

let uidSeed: number = 0;

function nextTitleId(): string {
    uidSeed += 1;

    return `${BEM_BLOCK}-title-${uidSeed}`;
}

/** Ячейка, как её рисует шаблон: вид блока и готовая запись модификаторов. */
interface ICell {
    readonly view: IRtAiChat.BlockView;
    readonly mods: Readonly<Record<string, boolean>>;
}

/**
 * Секция ответа `rt-ai-chat`: заголовок по желанию и сетка ячеек. Колонки задаёт ширина самой
 * секции: одна уже 600, две от 600. Что стоит в ячейке, рисует шаблон ленты блоков — секция
 * только раскладывает ячейки и сама блоков не знает.
 */
@Component({
    selector: 'rt-ai-chat-section',
    templateUrl: './rt-ai-chat-section.component.html',
    styleUrl: './rt-ai-chat-section.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[attr.role]': 'role()',
        '[attr.aria-labelledby]': 'labelledBy()',
    },
})
export class RtAiChatSectionComponent {
    /** Свой id заголовка: две секции одного ответа названы каждая своим. */
    protected readonly titleId: string = nextTitleId();

    /** Секция с заголовком — группа, названная им; без заголовка роли нет. */
    protected readonly role: Signal<string | null> = computed((): string | null => (this.title() === null ? null : 'group'));

    protected readonly labelledBy: Signal<string | null> = computed((): string | null => (this.title() === null ? null : this.titleId));

    protected readonly drawn: Signal<readonly ICell[]> = computed((): readonly ICell[] =>
        this.cells().map((cell: IRtAiChat.SectionCell): ICell => ({
            view: cell.view,
            mods: { full: cell.span === ERtSectionSpan.Full, column: cell.span === ERtSectionSpan.Column },
        }))
    );

    /** Заголовок секции, уже обрезанный; `null` — заголовка нет. */
    public readonly title: InputSignal<string | null> = input<string | null>(null);

    /** Ячейки сетки по порядку списка. */
    public readonly cells: InputSignal<readonly IRtAiChat.SectionCell[]> = input.required<readonly IRtAiChat.SectionCell[]>();

    /** Шаблон ленты, который рисует блок в ячейке; в контекст уходит вид блока. */
    public readonly cellTemplate: InputSignal<TemplateRef<IRtAiChat.CellContext>> = input.required<TemplateRef<IRtAiChat.CellContext>>();
}
