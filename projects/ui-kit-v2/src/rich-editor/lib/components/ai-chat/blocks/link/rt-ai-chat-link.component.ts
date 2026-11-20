import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    linkedSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import {
    ERtLinkState,
    IRtIcon,
    IRtLinkData,
    IRtTag,
    isKitIconName,
    RT_KIT_LABELS,
    RtButtonDirective,
    RtIconComponent,
    RtTagComponent,
    TRtKitLabelKey,
    TRtKitLabelMap,
} from '@rt-tools/ui-kit-v2';

import { IRtAiChat } from '../../rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat-link';

/** Чем метка статуса рисует исход открытия. */
interface IStatusLook {
    readonly severity: IRtTag.Severity;
    readonly icon: IRtIcon.Name;
    readonly label: TRtKitLabelKey;
    readonly spin: boolean;
}

/** Вид метки по исходу; полная запись, чтобы новый исход не остался без вида. */
const STATUS_LOOK: Readonly<Record<ERtLinkState, IStatusLook>> = {
    [ERtLinkState.Pending]: { severity: 'neutral', icon: 'spinner', label: 'aiLinkOpening', spin: true },
    [ERtLinkState.Opened]: { severity: 'success', icon: 'check', label: 'aiLinkOpened', spin: false },
    [ERtLinkState.Failed]: { severity: 'danger', icon: 'exclamation-circle', label: 'aiLinkFailed', spin: false },
};

/** Метка статуса, готовая для шаблона. */
interface IStatus {
    readonly severity: IRtTag.Severity;
    readonly icon: IRtIcon.Name;
    readonly label: string;
    readonly spin: boolean;
}

/** Значок карточки, когда имени нет в наборе кита. */
const FALLBACK_ICON: IRtIcon.Name = 'link';

/** Что карточка объявила читалке: о какой странице, при каком исходе и с какой причиной. */
interface IAnnounced {
    readonly url: string;
    readonly state: ERtLinkState | null;
    readonly reason: string | null;
    readonly text: string;
}

/**
 * Карточка страницы в ответе `rt-ai-chat`: значок, название, раздел, метка исхода открытия и две
 * кнопки. Кит никуда не переходит: нажатие уходит событием `opened`, а переход делает приложение.
 * Пока страница открывается, кнопки недоступны, но фокус не теряют. Смену исхода уже нарисованной
 * карточки объявляет скрытая строка: лента чата — живая область, и новый текст в ней читается.
 */
@Component({
    selector: 'rt-ai-chat-link',
    templateUrl: './rt-ai-chat-link.component.html',
    styleUrl: './rt-ai-chat-link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtIconComponent,
        RtTagComponent,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'group',
        '[attr.aria-label]': 'data().title',
    },
})
export class RtAiChatLinkComponent {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /**
     * Имя значка карточки. Имя пишет модель, а `rt-icon` идёт за рисунком по имени: имя, которого
     * в наборе кита нет, заменяется значком `link`, и запроса по чужому имени нет.
     */
    protected readonly icon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => {
        const name: string = this.data().icon;

        return isKitIconName(name) ? name : FALLBACK_ICON;
    });

    /** Причина отказа: рисуется только при отказе, что бы ни пришло во входе. */
    protected readonly reason: Signal<string | null> = computed((): string | null =>
        this.data().state === ERtLinkState.Failed ? this.data().reason : null
    );

    /** Метка исхода; без названного исхода её нет. */
    protected readonly status: Signal<IStatus | null> = computed((): IStatus | null => {
        const state: ERtLinkState | null = this.data().state;

        if (state === null) {
            return null;
        }
        const look: IStatusLook = STATUS_LOOK[state];

        return { severity: look.severity, icon: look.icon, spin: look.spin, label: this.t()[look.label] };
    });

    /** Страница открывается: кнопки недоступны и нажатий не отдают. */
    protected readonly pending: Signal<boolean> = computed((): boolean => this.data().state === ERtLinkState.Pending);

    /**
     * Что объявлено читалке. Первая отрисовка ничего не объявляет: исход, с которым карточка
     * пришла, человек читает вместе с ответом. Объявляется смена исхода или причины той же
     * страницы. Лента держит карточки по месту, поэтому другой адрес на том же месте — другая
     * карточка, и она начинает с молчания.
     */
    protected readonly announced: WritableSignal<IAnnounced> = linkedSignal<IRtLinkData, IAnnounced>({
        source: (): IRtLinkData => this.data(),
        computation: (data: IRtLinkData, previous?: { readonly value: IAnnounced }): IAnnounced => {
            const reason: string | null = data.state === ERtLinkState.Failed ? data.reason : null;
            const silent: IAnnounced = { reason, url: data.url, state: data.state, text: '' };

            if (previous === undefined || previous.value.url !== data.url) {
                return silent;
            }
            if (previous.value.state === data.state && previous.value.reason === reason) {
                return { ...silent, text: previous.value.text };
            }

            return { ...silent, text: this.#announcement(data, reason) };
        },
    });

    /** Карточка, приведённая к виду для рисования. */
    public readonly data: InputSignal<IRtLinkData> = input.required<IRtLinkData>();

    /** Нажатие кнопки карточки: адрес и нужна ли новая вкладка. В ожидании не срабатывает. */
    public readonly opened: OutputEmitterRef<IRtAiChat.LinkPress> = output<IRtAiChat.LinkPress>();

    protected onOpen(newTab: boolean): void {
        if (this.pending()) {
            return;
        }

        this.opened.emit({ newTab, url: this.data().url });
    }

    /** «Название: исход», у отказа — с причиной; карточка без исхода ничего не объявляет. */
    #announcement(data: IRtLinkData, reason: string | null): string {
        if (data.state === null) {
            return '';
        }
        const text: string = `${data.title}: ${this.t()[STATUS_LOOK[data.state].label]}`;

        return reason === null ? text : `${text}. ${reason}`;
    }
}
