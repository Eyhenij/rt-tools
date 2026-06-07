import type { Preview } from '@storybook/angular';

import { setupTokenCopy } from './token-copy';

setupTokenCopy();

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
