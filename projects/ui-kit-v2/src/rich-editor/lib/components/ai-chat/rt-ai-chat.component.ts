import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    booleanAttribute,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import {
    IRtIcon,
    IRtSideMenu,
    IRtThreadList,
    RT_KIT_LABELS,
    RtButtonDirective,
    RtCopyValueComponent,
    RtEmptyStateComponent,
    RtIconButtonComponent,
    RtIconComponent,
    RtMessageComponent,
    RtPromptSuggestionComponent,
    RtSpinnerComponent,
    RtThreadListComponent,
    RtThreadListRowActionsDirective,
    RtThreadListRowDirective,
    splitSideMenuTitle,
    TRtKitLabelMap,
} from '@rt-tools/ui-kit-v2';

import { nextAtBottom, RT_CHAT_PIN_RETRY_DELAYS_MS } from '../chat/rt-chat-thread.logic';
import { IRtMessageComposer } from '../message-composer/rt-message-composer.model';
import { RtMessageComposerComponent } from '../message-composer/rt-message-composer.component';
import { RtAiChatAnswerComponent } from './answer/rt-ai-chat-answer.component';
import { RtAiChatMessageExtraDirective } from './rt-ai-chat.directives';
import { IRtAiChat } from './rt-ai-chat.model';

const BEM_BLOCK: string = 'rt-ai-chat';

/** Значки строк-превью пустого списка бесед по умолчанию: беседы идут с ассистентом. */
const PREVIEW_ICONS: readonly IRtIcon.Name[] = ['sparkle', 'bot', 'sparkle'];

/** Строка беседы для списка бесед: `rt-thread-list` ждёт `id` и `hasUnread`. */
interface IThreadRow extends IRtThreadList.Row {
    readonly id: string;
    readonly hasUnread: boolean;
    readonly title: string;
    readonly titleParts: readonly IRtSideMenu.TitlePart[];
    readonly time: string;
    readonly unreadCount: number;
}

/**
 * Панель ИИ-ассистента одним компонентом: шапка с действиями, лента вопросов и ответов с ходом
 * работы, пустой экран с подсказками, ошибка с номером обращения, поле сообщения и подпись под
 * ним; по кнопке «Conversations» — список бесед.
 *
 * Компонент презентационный: сообщения, ход работы, беседы и ошибка приходят входами, действия
 * уходят выходами. Вложения ответа — графики и прочее — приложение отдаёт шаблоном
 * `rtAiChatMessageExtra`.
 */
