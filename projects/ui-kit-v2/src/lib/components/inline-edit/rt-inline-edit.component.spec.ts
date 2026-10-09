import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtInlineEditComponent } from './rt-inline-edit.component';

async function edit(inputs: Readonly<Record<string, unknown>> = {}): Promise<ComponentFixture<RtInlineEditComponent>> {
    const fixture: ComponentFixture<RtInlineEditComponent> = createRtFixture(RtInlineEditComponent, { value: 'Отчёт', ...inputs });
    await fixture.whenStable();
    return fixture;
}

function el<T>(fixture: ComponentFixture<T>, id: string): HTMLElement | null {
    return (qa(fixture, id)?.nativeElement as HTMLElement | undefined) ?? null;
}

function field<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.rt-inline-edit__field input') as HTMLInputElement;
}

function button<T>(fixture: ComponentFixture<T>, id: string): RtIconButtonComponent {
    return (qa(fixture, id) as DebugElement).injector.get(RtIconButtonComponent);
}

async function press<T>(fixture: ComponentFixture<T>, id: string): Promise<void> {
    (el(fixture, id)?.querySelector('button') ?? el(fixture, id))?.click();
    fixture.detectChanges();
    await fixture.whenStable();
}

async function type<T>(fixture: ComponentFixture<T>, text: string): Promise<void> {
    const input: HTMLInputElement = field(fixture);
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
}

async function key<T>(fixture: ComponentFixture<T>, name: string): Promise<KeyboardEvent> {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    field(fixture).dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();
    return event;
}

function track(fixture: ComponentFixture<RtInlineEditComponent>): { saved: string[]; cancelled: number } {
    const log: { saved: string[]; cancelled: number } = { saved: [], cancelled: 0 };
    fixture.componentInstance.saved.subscribe((value: string): number => log.saved.push(value));
    fixture.componentInstance.cancelled.subscribe((): number => (log.cancelled += 1));
    return log;
}

