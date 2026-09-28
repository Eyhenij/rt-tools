import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { IRtConfirmPopover } from './rt-confirm-popover.model';
import { RtConfirmDirective } from './rt-confirm.directive';

/** Панель подтверждения живёт в оверлее CDK — ищем её в документе. */
function panel(): HTMLElement | null {
    return document.querySelector('rt-confirm-popover');
}

function button(id: 'confirm-accept' | 'confirm-cancel'): HTMLButtonElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

@Component({
    selector: 'rt-confirm-host',
    template: `
        <button
            type="button"
            qa-dataid="confirm-trigger"
            [rtConfirm]="message()"
            [rtConfirmTitle]="title()"
            [rtConfirmLabel]="label()"
            [rtConfirmCancelLabel]="cancelLabel()"
            [rtConfirmTone]="tone()"
            [rtConfirmDisabled]="disabled()"
            (confirmed)="confirmedCount = confirmedCount + 1">
            Отклонить
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtConfirmDirective],
})
class ConfirmHostComponent {
    public readonly confirm: Signal<RtConfirmDirective | undefined> = viewChild(RtConfirmDirective);
    public readonly message: WritableSignal<string> = signal<string>('Отклонить заявку?');
    public readonly title: WritableSignal<string | null> = signal<string | null>(null);
    public readonly label: WritableSignal<string> = signal<string>('');
    public readonly cancelLabel: WritableSignal<string> = signal<string>('');
    public readonly tone: WritableSignal<IRtConfirmPopover.Tone> = signal<IRtConfirmPopover.Tone>('danger');
    public readonly disabled: WritableSignal<boolean> = signal<boolean>(false);
    public confirmedCount: number = 0;
}

interface IHostPatch {
    message?: string;
    title?: string | null;
    label?: string;
    cancelLabel?: string;
    tone?: IRtConfirmPopover.Tone;
    disabled?: boolean;
}

function setup(patch: IHostPatch = {}): ComponentFixture<ConfirmHostComponent> {
    const fixture: ComponentFixture<ConfirmHostComponent> = createRtFixture(ConfirmHostComponent, {}, { skipInitialDetect: true });
    const host: ConfirmHostComponent = fixture.componentInstance;
    if (patch.message !== undefined) {
        host.message.set(patch.message);
    }
    if (patch.title !== undefined) {
        host.title.set(patch.title);
    }
    if (patch.label !== undefined) {
        host.label.set(patch.label);
    }
    if (patch.cancelLabel !== undefined) {
        host.cancelLabel.set(patch.cancelLabel);
    }
    if (patch.tone !== undefined) {
        host.tone.set(patch.tone);
    }
    if (patch.disabled !== undefined) {
        host.disabled.set(patch.disabled);
    }
    fixture.detectChanges();
    return fixture;
}

function openPanel(fixture: ComponentFixture<ConfirmHostComponent>): void {
    el(fixture, '[qa-dataid="confirm-trigger"]')?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtConfirmDirective', (): void => {
    it('клик по кнопке показывает вопрос', (): void => {
        const fixture: ComponentFixture<ConfirmHostComponent> = setup();

        openPanel(fixture);

        expect(panel()?.textContent).toContain('Отклонить заявку?');
        expect(fixture.componentInstance.confirm()?.isOpen()).toBe(true);
    });

    it('SC-UKV-372 — панель, открытая под признаком набора, несёт класс набора, без признака — нет', (): void => {
        const plain: ComponentFixture<ConfirmHostComponent> = setup();
        openPanel(plain);
        expect(document.querySelector('.rt-confirm-popover-panel')?.classList.contains('rt-preset-material')).toBe(false);
        plain.destroy();

        const fixture: ComponentFixture<ConfirmHostComponent> = setup();
        (fixture.nativeElement as HTMLElement).setAttribute('data-preset', 'material');
        openPanel(fixture);

        expect(document.querySelector('.rt-confirm-popover-panel')?.classList.contains('rt-preset-material')).toBe(true);
    });

    describe('тема куска', (): void => {
        afterEach((): void => {
            document.documentElement.removeAttribute('data-theme');
        });

        it('панель из тёмного куска несёт тему куска на коробке и снимает её, когда кусок ушёл', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();
            (fixture.nativeElement as HTMLElement).setAttribute('data-theme', 'dark');

            openPanel(fixture);
            expect(document.querySelector('.rt-confirm-popover-panel')?.getAttribute('data-theme')).toBe('dark');

            button('confirm-cancel')?.click();
            fixture.detectChanges();
            (fixture.nativeElement as HTMLElement).removeAttribute('data-theme');
            openPanel(fixture);

            expect(panel()).not.toBeNull();
            expect(document.querySelector('.rt-confirm-popover-panel')?.hasAttribute('data-theme')).toBe(false);
        });

        it('тема корня страницы на коробку не копируется', (): void => {
            document.documentElement.setAttribute('data-theme', 'dark');
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();

            openPanel(fixture);

            expect(panel()).not.toBeNull();
            expect(document.querySelector('.rt-confirm-popover-panel')?.hasAttribute('data-theme')).toBe(false);
        });
    });

    it('пустой вопрос не открывает ничего — подтверждать нечего', (): void => {
        const fixture: ComponentFixture<ConfirmHostComponent> = setup({ message: '   ' });

        openPanel(fixture);

        expect(panel()).toBeNull();
    });

    it('отключённая директива молчит', (): void => {
        const fixture: ComponentFixture<ConfirmHostComponent> = setup({ disabled: true });

        openPanel(fixture);

        expect(panel()).toBeNull();
    });

    describe('заголовок', (): void => {
        it('без входа не рисуется', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();

            openPanel(fixture);

            expect(panel()?.querySelector('.rt-confirm-popover__title')).toBeNull();
        });

        it('рисуется над вопросом, когда задан', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup({ title: 'Отклонить заявку' });

            openPanel(fixture);

            expect(panel()?.querySelector('.rt-confirm-popover__title')?.textContent?.trim()).toBe('Отклонить заявку');
        });
    });

    describe('кнопки', (): void => {
        it('подписи по умолчанию берутся из словаря кита', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();

            openPanel(fixture);

            expect(button('confirm-accept')?.getAttribute('aria-label')).toBe('Confirm');
            expect(button('confirm-cancel')?.getAttribute('aria-label')).toBe('Cancel');
        });

        it('свои подписи перебивают умолчание', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup({ label: 'Отклонить', cancelLabel: 'Оставить' });

            openPanel(fixture);

            expect(button('confirm-accept')?.getAttribute('aria-label')).toBe('Отклонить');
            expect(button('confirm-cancel')?.getAttribute('aria-label')).toBe('Оставить');
        });

        it('без входа тона подтверждение красное — подтверждают обычно удаление', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();

            openPanel(fixture);

            expect(button('confirm-accept')?.classList.contains('rt-button--danger')).toBe(true);
        });

        it('тон меняется входом', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup({ tone: 'primary' });

            openPanel(fixture);

            expect(button('confirm-accept')?.classList.contains('rt-button--danger')).toBe(false);
        });
    });

    describe('исход', (): void => {
        it('подтверждение поднимает событие и закрывает панель', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();
            openPanel(fixture);

            button('confirm-accept')?.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.confirmedCount).toBe(1);
            expect(panel()).toBeNull();
        });

        it('отмена закрывает панель и события не поднимает', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();
            openPanel(fixture);

            button('confirm-cancel')?.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.confirmedCount).toBe(0);
            expect(panel()).toBeNull();
        });

        it('Escape равносилен отмене', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();
            openPanel(fixture);

            panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.confirmedCount).toBe(0);
            expect(panel()).toBeNull();
        });

        it('клик мимо равносилен отмене', (): void => {
            const fixture: ComponentFixture<ConfirmHostComponent> = setup();
            openPanel(fixture);

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.confirmedCount).toBe(0);
            expect(panel()).toBeNull();
        });
    });
});
