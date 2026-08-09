import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtAsideMatrixComponent } from './component/test-aside-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Панель стоит прямо в разметке: в оверлей её уносит служба, а сам компонент — обычная коробка.
 * Так размеры встают рядом, а светло-тёмная пара ловит панель целиком.
 */
export default {
    title: 'Components/Aside',
    component: TestRtAsideMatrixComponent,
    parameters: {
        // Панель называет ширину сама: `@media (width <= 768px)` растягивает её на весь экран
        // и меняет отступы шапки. Кадр порога снимается в окне ровно 768 — правило его включает.
        snapshot: { widths: [storyWidthAtMost(768)] },
        controls: { disable: true },
    },
} as Meta<TestRtAsideMatrixComponent>;

type Story = StoryObj<TestRtAsideMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

/** Своя ширина перекрывает размер — рядом видно, что перекрывает и правда. */
export const Width: Story = { args: { part: 'width' } };

/** Раскладка содержимого: обычная прокручивается целиком, «под вкладки» отдаёт прокрутку внутрь. */
export const Layout: Story = { args: { part: 'layout' } };

export const Themes: Story = { args: { part: 'themes' } };
