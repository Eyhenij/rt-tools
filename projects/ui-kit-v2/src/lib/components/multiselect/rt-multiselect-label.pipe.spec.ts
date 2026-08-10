import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectLabelPipe } from './rt-multiselect-label.pipe';

const pipe: RtMultiselectLabelPipe = new RtMultiselectLabelPipe();

const OPTIONS: ReadonlyArray<IRtSelect.Option<number>> = [
    { label: 'Москва', value: 1 },
    { label: 'Санкт-Петербург', value: 2 },
];

describe('RtMultiselectLabelPipe', (): void => {
    it('по значению отдаёт подпись его варианта', (): void => {
        expect(pipe.transform(2, OPTIONS)).toBe('Санкт-Петербург');
    });

    it('значение, которого нет в вариантах, показывает само себя', (): void => {
        // Иначе чип выбранного значения оказался бы пустым, и человек не понял бы,
        // что именно у него выбрано.
        expect(pipe.transform(7, OPTIONS)).toBe('7');
    });

    it('пустой набор вариантов оставляет значение как есть', (): void => {
        expect(pipe.transform(1, [])).toBe('1');
    });
});
