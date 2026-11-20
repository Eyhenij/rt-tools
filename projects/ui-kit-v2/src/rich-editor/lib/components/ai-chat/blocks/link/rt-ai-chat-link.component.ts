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

/** Что карточка объявила читалке и при каком исходе. */
interface IAnnounced {
    readonly state: ERtLinkState | null;
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

    /** Имя значка карточки: имени, которого в наборе кита нет, значок не рисует. */
    protected readonly icon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => this.data().icon as IRtIcon.Name);

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
     * пришла, человек читает вместе с ответом. Объявляется только смена исхода.
     */
    protected readonly announced: WritableSignal<IAnnounced> = linkedSignal<IRtLinkData, IAnnounced>({
        source: (): IRtLinkData => this.data(),
        computation: (data: IRtLinkData, previous?: { readonly value: IAnnounced }): IAnnounced => {
            if (previous === undefined || previous.value.state === data.state) {
                return { state: data.state, text: previous?.value.text ?? '' };
            }

            return { state: data.state, text: this.#announcement(data) };
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
    #announcement(data: IRtLinkData): string {
        if (data.state === null) {
            return '';
        }
        const text: string = `${data.title}: ${this.t()[STATUS_LOOK[data.state].label]}`;

        return data.reason === null ? text : `${text}. ${data.reason}`;
    }
}
