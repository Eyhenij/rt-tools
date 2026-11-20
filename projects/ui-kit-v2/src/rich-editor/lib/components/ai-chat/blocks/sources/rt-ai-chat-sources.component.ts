import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import {
    IRtIcon,
    IRtSourceItem,
    IRtSourcesData,
    isKitIconName,
    RT_KIT_LABELS,
    RtExpansionPanelComponent,
    RtExpansionPanelContentDirective,
    RtIconComponent,
    TRtKitLabelMap,
} from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../../rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat-sources';

/** Значок источника, когда имени нет в наборе кита. */
const FALLBACK_ICON: IRtIcon.Name = 'file';

/** Источник, готовый для шаблона: значок из набора кита и номер для связи названия с уточнением. */
interface IRow {
    readonly item: IRtSourceItem;
    readonly icon: IRtIcon.Name;
    readonly titleId: string;
    readonly detailId: string | null;
}

let nextId: number = 0;

/** Свой номер каждому экземпляру: по нему уточнения источников получают несовпадающие id. */
function nextIdBase(): string {
    nextId += 1;

    return `rt-ai-chat-sources-${nextId}`;
}

/**
 * Список источников цифр ответа `rt-ai-chat` на `rt-expansion-panel`: заголовок «Источники» с
 * числом источников и строки под ним. В первый раз список свёрнут; раскрытое или свёрнутое
 * состояние хранит панель. Источник с адресом — кнопка, без адреса — текст. Кит ничего не
 * открывает: нажатие уходит событием `opened`, а адрес открывает приложение.
 */
@Component({
    selector: 'rt-ai-chat-sources',
    templateUrl: './rt-ai-chat-sources.component.html',
    styleUrl: './rt-ai-chat-sources.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtExpansionPanelComponent,
        RtExpansionPanelContentDirective,
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatSourcesComponent {
    readonly #idBase: string = nextIdBase();

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /**
     * Строки списка. Имя значка пишет модель, а `rt-icon` идёт за рисунком по имени: имя, которого
     * в наборе кита нет, заменяется значком `file`, и запроса по чужому имени нет.
     */
    protected readonly rows: Signal<readonly IRow[]> = computed((): readonly IRow[] =>
        this.data().items.map((item: IRtSourceItem, index: number): IRow => ({
            item,
            icon: isKitIconName(item.icon) ? item.icon : FALLBACK_ICON,
            titleId: `${this.#idBase}-title-${index}`,
            detailId: item.detail === null ? null : `${this.#idBase}-detail-${index}`,
        }))
    );

    /** Источники, приведённые к виду для рисования. */
    public readonly data: InputSignal<IRtSourcesData> = input.required<IRtSourcesData>();

    /** Нажат источник с адресом: что открыть и как он называется. */
    public readonly opened: OutputEmitterRef<IRtAiChat.SourcePress> = output<IRtAiChat.SourcePress>();

    protected onOpen(item: IRtSourceItem): void {
        if (item.url !== null) {
            this.opened.emit({ url: item.url, title: item.title });
        }
    }
}
