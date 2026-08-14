import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtAsideFooterComponent } from './rt-aside-footer.component';

/** Подвал показывает только то, что в него спроецировали, — своей разметки у него нет. */
@Component({
    selector: 'rt-aside-footer-host',
    template: `
        <rt-aside-footer>
            <button asideDismiss qa-dataid="host-dismiss" type="button">Отмена</button>
            <button asidePrimary qa-dataid="host-primary" type="button">Сохранить</button>
            <button qa-dataid="host-stray" type="button">Мимо слотов</button>
        </rt-aside-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideFooterComponent],
})
class AsideFooterHostComponent {}

function setup(): ComponentFixture<AsideFooterHostComponent> {
    return createRtFixture(AsideFooterHostComponent);
}

describe('RtAsideFooterComponent', (): void => {
    it('показывает обе кнопки слотов', (): void => {
        const fixture: ComponentFixture<AsideFooterHostComponent> = setup();

        expect(textOf(qa(fixture, 'host-dismiss'))).toBe('Отмена');
        expect(textOf(qa(fixture, 'host-primary'))).toBe('Сохранить');
    });

    it('порядок кнопок задаёт подвал, а не разметка потребителя', (): void => {
        // Иначе «Сохранить» и «Отмена» менялись бы местами от экрана к экрану.
        const fixture: ComponentFixture<AsideFooterHostComponent> = setup();
        const footer: HTMLElement = qa(fixture, 'aside-footer')?.nativeElement as HTMLElement;
        const order: string[] = Array.from(footer.querySelectorAll('[qa-dataid]')).map(
            (node: Element): string => node.getAttribute('qa-dataid') ?? ''
        );

        expect(order).toEqual(['host-dismiss', 'host-primary']);
    });

    it('содержимое мимо слотов в подвал не попадает', (): void => {
        // Слоты названы намеренно: всё прочее осталось бы висеть без места.
        const fixture: ComponentFixture<AsideFooterHostComponent> = setup();
        const footer: HTMLElement = qa(fixture, 'aside-footer')?.nativeElement as HTMLElement;

        expect(footer.querySelector('[qa-dataid="host-stray"]')).toBeNull();
    });
});
