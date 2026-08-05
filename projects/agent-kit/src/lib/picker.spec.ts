/**
 * Выбиралка: переход состояния по нажатой клавише. Проверяется здесь, а не глазами на живом
 * терминале, — потому переход и вынесен из сырого режима отдельным чистым модулем.
 */
import {
    IChoice,
    IPickerState,
    KEY_CANCEL,
    KEY_DOWN,
    KEY_ESCAPE,
    KEY_UP,
    keysOf,
    pickerOf,
    pressChunk,
    pressKey,
    renderPicker,
} from './picker.js';

const CHOICES: readonly IChoice[] = [
    { id: 'laws/access.md', name: 'access', title: 'Доступ' },
    { id: 'laws/delivery.md', name: 'delivery', title: 'Поставка' },
    { id: 'laws/money.md', name: 'money', title: 'Деньги' },
];

const press: (keys: readonly string[]) => IPickerState = (keys: readonly string[]): IPickerState =>
    keys.reduce(pressKey, pickerOf(CHOICES));

describe('pickerOf', () => {
    it('первым предложением берёт всё', () => {
        expect(pickerOf(CHOICES).chosen.size).toBe(CHOICES.length);
    });
});

describe('pressKey', () => {
    it('пробел снимает галочку под курсором', () => {
        expect([...press([' ']).chosen]).toEqual(['laws/delivery.md', 'laws/money.md']);
    });

    it('пробел дважды возвращает её обратно', () => {
        expect(press([' ', ' ']).chosen.size).toBe(CHOICES.length);
    });

    it('курсор ходит вниз и заворачивается', () => {
        expect(press([KEY_DOWN, KEY_DOWN, KEY_DOWN]).cursor).toBe(0);
    });

    it('курсор вверх с первой строки уходит на последнюю', () => {
        expect(press([KEY_UP]).cursor).toBe(CHOICES.length - 1);
    });

    it('`a` снимает всё, а следом возвращает', () => {
        expect(press(['a']).chosen.size).toBe(0);
        expect(press(['a', 'a']).chosen.size).toBe(CHOICES.length);
    });

    it('enter заканчивает выбор', () => {
        expect(press(['\r']).done).toBe(true);
    });

    it('Ctrl-C и escape бросают выбор', () => {
        expect(press([KEY_CANCEL]).cancelled).toBe(true);
        expect(press([KEY_ESCAPE]).cancelled).toBe(true);
    });

    it('брошенный выбор не считается оконченным: ответа нет', () => {
        expect(press([KEY_CANCEL]).done).toBe(false);
    });

    it('после конца клавиши уже ничего не меняют', () => {
        expect(press(['\r', 'a']).chosen.size).toBe(CHOICES.length);
    });

    it('незнакомая клавиша не делает ничего', () => {
        expect(press(['ы'])).toEqual(pickerOf(CHOICES));
    });
});

describe('keysOf', () => {
    it('стрелку берёт целиком, а не escape и две буквы', () => {
        expect(keysOf(KEY_DOWN)).toEqual([KEY_DOWN]);
    });

    it('разбирает пачку клавиш из одного куска', () => {
        expect(keysOf(` ${KEY_DOWN} \r`)).toEqual([' ', KEY_DOWN, ' ', '\r']);
    });

    it('одинокий escape остаётся отменой', () => {
        expect(keysOf(KEY_ESCAPE)).toEqual([KEY_ESCAPE]);
    });
});

describe('pressChunk', () => {
    /**
     * Терминал не обещает по куску на нажатие: набранное быстро и пришедшее по конвейеру
     * приезжает одной строкой. Неразобранный кусок читался бы одной незнакомой клавишей —
     * выбиралка на первом прогоне через конвейер именно так и повисла.
     */
    it('пачка «пробел, вниз, пробел, enter» снимает два первых и заканчивает', () => {
        const state: IPickerState = pressChunk(pickerOf(CHOICES), ` ${KEY_DOWN} \r`);

        expect(state.done).toBe(true);
        expect([...state.chosen]).toEqual(['laws/money.md']);
    });
});

describe('renderPicker', () => {
    it('показывает крестик у выбранного и стрелку под курсором', () => {
        const lines: readonly string[] = renderPicker(press([' ', KEY_DOWN]), 'Какие законы?');

        expect(lines[0]).toBe('Какие законы?');
        expect(lines[3]).toContain('[ ] access');
        expect(lines[4]).toContain('[x] delivery');
        expect(lines[4].startsWith('❯')).toBe(true);
    });

    it('заголовок ресурса виден: по именам законов выбирать нечем', () => {
        expect(renderPicker(pickerOf(CHOICES), '?').join('\n')).toContain('Поставка');
    });
});
