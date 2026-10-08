import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtRadioButtonComponent } from '../../radio-button/rt-radio-button.component';
import { RtTooltipDirective } from '../../tooltip/rt-tooltip.directive';
import { RtDynamicSelectorPopupComponent } from './rt-dynamic-selector-popup.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const LONG_NAME: string = 'Анна Сергеевна Константинопольская-Преображенская';

const PEOPLE: IPerson[] = [
    { id: 1, name: LONG_NAME },
    { id: 2, name: 'Boris' },
];

type TPopupFixture = ComponentFixture<RtDynamicSelectorPopupComponent<IPerson>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TPopupFixture {
    return createRtFixture<RtDynamicSelectorPopupComponent<IPerson>>(
        RtDynamicSelectorPopupComponent,
        { entities: PEOPLE, keyExp: 'id', displayExp: 'name', ...inputs },
        { providers: [provideRouter([])] }
    );
}

function rows(fixture: TPopupFixture): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.rt-dynamic-selector-popup__row'));
}

function labels(fixture: TPopupFixture): DebugElement[] {
    return qaAll(fixture, 'dynamic-selector-option-label');
}

function tooltipOf(label: DebugElement): string {
    return label.injector.get(RtTooltipDirective).text();
}

describe('RtDynamicSelectorPopupComponent — подпись пункта одной строкой', (): void => {
    it('SC-UKV-727 — без переноса строка помечена одной строкой, а подпись несёт подсказку с полным текстом', (): void => {
        const fixture: TPopupFixture = setup({ titleWrap: false });

        expect(rows(fixture).length).toBe(2);
        expect(rows(fixture).every((row: HTMLElement): boolean => row.classList.contains('rt-dynamic-selector-popup__row--nowrap'))).toBe(
            true
        );
        expect(labels(fixture).map(tooltipOf)).toEqual([LONG_NAME, 'Boris']);
    });

    it('SC-UKV-727 — с переносом по умолчанию у строки нет метки, а у подписи нет подсказки', (): void => {
        const fixture: TPopupFixture = setup();

        expect(rows(fixture).length).toBe(2);
        expect(rows(fixture).some((row: HTMLElement): boolean => row.classList.contains('rt-dynamic-selector-popup__row--nowrap'))).toBe(
            false
        );
        expect(labels(fixture).map((label: DebugElement): string => textOf(label.nativeElement))).toEqual([LONG_NAME, 'Boris']);
        expect(labels(fixture).map(tooltipOf)).toEqual(['', '']);
    });

    it('SC-UKV-727 — у выбора одной записи без переноса подпись стоит рядом с кнопкой, ведёт её имя и выбирает строку', (): void => {
        const fixture: TPopupFixture = setup({ mode: 'single', titleWrap: false });
        const radios: RtRadioButtonComponent[] = qaAll(fixture, 'dynamic-selector-option').map(
            (option: DebugElement): RtRadioButtonComponent => option.componentInstance as RtRadioButtonComponent
        );

        expect(radios.map((radio: RtRadioButtonComponent): string => radio.label())).toEqual(['', '']);
        expect(radios.map((radio: RtRadioButtonComponent): string | null => radio.ariaLabel())).toEqual([LONG_NAME, 'Boris']);
        expect(labels(fixture).map(tooltipOf)).toEqual([LONG_NAME, 'Boris']);

        (labels(fixture)[1].nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(
            qaAll(fixture, 'dynamic-selector-option').map(
                (option: DebugElement): string | null =>
                    (option.nativeElement as HTMLElement).querySelector('[role="radio"]')?.getAttribute('aria-checked') ?? null
            )
        ).toEqual(['false', 'true']);
    });

    it('SC-UKV-727 — у выбора одной записи с переносом подпись рисует сама кнопка', (): void => {
        const fixture: TPopupFixture = setup({ mode: 'single' });
        const radios: RtRadioButtonComponent[] = qaAll(fixture, 'dynamic-selector-option').map(
            (option: DebugElement): RtRadioButtonComponent => option.componentInstance as RtRadioButtonComponent
        );

        expect(radios.map((radio: RtRadioButtonComponent): string => radio.label())).toEqual([LONG_NAME, 'Boris']);
        expect(labels(fixture)).toEqual([]);
    });
});
