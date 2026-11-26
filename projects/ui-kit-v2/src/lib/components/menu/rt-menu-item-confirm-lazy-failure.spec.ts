import { ErrorHandler } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RT_MENU_CONFIRM_EVENT } from './rt-menu.model';

/** Код диалога не загружается: так выглядит оборванная сеть или кусок, которого после выкладки уже нет. */
jest.mock('./rt-menu-confirm-dialog.component', (): never => {
    throw new Error('the dialog code did not load');
});

async function flushDialogCode(): Promise<void> {
    for (let pass: number = 0; pass < 10; pass += 1) {
        await Promise.resolve();
    }
}

describe('Пункт меню — код диалога подтверждения не загрузился', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('сбой загрузки называется обработчику ошибок, снимает ожидание меню и допускает повтор', async (): Promise<void> => {
        const handled: unknown[] = [];
        const fixture: ComponentFixture<RtMenuItemComponent> = createRtFixture(
            RtMenuItemComponent,
            { label: 'Удалить', confirmMessage: 'Удалить запись?' },
            { providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown): number => handled.push(error) } }] }
        );
        const picks: jest.Mock = jest.fn();
        const pending: boolean[] = [];
        fixture.componentInstance.selected.subscribe(picks);
        (fixture.nativeElement as HTMLElement).addEventListener(RT_MENU_CONFIRM_EVENT, (event: Event): void => {
            pending.push((event as CustomEvent<boolean>).detail);
        });

        (fixture.nativeElement as HTMLElement).click();
        await flushDialogCode();

        expect(handled).toHaveLength(1);
        expect(pending).toEqual([true, false]);
        expect(picks).not.toHaveBeenCalled();
        expect(document.querySelector('rt-menu-confirm-dialog')).toBeNull();

        (fixture.nativeElement as HTMLElement).click();
        await flushDialogCode();

        expect(handled).toHaveLength(2);
        expect(pending).toEqual([true, false, true, false]);
    });

    it('обработчик ошибок приложения, бросивший сам, не убивает пункт: меню получает ответ и следующий щелчок работает', async (): Promise<void> => {
        const fixture: ComponentFixture<RtMenuItemComponent> = createRtFixture(
            RtMenuItemComponent,
            { label: 'Удалить', confirmMessage: 'Удалить запись?' },
            {
                providers: [
                    {
                        provide: ErrorHandler,
                        useValue: {
                            handleError: (): never => {
                                throw new Error('the handler of the application failed');
                            },
                        },
                    },
                ],
            }
        );
        const pending: boolean[] = [];
        (fixture.nativeElement as HTMLElement).addEventListener(RT_MENU_CONFIRM_EVENT, (event: Event): void => {
            pending.push((event as CustomEvent<boolean>).detail);
        });

        (fixture.nativeElement as HTMLElement).click();
        await flushDialogCode();
        (fixture.nativeElement as HTMLElement).click();
        await flushDialogCode();

        expect(pending).toEqual([true, false, true, false]);
    });
});
