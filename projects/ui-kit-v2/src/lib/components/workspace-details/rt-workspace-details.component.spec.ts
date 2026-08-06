import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { INotification, NotificationBus } from '../../platform';
import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtWorkspaceDetails } from './rt-workspace-details.model';
import { RtWorkspaceDetailsComponent } from './rt-workspace-details.component';

const ROWS: ReadonlyArray<IRtWorkspaceDetails.Row> = [
    { label: 'Клиент', value: 'Иванов И. И.' },
    { label: 'Тариф', value: 'Базовый' },
];

const AUDIT: IRtWorkspaceDetails.Audit = {
    steps: [{ label: 'Заявка создана', status: 'complete' }],
    loading: false,
    loadingMore: false,
    hasMore: false,
    error: null,
    emptyText: 'Событий нет',
};

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtWorkspaceDetailsComponent> {
    return createRtFixture(RtWorkspaceDetailsComponent, { rows: ROWS, ...inputs });
}

/** Историю рисует своя вкладка — до неё надо доехать. */
function openTab(fixture: ComponentFixture<RtWorkspaceDetailsComponent>, label: string): void {
    const tab: HTMLButtonElement | undefined = qaAll(fixture, 'tabs-tab')
        .map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement)
        .find((node: HTMLButtonElement): boolean => (node.textContent ?? '').trim() === label);
    tab?.click();
    fixture.detectChanges();
}

describe('RtWorkspaceDetailsComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-workspace-details');
    });

    describe('заголовок', (): void => {
        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'workspace-details-title')).toBeNull();
        });

        it('рисуется, когда задан', (): void => {
            expect(textOf(qa(setup({ title: 'Заявка №12' }), 'workspace-details-title'))).toBe('Заявка №12');
        });
    });

    describe('строки', (): void => {
        it('рисуются перечнем «ключ → значение»', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup();

            expect(qaAll(fixture, 'detail-row-label').map((node: DebugElement): string => textOf(node))).toEqual(['Клиент', 'Тариф']);
        });

        it('во время загрузки значения подменяются заглушками', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({ loading: true });

            expect(qaAll(fixture, 'skeleton-wrapper-placeholder').length).toBe(ROWS.length);
        });

        it('пустой набор строк перечня не рисует', (): void => {
            expect(qaAll(setup({ rows: [] }), 'workspace-details-row').length).toBe(0);
        });
    });

    describe('вкладки', (): void => {
        it('без переходов и истории вкладок нет — данные рисуются сразу', (): void => {
            // Одна вкладка вместо содержимого была бы лишним щелчком.
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup();

            expect(qa(fixture, 'workspace-details-tabs')).toBeNull();
            expect(qaAll(fixture, 'detail-row-label').length).toBe(2);
        });

        it('история включает вкладки', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({ audit: AUDIT });

            expect(qa(fixture, 'workspace-details-tabs')).not.toBeNull();
        });
    });

    describe('суммы', (): void => {
        it('рисуются отдельным перечнем с форматированием и валютой', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({
                money: [{ label: 'Итого', amount: 12000, total: true }],
            });

            expect(textOf(qa(fixture, 'workspace-details-money-row'))).toContain('₽');
            expect(textOf(qa(fixture, 'workspace-details-money-row'))).toContain('12,000');
        });

        it('без сумм перечня нет', (): void => {
            expect(qa(setup(), 'workspace-details-money-row')).toBeNull();
        });
    });

    describe('переключатели', (): void => {
        it('рисуются строками с контролом', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({
                toggles: [{ id: 'vip', label: 'VIP', value: false }],
            });

            expect(textOf(qa(fixture, 'workspace-details-toggle-label'))).toBe('VIP');
            expect(qa(fixture, 'workspace-details-toggle')).not.toBeNull();
        });

        it('переключение отдаёт наружу идентификатор и новое значение', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({
                toggles: [{ id: 'vip', label: 'VIP', value: false }],
            });
            const changes: IRtWorkspaceDetails.ToggleChange[] = [];
            fixture.componentInstance.toggleChange.subscribe((change: IRtWorkspaceDetails.ToggleChange): void => {
                changes.push(change);
            });

            qa(fixture, 'toggle-switch-control')?.nativeElement.click();
            fixture.detectChanges();

            expect(changes).toEqual([{ id: 'vip', value: true }]);
        });

        it('отключённый переключатель не трогается', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({
                toggles: [{ id: 'vip', label: 'VIP', value: false, disabled: true }],
            });

            expect((qa(fixture, 'toggle-switch-control')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        });
    });

    describe('история', (): void => {
        it.each<[string, IRtWorkspaceDetails.Audit, string]>([
            ['пока грузится', { ...AUDIT, loading: true }, 'workspace-details-audit-loading'],
            ['без событий', { ...AUDIT, steps: [] }, 'workspace-details-audit-empty'],
            ['с событиями', AUDIT, 'workspace-details-audit-timeline'],
        ])('%s рисуется своим состоянием', (_name: string, audit: IRtWorkspaceDetails.Audit, expected: string): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({ audit });

            openTab(fixture, 'History');

            expect(qa(fixture, expected)).not.toBeNull();
        });

        it('кнопка догрузки появляется, только когда есть что грузить', (): void => {
            const without: ComponentFixture<RtWorkspaceDetailsComponent> = setup({ audit: AUDIT });
            openTab(without, 'History');
            expect(qa(without, 'workspace-details-audit-more')).toBeNull();

            const withMore: ComponentFixture<RtWorkspaceDetailsComponent> = setup({ audit: { ...AUDIT, hasMore: true } });
            openTab(withMore, 'History');
            expect(qa(withMore, 'workspace-details-audit-more')).not.toBeNull();
        });

        it('нажатие догрузки поднимает событие', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({ audit: { ...AUDIT, hasMore: true } });
            const loads: jest.Mock = jest.fn();
            fixture.componentInstance.auditLoadMore.subscribe(loads);
            openTab(fixture, 'History');

            qa(fixture, 'workspace-details-audit-more')?.nativeElement.click();
            fixture.detectChanges();

            expect(loads).toHaveBeenCalledTimes(1);
        });
    });

    describe('действия', (): void => {
        it('рисуются кнопками и отдают свой идентификатор', (): void => {
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup({
                actions: [{ id: 'archive', label: 'В архив' }],
            });
            const picked: string[] = [];
            fixture.componentInstance.actionClicked.subscribe((id: string): void => {
                picked.push(id);
            });

            el(fixture, '[qa-dataid="workspace-details-action"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(picked).toEqual(['archive']);
        });
    });

    describe('ошибка', (): void => {
        it('уходит в общую шину уведомлений, а не рисуется внутри панели', (): void => {
            // Панель узкая, и сообщение в ней сдвигало бы данные. Тост показывает
            // ошибку поверх, не трогая раскладку.
            const emitted: string[] = [];
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup();
            TestBed.inject(NotificationBus)
                .onEmit()
                .subscribe((event: INotification.Event): void => {
                    emitted.push(event.payload.message);
                });

            fixture.componentRef.setInput('error', 'Не удалось загрузить');
            fixture.detectChanges();

            expect(emitted).toEqual(['Не удалось загрузить']);
        });

        it('одна и та же ошибка не повторяется на каждой перерисовке', (): void => {
            const emitted: string[] = [];
            const fixture: ComponentFixture<RtWorkspaceDetailsComponent> = setup();
            TestBed.inject(NotificationBus)
                .onEmit()
                .subscribe((event: INotification.Event): void => {
                    emitted.push(event.payload.message);
                });

            fixture.componentRef.setInput('error', 'Сбой');
            fixture.detectChanges();
            fixture.detectChanges();

            expect(emitted).toEqual(['Сбой']);
        });
    });
});
