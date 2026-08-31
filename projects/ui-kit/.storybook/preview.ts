import { faker } from '@faker-js/faker';
import type { Preview } from '@storybook/angular';

import { setupTokenCopy } from './token-copy';

setupTokenCopy();

// Демонстрационные данные должны быть одинаковы от загрузки к загрузке: на них смотрит
// визуальная проверка витрины, и случайные имена роняли бы её на каждом прогоне.
faker.seed(20260808);

const preview: Preview = {
    parameters: {
        // Узкий экран кит определяет сам — службой точек перелома, а она читает ширину окна
        // показа. Рамка кадра поэтому и есть единственный способ перешагнуть этот порог из
        // истории: порог у кита — 599 пикселей, и рамка берётся заведомо уже него.
        viewport: {
            options: {
                narrow: { name: 'Узкий экран', styles: { width: '360px', height: '780px' } },
            },
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
