import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtAsideSectionComponent } from './rt-aside-section.component';

/** Содержимое приходит проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-aside-section-host',
    template: `
        <rt-aside-section heading="Контакты">
            <p>Телефон и почта</p>
        </rt-aside-section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideSectionComponent],
})
class AsideSectionHostComponent {}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAsideSectionComponent> {
    return createRtFixture(RtAsideSectionComponent, inputs);
}

describe('RtAsideSectionComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-aside-section');
    });

    it('заголовок рисуется, когда задан', (): void => {
        expect(textOf(qa(setup({ heading: 'Контакты' }), 'aside-section-heading'))).toBe('Контакты');
    });

    it('без заголовка пустой строки в раскладке нет', (): void => {
        // Разделы асайда часто идут подряд без подписей — пустой заголовок
        // добавлял бы им лишний отступ.
        expect(qa(setup(), 'aside-section-heading')).toBeNull();
    });

    it('тело раздела существует всегда — в него проецируется содержимое', (): void => {
        expect(textOf(qa(createRtFixture(AsideSectionHostComponent), 'aside-section-body'))).toBe('Телефон и почта');
    });

    it('пустой раздел тоже рисует тело — прячут его стили', (): void => {
        expect(qa(setup(), 'aside-section-body')).not.toBeNull();
    });
});
