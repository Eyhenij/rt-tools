import { ErrorHandler } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { forgetConfirmDialogCode } from './rt-menu-confirm.code';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RT_MENU_CONFIRM_EVENT } from './rt-menu.model';

const handled: unknown[] = [];

function setup(inputs: Readonly<Record<string, unknown>> = { label: 'Удалить', confirmMessage: 'Удалить запись?' }): {
    fixture: ComponentFixture<RtMenuItemComponent>;
    picks: jest.Mock;
    pending: boolean[];
} {
    const fixture: ComponentFixture<RtMenuItemComponent> = createRtFixture(RtMenuItemComponent, inputs, {
        providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown): number => handled.push(error) } }],
    });
    const picks: jest.Mock = jest.fn();
    const pending: boolean[] = [];
    fixture.componentInstance.selected.subscribe(picks);
    (fixture.nativeElement as HTMLElement).addEventListener(RT_MENU_CONFIRM_EVENT, (event: Event): void => {
        pending.push((event as CustomEvent<boolean>).detail);
    });

    return { fixture, picks, pending };
}

/** Код диалога приходит отдельным куском: ждём, пока обещание его загрузки отработает. */
async function flushDialogCode(fixture: ComponentFixture<RtMenuItemComponent>): Promise<void> {
    for (let pass: number = 0; pass < 10; pass += 1) {
        await Promise.resolve();
    }
    fixture.detectChanges();
}

function click(fixture: ComponentFixture<RtMenuItemComponent>): void {
    (fixture.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

function dialog(): Element | null {
    return document.querySelector('rt-menu-confirm-dialog');
}

function press(anchor: string): void {
    document.querySelector<HTMLElement>(`[qa-dataid="${anchor}"]`)?.click();
}

describe('Пункт меню — код диалога подтверждения приходит позже щелчка', (): void => {
    beforeEach((): void => {
        forgetConfirmDialogCode();
        handled.length = 0;
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('«Подтвердить» после прихода кода даёт выбор один раз и снимает ожидание меню', async (): Promise<void> => {
        const { fixture, picks, pending } = setup();

        click(fixture);
        expect(dialog()).toBeNull();
        await flushDialogCode(fixture);
        expect(dialog()).not.toBeNull();
        press('menu-confirm-accept');
        fixture.detectChanges();

        expect(picks).toHaveBeenCalledTimes(1);
        expect(pending).toEqual([true, false]);
        expect(handled).toHaveLength(0);
    });

    it('«Отмена» не даёт выбора и снимает ожидание меню', async (): Promise<void> => {
        const { fixture, picks, pending } = setup();

        click(fixture);
        await flushDialogCode(fixture);
        press('menu-confirm-cancel');
        fixture.detectChanges();

        expect(picks).not.toHaveBeenCalled();
        expect(pending).toEqual([true, false]);
    });

    it('закрытие диалога без ответа считается отменой', async (): Promise<void> => {
        const { fixture, picks, pending } = setup();

        click(fixture);
        await flushDialogCode(fixture);
        document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
        fixture.detectChanges();

        expect(picks).not.toHaveBeenCalled();
        expect(pending).toEqual([true, false]);
    });

    it('повторное подтверждение берёт готовый код и открывает диалог сразу', async (): Promise<void> => {
        const { fixture } = setup();
        click(fixture);
        await flushDialogCode(fixture);
        press('menu-confirm-cancel');
        fixture.detectChanges();
        expect(dialog()).toBeNull();

        click(fixture);

        expect(dialog()).not.toBeNull();
    });

    it('снос пункта до прихода кода не открывает диалога и не даёт выбора', async (): Promise<void> => {
        const { fixture, picks } = setup();

        click(fixture);
        fixture.destroy();
        await flushDialogCode(fixture);

        expect(dialog()).toBeNull();
        expect(picks).not.toHaveBeenCalled();
    });

    it('отключённый пункт кода диалога не просит и диалога не открывает', async (): Promise<void> => {
        const { fixture, picks, pending } = setup({ label: 'Удалить', confirmMessage: 'Удалить запись?', disabled: true });

        click(fixture);
        await flushDialogCode(fixture);

        expect(dialog()).toBeNull();
        expect(picks).not.toHaveBeenCalled();
        expect(pending).toEqual([]);
    });

    it('пункт без вопроса выбирается сразу, без диалога', async (): Promise<void> => {
        const { fixture, picks, pending } = setup({ label: 'Открыть' });

        click(fixture);
        await flushDialogCode(fixture);

        expect(dialog()).toBeNull();
        expect(picks).toHaveBeenCalledTimes(1);
        expect(pending).toEqual([]);
    });
});
