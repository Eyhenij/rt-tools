import { IBemConfig } from './bem.types';

export const BEM_MODULE_CONFIG: IBemConfig = {
    separators: {
        el: '__',
        mod: '--',
        val: '--',
    },
    ignoreValues: false,
    modCase: 'kebab',
};
