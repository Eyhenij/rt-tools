import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { NotificationBus } from '../../platform';
import { RT_TOAST_SEVERITY_ICONS, IRtToaster } from './rt-toaster.model';
import { RtToasterComponent } from './rt-toaster.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtToasterComponent> {
    return createRtFixture(RtToasterComponent, inputs);
}

function bus(): NotificationBus {
    return TestBed.inject(NotificationBus);
}

function messages(fixture: ComponentFixture<RtToasterComponent>): string[] {
    return qaAll(fixture, 'toast-message').map((node: DebugElement): string => textOf(node));
}

describe('RtToasterComponent', (): void => {
    it('пустой, пока никто ничего не сообщил', (): void => {
        expect(qaAll(setup(), 'toast').length).toBe(0);
    });

    it('сообщение из шины превращается в тост', (): void => {
        // Стопка ничего не знает о том, кто шлёт: она подписана на шину, и это
        // единственный способ показать тост.
        const fixture: ComponentFixture<RtToasterComponent> = setup();

        bus().success('Сохранено');
        fixture.detectChanges();

        expect(messages(fixture)).toEqual(['Сохранено']);
    });

    it('новый тост встаёт первым — сверху стопки', (): void => {
        const fixture: ComponentFixture<RtToasterComponent> = setup();

        bus().info('Первое');
        fixture.detectChanges();
        bus().info('Второе');
        fixture.detectChanges();

        expect(messages(fixture)).toEqual(['Второе', 'Первое']);
    });

    it.each<[string, (notifications: NotificationBus, text: string) => void, string]>([
        ['успех', (notifications: NotificationBus, text: string): void => notifications.success(text), 'check-circle'],
        ['сообщение', (notifications: NotificationBus, text: string): void => notifications.info(text), 'info-circle'],
        ['предупреждение', (notifications: NotificationBus, text: string): void => notifications.warning(text), 'exclamation-circle'],
        ['ошибка', (notifications: NotificationBus, text: string): void => notifications.error(text), 'times-circle'],
    ])('%s рисуется своей иконкой', (_name: string, emit: (notifications: NotificationBus, text: string) => void, icon: string): void => {
        const fixture: ComponentFixture<RtToasterComponent> = setup();

        emit(bus(), 'Текст');
        fixture.detectChanges();

        expect((fixture.nativeElement as HTMLElement).querySelector('.rt-toast__icon use')?.getAttribute('href')).toBe(`#rt-icon-${icon}`);
    });

    describe('содержимое тоста', (): void => {
        it('описание и надпись сверху рисуются, когда переданы', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Заявка принята', 'info', { description: 'Ответ придёт в течение дня', meta: 'Заявка №12' });
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'toast-description'))).toBe('Ответ придёт в течение дня');
            expect(textOf(qa(fixture, 'toast-meta'))).toBe('Заявка №12');
        });

        it('без описания лишних узлов нет', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Готово');
            fixture.detectChanges();

            expect(qa(fixture, 'toast-description')).toBeNull();
            expect(qa(fixture, 'toast-meta')).toBeNull();
        });

        it('действие рисуется кнопкой и зовёт переданный обработчик', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const handler: jest.Mock = jest.fn();

            bus().info('Файл удалён', 'info', { action: { label: 'Вернуть', handler } });
            fixture.detectChanges();
            qa(fixture, 'toast-action')?.nativeElement.click();
            fixture.detectChanges();

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('второе действие рисуется рядом с первым', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Файл удалён', 'info', {
                action: { label: 'Вернуть', handler: (): void => undefined },
                secondaryAction: { label: 'Подробнее', handler: (): void => undefined },
            });
            fixture.detectChanges();

            expect(qa(fixture, 'toast-secondary-action')).not.toBeNull();
        });
    });

    describe('закрытие', (): void => {
        it('крестик убирает тост из стопки', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            bus().info('Готово');
            fixture.detectChanges();

            (
                (fixture.nativeElement as HTMLElement).querySelector(
                    '[qa-dataid="toast-close"] [qa-dataid="icon-button-control"]'
                ) as HTMLButtonElement
            ).click();
            fixture.detectChanges();
            jest.advanceTimersByTime(400);
            fixture.detectChanges();

            expect(qaAll(fixture, 'toast').length).toBe(0);
        });
    });

    describe('положение', (): void => {
        it('без входа стопка стоит в правом нижнем углу', (): void => {
            expect(hostClasses(setup())).toEqual(expect.arrayContaining(['rt-toaster--y--bottom', 'rt-toaster--x--right']));
        });

        it.each<[IRtToaster.Position, string, string]>([
            ['top-left', 'top', 'left'],
            ['top-center', 'top', 'center'],
            ['top-right', 'top', 'right'],
            ['bottom-left', 'bottom', 'left'],
            ['bottom-center', 'bottom', 'center'],
            ['bottom-right', 'bottom', 'right'],
        ])('положение %s раскладывается на два модификатора', (position: IRtToaster.Position, y: string, x: string): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup({ position });

            expect(hostClasses(fixture)).toEqual(expect.arrayContaining([`rt-toaster--y--${y}`, `rt-toaster--x--${x}`]));
        });
    });

    describe('доступность', (): void => {
        it('стопка объявлена областью с переведённой подписью', (): void => {
            const host: HTMLElement = setup().nativeElement as HTMLElement;

            expect(host.getAttribute('role')).toBe('region');
            expect(host.getAttribute('aria-label')).toBe('Notifications');
        });

        it('тост объявлен статусом и читается целиком, а не по изменённым кускам', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Готово');
            fixture.detectChanges();

            const toast: HTMLElement = qa(fixture, 'toast')?.nativeElement as HTMLElement;
            expect(toast.getAttribute('role')).toBe('status');
            expect(toast.getAttribute('aria-atomic')).toBe('true');
        });
    });

    it('время жизни и число видимых тостов задаются входами', (): void => {
        const fixture: ComponentFixture<RtToasterComponent> = setup();

        setInputs(fixture, { duration: 8000, visibleToasts: 5 });
        fixture.detectChanges();
        bus().info('Готово');
        fixture.detectChanges();

        expect(qaAll(fixture, 'toast').length).toBe(1);
    });

    describe('параметры тоста', (): void => {
        function closeTimers(fixture: ComponentFixture<RtToasterComponent>, ms: number): void {
            fixture.detectChanges();
            jest.advanceTimersByTime(ms);
            fixture.detectChanges();
            jest.advanceTimersByTime(400);
            fixture.detectChanges();
        }

        function iconHref(fixture: ComponentFixture<RtToasterComponent>): string | null | undefined {
            return (fixture.nativeElement as HTMLElement).querySelector('.rt-toast__icon use')?.getAttribute('href');
        }

        it('SC-UKV-580 — тост живёт свой срок, а без него — срок тостера', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup({ duration: 8000 });

            bus().info('Короткий', 'info', { duration: 1000 });
            bus().info('Обычный');
            closeTimers(fixture, 1000);

            expect(messages(fixture)).toEqual(['Обычный']);

            closeTimers(fixture, 7000);

            expect(messages(fixture)).toEqual([]);
        });

        it('SC-UKV-581 — тост без срока держится, пока его не закроют', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().warning('Нужен ответ', 'warning', { duration: null });
            closeTimers(fixture, 60000);

            expect(messages(fixture)).toEqual(['Нужен ответ']);
        });

        it('SC-UKV-582 — полоса срока рисуется по просьбе и встаёт вместе с таймером', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Без полосы');
            bus().info('С полосой', 'info', { progress: true, duration: 3000 });
            fixture.detectChanges();

            expect(qaAll(fixture, 'toast-progress').length).toBe(1);
            const toast: HTMLElement = qa(fixture, 'toast')?.nativeElement as HTMLElement;
            expect(toast.style.getPropertyValue('--lifetime')).toBe('3000ms');
            expect(toast.classList).not.toContain('rt-toast--paused');

            (fixture.nativeElement as HTMLElement).dispatchEvent(new Event('mouseenter'));
            fixture.detectChanges();

            expect(toast.classList).toContain('rt-toast--paused');
        });

        it('SC-UKV-583 — у тоста без таймера полосы срока нет', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Висит', 'info', { progress: true, duration: null });
            fixture.detectChanges();

            expect(qa(fixture, 'toast')).not.toBeNull();
            expect(qa(fixture, 'toast-progress')).toBeNull();
        });

        it('SC-UKV-585 — в режиме замены новый тост уводит прежние', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup({ mode: 'replace', duration: 60000 });

            bus().info('Первое');
            fixture.detectChanges();
            bus().info('Второе');
            closeTimers(fixture, 0);

            expect(messages(fixture)).toEqual(['Второе']);
        });

        it('SC-UKV-585 — в режиме стопки прежние тосты остаются', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup({ duration: 60000 });

            bus().info('Первое');
            fixture.detectChanges();
            bus().info('Второе');
            closeTimers(fixture, 0);

            expect(messages(fixture)).toEqual(['Второе', 'Первое']);
        });

        it('SC-UKV-586 — свой значок тоста важнее значка важности, а null его снимает', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().success('Своим значком', 'success', { icon: 'bell' });
            fixture.detectChanges();

            expect(iconHref(fixture)).toBe('#rt-icon-bell');

            bus().success('Без значка', 'success', { icon: null });
            fixture.detectChanges();

            expect(qaAll(fixture, 'toast-icon').length).toBe(1);
        });

        it('SC-UKV-587 — карта значков важности подменяется через внедрение', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = createRtFixture(
                RtToasterComponent,
                {},
                {
                    providers: [
                        { provide: RT_TOAST_SEVERITY_ICONS, useValue: { info: 'bell', success: 'check', warning: 'bell', danger: 'bell' } },
                    ],
                }
            );

            bus().success('Готово');
            fixture.detectChanges();

            expect(iconHref(fixture)).toBe('#rt-icon-check');
        });
    });

    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });
});
