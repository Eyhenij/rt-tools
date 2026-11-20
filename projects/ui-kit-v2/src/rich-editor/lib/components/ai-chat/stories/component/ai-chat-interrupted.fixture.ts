import { IRtAiChat } from '../../rt-ai-chat.model';

/** Случай панели прерванного ответа: подпись ячейки, ширина ответа и то, что приходит входами. */
export interface IAiChatInterruptedCase {
    readonly name: string;
    /** Ширина ответа в ленте; панель шире на поля ленты и рамку. */
    readonly width: number;
    readonly messages: readonly IRtAiChat.Message[];
    readonly sending?: boolean;
    readonly error?: IRtAiChat.RunError | null;
    readonly extra?: boolean;
    readonly english?: boolean;
    readonly dir?: 'rtl';
    /** Признак состояния взаимодействия для аддона псевдосостояний. */
    readonly state?: string | null;
}

const QUESTION: IRtAiChat.Message = { id: 'q1', role: 'user', text: 'Подведи итоги октября', time: '14:02' };

const PARTIAL_TEXT: string = '**Итоги октября.** Подтверждено 42 брони — на 8 больше, чем в сентябре. Выручка выросла на 12 %.';

const STOPPED: IRtAiChat.Run = { state: 'stopped', label: 'Остановлен' };

const RUNNING: IRtAiChat.Run = { state: 'running', label: 'Пишет ответ' };

/** Ответ, оборвавшийся на полуслове: блок текста, строка хода и флаг. */
function partial(run: IRtAiChat.Run = STOPPED, extra: Partial<IRtAiChat.AssistantMessage> = {}): readonly IRtAiChat.Message[] {
    return [
        QUESTION,
        { id: 'a1', role: 'assistant', blocks: [{ type: 'markdown', text: PARTIAL_TEXT }], run, interrupted: true, ...extra },
    ];
}

/** Ответ, оборвавшийся до первого блока. */
function empty(run?: IRtAiChat.Run): readonly IRtAiChat.Message[] {
    return [QUESTION, { id: 'a1', role: 'assistant', blocks: [], ...(run === undefined ? {} : { run }), interrupted: true }];
}

/** Частичный ответ при ширинах макета: от узкой панели до колонки чтения — SC-UKV-1576. */
export const AI_CHAT_INTERRUPTED_WIDTH_CASES: readonly IAiChatInterruptedCase[] = [
    { name: '240', width: 240, messages: partial() },
    { name: '328 — узкая панель', width: 328, messages: partial() },
    { name: '386 — строка хода «пишет»', width: 386, messages: partial(RUNNING) },
    { name: '640 — колонка чтения', width: 640, messages: partial() },
];

/** Пустой прерванный ответ: без строки хода, с ней, с ходом «не удался» и с вложениями. */
export const AI_CHAT_INTERRUPTED_EMPTY_CASES: readonly IAiChatInterruptedCase[] = [
    { name: '328 — без строки хода', width: 328, messages: empty() },
    { name: '386 — остановлен', width: 386, messages: empty(STOPPED) },
    { name: '640 — не удался', width: 640, messages: empty({ state: 'failed', label: 'Не удалось' }) },
    { name: '386 — с вложениями приложения', width: 386, messages: empty(STOPPED), extra: true },
];

/** Вместе с ошибкой хода, английские подписи и пишущийся ответ без строки и кнопки. */
export const AI_CHAT_INTERRUPTED_CASES: readonly IAiChatInterruptedCase[] = [
    {
        name: '386 — с ошибкой хода',
        width: 386,
        messages: partial(),
        error: { message: 'Не удалось получить ответ. Повторите запрос.', retryable: true },
    },
    { name: '328 — английские подписи', width: 328, messages: partial(), english: true },
    { name: '386 — пишется: строки нет', width: 386, messages: partial(RUNNING, { streaming: true }) },
];

/** Справа налево — SC-UKV-1577. */
export const AI_CHAT_INTERRUPTED_RTL_CASES: readonly IAiChatInterruptedCase[] = [
    { name: '386 — справа налево', width: 386, messages: partial(), dir: 'rtl' },
];

/** Состояния «спросить снова»: обычное, наведение, фокус с клавиши и отключено на время отправки. */
export const AI_CHAT_INTERRUPTED_STATE_CASES: readonly IAiChatInterruptedCase[] = [
    { name: 'обычное', width: 386, messages: partial() },
    { name: 'наведение', width: 386, messages: partial(), state: 'hover' },
    { name: 'фокус с клавиши', width: 386, messages: partial(), state: 'focus-visible' },
    { name: 'идёт отправка — отключено', width: 386, messages: partial(), sending: true },
];

/** Темы и наборы: частичный ответ и пустой. */
export const AI_CHAT_INTERRUPTED_THEME_CASES: readonly IAiChatInterruptedCase[] = [
    AI_CHAT_INTERRUPTED_WIDTH_CASES[1],
    AI_CHAT_INTERRUPTED_EMPTY_CASES[1],
];