describe('Правка на месте', (): void => {
    it('SC-UKV-786 — нажатие на значение открывает поле со значением, фокусом и выделением', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit();
        expect(el(fixture, 'inline-edit-value')?.textContent?.trim()).toBe('Отчёт');
        expect(el(fixture, 'inline-edit-value')?.getAttribute('aria-label')).toBe('Edit: Отчёт');

        await press(fixture, 'inline-edit-value');

        const input: HTMLInputElement = field(fixture);
        expect(input.value).toBe('Отчёт');
        expect(document.activeElement).toBe(input);
        expect([input.selectionStart, input.selectionEnd]).toEqual([0, 'Отчёт'.length]);
        expect(el(fixture, 'inline-edit-value')).toBeNull();
    });

    it('SC-UKV-786 — пустое значение показывает подсказку в покое', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit({ value: '', placeholder: 'Название отчёта' });
        const rest: HTMLElement | null = el(fixture, 'inline-edit-value');

        expect(rest?.textContent?.trim()).toBe('Название отчёта');
        expect(rest?.classList).toContain('rt-inline-edit__value--empty');
    });

    it('SC-UKV-787 — Enter сохраняет обрезанный черновик один раз и закрывает поле', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit();
        const log: { saved: string[]; cancelled: number } = track(fixture);
        await press(fixture, 'inline-edit-value');
        await type(fixture, '  Отчёт за май ');

        await key(fixture, 'Enter');

        expect(log.saved).toEqual(['Отчёт за май']);
        expect(fixture.componentInstance.editing()).toBe(false);
        expect(document.activeElement).toBe(el(fixture, 'inline-edit-value'));
    });

    it('SC-UKV-787 — кнопка сохранения сохраняет, а неизменный черновик закрывает поле без события', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit();
        const log: { saved: string[]; cancelled: number } = track(fixture);

        await press(fixture, 'inline-edit-value');
        await press(fixture, 'inline-edit-save');
        expect(log.saved).toEqual([]);
        expect(fixture.componentInstance.editing()).toBe(false);

        await press(fixture, 'inline-edit-value');
        await type(fixture, 'Сводка');
        await press(fixture, 'inline-edit-save');
        expect(log.saved).toEqual(['Сводка']);
    });

    it('SC-UKV-788 — Escape и кнопка отмены закрывают поле, отдают отмену и не трогают значение', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit();
        const log: { saved: string[]; cancelled: number } = track(fixture);

        await press(fixture, 'inline-edit-value');
        await type(fixture, 'Черновик');
        const escape: KeyboardEvent = await key(fixture, 'Escape');
        expect(escape.defaultPrevented).toBe(true);
        expect(log).toEqual({ saved: [], cancelled: 1 });
        expect(el(fixture, 'inline-edit-value')?.textContent?.trim()).toBe('Отчёт');

        await press(fixture, 'inline-edit-value');
        expect(field(fixture).value).toBe('Отчёт');
        await press(fixture, 'inline-edit-cancel');
        expect(log).toEqual({ saved: [], cancelled: 2 });
        expect(fixture.componentInstance.editing()).toBe(false);
    });

    it('SC-UKV-789 — пустой черновик не уходит: кнопка недоступна, Enter молчит', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit();
        const log: { saved: string[]; cancelled: number } = track(fixture);
        await press(fixture, 'inline-edit-value');
        await type(fixture, '  ');

        expect(button(fixture, 'inline-edit-save').disabled()).toBe(true);
        await key(fixture, 'Enter');
        expect(log.saved).toEqual([]);
        expect(fixture.componentInstance.editing()).toBe(true);
    });

    it('SC-UKV-789 — с разрешённым пустым значением пустой черновик сохраняется', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit({ allowEmpty: true });
        const log: { saved: string[]; cancelled: number } = track(fixture);
        await press(fixture, 'inline-edit-value');
        await type(fixture, '');

        await key(fixture, 'Enter');
        expect(log.saved).toEqual(['']);
    });

    it('SC-UKV-790 — без закрытия при сохранении поле ждёт приложение и стоит недоступным', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit({ closeOnSave: false });
        const log: { saved: string[]; cancelled: number } = track(fixture);
        await press(fixture, 'inline-edit-value');
        await type(fixture, 'Сводка');
        await key(fixture, 'Enter');

        expect(log.saved).toEqual(['Сводка']);
        expect(fixture.componentInstance.editing()).toBe(true);

        fixture.componentRef.setInput('saving', true);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(button(fixture, 'inline-edit-save').loading()).toBe(true);
        expect(button(fixture, 'inline-edit-cancel').disabled()).toBe(true);
        expect(field(fixture).disabled).toBe(true);
        await key(fixture, 'Escape');
        expect(log.cancelled).toBe(0);

        fixture.componentRef.setInput('saving', false);
        fixture.componentRef.setInput('value', 'Сводка');
        fixture.componentRef.setInput('editing', false);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(el(fixture, 'inline-edit-value')?.textContent?.trim()).toBe('Сводка');
    });

    it('SC-UKV-790 — фокус, упавший с недоступного поля, возвращается в поле при отказе и на значение при закрытии', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit({ closeOnSave: false });
        const settle: (inputs: Readonly<Record<string, unknown>>) => Promise<void> = async (
            inputs: Readonly<Record<string, unknown>>
        ): Promise<void> => {
            Object.entries(inputs).forEach(([name, value]: [string, unknown]): void => fixture.componentRef.setInput(name, value));
            fixture.detectChanges();
            await fixture.whenStable();
        };
        await press(fixture, 'inline-edit-value');
        await type(fixture, 'Сводка');
        await key(fixture, 'Enter');

        // Браузер роняет фокус с поля, ставшего недоступным: он уходит в никуда, а не на другой элемент.
        await settle({ saving: true });
        field(fixture).blur();
        await settle({ saving: false });
        expect(document.activeElement).toBe(field(fixture));

        await settle({ saving: true });
        field(fixture).blur();
        await settle({ saving: false, value: 'Сводка', editing: false });
        expect(document.activeElement).toBe(el(fixture, 'inline-edit-value'));
    });

    it('SC-UKV-790 — фокус, ушедший на другой элемент страницы, при закрытии поля не забирается', async (): Promise<void> => {
        const outside: HTMLButtonElement = document.body.appendChild(document.createElement('button'));
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit();
        await press(fixture, 'inline-edit-value');

        outside.focus();
        fixture.componentRef.setInput('editing', false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(outside);
        outside.remove();
    });

    it('SC-UKV-791 — уход фокуса держит, сохраняет или отменяет по входу; свои кнопки уходом не считаются', async (): Promise<void> => {
        const outside: HTMLButtonElement = document.body.appendChild(document.createElement('button'));
        const leave: (fixture: ComponentFixture<RtInlineEditComponent>, target: Element) => Promise<void> = async (
            fixture: ComponentFixture<RtInlineEditComponent>,
            target: Element
        ): Promise<void> => {
            field(fixture).dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: target }));
            fixture.detectChanges();
            await fixture.whenStable();
        };

        const kept: ComponentFixture<RtInlineEditComponent> = await edit();
        await press(kept, 'inline-edit-value');
        await type(kept, 'Сводка');
        await leave(kept, outside);
        expect(kept.componentInstance.editing()).toBe(true);

        const saving: ComponentFixture<RtInlineEditComponent> = await edit({ blurAction: 'save' });
        const savedLog: { saved: string[]; cancelled: number } = track(saving);
        await press(saving, 'inline-edit-value');
        await type(saving, 'Сводка');
        await leave(saving, el(saving, 'inline-edit-cancel')?.querySelector('button') as Element);
        expect(savedLog.saved).toEqual([]);
        await leave(saving, outside);
        expect(savedLog.saved).toEqual(['Сводка']);

        const cancelling: ComponentFixture<RtInlineEditComponent> = await edit({ blurAction: 'cancel' });
        const cancelLog: { saved: string[]; cancelled: number } = track(cancelling);
        await press(cancelling, 'inline-edit-value');
        await leave(cancelling, outside);
        expect(cancelLog.cancelled).toBe(1);

        outside.remove();
    });

    it('SC-UKV-792 — недоступная правка не открывает поле', async (): Promise<void> => {
        const fixture: ComponentFixture<RtInlineEditComponent> = await edit({ disabled: true });

        await press(fixture, 'inline-edit-value');
        fixture.componentInstance.open();
        fixture.detectChanges();

        expect(fixture.componentInstance.editing()).toBe(false);
        expect(el(fixture, 'inline-edit-field')).toBeNull();
        expect(el(fixture, 'inline-edit-value')?.querySelector('.rt-inline-edit__pencil')).toBeNull();
    });
});
