import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtDrawerContainerComponent } from './rt-drawer-container.component';
import { RtDrawerComponent } from './rt-drawer.component';
import { IRtDrawer } from './rt-drawer.model';

/** Участок страницы с панелью: все входы панели — сигналы владельца. */
@Component({
    selector: 'rt-drawer-test-host',
    template: `
        <rt-drawer-container>
            <rt-drawer
                ariaLabel="Фильтры"
                [mode]="mode()"
                [position]="position()"
                [hasBackdrop]="backdrop()"
                [disableClose]="disableClose()"
                [resizable]="resizable()"
                [overflow]="overflow()"
                [autoFocus]="autoFocus()"
                [(opened)]="opened"
                [(width)]="width"
                (openedStart)="log.push('openedStart')"
                (closedStart)="log.push('closedStart')"
                (afterOpened)="log.push('afterOpened')"
                (afterClosed)="log.push('afterClosed')"
                (backdropClick)="log.push('backdropClick:' + opened())">
                <input qa-dataid="drawer-field" />
                <textarea qa-dataid="drawer-text"></textarea>
            </rt-drawer>
            <button type="button" qa-dataid="page-button">Отчёт</button>
        </rt-drawer-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDrawerContainerComponent, RtDrawerComponent],
})
class DrawerHostComponent {
    public readonly mode: WritableSignal<IRtDrawer.Mode> = signal<IRtDrawer.Mode>('side');
    public readonly position: WritableSignal<IRtDrawer.Position> = signal<IRtDrawer.Position>('start');
    public readonly backdrop: WritableSignal<boolean> = signal(true);
    public readonly disableClose: WritableSignal<boolean> = signal(false);
    public readonly resizable: WritableSignal<boolean> = signal(false);
    public readonly opened: WritableSignal<boolean> = signal(false);
    public readonly width: WritableSignal<number | null> = signal<number | null>(320);
    public readonly overflow: WritableSignal<IRtDrawer.Overflow> = signal<IRtDrawer.Overflow>('clip');
    public readonly autoFocus: WritableSignal<IRtDrawer.AutoFocus> = signal<IRtDrawer.AutoFocus>(true);
    public readonly log: string[] = [];
}

function setup(apply: (host: DrawerHostComponent) => void = (): void => undefined): ComponentFixture<DrawerHostComponent> {
    const fixture: ComponentFixture<DrawerHostComponent> = createRtFixture(DrawerHostComponent);

    apply(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
}

function panel(fixture: ComponentFixture<DrawerHostComponent>): HTMLElement {
    return qa(fixture, 'drawer-panel')?.nativeElement as HTMLElement;
}

function change(fixture: ComponentFixture<DrawerHostComponent>, apply: (host: DrawerHostComponent) => void): void {
    apply(fixture.componentInstance);
    fixture.detectChanges();
}

function escape(fixture: ComponentFixture<DrawerHostComponent>): void {
    panel(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
}

function over(fixture: ComponentFixture<DrawerHostComponent>): void {
    change(fixture, (it: DrawerHostComponent): void => {
        it.mode.set('over');
        it.opened.set(true);
    });
}

describe('RtDrawerComponent', (): void => {
    describe('рядом с содержимым', (): void => {
        it('SC-UKV-939 — панель стоит в строке контейнера рядом с содержимым и рисует ширину', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));
            const container: HTMLElement = qa(fixture, 'drawer-container')?.nativeElement as HTMLElement;

            expect(panel(fixture).classList).toContain('rt-drawer__panel--mode--side');
            expect(panel(fixture).classList).toContain('rt-drawer__panel--position--start');
            expect(panel(fixture).classList).toContain('rt-drawer__panel--opened');
            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('320px');
            expect(qa(fixture, 'drawer-backdrop')).toBeNull();
            expect(container.querySelector('[qa-dataid="drawer-container-content"] [qa-dataid="page-button"]')).not.toBeNull();
        });

        it('SC-UKV-939 — ширина вне пределов рисуется на пределе', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.width.set(5000));

            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('640px');
        });

        it('SC-UKV-939 — Escape в панели рядом с содержимым её не закрывает', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));

            escape(fixture);

            expect(fixture.componentInstance.opened()).toBe(true);
        });
    });

    describe('поверх содержимого', (): void => {
        it('SC-UKV-939 — подложка видна при открытой панели и закрывает её', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup();
            over(fixture);
            const backdrop: HTMLElement = qa(fixture, 'drawer-backdrop')?.nativeElement as HTMLElement;

            expect(backdrop.classList).toContain('rt-drawer__backdrop--visible');

            backdrop.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.opened()).toBe(false);
            expect(backdrop.classList).not.toContain('rt-drawer__backdrop--visible');
        });

        it('SC-UKV-939 — Escape в панели закрывает её и не уходит выше', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup();
            const above: jest.Mock = jest.fn();
            over(fixture);
            (fixture.nativeElement as HTMLElement).addEventListener('keydown', above);

            escape(fixture);

            expect(fixture.componentInstance.opened()).toBe(false);
            expect(above).not.toHaveBeenCalled();
        });

        it('SC-UKV-939 — с disableClose ни подложка, ни Escape панель не закрывают', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.disableClose.set(true));
            over(fixture);

            (qa(fixture, 'drawer-backdrop')?.nativeElement as HTMLElement).click();
            escape(fixture);

            expect(fixture.componentInstance.opened()).toBe(true);
        });

        it('SC-UKV-939 — без подложки её нет и поверх', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.backdrop.set(false));
            over(fixture);

            expect(qa(fixture, 'drawer-backdrop')).toBeNull();
        });
    });

    it('SC-UKV-940 — закрытая панель недоступна фокусу, набранный текст переживает закрытие', (): void => {
        const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));
        const field: HTMLInputElement = qa(fixture, 'drawer-field')?.nativeElement as HTMLInputElement;

        expect(panel(fixture).hasAttribute('inert')).toBe(false);
        field.value = 'Москва';

        change(fixture, (it: DrawerHostComponent): void => it.opened.set(false));
        expect(panel(fixture).hasAttribute('inert')).toBe(true);
        expect(panel(fixture).classList).not.toContain('rt-drawer__panel--opened');

        change(fixture, (it: DrawerHostComponent): void => it.opened.set(true));
        expect((qa(fixture, 'drawer-field')?.nativeElement as HTMLInputElement).value).toBe('Москва');
    });

    describe('ширина', (): void => {
        it('SC-UKV-938 — ручка стоит у внутреннего края и пишет ширину владельцу', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => {
                it.opened.set(true);
                it.resizable.set(true);
            });
            const handle: HTMLElement = qa(fixture, 'resize-handle')?.nativeElement as HTMLElement;

            expect(handle.classList).toContain('rt-resize-handle--edge--end');
            expect(handle.getAttribute('aria-label')).toBe('Фильтры');

            handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.width()).toBe(336);
            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('336px');
        });

        it('SC-UKV-938 — у панели справа ручка стоит у левого края', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => {
                it.position.set('end');
                it.resizable.set(true);
            });

            expect((qa(fixture, 'resize-handle')?.nativeElement as HTMLElement).classList).toContain('rt-resize-handle--edge--start');
        });

        it('без resizable ручки нет', (): void => {
            expect(qa(setup(), 'resize-handle')).toBeNull();
        });
    });

    describe('замена боковой панели приложения', (): void => {
        it('SC-UKV-1002 — по умолчанию панель обрезает своё и держит ширину в пикселях', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));

            expect(panel(fixture).classList).toContain('rt-drawer__panel--overflow--clip');
            expect(panel(fixture).classList).not.toContain('rt-drawer__panel--auto-width');
        });

        it('SC-UKV-1002 — overflow visible и ширина null: модификаторы есть, своей ширины и ручки нет', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => {
                it.opened.set(true);
                it.resizable.set(true);
                it.overflow.set('visible');
                it.width.set(null);
            });

            expect(panel(fixture).classList).toContain('rt-drawer__panel--overflow--visible');
            expect(panel(fixture).classList).toContain('rt-drawer__panel--auto-width');
            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('');
            expect(qa(fixture, 'resize-handle')).toBeNull();
        });

        it('SC-UKV-1003 — начало смены приходит сразу, конец без движения — следом; исходное состояние молчит', async (): Promise<void> => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup();
            await fixture.whenStable();

            expect(fixture.componentInstance.log).toEqual([]);

            change(fixture, (it: DrawerHostComponent): void => it.opened.set(true));
            await fixture.whenStable();
            change(fixture, (it: DrawerHostComponent): void => it.opened.set(false));
            await fixture.whenStable();

            expect(fixture.componentInstance.log).toEqual(['openedStart', 'afterOpened', 'closedStart', 'afterClosed']);
        });

        it('SC-UKV-1003 — конец ждёт перехода сдвига, а обогнанный новой сменой молчит', (): void => {
            jest.useFakeTimers();
            try {
                const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.mode.set('over'));
                const log: string[] = fixture.componentInstance.log;

                panel(fixture).style.transitionDuration = '0.2s';
                change(fixture, (it: DrawerHostComponent): void => it.opened.set(true));
                expect(log).toEqual(['openedStart']);

                change(fixture, (it: DrawerHostComponent): void => it.opened.set(false));
                const end: Event = new Event('transitionend');
                Object.defineProperty(end, 'propertyName', { value: 'transform' });
                panel(fixture).dispatchEvent(end);
                jest.advanceTimersByTime(1000);

                expect(log).toEqual(['openedStart', 'closedStart', 'afterClosed']);
            } finally {
                jest.useRealTimers();
            }
        });

        it('SC-UKV-1004 — селектор ставит фокус на свой узел и рядом с содержимым', async (): Promise<void> => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.autoFocus.set('textarea'));

            change(fixture, (it: DrawerHostComponent): void => it.opened.set(true));
            await fixture.whenStable();

            expect(document.activeElement).toBe(qa(fixture, 'drawer-text')?.nativeElement);
        });

        it('SC-UKV-1004 — false оставляет фокус на месте и поверх содержимого', async (): Promise<void> => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.autoFocus.set(false));
            const page: HTMLElement = qa(fixture, 'page-button')?.nativeElement as HTMLElement;

            page.focus();
            over(fixture);
            await fixture.whenStable();

            expect(document.activeElement).toBe(page);
        });

        it('SC-UKV-1004 — без входа панель поверх содержимого берёт фокус себе', async (): Promise<void> => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup();

            over(fixture);
            await fixture.whenStable();

            expect(document.activeElement).toBe(panel(fixture));
        });

        it('SC-UKV-1004 — нажатие на подложку приходит до закрытия и с disableClose', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.disableClose.set(true));
            over(fixture);

            (qa(fixture, 'drawer-backdrop')?.nativeElement as HTMLElement).click();
            change(fixture, (it: DrawerHostComponent): void => it.disableClose.set(false));
            (qa(fixture, 'drawer-backdrop')?.nativeElement as HTMLElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.log.filter((entry: string): boolean => entry.startsWith('backdropClick'))).toEqual([
                'backdropClick:true',
                'backdropClick:true',
            ]);
            expect(fixture.componentInstance.opened()).toBe(false);
        });
    });
});
