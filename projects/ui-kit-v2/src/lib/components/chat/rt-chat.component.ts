import { BooleanInput } from '@angular/cdk/coercion';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DatePipe } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { translateSignal, TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtChatStatusLabelPipe } from '../../pipes/rt-chat-status-label.pipe';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtConfirmDirective } from '../confirm-popover/rt-confirm.directive';
import { RtDeltaViewComponent } from '../delta-view/rt-delta-view.component';
import { RtFileCardComponent } from '../file-card/rt-file-card.component';
import { RtFileDropComponent } from '../file-drop/rt-file-drop.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtMessageComposerComponent } from '../message-composer/rt-message-composer.component';
import { IRtMessageComposer } from '../message-composer/rt-message-composer.model';
import { RtNoteComponent } from '../note/rt-note.component';
import { IRtRichEditorToolbar } from '../rich-editor/rt-rich-editor.component';
import { RtSkeletonWrapperComponent } from '../skeleton-wrapper/rt-skeleton-wrapper.component';
import { RtSpinnerComponent } from '../spinner/rt-spinner.component';
import { RtToolbarComponent, RtToolbarLeftDirective, RtToolbarRightDirective } from '../toolbar/rt-toolbar.component';
import { ERtChatMessageStatus, IRtChat } from './rt-chat.model';

const BEM_BLOCK: string = 'rt-chat';

/** Ключ заглушки имени вложения, когда домен не отдал `fileName` (только URL). */
const ATTACHMENT_FALLBACK_KEY: string = 'rtKit.chatAttachmentFallback';

/** Зазор от низа треда, в пределах которого считаем пользователя «у нижнего края». */
const NEAR_BOTTOM_THRESHOLD_PX: number = 64;

/**
 * Задержки (мс) серии повторных пинов к низу после первичной прокрутки. Rich-контент
 * (`rt-delta-view`, код-блоки) дорисовывается несколькими render-пассами уже после
 * того, как afterRenderEffect выставил scrollTop по промежуточной высоте, — набор
 * тиков покрывает окно, за которое высота устаканивается.
 */
const PIN_RETRY_DELAYS_MS: readonly number[] = [50, 150, 300, 500, 800];

/**
 * Общий презентационный чат: тред сообщений + композер. Никакого data-access/api —
 * история приходит готовым массивом `IRtChat.Message[]`, отправка/обновление/
 * скачивание уходят наружу через outputs, а стор и blob-загрузка остаются в
 * feature-компоненте каждого домена.
 *
 * Композер держит свой `FormGroup` — наружу торчит только `send`. Полноэкранный
 * режим (expand) — overlay внутри самого компонента (`--expanded`), потребителю
 * лишь опционально сообщается через `expandedChange`.
 *
 * Шапка (тулбар «Чат» + refresh/expand) рендерится только когда включена хотя бы
 * одна из иконок (`showRefresh`/`showExpand`): в диалогах своя header-обёртка,
 * туда тулбар не нужен.
 */
@Component({
    selector: 'rt-chat',
    templateUrl: './rt-chat.component.html',
    styleUrls: ['./rt-chat.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        CdkTextareaAutosize,
        DatePipe,
        ReactiveFormsModule,

        // standalone components / directives
        RtButtonDirective,
        RtChatStatusLabelPipe,
        RtConfirmDirective,
        RtDeltaViewComponent,
        RtFileCardComponent,
        RtFileDropComponent,
        RtIconButtonComponent,
        RtIconComponent,
        RtMessageComposerComponent,
        RtNoteComponent,
        RtSkeletonWrapperComponent,
        RtSpinnerComponent,
        RtToolbarComponent,
        RtToolbarLeftDirective,
        RtToolbarRightDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,

        // transloco
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-chat--expanded]': 'expanded()',
        '[class.rt-chat--fill]': 'fill()',
    },
})
export class RtChatComponent {
    readonly #transloco: TranslocoService = inject(TranslocoService);

