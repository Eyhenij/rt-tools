import { inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { faker } from '@faker-js/faker';
import { applicationConfig, type Preview } from '@storybook/angular';

import { setupTokenCopy } from './token-copy';

setupTokenCopy();

// Демонстрационные данные должны быть одинаковы от загрузки к загрузке: на них смотрит
// визуальная проверка витрины, и случайные имена роняли бы её на каждом прогоне.
faker.seed(20260808);

const preview: Preview = {
    // Значки — шрифтом Material Symbols, как README кита велит приложению: директива значка ставит
    // ему толщину 700 и заливку. Старый Material Icons ось толщины не читает, и витрина рисовала
    // значки тоньше, чем их видит приложение.
    decorators: [
        applicationConfig({
            providers: [
                provideAppInitializer((): void => {
                    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
                }),
            ],
        }),
    ],
    parameters: {
        // Узкий экран кит определяет сам — службой точек перелома, а она читает ширину окна
        // показа. Рамка кадра поэтому и есть единственный способ перешагнуть этот порог из
        // истории: порог у кита — 599 пикселей, и рамка берётся заведомо уже него.
        viewport: {
            options: {
                narrow: { name: 'Узкий экран', styles: { width: '360px', height: '780px' } },
                // Низкое окно нужно спискам меню: в полный рост они влезают целиком, и признак
                // непоказанного снизу показать нечем.
                shortScreen: { name: 'Низкий экран', styles: { width: '1280px', height: '320px' } },
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
