import { faker } from '@faker-js/faker';
import type { Preview } from '@storybook/angular';

import { setupTokenCopy } from './token-copy';

setupTokenCopy();

// Демонстрационные данные должны быть одинаковы от загрузки к загрузке: на них смотрит
// визуальная проверка витрины, и случайные имена роняли бы её на каждом прогоне.
faker.seed(20260808);

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
