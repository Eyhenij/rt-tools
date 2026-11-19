import { Meta, StoryObj } from '@storybook/angular';

import { TestRtStatTileMatrixComponent } from './component/test-stat-tile-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Data/StatTile',
    component: TestRtStatTileMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtStatTileMatrixComponent>;

type TStory = StoryObj<TestRtStatTileMatrixComponent>;

export const Delta: TStory = { args: { part: 'delta' } };

export const Baseline: TStory = { args: { part: 'baseline' } };

interface IPlayContext {
    readonly canvasElement: HTMLElement;
}

function expectThat(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

/** Ждёт, пока в истории встанут все плитки первой половины пары, и отдаёт их корни. */
async function settledTiles(root: HTMLElement, count: number): Promise<HTMLElement[]> {
    await document.fonts.ready;

    return new Promise<HTMLElement[]>((resolve: (tiles: HTMLElement[]) => void): void => {
        const look: () => void = (): void => {
            const tiles: HTMLElement[] = Array.from(root.querySelectorAll<HTMLElement>('[qa-dataid="stat-tile"]'));

            if (tiles.length < count) {
                requestAnimationFrame(look);
            } else {
                resolve(tiles.slice(0, count));
            }
        };
        look();
    });
}

/**
 * Обычный и компактный размер при 220 и 136; компактный переносит подпись базы и вторую строку —
 * SC-UKV-1454, SC-UKV-1467, SC-UKV-1468. Шаг play меряет размер значения, промежутки и судьбу
 * второй строки при 136.
 */
export const Size: TStory = {
    args: { part: 'size' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const [plain, compact, , plainNarrow, compactNarrow]: HTMLElement[] = await settledTiles(canvasElement, 5);
        const valueSize: (tile: HTMLElement) => string = (tile: HTMLElement): string =>
            getComputedStyle(tile.querySelector<HTMLElement>('[qa-dataid="stat-tile-value"]') ?? tile).fontSize;
        const secondary: (tile: HTMLElement) => HTMLElement = (tile: HTMLElement): HTMLElement =>
            tile.querySelector<HTMLElement>('[qa-dataid="stat-tile-secondary"]') ?? tile;

        expectThat(valueSize(plain) === '32px', `обычная: значение ${valueSize(plain)}, а не 32px`);
        expectThat(valueSize(compact) === '24px', `компактная: значение ${valueSize(compact)}, а не 24px`);
        expectThat(getComputedStyle(compact).rowGap === '6px', `компактная: промежуток ${getComputedStyle(compact).rowGap}, а не 6px`);
        expectThat(secondary(plainNarrow).scrollWidth > secondary(plainNarrow).clientWidth, 'обычная при 136: вторая строка не режется');
        expectThat(
            secondary(compactNarrow).scrollWidth <= secondary(compactNarrow).clientWidth &&
                secondary(compactNarrow).getBoundingClientRect().height > secondary(compact).getBoundingClientRect().height,
            'компактная при 136: вторая строка не переносится'
        );
    },
};

export const Parts: TStory = { args: { part: 'parts' } };

export const Unit: TStory = { args: { part: 'unit' } };

export const Growth: TStory = { args: { part: 'growth' } };

export const Framed: TStory = { args: { part: 'framed' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
