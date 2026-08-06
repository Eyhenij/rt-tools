import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtInfoItemComponent } from './rt-info-item.component';

/**
 * Значение приходит проекцией, поэтому нужна host-обёртка. Поля обёртки —
 * сигналы: у компонента `OnPush`, и присвоение в обычное поле не пометило бы
 * представление к перерисовке.
 */
@Component({
    selector: 'rt-info-item-host',
    template: '<rt-info-item [label]="label()" [loading]="loading()" [grow]="grow()">{{ value() }}</rt-info-item>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInfoItemComponent],
})
class InfoItemHostComponent {
    public readonly label: WritableSignal<string> = signal<string>('Тариф');
    public readonly value: WritableSignal<string> = signal<string>('Базовый');
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly grow: WritableSignal<boolean> = signal<boolean>(false);
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtInfoItemComponent> {
    return createRtFixture(RtInfoItemComponent, { label: 'Тариф', ...inputs });
}

describe('RtInfoItemComponent', (): void => {
    it('рисует подпись', (): void => {
        expect(textOf(qa(setup({ label: 'Владелец' }), 'info-item-label'))).toBe('Владелец');
    });

    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-info-item');
    });

    it('проецирует значение рядом с подписью', (): void => {
        const fixture: ComponentFixture<InfoItemHostComponent> = createRtFixture(InfoItemHostComponent);

        expect(textOf(qa(fixture, 'info-item-value'))).toBe('Базовый');
    });

    describe('загрузка', (): void => {
        it('без входа рисуется значение, заглушки нет', (): void => {
            const fixture: ComponentFixture<InfoItemHostComponent> = createRtFixture(InfoItemHostComponent);

            expect(qa(fixture, 'info-item-value')).not.toBeNull();
            expect(qa(fixture, 'info-item-skeleton')).toBeNull();
        });

        it('на время загрузки значение подменяется заглушкой', (): void => {
            const fixture: ComponentFixture<InfoItemHostComponent> = createRtFixture(InfoItemHostComponent);

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'info-item-skeleton')).not.toBeNull();
            expect(qa(fixture, 'info-item-value')).toBeNull();
        });

        it('подпись во время загрузки остаётся — по ней читается, чего ждут', (): void => {
            const fixture: ComponentFixture<RtInfoItemComponent> = setup({ loading: true, label: 'Тариф' });

            expect(textOf(qa(fixture, 'info-item-label'))).toBe('Тариф');
        });

        it('заглушка узкая — под значение, а не под всю строку', (): void => {
            const fixture: ComponentFixture<RtInfoItemComponent> = setup({ loading: true });

            expect(el(fixture, '[qa-dataid="skeleton-wrapper-placeholder"]')?.styles['width']).toBe('80px');
        });
    });

    describe('растягивание', (): void => {
        it('без входа элемент занимает свою ширину', (): void => {
            expect(hostClasses(setup())).not.toContain('rt-info-item--grow');
        });

        it('вход растягивает элемент по свободному месту строки', (): void => {
            expect(hostClasses(setup({ grow: true }))).toContain('rt-info-item--grow');
        });

        it('снятие входа возвращает исходную ширину', (): void => {
            const fixture: ComponentFixture<RtInfoItemComponent> = setup({ grow: true });

            setInputs(fixture, { grow: false });
            fixture.detectChanges();

            expect(hostClasses(fixture)).not.toContain('rt-info-item--grow');
        });
    });
});
