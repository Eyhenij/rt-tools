import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtConfirmPopoverComponent } from './rt-confirm-popover.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtConfirmPopoverComponent> {
    return createRtFixture(RtConfirmPopoverComponent, { message: 'Удалить договор?', ...inputs });
}

describe('RtConfirmPopoverComponent', (): void => {
    it('показывает вопрос', (): void => {
        expect(textOf(el(setup(), '.rt-confirm-popover__message'))).toBe('Удалить договор?');
    });

    it('заголовок появляется только со своим значением', (): void => {
        expect(el(setup(), '.rt-confirm-popover__title')).toBeNull();
        expect(textOf(el(setup({ title: 'Удаление' }), '.rt-confirm-popover__title'))).toBe('Удаление');
    });

    it('без своих подписей кнопки берут переведённые умолчания', (): void => {
        const fixture: ComponentFixture<RtConfirmPopoverComponent> = setup();

        expect(textOf(qa(fixture, 'confirm-accept'))).toBe('Confirm');
        expect(textOf(qa(fixture, 'confirm-cancel'))).toBe('Cancel');
    });

    it('свои подписи перебивают умолчания', (): void => {
        const fixture: ComponentFixture<RtConfirmPopoverComponent> = setup({ confirmLabel: 'Удалить', cancelLabel: 'Оставить' });

        expect(textOf(qa(fixture, 'confirm-accept'))).toBe('Удалить');
        expect(textOf(qa(fixture, 'confirm-cancel'))).toBe('Оставить');
    });

    it('согласие и отказ уезжают разными выходами', (): void => {
        // Порознь каждая кнопка выглядит исправной: перепутанные выходы видны
        // только рядом.
        const fixture: ComponentFixture<RtConfirmPopoverComponent> = setup();
        const seen: string[] = [];

        fixture.componentInstance.accepted.subscribe((): void => void seen.push('accepted'));
        fixture.componentInstance.cancelled.subscribe((): void => void seen.push('cancelled'));

        (qa(fixture, 'confirm-accept')?.nativeElement as HTMLElement).click();
        (qa(fixture, 'confirm-cancel')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(seen).toEqual(['accepted', 'cancelled']);
    });

    it('опасное действие красится палитрой опасности, обычное — своей', (): void => {
        const fixture: ComponentFixture<RtConfirmPopoverComponent> = setup();

        expect(classesOf(qa(fixture, 'confirm-accept'))).toContain('rt-button--danger');

        setInputs(fixture, { tone: 'primary' });
        fixture.detectChanges();

        expect(classesOf(qa(fixture, 'confirm-accept'))).not.toContain('rt-button--danger');
    });
});
