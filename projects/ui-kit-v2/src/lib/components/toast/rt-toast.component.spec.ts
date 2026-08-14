import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { IRtToaster } from './rt-toaster.model';
import { RtToastComponent } from './rt-toast.component';

const TOAST: IRtToaster.Toast = { id: 7, severity: 'info', message: 'Договор сохранён' };

function setup(toast: IRtToaster.Toast = TOAST, extra: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtToastComponent> {
    return createRtFixture(RtToastComponent, {
        toast,
        index: 0,
        totalToasts: 1,
        heights: [],
        expanded: false,
        duration: 0,
        ...extra,
    });
}

describe('RtToastComponent', (): void => {
    it('показывает сообщение', (): void => {
        expect(textOf(qa(setup(), 'toast-message'))).toBe('Договор сохранён');
    });

    it('надстрочник и описание появляются только вместе со своими значениями', (): void => {
        const bare: ComponentFixture<RtToastComponent> = setup();

        expect(qa(bare, 'toast-meta')).toBeNull();
        expect(qa(bare, 'toast-description')).toBeNull();

        const full: ComponentFixture<RtToastComponent> = setup({
            ...TOAST,
            meta: 'Иванов И. И. · 14 марта',
            description: 'Изменения увидят все участники.',
        });

        expect(textOf(qa(full, 'toast-meta'))).toBe('Иванов И. И. · 14 марта');
        expect(textOf(qa(full, 'toast-description'))).toBe('Изменения увидят все участники.');
    });

    it('важность и заливка объявлены модификаторами на самой плашке', (): void => {
        const fixture: ComponentFixture<RtToastComponent> = setup({ ...TOAST, severity: 'danger', filled: true });

        expect(hostClasses(fixture)).toContain('rt-toast--severity--danger');
        expect(hostClasses(fixture)).toContain('rt-toast--filled');
    });

    it('без заливки модификатора заливки нет', (): void => {
        expect(hostClasses(setup())).not.toContain('rt-toast--filled');
    });

    it('плашка за пределами видимой части стопки помечена скрытой', (): void => {
        // Стопка показывает три верхние плашки; четвёртая остаётся в разметке,
        // и отличает её только модификатор.
        const fixture: ComponentFixture<RtToastComponent> = setup(TOAST, { index: 3, totalToasts: 4, visibleToasts: 3 });

        expect(hostClasses(fixture)).toContain('rt-toast--hidden');
        expect(hostClasses(fixture)).not.toContain('rt-toast--front');
    });

    it('верхняя плашка стопки помечена передней', (): void => {
        expect(hostClasses(setup())).toContain('rt-toast--front');
    });

    it('кнопки действий появляются по своим значениям', (): void => {
        const bare: ComponentFixture<RtToastComponent> = setup();

        expect(qa(bare, 'toast-action')).toBeNull();

        const withActions: ComponentFixture<RtToastComponent> = setup({
            ...TOAST,
            action: { label: 'Повторить', handler: (): void => undefined },
            secondaryAction: { label: 'Отменить', handler: (): void => undefined },
        });

        expect(textOf(qa(withActions, 'toast-action'))).toBe('Повторить');
        expect(textOf(qa(withActions, 'toast-secondary-action'))).toBe('Отменить');
    });

    it('нажатие на действие зовёт его обработчик', (): void => {
        let called: number = 0;
        const fixture: ComponentFixture<RtToastComponent> = setup({
            ...TOAST,
            action: { label: 'Повторить', handler: (): void => void (called += 1) },
        });

        (qa(fixture, 'toast-action')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(called).toBe(1);
    });

    it('после действия плашка уходит', (): void => {
        const fixture: ComponentFixture<RtToastComponent> = setup({
            ...TOAST,
            action: { label: 'Повторить', handler: (): void => undefined },
        });

        (qa(fixture, 'toast-action')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(hostClasses(fixture)).toContain('rt-toast--removed');
    });

    it('крестик отдаёт снятую высоту наружу — стопка иначе не сомкнётся', (): void => {
        const fixture: ComponentFixture<RtToastComponent> = setup();
        let removed: number | null = null;

        fixture.componentInstance.heightRemoved.subscribe((id: number): void => void (removed = id));
        (qa(fixture, 'toast-close')?.nativeElement as HTMLElement).querySelector('button')?.click();
        fixture.detectChanges();

        expect(removed).toBe(7);
        expect(hostClasses(fixture)).toContain('rt-toast--removed');
    });

    it('смена важности перерисовывает модификатор, а не добавляет второй', (): void => {
        const fixture: ComponentFixture<RtToastComponent> = setup();

        setInputs(fixture, { toast: { ...TOAST, severity: 'success' } });
        fixture.detectChanges();

        expect(hostClasses(fixture)).toContain('rt-toast--severity--success');
        expect(hostClasses(fixture)).not.toContain('rt-toast--severity--info');
    });
});
