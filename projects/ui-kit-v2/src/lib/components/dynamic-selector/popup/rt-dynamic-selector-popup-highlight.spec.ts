import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtDynamicSelectorPopupComponent } from './rt-dynamic-selector-popup.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Анна Борисова' },
    { id: 2, name: 'Борис Анин' },
];

type TPopupFixture = ComponentFixture<RtDynamicSelectorPopupComponent<IPerson>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TPopupFixture {
    return createRtFixture<RtDynamicSelectorPopupComponent<IPerson>>(
        RtDynamicSelectorPopupComponent,
        { entities: PEOPLE, keyExp: 'id', displayExp: 'name', localSearch: true, searchTerm: 'бор', ...inputs },
        { providers: [provideRouter([])] }
    );
}

function marks(fixture: TPopupFixture): string[][] {
    return qaAll(fixture, 'dynamic-selector-option-label').map((label: DebugElement): string[] =>
        Array.from((label.nativeElement as HTMLElement).querySelectorAll('.rt-dynamic-selector-popup__match')).map(
            (mark: Element): string => mark.textContent ?? ''
        )
    );
}

describe('RtDynamicSelectorPopupComponent — подсветка совпадений с поиском', (): void => {
    it('SC-UKV-730 — с подсветкой совпавшие символы подписи выделены, а подпись читается целиком', (): void => {
        const fixture: TPopupFixture = setup({ highlightSearch: true });
        const labels: DebugElement[] = qaAll(fixture, 'dynamic-selector-option-label');

        expect(labels.map((label: DebugElement): string => textOf(label.nativeElement))).toEqual(['Анна Борисова', 'Борис Анин']);
        expect(marks(fixture)).toEqual([['Бор'], ['Бор']]);
    });

    it('SC-UKV-730 — подсветка работает вместе с подписью одной строкой у выбора одной записи', (): void => {
        const fixture: TPopupFixture = setup({ highlightSearch: true, titleWrap: false, mode: 'single' });

        expect(marks(fixture)).toEqual([['Бор'], ['Бор']]);
    });

    it('SC-UKV-730 — без подсветки по умолчанию выделенных символов нет', (): void => {
        const fixture: TPopupFixture = setup();

        expect(marks(fixture).flat()).toEqual([]);
        expect(fixture.nativeElement.querySelectorAll('.rt-dynamic-selector-popup__option').length).toBe(2);
    });
});
