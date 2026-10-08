import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDynamicSelectorMatrixComponent } from './component/test-dynamic-selector-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре неотличимо
 * от отсутствующего.
 *
 * Наведение, фокус и нажатие рисуют кнопки строки и полосы — `rt-icon-button` и `[rtButton]`; их
 * состояния показаны в их собственных семьях, и своих у списка нет.
 */
/**
 * Ждёт подписи полей новой строки и фокуса в последнем из них: без подписей кадр снял бы закрытое
 * поле, а фокус, пришедший после снятия, оставил бы кольцо на одной половине.
 */
async function waitForFieldLabels(canvasElement: HTMLElement, count: number): Promise<void> {
    for (let attempt: number = 0; attempt < 100; attempt++) {
        const labels: number = canvasElement.querySelectorAll('[qa-dataid="dynamic-input-field-label"]').length;
        // Поле берёт фокус кадром позже, чем появляется: фокус снимают, когда он уже в поле.
        const focused: boolean = document.activeElement?.closest('[qa-dataid="dynamic-input-field-label"]') !== null;
        if (labels >= count && focused) {
            return;
        }
        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame((): void => resolve());
        });
    }
    throw new Error(`Подписи полей новой строки не появились: ожидалось ${count}.`);
}

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };

export default {
    title: 'Organisms/Forms/DynamicSelector',
    component: TestRtDynamicSelectorMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDynamicSelectorMatrixComponent>;

type TStory = StoryObj<TestRtDynamicSelectorMatrixComponent>;

export const Rows: TStory = { args: { part: 'rows' } };

/** Кнопки-иконки списка круглые по умолчанию; шаг задаёт вход `buttonRadius`. */
export const ButtonRadius: TStory = { args: { part: 'radius' } };

/** Свои кнопки строки и своё название — шаблоны вызывающего; корзина остаётся китовой. */
export const RowTemplates: TStory = { args: { part: 'templates' } };

export const Invitation: TStory = { args: { part: 'invitation' } };

export const States: TStory = { args: { part: 'states' } };

/** Окно выбора стоит в разметке: в оверлее открытое окно было бы одно, а случаев шесть. */
export const Popup: TStory = { args: { part: 'popup' } };

/** Поле строк — те же строки и полоса, но строки набирают вручную. */
export const StringList: TStory = { args: { part: 'input' } };

/** Переключатели списка: корзина, панель сброса и очистки, правки в шаблоне строки. */
export const Switches: TStory = { args: { part: 'switches' } };

/** Окно с начальным запросом: текст уже в поиске, предложены только совпадения. */
export const InitialQuery: TStory = { args: { part: 'initial-query' } };

/** Вид, который задаёт приложение: входы приглашения, очистки, поиска и пустого результата, свойства окна. */
export const Look: TStory = {
    args: { part: 'look' },
    /**
     * Поле новой строки появляется по «Добавить»: шаг открывает его в обеих половинах и снимает
     * фокус — пустое поле при уходе фокуса остаётся открытым, а кадр не держит кольцо фокуса на одной
     * половине.
     */
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const hosts: HTMLElement[] = [...canvasElement.querySelectorAll<HTMLElement>('[data-story-field-open]')];
        hosts.forEach((host: HTMLElement): void => host.querySelector<HTMLButtonElement>('[qa-dataid="dynamic-input-add"]')?.click());
        await waitForFieldLabels(canvasElement, hosts.length);
        (document.activeElement as HTMLElement | null)?.blur();
    },
};
