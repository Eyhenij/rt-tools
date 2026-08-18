import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AdminLocaleService, EAdminLocale } from '@rt/message-bus-admin/common/core/util';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminLocaleSwitchComponent } from './admin-locale-switch.component';

/** Кнопка языка, какой её нажимает человек: якорь ставит кит на каждый сегмент. */
function optionButton(fixture: ComponentFixture<AdminLocaleSwitchComponent>, locale: EAdminLocale): HTMLButtonElement {
    return fixture.debugElement.query(By.css(`[qa-dataid="toggle-button-group-option"][data-value="${locale}"]`))
        .nativeElement as HTMLButtonElement;
}

describe('AdminLocaleSwitchComponent', () => {
    let fixture: ComponentFixture<AdminLocaleSwitchComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminLocaleSwitchComponent],
            providers: [provideRtUtils(), provideRtStorage()],
        });

        fixture = TestBed.createComponent(AdminLocaleSwitchComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('оба языка стоят рядом, и выбранный виден нажатым', () => {
        expect(optionButton(fixture, EAdminLocale.Ru).textContent?.trim()).toBe('RU');
        expect(optionButton(fixture, EAdminLocale.En).textContent?.trim()).toBe('EN');
        expect(optionButton(fixture, EAdminLocale.Ru).getAttribute('aria-pressed')).toBe('true');
    });

    it('SC-MB-149 — нажатие меняет выбранный язык у службы, а не только вид кнопки', () => {
        optionButton(fixture, EAdminLocale.En).click();
        fixture.detectChanges();

        expect(TestBed.inject(AdminLocaleService).current()).toBe(EAdminLocale.En);
        expect(optionButton(fixture, EAdminLocale.En).getAttribute('aria-pressed')).toBe('true');
    });
});