@Component({
    selector: 'rt-ai-chat',
    templateUrl: './rt-ai-chat.component.html',
    styleUrl: './rt-ai-chat.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtAiChatAnswerComponent,
        RtButtonDirective,
        RtCopyValueComponent,
        RtEmptyStateComponent,
        RtIconButtonComponent,
        RtIconComponent,
        RtMessageComponent,
        RtMessageComposerComponent,
        RtPromptSuggestionComponent,
        RtSpinnerComponent,
        RtThreadListComponent,
        RtThreadListRowActionsDirective,
        RtThreadListRowDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatComponent {
    #atBottom: boolean = true;
    #lastScrollTop: number = 0;
    #forceScroll: boolean = false;

    readonly #injector: Injector = inject(Injector);

    protected readonly composer: Signal<RtMessageComposerComponent | undefined> = viewChild(RtMessageComposerComponent);
    protected readonly backButton: Signal<ElementRef<HTMLElement> | undefined> = viewChild('back', { read: ElementRef });
    protected readonly feed: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('feed');

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly extraTemplate: Signal<RtAiChatMessageExtraDirective | undefined> = contentChild(RtAiChatMessageExtraDirective);

    /** Ответы, у которых человек раскрыл шаги. */
    protected readonly openRuns: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(new Set<string>());

    protected readonly titleText: Signal<string> = computed((): string => this.title() || this.t().aiTitle);
    protected readonly emptyTitleText: Signal<string> = computed((): string => this.emptyTitle() || this.t().aiEmptyTitle);
    protected readonly emptyDescriptionText: Signal<string> = computed((): string => this.emptyDescription() || this.t().aiEmptyText);
    protected readonly disclaimerText: Signal<string> = computed((): string => this.disclaimer() ?? this.t().aiDisclaimer);

    protected readonly hasThreads: Signal<boolean> = computed((): boolean => this.threads() !== null);

    /** Список бесед стоит колонкой слева: на весь экран, когда беседы есть. */
    protected readonly isThreadColumn: Signal<boolean> = computed((): boolean => this.fullScreen() && this.hasThreads());

    /** Список бесед стоит на месте ленты: в узкой панели по кнопке «Conversations». */
    protected readonly isThreadPage: Signal<boolean> = computed(
        (): boolean => this.threadsOpen() && this.hasThreads() && !this.isThreadColumn()
    );

    protected readonly isEmpty: Signal<boolean> = computed(
        (): boolean => !this.loading() && !this.messages().length && this.error() === null
    );

    /** Строка поиска по беседам: подсвечивает совпадения и меняет подпись пустого списка. */
    protected readonly threadQuery: WritableSignal<string> = signal<string>('');

    protected readonly threadRows: Signal<readonly IThreadRow[]> = computed((): readonly IThreadRow[] => {
        const query: string = this.threadQuery();

        return (this.threads() ?? []).map((thread: IRtAiChat.Thread): IThreadRow => ({
            id: thread.id,
            hasUnread: (thread.unreadCount ?? 0) > 0,
            title: thread.title,
            titleParts: splitSideMenuTitle(thread.title, query),
            time: thread.time ?? '',
            unreadCount: thread.unreadCount ?? 0,
        }));
    });

    /** Пустой список: без поиска — «бесед нет», с поиском — подпись списка «ничего не найдено». */
    protected readonly threadsEmptyText: Signal<string> = computed((): string => (this.threadQuery() ? '' : this.t().aiNoThreads));

    /** Заголовок беседы над лентой; пусто — строки нет. */
    public readonly title: InputSignal<string> = input<string>('');

    /** Вторая строка шапки — обычно название беседы. Пусто — не рисуется. */
    public readonly subtitle: InputSignal<string> = input<string>('');

    public readonly messages: InputSignal<readonly IRtAiChat.Message[]> = input<readonly IRtAiChat.Message[]>([]);

    /** Готовые вопросы пустого экрана. */
    public readonly suggestions: InputSignal<readonly string[]> = input<readonly string[]>([]);

    public readonly emptyTitle: InputSignal<string> = input<string>('');

    public readonly emptyDescription: InputSignal<string> = input<string>('');

    /** Подсказка в поле сообщения; пусто — подпись поля кита. */
    public readonly placeholder: InputSignal<string> = input<string>('');

    /** Подпись под полем сообщения; `null` — подпись кита, пустая строка — без подписи. */
    public readonly disclaimer: InputSignal<string | null> = input<string | null>(null);

    /** Ответ пишется: поле сообщения в режиме остановки, подсказки и новая беседа выключены. */
    public readonly sending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Беседа загружается: крутилка, пока сообщений нет. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly error: InputSignal<IRtAiChat.RunError | null> = input<IRtAiChat.RunError | null>(null);

    /** Беседы; `null` — кнопки «Conversations» нет. */
    public readonly threads: InputSignal<readonly IRtAiChat.Thread[] | null> = input<readonly IRtAiChat.Thread[] | null>(null);

    public readonly activeThreadId: InputSignal<string | null> = input<string | null>(null);

    public readonly threadsLoading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly threadsFetching: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly threadsHasMore: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Значки декоративных строк-превью пустого списка бесед, по строке на значок. */
    public readonly emptyPreviewIcons: InputSignal<readonly IRtIcon.Name[]> = input<readonly IRtIcon.Name[]>(PREVIEW_ICONS);

    /** Кнопка «Full screen» в шапке. */
    public readonly fullScreenable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Кнопка закрытия в шапке. */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Черновик в поле сообщения. */
    public readonly draft: ModelSignal<string> = model<string>('');

    /** Список бесед открыт на месте ленты. */
    public readonly threadsOpen: ModelSignal<boolean> = model<boolean>(false);

    public readonly fullScreen: ModelSignal<boolean> = model<boolean>(false);

    /** Вопрос ушёл: набранный или выбранная подсказка. */
    public readonly send: OutputEmitterRef<string> = output<string>();

    public readonly stop: OutputEmitterRef<void> = output<void>();

    public readonly retry: OutputEmitterRef<void> = output<void>();

    public readonly newThread: OutputEmitterRef<void> = output<void>();

    public readonly closed: OutputEmitterRef<void> = output<void>();

    public readonly selectThread: OutputEmitterRef<string> = output<string>();

    public readonly deleteThread: OutputEmitterRef<string> = output<string>();

    public readonly searchThreads: OutputEmitterRef<string> = output<string>();

    public readonly loadMoreThreads: OutputEmitterRef<void> = output<void>();

    public readonly feedbackChange: OutputEmitterRef<IRtAiChat.FeedbackChange> = output<IRtAiChat.FeedbackChange>();

    constructor() {
        afterRenderEffect((): void => {
            this.messages();
            this.error();
            this.loading();
            this.isThreadPage();
            const el: HTMLElement | undefined = this.feed()?.nativeElement;
            if (el === undefined) {
                return;
            }
            if (this.#forceScroll || this.#atBottom) {
                el.scrollTop = el.scrollHeight;
                this.#atBottom = true;
                this.#pinToBottomDeferred();
            }
            this.#forceScroll = false;
        });
    }

    /** Фокус в поле сообщения после отрисовки: приложению — после своих действий вне панели. */
    public focusComposer(): void {
        afterNextRender((): void => this.composer()?.focus(), { injector: this.#injector });
    }

    protected onFeedScroll(): void {
        const el: HTMLElement | undefined = this.feed()?.nativeElement;
        if (el === undefined) {
            return;
        }
        this.#atBottom = nextAtBottom(this.#atBottom, this.#lastScrollTop, el);
        this.#lastScrollTop = el.scrollTop;
    }

    protected onSubmitted(value: IRtMessageComposer.SubmitPayload): void {
        const text: string = value.text.trim();
        if (!text) {
            return;
        }
        this.#forceScroll = true;
        this.send.emit(text);
    }

    protected onSuggestion(text: string): void {
        this.#forceScroll = true;
        this.send.emit(text);
    }

    protected onToggleRun(messageId: string, open: boolean): void {
        this.openRuns.update((ids: ReadonlySet<string>): ReadonlySet<string> => {
            const next: Set<string> = new Set<string>(ids);
            if (open) {
                next.add(messageId);
            } else {
                next.delete(messageId);
            }
            return next;
        });
    }

    protected onFeedback(message: IRtAiChat.Message, feedback: Exclude<IRtAiChat.Feedback, null>): void {
        this.feedbackChange.emit({ messageId: message.id, feedback: message.feedback === feedback ? null : feedback });
    }

    protected onToggleThreads(): void {
        this.threadsOpen.set(!this.threadsOpen());

        if (this.threadsOpen()) {
            afterNextRender((): void => this.backButton()?.nativeElement.querySelector('button')?.focus(), { injector: this.#injector });
        } else {
            this.focusComposer();
        }
    }

    protected onNewThread(): void {
        this.newThread.emit();
        this.focusComposer();
    }

    protected onStop(): void {
        this.stop.emit();
        this.focusComposer();
    }

    protected onToggleFullScreen(): void {
        this.fullScreen.set(!this.fullScreen());
    }

    protected onSearchThreads(query: string): void {
        this.threadQuery.set(query);
        this.searchThreads.emit(query);
    }

    protected onSelectThread(id: IRtThreadList.TRowId): void {
        this.threadsOpen.set(false);
        this.#forceScroll = true;
        this.selectThread.emit(String(id));
        this.focusComposer();
    }

    #pinToBottomDeferred(): void {
        for (const delay of RT_CHAT_PIN_RETRY_DELAYS_MS) {
            setTimeout((): void => {
                const el: HTMLElement | undefined = this.feed()?.nativeElement;
                if (el !== undefined && this.#atBottom) {
                    el.scrollTop = el.scrollHeight;
                }
            }, delay);
        }
    }
}
