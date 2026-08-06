import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtTag } from '../tag/rt-tag.model';
import { RtMessageComponent } from './rt-message.component';

/** Текст сообщения приходит проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-message-host',
    template: '<rt-message severity="danger" [closable]="true">Не удалось сохранить</rt-message>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMessageComponent],
})
class MessageHostComponent {}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtMessageComponent> {
    return createRtFixture(RtMessageComponent, inputs);
}

function iconHref(fixture: ComponentFixture<RtMessageComponent>): string | null | undefined {
    return el(fixture, '.rt-message__icon use')?.attributes['href'];
}

describe('RtMessageComponent', (): void => {
    it('объявлено сообщением тревоги — скринридер читает его сразу', (): void => {
        // Этим оно и отличается от `rt-note`: то вспомогательное, это перебивает.
        const alert: HTMLElement = qa(setup(), 'message-alert')?.nativeElement as HTMLElement;

        expect(alert.getAttribute('role')).toBe('alert');
        expect(alert.tagName).toBe('ASIDE');
    });

    it('текст приходит проекцией', (): void => {
        expect(textOf(qa(createRtFixture(MessageHostComponent), 'message-body'))).toBe('Не удалось сохранить');
    });

    describe('палитра', (): void => {
        it('без входа — нейтрально-информационная', (): void => {
            const fixture: ComponentFixture<RtMessageComponent> = setup();

            expect(classesOf(qa(fixture, 'message-alert'))).toContain('rt-message--severity--info');
            expect(qa(fixture, 'message-alert')?.attributes['data-severity']).toBe('info');
        });

        it.each<IRtTag.Severity>(['info', 'success', 'warning', 'danger', 'secondary', 'neutral'])(
            'палитра %s помечает сообщение',
            (severity: IRtTag.Severity): void => {
                expect(classesOf(qa(setup({ severity }), 'message-alert'))).toContain(`rt-message--severity--${severity}`);
            }
        );
    });

    describe('иконка', (): void => {
        it.each<[IRtTag.Severity, string]>([
            ['info', '#rt-icon-ico-info'],
            ['success', '#rt-icon-check'],
            ['warning', '#rt-icon-ico-warning'],
            ['danger', '#rt-icon-ico-error'],
        ])('палитра %s подставляет свою иконку', (severity: IRtTag.Severity, href: string): void => {
            expect(iconHref(setup({ severity }))).toBe(href);
        });

        it.each<IRtTag.Severity>(['secondary', 'neutral'])('у палитры %s своей иконки нет', (severity: IRtTag.Severity): void => {
            // Приглушённым сообщениям иконка не нужна: они не сообщают об исходе.
            expect(el(setup({ severity }), '.rt-message__icon')).toBeNull();
        });

        it('заданная иконка перебивает умолчание палитры', (): void => {
            expect(iconHref(setup({ severity: 'danger', icon: 'bell' }))).toBe('#rt-icon-bell');
        });

        it('иконку можно погасить целиком, даже заданную', (): void => {
            expect(el(setup({ severity: 'danger', icon: 'bell', hideIcon: true }), '.rt-message__icon')).toBeNull();
        });
    });

    describe('закрытие', (): void => {
        it('без входа крестика нет', (): void => {
            expect(qa(setup(), 'message-close')).toBeNull();
        });

        it('крестик просит закрыть, но сам сообщение не убирает', (): void => {
            // Убрать сообщение — дело потребителя: оно может быть частью формы.
            const fixture: ComponentFixture<RtMessageComponent> = setup({ closable: true });
            const closes: jest.Mock = jest.fn();
            fixture.componentInstance.closed.subscribe(closes);

            el(fixture, '[qa-dataid="message-close"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(closes).toHaveBeenCalledTimes(1);
            expect(qa(fixture, 'message-alert')).not.toBeNull();
        });

        it('крестик подписан переведённой подписью', (): void => {
            const fixture: ComponentFixture<RtMessageComponent> = setup({ closable: true });

            expect(el(fixture, '[qa-dataid="message-close"] [qa-dataid="icon-button-control"]')?.attributes['aria-label']).toBe('Close');
        });
    });
});
