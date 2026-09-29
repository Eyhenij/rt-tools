import { IRtSelect } from '../lib/components/select/rt-select.model';

/**
 * Дерево опций для историй обеих семей выбора из списка. Одно на обе: разойдись наборы, разница
 * читалась бы как разница семей. Три уровня, отключённый лист и лист без родителя — всё, что панель
 * рисует в дереве по-своему.
 */
export const STORY_OPTION_TREE: ReadonlyArray<IRtSelect.Option<string>> = [
    {
        label: 'Центральный округ',
        value: 'cfd',
        children: [
            {
                label: 'Московская область',
                value: 'mos',
                children: [
                    { label: 'Москва', value: 'msk' },
                    { label: 'Химки', value: 'khi' },
                ],
            },
            { label: 'Тверь', value: 'tvr' },
            { label: 'Ярославль', value: 'yar', disabled: true },
        ],
    },
    {
        label: 'Северо-Западный округ',
        value: 'nwfd',
        children: [
            { label: 'Санкт-Петербург', value: 'spb' },
            { label: 'Калининград', value: 'kgd' },
        ],
    },
    { label: 'Новосибирск', value: 'nsk' },
];
