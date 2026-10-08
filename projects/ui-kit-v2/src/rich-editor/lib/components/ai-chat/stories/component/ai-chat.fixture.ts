import { IRtAiChat } from '../../rt-ai-chat.model';

export const AI_CHAT_SUGGESTIONS: readonly string[] = [
    'Give me a performance overview',
    "What's changed in bookings?",
    'Which upcoming dates need attention?',
];

const QUESTION: IRtAiChat.Message = { id: 'q1', role: 'user', text: 'How did occupancy change last week?', time: '14:02' };

const ANSWER_TEXT: string = [
    'Occupancy grew by **4.2 points** week over week.',
    '',
    '- Weekdays carried the growth: +6.1 points.',
    '- Weekends stayed flat at 81%.',
    '',
    'The main driver is corporate demand on Tuesday and Wednesday.',
].join('\n');

const STEPS: IRtAiChat.Run['steps'] = [
    { label: 'Read the question', status: 'complete' },
    { label: 'Queried occupancy by day', meta: '4 s', status: 'complete' },
    { label: 'Compared with the previous week', status: 'complete' },
];

export const AI_CHAT_DONE: readonly IRtAiChat.Message[] = [
    QUESTION,
    { id: 'a1', role: 'assistant', text: ANSWER_TEXT, run: { state: 'done', label: 'Answered', meta: '12 s', steps: STEPS } },
];

export const AI_CHAT_THINKING: readonly IRtAiChat.Message[] = [
    QUESTION,
    { id: 'a1', role: 'assistant', text: '', streaming: true, run: { state: 'running', label: 'Querying occupancy by day…' } },
];

export const AI_CHAT_STREAMING: readonly IRtAiChat.Message[] = [
    QUESTION,
    {
        id: 'a1',
        role: 'assistant',
        text: 'Occupancy grew by **4.2 points** week over week.\n\n- Weekdays carried the growth',
        streaming: true,
        run: { state: 'running', label: 'Writing the answer…' },
    },
];

export const AI_CHAT_RATED: readonly IRtAiChat.Message[] = [
    QUESTION,
    {
        id: 'a1',
        role: 'assistant',
        text: ANSWER_TEXT,
        feedback: 'liked',
        run: { state: 'done', label: 'Answered', meta: '12 s', steps: STEPS },
    },
];

export const AI_CHAT_STOPPED: readonly IRtAiChat.Message[] = [
    QUESTION,
    { id: 'a1', role: 'assistant', text: 'Occupancy grew by **4.2 points**', run: { state: 'stopped', label: 'Stopped' } },
];

export const AI_CHAT_FAILED: readonly IRtAiChat.Message[] = [
    QUESTION,
    { id: 'a1', role: 'assistant', text: '', run: { state: 'failed', label: 'Failed' } },
];

export const AI_CHAT_ERROR: IRtAiChat.RunError = {
    message: 'The assistant could not finish the answer.',
    referenceId: '7f3c2a9e-41d8-4b6e-9a51-0c8e2d7b1f64',
    retryable: true,
};

export const AI_CHAT_LONG: readonly IRtAiChat.Message[] = Array.from({ length: 4 }, (_: unknown, i: number): IRtAiChat.Message[] => [
    { ...QUESTION, id: `q${i}` },
    { id: `a${i}`, role: 'assistant', text: ANSWER_TEXT, run: { state: 'done', label: 'Answered', meta: '12 s' } },
]).flat();

export const AI_CHAT_THREADS: readonly IRtAiChat.Thread[] = [
    { id: 't1', title: 'Occupancy last week', time: '14:02' },
    { id: 't2', title: 'Pickup for the summer season', time: 'Yesterday', unreadCount: 2 },
    { id: 't3', title: 'Which upcoming dates need attention?', time: 'Mon' },
    { id: 't4', title: 'Average rate by segment, compared with the budget for the whole of next quarter', time: '2 Oct' },
];

export const AI_CHAT_LONG_DRAFT: string =
    'Compare occupancy, average rate and revenue per available room for the last four weeks with the same weeks last year, split by segment, and point out the dates where the gap is the largest.';
