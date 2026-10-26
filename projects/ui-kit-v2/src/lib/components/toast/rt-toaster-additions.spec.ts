import { ChangeDetectionStrategy, Component, DebugElement, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { INotification, NotificationBus, NotificationRef } from '../../platform';
import { RtToasterComponent } from './rt-toaster.component';
import { RT_TOAST_DATA } from './rt-toaster.model';

interface IRefreshData {
    readonly dataset: string;
}

/** Свой компонент тоста: читает данные и закрывает тост своей кнопкой. */
@Component({
    selector: 'rt-toast-refresh-test',
    template: `
        <span qa-dataid="custom-dataset">{{ data.dataset }}</span>
        <button type="button" qa-dataid="custom-close" (click)="ref?.dismiss()">Скрыть</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class RefreshToastComponent {
    public readonly data: IRefreshData = inject(RT_TOAST_DATA) as IRefreshData;
    public readonly ref: NotificationRef | null = inject(NotificationRef);
}

function setup(): ComponentFixture<RtToasterComponent> {
    return createRtFixture(RtToasterComponent);
}

function bus(): NotificationBus {
    return TestBed.inject(NotificationBus);
}

function host(fixture: ComponentFixture<RtToasterComponent>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

/** Ход времени до конца ухода: тост доигрывает анимацию и снимается. */
function settle(fixture: ComponentFixture<RtToasterComponent>): void {
    fixture.detectChanges();
    jest.advanceTimersByTime(400);
    fixture.detectChanges();
}

function reasonsOf(ref: NotificationRef): INotification.CloseReason[] {
    const reasons: INotification.CloseReason[] = [];
    ref.afterDismissed().subscribe((reason: INotification.CloseReason): void => {
        reasons.push(reason);
    });
    return reasons;
}

describe('RtToasterComponent — дополнения', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });
    describe('свой компонент', (): void => {
        it('SC-UKV-933 — компонент встаёт на место сообщения и читает данные', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().openFromComponent(RefreshToastComponent, {
                data: { dataset: 'Продажи' },
                message: 'Обновление набора',
                duration: null,
            });
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'custom-dataset'))).toBe('Продажи');
            expect(qa(fixture, 'toast-message')).toBeNull();
            expect(host(fixture).querySelector('.rt-toast__sr-message')?.textContent).toBe('Обновление набора');
            expect(qa(fixture, 'toast-close')).not.toBeNull();
            expect(host(fixture).querySelector('.rt-toast__icon')).not.toBeNull();
        });

        it('SC-UKV-933 — компонент закрывает тост ручкой, полученной инъекцией', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().openFromComponent(RefreshToastComponent, { data: { dataset: 'Гости' }, duration: null });
            const reasons: INotification.CloseReason[] = reasonsOf(ref);
            fixture.detectChanges();

            (qa(fixture, 'custom-close')?.nativeElement as HTMLButtonElement).click();
            settle(fixture);

            expect(qaAll(fixture, 'toast').length).toBe(0);
            expect(reasons).toEqual(['dismiss']);
        });

        it('SC-UKV-933 — живая доля не создаёт компонент заново', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().openFromComponent(RefreshToastComponent, {
                data: { dataset: 'Продажи' },
                duration: null,
                progressValue: 0,
            });
            fixture.detectChanges();
            const before: HTMLElement = qa(fixture, 'custom-dataset')?.nativeElement as HTMLElement;

            ref.update({ progressValue: 50 });
            fixture.detectChanges();

            expect(qa(fixture, 'custom-dataset')?.nativeElement).toBe(before);
        });

        it('SC-UKV-1001 — голый тост рисует только компонент: без значка, крестика и полосы срока', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().openFromComponent(RefreshToastComponent, {
                data: { dataset: 'Продажи' },
                message: 'Обновление набора',
                duration: 60000,
                progress: true,
                bare: true,
            });
            fixture.detectChanges();
            const toast: HTMLElement = qa(fixture, 'toast')?.nativeElement as HTMLElement;

            // Пара к утверждениям ниже: компонент и имя для чтения с экрана на месте.
            expect(textOf(qa(fixture, 'custom-dataset'))).toBe('Продажи');
            expect(host(fixture).querySelector('.rt-toast__sr-message')?.textContent).toBe('Обновление набора');
            expect(toast.classList.contains('rt-toast--bare')).toBe(true);
            expect(qa(fixture, 'toast-icon')).toBeNull();
            expect(qa(fixture, 'toast-close')).toBeNull();
            expect(qa(fixture, 'toast-progress')).toBeNull();
        });

        it('SC-UKV-1001 — голый тост закрывается ручкой своего компонента', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().openFromComponent(RefreshToastComponent, {
                data: { dataset: 'Продажи' },
                duration: null,
                bare: true,
            });
            const reasons: INotification.CloseReason[] = reasonsOf(ref);
            fixture.detectChanges();

            (qa(fixture, 'custom-close')?.nativeElement as HTMLButtonElement).click();
            settle(fixture);

            expect(qaAll(fixture, 'toast').length).toBe(0);
            expect(reasons).toEqual(['dismiss']);
        });

        it('SC-UKV-1001 — без bare оболочка тоста прежняя', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().openFromComponent(RefreshToastComponent, { data: { dataset: 'Продажи' }, duration: null });
            fixture.detectChanges();

            expect((qa(fixture, 'toast')?.nativeElement as HTMLElement).classList.contains('rt-toast--bare')).toBe(false);
            expect(qa(fixture, 'toast-close')).not.toBeNull();
        });
    });

    describe('ручка', (): void => {
        it('SC-UKV-934 — тост, ушедший вместе с тостером, сообщает ручке причину destroyed', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().open({ message: 'Нет сети', severity: 'warning', duration: null });
            const reasons: INotification.CloseReason[] = reasonsOf(ref);
            fixture.detectChanges();

            fixture.destroy();

            expect(reasons).toEqual(['destroyed']);
        });

        it('SC-UKV-934 — обновление меняет текст показанного тоста на месте', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().open({ message: 'Нет сети', severity: 'warning', duration: null });
            fixture.detectChanges();

            ref.update({ message: 'Сеть вернулась', severity: 'success', description: 'Данные обновлены' });
            fixture.detectChanges();

            expect(qaAll(fixture, 'toast').length).toBe(1);
            expect(textOf(qa(fixture, 'toast-message'))).toBe('Сеть вернулась');
            expect(textOf(qa(fixture, 'toast-description'))).toBe('Данные обновлены');
            expect(host(fixture).querySelector('rt-toast')?.classList).toContain('rt-toast--severity--success');
        });

        it('SC-UKV-934 — dismiss уводит тост, ручка сообщает причину один раз, onDismiss молчит', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const onDismiss: jest.Mock = jest.fn();
            const ref: NotificationRef = bus().open({ message: 'Задача идёт', severity: 'info', duration: null, onDismiss });
            const reasons: INotification.CloseReason[] = reasonsOf(ref);
            fixture.detectChanges();

            ref.dismiss();
            ref.dismiss();
            settle(fixture);

            expect(qaAll(fixture, 'toast').length).toBe(0);
            expect(reasons).toEqual(['dismiss']);
            expect(onDismiss).not.toHaveBeenCalled();
        });

        it.each<[string, (fixture: ComponentFixture<RtToasterComponent>) => void, INotification.CloseReason]>([
            [
                'крестик',
                (fixture: ComponentFixture<RtToasterComponent>): void =>
                    (
                        host(fixture).querySelector('[qa-dataid="toast-close"] [qa-dataid="icon-button-control"]') as HTMLButtonElement
                    ).click(),
                'close',
            ],
            [
                'действие',
                (fixture: ComponentFixture<RtToasterComponent>): void =>
                    (qa(fixture, 'toast-action')?.nativeElement as HTMLButtonElement).click(),
                'action',
            ],
        ])('SC-UKV-934 — %s: ручка узнаёт причину ухода', (_name: string, press, expected: INotification.CloseReason): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().open({
                message: 'Готово',
                severity: 'success',
                duration: null,
                action: { label: 'Открыть', handler: (): void => undefined },
            });
            const reasons: INotification.CloseReason[] = reasonsOf(ref);
            fixture.detectChanges();

            press(fixture);
            settle(fixture);

            expect(reasons).toEqual([expected]);
        });

        it('SC-UKV-934 — истёкший срок: ручка сообщает timeout; подписка после ухода тоже получает ответ', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().open({ message: 'Сохранено', severity: 'success', duration: 1000 });
            fixture.detectChanges();

            jest.advanceTimersByTime(1000);
            settle(fixture);

            expect(reasonsOf(ref)).toEqual(['timeout']);
        });

        it('SC-UKV-934 — после ухода обновление и закрытие ничего не делают', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().open({ message: 'Раз', severity: 'info', duration: null });
            fixture.detectChanges();
            ref.dismiss();
            settle(fixture);

            bus().info('Два', 'info', { duration: null });
            fixture.detectChanges();
            ref.update({ message: 'Три' });
            ref.dismiss();
            settle(fixture);

            expect(qaAll(fixture, 'toast-message').map((node): string => textOf(node))).toEqual(['Два']);
        });

        it('success и прочие короткие способы ручки не возвращают — их зовут из стрелок с типом void', (): void => {
            expect(bus().success('Сохранено')).toBeUndefined();
        });
    });

    describe('доля и подробности', (): void => {
        it('SC-UKV-935 — полоса стоит под сообщением и идёт за долей из ручки', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            const ref: NotificationRef = bus().open({ message: 'Обновление набора', severity: 'info', duration: null, progressValue: 10 });
            fixture.detectChanges();
            const bar: () => HTMLElement = (): HTMLElement => qa(fixture, 'toast-progress-value')?.nativeElement as HTMLElement;

            expect(bar().getAttribute('aria-valuenow')).toBe('10');
            expect(bar().getAttribute('aria-label')).toBe('Обновление набора');

            ref.update({ progressValue: 64 });
            fixture.detectChanges();
            expect(bar().getAttribute('aria-valuenow')).toBe('64');

            ref.update({ progressValue: null });
            fixture.detectChanges();
            expect(qa(fixture, 'toast-progress-value')).toBeNull();
        });

        it('SC-UKV-935 — без доли полосы нет', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().info('Готово');
            fixture.detectChanges();

            expect(qa(fixture, 'toast-progress-value')).toBeNull();
            expect(qa(fixture, 'toast-details-toggle')).toBeNull();
        });

        it('SC-UKV-935 — подробности раскрываются кнопкой и стоят с копированием', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();
            bus().error('Токен отклонён', 'danger', { duration: null, details: 'HTTP 401\nrequest-id: 7f3a' });
            fixture.detectChanges();
            const toggle: () => HTMLButtonElement = (): HTMLButtonElement =>
                qa(fixture, 'toast-details-toggle')?.nativeElement as HTMLButtonElement;

            expect(qa(fixture, 'toast-details')).toBeNull();
            expect(toggle().getAttribute('aria-expanded')).toBe('false');

            toggle().click();
            fixture.detectChanges();

            const details: HTMLElement = qa(fixture, 'toast-details')?.nativeElement as HTMLElement;
            expect(details.classList).toContain('rt-copy-value--wrap');
            expect(details.querySelector('[qa-dataid="copy-value-value"]')?.textContent).toBe('HTTP 401\nrequest-id: 7f3a');
            expect(details.querySelector('[qa-dataid="copy-value-button"]')).not.toBeNull();
            expect(toggle().getAttribute('aria-expanded')).toBe('true');

            toggle().click();
            fixture.detectChanges();
            expect(qa(fixture, 'toast-details')).toBeNull();
        });
    });

    describe('канал', (): void => {
        function messages(fixture: ComponentFixture<RtToasterComponent>): string[] {
            return qaAll(fixture, 'toast-message').map((node: DebugElement): string => textOf(node));
        }

        it('SC-UKV-1000 — тостер без входа показывает события без канала и не берёт чужой канал', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = setup();

            bus().success('Сохранено');
            bus().warning('Нет сети', 'offline', { channel: 'status', duration: null });
            fixture.detectChanges();

            expect(messages(fixture)).toEqual(['Сохранено']);
        });

        it('SC-UKV-1000 — тостер своего канала показывает только его события', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = createRtFixture(RtToasterComponent, { channel: 'status' });

            bus().success('Сохранено');
            bus().warning('Нет сети', 'offline', { channel: 'status', duration: null });
            fixture.detectChanges();

            expect(messages(fixture)).toEqual(['Нет сети']);
        });

        it('SC-UKV-1000 — закреплённые тосты копятся стопкой и держатся до dismiss()', (): void => {
            const fixture: ComponentFixture<RtToasterComponent> = createRtFixture(RtToasterComponent, { channel: 'status' });
            const refs: NotificationRef[] = ['Токен A', 'Токен B', 'Токен C'].map((message: string): NotificationRef =>
                bus().open({ message, severity: 'danger', duration: null, channel: 'status' })
            );
            fixture.detectChanges();
            jest.advanceTimersByTime(600000);
            fixture.detectChanges();

            expect(messages(fixture)).toEqual(['Токен C', 'Токен B', 'Токен A']);

            refs[1].dismiss();
            settle(fixture);

            expect(messages(fixture)).toEqual(['Токен C', 'Токен A']);
        });
    });
});
