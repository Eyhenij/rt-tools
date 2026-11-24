import { ApplicationRef, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtAsideHeaderComponent } from '../aside/header/rt-aside-header.component';
import { RtAsideContentDirective } from '../aside/rt-aside-content.directive';
import { RtAsideComponent } from '../aside/rt-aside.component';
import { RtContainerComponent, TRtContainerRightMode } from './rt-container.component';
import { RtContainerContentDirective, RtContainerRightSidenavDirective } from './rt-container.directives';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/** Каркас с панелью записи справа: место, подложка и ручка — сигналы владельца. */
@Component({
    selector: 'rt-container-sheet-host',
    template: `
        <rt-container [rightMode]="mode()" [rightBackdrop]="backdrop()" [rightResizable]="resizable()" [rightWidth]="360">
            <!-- Панель в остальной странице шторкой не становится: вид даёт только слот правой панели. -->
            <ng-template rtContainerContent>
                <rt-aside qa-dataid="page-aside"><rt-aside-header title="Сводка" /></rt-aside>
            </ng-template>
            <ng-template rtContainerRightSidenav>
                <rt-aside>
                    <rt-aside-header title="Запись 6" />
                    <ng-template rtAsideContent><input qa-dataid="record-field" /></ng-template>
                </rt-aside>
            </ng-template>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerRightSidenavDirective,
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideContentDirective,
    ],
})
class SheetHostComponent {
    public readonly mode: WritableSignal<TRtContainerRightMode> = signal<TRtContainerRightMode>('over');
    public readonly backdrop: WritableSignal<boolean> = signal(true);
    public readonly resizable: WritableSignal<boolean> = signal(false);
}

type TFixture = ComponentFixture<SheetHostComponent>;

function setup(phone: boolean, apply: (host: SheetHostComponent) => void = (): void => undefined): TFixture {
    setMediaQueryMatches(PHONE_QUERY, phone);
    const fixture: TFixture = createRtFixture(SheetHostComponent);

    apply(fixture.componentInstance);
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture;
}

function containerOf(fixture: TFixture): RtContainerComponent {
    return el(fixture, 'rt-container')?.componentInstance as RtContainerComponent;
}

/** Кадр, в который панель встаёт на место, и отрисовка после него. */
async function settle(fixture: TFixture): Promise<void> {
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    fixture.detectChanges();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();
    await fixture.whenStable();
    fixture.detectChanges();
}

async function setPhone(fixture: TFixture, phone: boolean): Promise<void> {
    setMediaQueryMatches(PHONE_QUERY, phone);
    await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 10);
    });
    fixture.detectChanges();
}

async function openRight(fixture: TFixture): Promise<void> {
    containerOf(fixture).openRight();
    await settle(fixture);
}

async function closeRight(fixture: TFixture): Promise<void> {
    containerOf(fixture).closeRight();
    await settle(fixture);
}

/** Шторка панели записи — та, что стоит в слоте правой панели. */
function recordSheet(): HTMLElement | null {
    return document.querySelector('[qa-dataid="record-field"]')?.closest<HTMLElement>('rt-bottom-sheet') ?? null;
}

function overlayPane(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

describe('RtContainerComponent — правая панель на телефоне', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        resetMediaQueries();
    });

    it('SC-UKV-1804 — панель записи поверх страницы поднимается снизу шторкой во всю высоту', async (): Promise<void> => {
        const fixture: TFixture = setup(true);
        await openRight(fixture);

        expect(overlayPane()?.classList).toContain('rt-aside-overlay--sheet');
        expect(overlayPane()?.classList).toContain('rt-aside-overlay--open');
        expect(recordSheet()?.classList).toContain('rt-bottom-sheet--open');
        expect(recordSheet()?.querySelector('[qa-dataid="bottom-sheet-panel"]')?.classList).toContain('rt-bottom-sheet__panel--full');
        expect(document.querySelector('.rt-aside-backdrop--visible')).toBeNull();
    });

    it('SC-UKV-1804 — панель в остальной странице шторкой не становится', async (): Promise<void> => {
        const fixture: TFixture = setup(true);
        await openRight(fixture);
        const pageAside: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="page-aside"]');

        expect(pageAside?.querySelector('rt-bottom-sheet')).toBeNull();
        expect(pageAside?.querySelector('[qa-dataid="aside-back"]')).not.toBeNull();
    });

    it('SC-UKV-1805 — панель записи рядом с содержимым поднимается шторкой, колонка места не берёт', async (): Promise<void> => {
        const fixture: TFixture = setup(true, (host: SheetHostComponent): void => host.mode.set('side'));
        await openRight(fixture);
        const host: HTMLElement = el(fixture, 'rt-container')?.nativeElement as HTMLElement;

        expect(host.classList).toContain('rt-container--right-sheet');
        expect(recordSheet()?.classList).toContain('rt-bottom-sheet--open');
        expect(recordSheet()?.closest('[qa-dataid="container-right-sidenav"]')).not.toBeNull();
    });

    it('SC-UKV-1846 — панель без подложки на телефоне затемняет страницу подложкой шторки', async (): Promise<void> => {
        const fixture: TFixture = setup(true, (host: SheetHostComponent): void => host.backdrop.set(false));
        await openRight(fixture);

        expect(document.querySelector('.rt-aside-backdrop')).toBeNull();
        expect(recordSheet()?.querySelector('[qa-dataid="bottom-sheet-backdrop"]')).not.toBeNull();
        expect(recordSheet()?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1858 — ручка ширины в шторке не рисуется, шторка во всю ширину окна', async (): Promise<void> => {
        const fixture: TFixture = setup(true, (host: SheetHostComponent): void => host.resizable.set(true));
        await openRight(fixture);

        expect(document.querySelector('rt-resize-handle')).toBeNull();
        expect(overlayPane()?.classList).toContain('rt-aside-overlay--sheet');
    });

    it('SC-UKV-1858 — шире телефона ручка ширины на месте', async (): Promise<void> => {
        const fixture: TFixture = setup(false, (host: SheetHostComponent): void => host.resizable.set(true));
        await openRight(fixture);

        expect(document.querySelector('rt-resize-handle')).not.toBeNull();
        expect(recordSheet()).toBeNull();
    });

    it('SC-UKV-1853 — переход к другой записи в открытой шторке её вид держит, хоть окно уже 667', async (): Promise<void> => {
        const fixture: TFixture = setup(true);
        await openRight(fixture);

        await setPhone(fixture, false);
        // Переход по ссылке к другой записи открывает ту же панель ещё раз — она уже открыта.
        await openRight(fixture);

        expect(overlayPane()?.classList).toContain('rt-aside-overlay--sheet');
        expect(recordSheet()?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1854 — панель рядом с содержимым судится при каждом открытии', async (): Promise<void> => {
        const fixture: TFixture = setup(false, (host: SheetHostComponent): void => host.mode.set('side'));
        await openRight(fixture);
        expect(recordSheet()).toBeNull();
        await closeRight(fixture);

        await setPhone(fixture, true);
        await openRight(fixture);

        expect(recordSheet()?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1854 — шторка, закрытая на телефоне, на широком окне открывается панелью сбоку', async (): Promise<void> => {
        const fixture: TFixture = setup(true);
        await openRight(fixture);
        await closeRight(fixture);

        await setPhone(fixture, false);
        await openRight(fixture);

        expect(recordSheet()).toBeNull();
        expect(overlayPane()?.classList).not.toContain('rt-aside-overlay--sheet');
        expect(overlayPane()?.classList).toContain('rt-aside-overlay--open');
        expect(document.querySelector('.rt-aside-backdrop--visible')).not.toBeNull();
    });

    it('SC-UKV-1855 — панель, поднятая заново по адресу на телефоне, открывается шторкой', async (): Promise<void> => {
        // Перезагрузка: каркас создаётся заново, и панель адреса открывается первой же отрисовкой.
        setMediaQueryMatches(PHONE_QUERY, true);
        const fixture: TFixture = createRtFixture(SheetHostComponent);
        fixture.detectChanges();
        await openRight(fixture);

        expect(recordSheet()?.classList).toContain('rt-bottom-sheet--open');
    });
});