    /**
     * Дата сообщения форматируется по активному языку Transloco, а не по
     * `LOCALE_ID`: тот вычисляется на подъёме приложения и там, где язык
     * переключают на ходу, оставил бы часы в прежнем формате до перезагрузки.
     *
     * Данные локали для `DatePipe` регистрирует приложение: без них пайп падает
     * `Missing locale data`, и кит за это не отвечает.
     */
    protected readonly locale: Signal<string> = toSignal(this.#transloco.langChanges$, {
        initialValue: this.#transloco.getActiveLang(),
    });

    /**
     * Пользователь у нижнего края треда. Плоское поле (не сигнал), чтобы
     * afterRenderEffect не перезапускался на каждый scroll — обновляется в
     * обработчике scroll и читается при автоскролле.
     */
    #atBottom: boolean = true;

    /** Прошлый scrollTop треда — для различения прокрутки вверх и роста контента. */
    #lastScrollTop: number = 0;

    /** One-shot: своё отправленное сообщение всегда прокручивает тред вниз. */
    #forceScroll: boolean = false;

    /** Текущее значение композера — источник реактивности для `canSend`. */
    readonly #formValue: Signal<Partial<{ message: string; files: File[] }>>;

    /**
     * Скролл-контейнер треда — для автопрокрутки к последнему сообщению.
     * `viewChild` не работает на ES-private (`#`) поле, поэтому `protected`.
     */
    protected readonly thread: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('thread');

    /** Скрытый нативный input — открывается кнопкой-скрепкой внутри поля ввода. */
    protected readonly composerFileEl: Signal<ElementRef<HTMLInputElement> | undefined> =
        viewChild<ElementRef<HTMLInputElement>>('composerFileEl');

    protected readonly attachmentFallbackName: Signal<string> = translateSignal(ATTACHMENT_FALLBACK_KEY);

    /** Подписи с учётом того, что передал хозяин компонента: своё важнее умолчания */
    protected readonly titleText: Signal<string> = computed((): string => this.title() || this.#defaultTitle());
    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.#defaultPlaceholder());
    protected readonly emptyHintText: Signal<string> = computed((): string => this.emptyHint() || this.#defaultEmptyHint());

    readonly #defaultTitle: Signal<string> = translateSignal('rtKit.chatTitle');
    readonly #defaultPlaceholder: Signal<string> = translateSignal('rtKit.chatPlaceholder');
    readonly #defaultEmptyHint: Signal<string> = translateSignal('rtKit.chatEmptyHint');

    protected readonly MessageStatus: typeof ERtChatMessageStatus = ERtChatMessageStatus;

    /** Плейсхолдеры скелетонов треда при первичной загрузке. */
    protected readonly skeletonRows: readonly number[] = [1, 2, 3];

    /** Полноэкранный режим (overlay поверх страницы). */
    protected readonly expanded: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly replyForm: FormGroup<{
        message: FormControl<string>;
        files: FormControl<File[]>;
    }> = new FormGroup({
        message: new FormControl<string>('', { nonNullable: true }),
        files: new FormControl<File[]>([], { nonNullable: true }),
    });

    /** Композер заблокирован при загрузке/рефреше треда или отправке in-flight. */
    protected readonly composerDisabled: Signal<boolean> = computed((): boolean => this.loading() || this.fetching() || this.sending());

    /**
     * Можно ли отправить: композер активен и есть содержимое — непустой текст или
     * (при включённых вложениях) хотя бы один файл. Сообщение само по себе не
     * бывает «невалидным» — пустоту гасим дизейблом кнопки, а не подсветкой поля.
     */
    protected readonly canSend: Signal<boolean> = computed((): boolean => {
        if (this.composerDisabled()) {
            return false;
        }
        const value: Partial<{ message: string; files: File[] }> = this.#formValue();
        const hasText: boolean = (value.message ?? '').trim().length > 0;
        const hasFiles: boolean = this.attachments() && (value.files?.length ?? 0) > 0;
        return hasText || hasFiles;
    });

    /** Показывать ли шапку: только когда включена хотя бы одна иконка. */
    protected readonly showHeader: Signal<boolean> = computed((): boolean => this.showRefresh() || this.showExpand());

    /** Подпись кнопки fullscreen: тернарник в шаблоне переводом не покрыть. */
    protected readonly expandLabel: Signal<string> = translateSignal(
        computed((): string => (this.expanded() ? 'rtKit.chatCollapse' : 'rtKit.chatExpand'))
    );

    /** Выбранные, но ещё не отправленные файлы — карточки над полем ввода. */
    protected readonly selectedFiles: Signal<File[]> = computed((): File[] => this.#formValue().files ?? []);

    /**
     * Drop-зона активна только когда вложения включены, ответ доступен и композер
     * не занят (загрузка/рефреш/отправка). Иначе обёртка `rt-file-drop` просто
     * пропускает контент без оверлея.
     */
    protected readonly dropDisabled: Signal<boolean> = computed(
        (): boolean => !this.attachments() || !this.canReply() || this.composerDisabled()
    );

    /**
     * Файл из drag-n-drop для rich-композера: каждый drop кладёт новый `File`,
     * пробрасывается в `rt-message-composer` через input. Классический композер
     * принимает drop напрямую в свой `replyForm`.
     */
    protected readonly droppedFiles: WritableSignal<File[] | null> = signal<File[] | null>(null);

    /** История сообщений (consumer уже смаппил из доменной модели). */
    public readonly messages: InputSignal<readonly IRtChat.Message[]> = input<readonly IRtChat.Message[]>([]);

    /** Первичная загрузка — скелетоны вместо треда. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Рефреш при наличии данных — тред остаётся, композер дизейблится. */
    public readonly fetching: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Доступна ли отправка (иначе вместо композера — note с причиной). */
    public readonly canReply: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Причина блокировки ответа — note под тредом. */
    public readonly replyBlockReason: InputSignal<string | null> = input<string | null>(null);

    /** Отправка in-flight — спиннер/дизейбл на кнопке. */
    public readonly sending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Подписи по умолчанию приходят пустыми и переводятся ниже: значение
     * `input()` вычисляется при создании компонента, и готовый перевод застыл бы
     * на языке, активном в этот момент.
     */
    public readonly placeholder: InputSignal<string> = input<string>('');

    public readonly title: InputSignal<string> = input<string>('');

    /** Текст, когда треда ещё нет (заявка не создана). */
    public readonly emptyHint: InputSignal<string> = input<string>('');

    /** Есть ли тред (иначе показываем `emptyHint`). */
    public readonly hasThread: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Включить загрузку файлов в композере. */
    public readonly attachments: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** `accept` для file-input (`.pdf,.doc,...`). */
    public readonly accept: InputSignal<string> = input<string>('');

    /**
     * Компактный композер (`rt-message-composer`): авто-растущая textarea над
     * разделителем + ряд иконок (прикрепить слева, отправить справа) вместо
     * классического вертикального стека. По умолчанию выключен.
     */
    public readonly richComposer: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Rich-текст в композере (Quill delta). Требует `richComposer` — форматирование
     * живёт только в компактном композере. Отправка уходит delta-каналом.
     */
    public readonly formatting: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Набор кнопок rich-редактора (проброс до `rt-rich-editor` через композер). */
    public readonly formattingToolbar: InputSignal<IRtRichEditorToolbar> = input<IRtRichEditorToolbar>('full');

    /**
     * Растягивать чат на всю высоту контейнера: тред занимает свободное место,
     * композер прижат к низу. По умолчанию выключен (тред с фикс. max-height).
     * Требует, чтобы родитель давал высоту (flex-цепочка).
     */
    public readonly fill: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Показать иконку refresh в шапке. */
    public readonly showRefresh: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Показать иконку expand (fullscreen) в шапке. */
    public readonly showExpand: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Отправка сообщения (+файлы) — consumer вызывает свой store/api. */
    public readonly send: OutputEmitterRef<IRtChat.SendPayload> = output<IRtChat.SendPayload>();

    /** Клик refresh — consumer перетягивает тред. */
    public readonly refresh: OutputEmitterRef<void> = output<void>();

    /** Клик по вложению — consumer качает blob своим api. */
    public readonly downloadFile: OutputEmitterRef<IRtChat.Message> = output<IRtChat.Message>();

    /** Клик по карточке вложения из `attachments[]` — консюмер качает по `publicId`. */
    public readonly downloadAttachment: OutputEmitterRef<IRtChat.Attachment> = output<IRtChat.Attachment>();

    /** Смена fullscreen-состояния. */
    public readonly expandedChange: OutputEmitterRef<boolean> = output<boolean>();

    public readonly deleteMessage: OutputEmitterRef<IRtChat.Message> = output<IRtChat.Message>();

    /** Повторная отправка своего сообщения со статусом `failed`. */
    public readonly retryMessage: OutputEmitterRef<IRtChat.Message> = output<IRtChat.Message>();

    constructor() {
        this.#formValue = toSignal(this.replyForm.valueChanges, {
            initialValue: this.replyForm.value,
        });

        // Поведение мессенджера: после каждого рендера, зависящего от треда
        // (новые сообщения, окончание загрузки, fullscreen), прокручиваем к
        // последнему сообщению — но только если это своё сообщение (forceScroll)
        // или пользователь уже у нижнего края. Если он ушёл вверх читать историю,
        // входящее сообщение его не дёргает. afterRenderEffect гарантирует, что DOM
        // уже обновлён и scrollHeight посчитан по реальной высоте.
        afterRenderEffect((): void => {
            this.messages();
            this.loading();
            this.fetching();
            this.expanded();
            const el: HTMLElement | undefined = this.thread()?.nativeElement;
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

        // `formControlName`-инпуты игнорируют атрибут `disabled` — состояние ввода
        // держим через сам контрол: блок при рефреше треда или отправке in-flight.
        effect((): void => {
            const blocked: boolean = this.composerDisabled();
            if (blocked && this.replyForm.enabled) {
                this.replyForm.disable({ emitEvent: false });
                return;
            }
            if (!blocked && this.replyForm.disabled) {
                this.replyForm.enable({ emitEvent: false });
            }
        });
    }

    protected onSubmit(): void {
        // Кнопка уже дизейблится по `canSend` — guard лишь страхует от submit в
        // обход кнопки (программный/Enter), молча и без подсветки поля.
        if (!this.canSend()) {
            return;
        }
        const text: string = this.replyForm.controls.message.value.trim();
        const files: File[] = this.replyForm.controls.files.value;
        // Своё сообщение всегда прокручивает тред вниз — независимо от позиции.
        this.#forceScroll = true;
        this.send.emit({ text, files: this.attachments() ? files : undefined });
        this.replyForm.reset({ message: '', files: [] });
    }

    protected onComposerKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            this.onSubmit();
        }
    }

    /** Релей submit'а от `rt-message-composer` (rich-режим) наружу как `send`. */
    protected onComposerSubmit(payload: IRtMessageComposer.SubmitPayload): void {
        // Своё сообщение всегда прокручивает тред вниз — независимо от позиции.
        this.#forceScroll = true;
        this.send.emit({
            text: payload.text,
            files: this.attachments() ? payload.files : undefined,
            delta: payload.delta,
        });
    }

    /**
     * Файлы выброшены в обёртку чата: в rich-режиме отдаём массив композеру через
     * input, в классическом — добавляем к уже выбранным в собственном `replyForm`.
     */
    protected onFilesDropped(files: File[]): void {
        if (files.length === 0) {
            return;
        }
        if (this.richComposer()) {
            // Новый массив на каждый drop — effect композера видит каждое перетаскивание.
            this.droppedFiles.set([...files]);
            return;
        }
        this.replyForm.controls.files.setValue([...this.replyForm.controls.files.value, ...files]);
    }

    protected openFilePicker(): void {
        this.composerFileEl()?.nativeElement.click();
    }

    protected onFilesPicked(event: Event): void {
        const inputEl: HTMLInputElement = event.target as HTMLInputElement;
        const picked: File[] = Array.from(inputEl.files ?? []);
        if (picked.length > 0) {
            this.replyForm.controls.files.setValue([...this.replyForm.controls.files.value, ...picked]);
        }
        // Сброс значения: без него повторный выбор того же файла не даёт `change`.
        inputEl.value = '';
    }

    protected removeFile(index: number): void {
        const next: File[] = this.replyForm.controls.files.value.filter((_: File, position: number): boolean => position !== index);
        this.replyForm.controls.files.setValue(next);
    }

    /**
     * Обновляем «у нижнего ли края» по скроллу — основа решения об автоскролле.
     * Прилипание к низу снимаем ТОЛЬКО когда пользователь прокрутил ВВЕРХ (scrollTop
     * уменьшился). Событие от программной прокрутки и рост контента идут при том же
     * или большем scrollTop — тогда прилипание лишь усиливаем, но не снимаем. Иначе
     * async-событие от нашего же `scrollTop = scrollHeight`, долетающее уже после
     * поздней дорисовки rich-контента (высота выросла, scrollTop прежний → мнимый
     * «отрыв от низа»), сбрасывало бы `#atBottom` и ломало до-прокрутку.
     */
    protected onThreadScroll(): void {
        const el: HTMLElement | undefined = this.thread()?.nativeElement;
        if (el === undefined) {
            return;
        }
        const scrollTop: number = el.scrollTop;
        const nearBottom: boolean = el.scrollHeight - el.clientHeight - scrollTop <= NEAR_BOTTOM_THRESHOLD_PX;
        if (scrollTop < this.#lastScrollTop - 1) {
            this.#atBottom = nearBottom;
        } else {
            this.#atBottom = this.#atBottom || nearBottom;
        }
        this.#lastScrollTop = scrollTop;
    }

    /**
     * Серия отложенных пинов к низу: rich-контент дорисовывается несколькими
     * render-пассами (иногда с пересозданием `#thread`), поэтому одного скролла в
     * afterRenderEffect мало — финальная высота устанавливается позже. Каждый тик
     * заново берёт актуальный элемент треда и его текущий scrollHeight и, пока
     * пользователь у нижнего края, дотягивает ленту до конца.
     */
    #pinToBottomDeferred(): void {
        for (const delay of PIN_RETRY_DELAYS_MS) {
            setTimeout((): void => {
                const el: HTMLElement | undefined = this.thread()?.nativeElement;
                if (el !== undefined && this.#atBottom) {
                    el.scrollTop = el.scrollHeight;
                }
            }, delay);
        }
    }

    protected onRefresh(): void {
        this.refresh.emit();
    }

    protected onDownload(message: IRtChat.Message): void {
        this.downloadFile.emit(message);
    }

    /** Релей клика по вложению наружу — сам компонент файлов не качает. */
    protected onDownloadAttachment(attachment: IRtChat.Attachment): void {
        this.downloadAttachment.emit(attachment);
    }

    /** Релей запроса на удаление сообщения — удаляет домен, компонент только рисует. */
    protected onDeleteMessage(message: IRtChat.Message): void {
        this.deleteMessage.emit(message);
    }

    /** Релей повтора отправки упавшего сообщения — переотправляет домен. */
    protected onRetryMessage(message: IRtChat.Message): void {
        this.retryMessage.emit(message);
    }

    protected toggleExpand(): void {
        const next: boolean = !this.expanded();
        this.expanded.set(next);
        this.expandedChange.emit(next);
    }
}
