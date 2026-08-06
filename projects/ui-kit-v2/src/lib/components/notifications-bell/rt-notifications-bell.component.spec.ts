import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { RtNotificationsBellComponent } from './rt-notifications-bell.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtNotificationsBellComponent> {
    return createRtFixture(RtNotificationsBellComponent, inputs);
}

describe('RtNotificationsBellComponent', (): void => {
    it('несёт свой BEM-блок и рисует колокольчик кнопкой', (): void => {
        const fixture: ComponentFixture<RtNotificationsBellComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-notifications-bell');
        expect((qa(fixture, 'header-bell')?.nativeElement as HTMLElement).tagName).toBe('BUTTON');
        expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-bell');
    });

    it('нажатие поднимает событие — открывать панель уведомлений будет потребитель', (): void => {
        const fixture: ComponentFixture<RtNotificationsBellComponent> = setup();
        const clicks: jest.Mock = jest.fn();
        fixture.componentInstance.clicked.subscribe(clicks);

        qa(fixture, 'header-bell')?.nativeElement.click();
        fixture.detectChanges();

        expect(clicks).toHaveBeenCalledTimes(1);
    });

    describe('метка непрочитанного', (): void => {
        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'header-bell-marker')).toBeNull();
        });

        it('рисуется точкой, объявленной картинкой с подписью', (): void => {
            // Точка несёт смысл, а не оформление, поэтому у неё своя подпись:
            // без неё скринридер сказал бы только «Уведомления».
            const fixture: ComponentFixture<RtNotificationsBellComponent> = setup({
                unread: true,
                unreadLabel: 'Есть непрочитанные',
            });

            expect(qa(fixture, 'header-bell-marker')?.attributes['role']).toBe('img');
            expect(qa(fixture, 'header-bell-marker')?.attributes['aria-label']).toBe('Есть непрочитанные');
        });

        it('принимает пустую строку как истину — так пишется голый атрибут разметки', (): void => {
            expect(qa(setup({ unread: '' }), 'header-bell-marker')).not.toBeNull();
        });
    });

    it('подпись кнопки задаётся входом — своих слов у кита здесь нет', (): void => {
        expect(qa(setup({ ariaLabel: 'Уведомления' }), 'header-bell')?.attributes['aria-label']).toBe('Уведомления');
    });
});
