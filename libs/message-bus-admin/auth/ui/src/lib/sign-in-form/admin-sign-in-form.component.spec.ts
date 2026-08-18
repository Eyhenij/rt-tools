import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ESignInFault } from '@rt/message-bus-admin/auth/util';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminSignInFormComponent } from './admin-sign-in-form.component';

/** Поле, каким его видит человек: сам ввод лежит внутри компонента кита. */
function inputOf(fixture: ComponentFixture<AdminSignInFormComponent>, id: string): HTMLInputElement {
    return fixture.debugElement.query(By.css(`[qa-dataid="${id}"] input`)).nativeElement as HTMLInputElement;
}

describe('AdminSignInFormComponent', () => {
    let fixture: ComponentFixture<AdminSignInFormComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminSignInFormComponent],
            providers: [provideRtUtils(), provideRtStorage()],
        });

        fixture = TestBed.createComponent(AdminSignInFormComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-151 — у обоих полей есть подсказка внутри поля и значок слева', () => {
        expect(inputOf(fixture, 'sign-in-name').placeholder).toBe('Имя дерева или владельца');
        expect(inputOf(fixture, 'sign-in-password').placeholder).toBe('Пароль учётной записи');

        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-name"] .rt-input__icon-left'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-password"] .rt-input__icon-left'))).not.toBeNull();
    });

    it('отказ пары остаётся сообщением в форме, а не тостом', () => {
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-fault"]'))).toBeNull();

        fixture.componentRef.setInput('fault', ESignInFault.Pair);
        fixture.detectChanges();

        const message: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="sign-in-fault"]')).nativeElement as HTMLElement;

        expect(message.textContent?.trim()).toBe('Имя или пароль не подошли');
    });

    it('незаполненная форма наверх не уходит', () => {
        let pairs: number = 0;
        fixture.componentInstance.submitted.subscribe((): void => {
            pairs += 1;
        });

        (fixture.debugElement.query(By.css('[qa-dataid="sign-in-submit"]')).nativeElement as HTMLButtonElement).click();

        expect(pairs).toBe(0);
    });
});
