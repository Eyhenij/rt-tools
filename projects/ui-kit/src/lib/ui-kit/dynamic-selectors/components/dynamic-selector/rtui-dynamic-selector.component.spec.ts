import { MatFormFieldAppearance } from '@angular/material/form-field';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IRtUiConfig, RT_UI_CONFIG } from '../../../config';
import { RtuiDynamicSelectorComponent } from './rtui-dynamic-selector.component';

interface IEntity extends Record<string, unknown> {
    id: string;
}

const ENTITIES: IEntity[] = [{ id: 'first' }, { id: 'second' }];

/**
 * Вид, доехавший до вложенного списка выбранного.
 *
 * Читается со вложенного компонента, а не с самого поля Material: поле рисуется по условию и в
 * пустом селекторе его нет вовсе, а статья договорённости — как раз о том, что вложенный получает
 * уже разрешённое значение, а не разрешает его заново.
 */
function nestedAppearance(fixture: ComponentFixture<RtuiDynamicSelectorComponent<IEntity, 'id'>>): string | null {
    const nested: { appearance: () => string } | null = fixture.debugElement.query(By.css('rtui-dynamic-selector-selected-list'))
        ?.componentInstance as { appearance: () => string } | null;

    return nested ? nested.appearance() : null;
}

function setup(
    config: IRtUiConfig.Config = {},
    appearance?: MatFormFieldAppearance
): ComponentFixture<RtuiDynamicSelectorComponent<IEntity, 'id'>> {
    TestBed.configureTestingModule({
        imports: [RtuiDynamicSelectorComponent],
        providers: [{ provide: RT_UI_CONFIG, useValue: config }],
    });

    const fixture: ComponentFixture<RtuiDynamicSelectorComponent<IEntity, 'id'>> = TestBed.createComponent<
        RtuiDynamicSelectorComponent<IEntity, 'id'>
    >(RtuiDynamicSelectorComponent<IEntity, 'id'>);

    // Входы реактивные: присваивание полю экземпляра их не меняет.
    fixture.componentRef.setInput('keyExp', 'id');
    fixture.componentRef.setInput('displayExp', 'id');
    fixture.componentRef.setInput('entities', ENTITIES);

    if (appearance) {
        fixture.componentRef.setInput('appearance', appearance);
    }

    fixture.detectChanges();

    return fixture;
}

describe('RtuiDynamicSelectorComponent — SC-UK-53, SC-UK-54, SC-UK-55', () => {
    describe('SC-UK-53 — без настройки поле остаётся прежним', () => {
        it('отдаёт вид с заливкой', () => {
            expect(setup().componentInstance.resolvedAppearance()).toBe('fill');
        });
    });

    describe('SC-UK-54 — раздел настройки задаёт вид поля', () => {
        it('отдаёт вид из настройки, когда вход не задан', () => {
            const fixture: ComponentFixture<RtuiDynamicSelectorComponent<IEntity, 'id'>> = setup({
                components: { dynamicSelectors: { appearance: 'outline' } },
            });

            expect(fixture.componentInstance.resolvedAppearance()).toBe('outline');
            expect(nestedAppearance(fixture)).toBe('outline');
        });
    });

    describe('SC-UK-55 — вход на месте перебивает настройку', () => {
        it('отдаёт вид из входа, а не из настройки', () => {
            const fixture: ComponentFixture<RtuiDynamicSelectorComponent<IEntity, 'id'>> = setup(
                { components: { dynamicSelectors: { appearance: 'outline' } } },
                'fill'
            );

            expect(fixture.componentInstance.resolvedAppearance()).toBe('fill');
        });
    });
});
