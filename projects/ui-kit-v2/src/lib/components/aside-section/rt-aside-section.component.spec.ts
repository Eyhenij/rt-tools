import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
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
        // Заголовок раздела живёт в той же колонке контролов, что и содержимое, — так его
        // ставит словарь формы, — поэтому текст колонки шире проецируемого.
        expect(textOf(qa(createRtFixture(AsideSectionHostComponent), 'aside-section-body'))).toContain('Телефон и почта');
    });

    it('пустой раздел тоже рисует тело — прячут его стили', (): void => {
        expect(qa(setup(), 'aside-section-body')).not.toBeNull();
    });

    it('SC-UKV-105 — раздел панели размечен словарём формы', (): void => {
        const fixture: ComponentFixture<RtAsideSectionComponent> = setup({ heading: 'Контакты' });

        expect(el(fixture, '.rt-form__controls[qa-dataid="aside-section-body"]')).not.toBeNull();
        expect(el(fixture, '.rt-form__title[qa-dataid="aside-section-heading"]')).not.toBeNull();
    });
});
