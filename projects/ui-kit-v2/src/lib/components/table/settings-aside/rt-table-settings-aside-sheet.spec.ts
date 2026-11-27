import { OutputRef, OutputRefSubscription, Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideRtKitTesting } from '../../../../testing/rt-kit-testing';
import { RT_ASIDE_SHEET, RtAsideSheet } from '../../aside/rt-aside-sheet';
import { RtContainerComponent } from '../../container/rt-container.component';
import { IRtTable } from '../rt-table.model';
import { RtTableSettingsRegistry } from '../rt-table-settings.registry';
import { RtTableSettingsAsideComponent } from './rt-table-settings-aside.component';

const COLUMNS: ReadonlyArray<IRtTable.ColumnSettingItem> = [
    { key: 'title', label: 'Договор', locked: true, hidden: false },
    { key: 'city', label: 'Город', hidden: false },
];

function outputStub(): OutputRef<void> {
    return {
        subscribe: (): OutputRefSubscription => ({ unsubscribe: (): void => undefined }),
    };
}

/** Двойник каркаса: панель просит у него готовность перекрытия и выходы жизненного цикла. */
class ContainerDouble {
    public readonly backdropClick: OutputRef<void> = outputStub();
    public readonly rightOpened: OutputRef<void> = outputStub();
    public readonly rightClosed: OutputRef<void> = outputStub();
    public readonly rightOverlayReady: Signal<boolean> = signal<boolean>(true);
    public readonly rightOpen: Signal<boolean> = signal<boolean>(false);

    public openRight(): void {
        return;
    }

    public closeRight(): void {
        return;
    }
}

/**
 * Панель настроек в слоте правой панели каркаса на телефоне: вид шторки ей даёт маркер слота, а
 * каркас выбрал его при открытии. Как каркас поднимает шторку, проверяет спека шторки каркаса.
 */
function setup(): ComponentFixture<RtTableSettingsAsideComponent> {
    const sheet: RtAsideSheet = new RtAsideSheet();
    sheet.activate(true);
    sheet.show(true);
    TestBed.configureTestingModule({
        imports: [RtTableSettingsAsideComponent],
        providers: [
            ...provideRtKitTesting(),
            provideRouter([]),
            { provide: RtContainerComponent, useValue: new ContainerDouble() },
            { provide: RT_ASIDE_SHEET, useValue: sheet },
        ],
    });
    const registry: RtTableSettingsRegistry = TestBed.inject(RtTableSettingsRegistry);
    registry.register('contracts', {
        columns: signal(COLUMNS).asReadonly(),
        defaults: signal(COLUMNS).asReadonly(),
        apply: (): void => undefined,
    });
    registry.setActive('contracts');
    const fixture: ComponentFixture<RtTableSettingsAsideComponent> = TestBed.createComponent(RtTableSettingsAsideComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    return fixture;
}

function node(fixture: ComponentFixture<unknown>, id: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${id}"]`);
}

describe('Настройки колонок на телефоне — шторка', (): void => {
    it('SC-UKV-1808 — настройки колонок стоят шторкой во всю высоту, «Сохранить» справа в шапке', (): void => {
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup();

        expect(node(fixture, 'aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node(fixture, 'bottom-sheet-panel')?.classList).toContain('rt-bottom-sheet__panel--full');
        expect(node(fixture, 'table-settings-save')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
        expect(node(fixture, 'table-settings-close')).toBeNull();
    });

    it('SC-UKV-1836 — значок сброса стоит справа в шапке, левее «Сохранить»', (): void => {
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup();
        const reset: HTMLElement | null = node(fixture, 'table-settings-reset');
        const save: HTMLElement | null = node(fixture, 'table-settings-save');

        expect(reset?.closest('[qa-dataid="aside-actions"]')).not.toBeNull();
        expect(save?.closest('[qa-dataid="aside-actions"]')).not.toBeNull();
        expect(reset?.compareDocumentPosition(save as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
});
