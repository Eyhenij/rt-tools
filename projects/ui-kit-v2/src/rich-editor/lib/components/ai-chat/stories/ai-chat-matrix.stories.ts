import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAiChatMatrixComponent } from './component/test-ai-chat-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов здесь нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре неотличимо
 * от отсутствующего.
 */
export default {
    title: 'Organisms/Chat/AiChat',
    component: TestRtAiChatMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatMatrixComponent>;

type TStory = StoryObj<TestRtAiChatMatrixComponent>;

/** Пустая беседа: подсказки, без подсказок и загрузка. */
export const Empty: TStory = { args: { part: 'empty' } };

/** Ответ от «думает» до «не удался»: копирование и оценка появляются, когда текст дописан; без копирования. */
export const Answer: TStory = { args: { part: 'answer' } };

/** Ошибка с номером обращения и повтором и без них. */
export const RunError: TStory = { args: { part: 'error' } };

/** Беседы на месте ленты: список, пустой список, загрузка. */
export const Threads: TStory = { args: { part: 'threads' } };

/** На весь экран беседы стоят колонкой слева. */
export const FullScreen: TStory = { args: { part: 'fullScreen' }, parameters: { snapshot: { fullPage: true } } };

/** Длинная лента прокручивается к последнему ответу; длинный вопрос растит поле. */
export const Long: TStory = { args: { part: 'long' } };

/** Вложения ответа — шаблон приложения под текстом. */
export const Extra: TStory = { args: { part: 'extra' }, parameters: { snapshot: { fullPage: true } } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
