import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtIconSetsComponent } from './component/test-icon-sets.component';

export default {
    title: 'Atoms/Icon/IconSet',
    component: TestRtIconSetsComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtIconSetsComponent>;

type TStory = StoryObj<TestRtIconSetsComponent>;

/** Ждёт, пока значок и кнопка под якорем сошлются на названные символы. */
async function drawn(root: HTMLElement, anchor: string, expected: string[]): Promise<void> {
    let seen: string = '';

    for (let pass: number = 0; pass < 50; pass += 1) {
        seen = Array.from(
            root.querySelectorAll(`[qa-dataid="${anchor}"] use`),
            (use: Element): string => use.getAttribute('href') ?? ''
        ).join(' ');

        if (seen === expected.join(' ')) {
            return;
        }
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 100);
        });
    }

    throw new Error(`${anchor}: ждали ${expected.join(' ')}, нарисовано ${seen}`);
}

function press(root: HTMLElement, anchor: string): void {
    root.querySelector<HTMLElement>(`[qa-dataid="${anchor}"]`)?.click();
}

const KIT: string[] = ['#rt-icon-cog', '#rt-icon-trash'];
const MATERIAL: string[] = ['#rt-icon-material-cog', '#rt-icon-material-trash'];

/**
 * SC-UKV-1887 — набор меняется на ходу: у всего приложения кнопкой, а у части страницы директивой.
 * Выбор приложения набор части не меняет.
 */
export const Switching: TStory = {
    parameters: storySnapshotSkip('смену наборов проверяет play-тест, а рисунки обоих наборов стоят в историях Presets и MaterialSet'),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await drawn(canvasElement, 'sets-app', KIT);
        await drawn(canvasElement, 'sets-part', KIT);

        press(canvasElement, 'sets-all-material');
        await drawn(canvasElement, 'sets-app', MATERIAL);
        await drawn(canvasElement, 'sets-part', KIT);

        press(canvasElement, 'sets-part-toggle');
        await drawn(canvasElement, 'sets-part', MATERIAL);

        press(canvasElement, 'sets-all-reset');
        await drawn(canvasElement, 'sets-app', KIT);
        await drawn(canvasElement, 'sets-part', MATERIAL);
    },
};
