import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    InputSignal,
    InputSignalWithTransform,
    input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TRtComponentInputs, setRtComponentInputs } from './component-inputs';

/**
 * Компонент со всеми родами полей сразу: обычный вход, вход с преобразованием и поле, которое
 * входом не объявлено вовсе. Последнее нужно затем, чтобы отбор шёл по типу поля, а не по имени.
 */
@Component({
    selector: 'rt-inputs-probe',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class InputsProbeComponent {
    public readonly title: InputSignal<string> = input<string>('умолчание');
    public readonly count: InputSignal<number> = input<number>(0);
    public readonly flag: InputSignalWithTransform<boolean, string | boolean> = input<boolean, string | boolean>(false, {
        transform: booleanAttribute,
    });

    /** Обычное поле: входом не объявлено, и в наборе ему не место. */
    public plain: string = 'не вход';
}

describe('TRtComponentInputs — SC-CR-08, SC-CR-09, SC-CR-10, SC-CR-11', () => {
    describe('SC-CR-08 — набор с чужим именем не собирается', () => {
        it('отбивается сборкой на неизвестном имени', () => {
            const inputs: TRtComponentInputs<InputsProbeComponent> = {
                // @ts-expect-error — входа с таким именем у компонента нет
                unknownInput: 'что-то',
            };

            expect(inputs).toBeDefined();
        });
    });

    describe('SC-CR-09 — набор с обычным полем класса не собирается', () => {
        it('отбивается сборкой на поле, которое входом не объявлено', () => {
            const inputs: TRtComponentInputs<InputsProbeComponent> = {
                // @ts-expect-error — поле есть, но входом оно не объявлено
                plain: 'значение',
            };

            expect(inputs).toBeDefined();
        });
    });

    describe('SC-CR-10 — значение сверяется с тем, что вход принимает', () => {
        it('принимает то, что вход берёт снаружи, и отбивает чужой тип', () => {
            const accepted: TRtComponentInputs<InputsProbeComponent> = { flag: 'true', title: 'Заголовок', count: 3 };
            const wrong: TRtComponentInputs<InputsProbeComponent> = {
                // @ts-expect-error — вход принимает строку или признак, а не число
                flag: 7,
            };

            expect(accepted.flag).toBe('true');
            expect(wrong).toBeDefined();
        });
    });

    describe('SC-CR-11 — поставленные входы доезжают до компонента', () => {
        it('ставит названное и оставляет неназванное с умолчанием', () => {
            const ref: ComponentRef<InputsProbeComponent> = TestBed.createComponent(InputsProbeComponent).componentRef;

            setRtComponentInputs(ref, { title: 'Поставлено', flag: 'true' });

            expect(ref.instance.title()).toBe('Поставлено');
            expect(ref.instance.flag()).toBe(true);
            expect(ref.instance.count()).toBe(0);
        });
    });
});
