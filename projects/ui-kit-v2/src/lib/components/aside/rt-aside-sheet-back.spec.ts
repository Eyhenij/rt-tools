import { ApplicationRef, ChangeDetectionStrategy, Component, getDebugNode, inject, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from '../bottom-sheet/rt-bottom-sheet.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideRef } from './rt-aside-ref';
import { RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

@Component({
    selector: 'rt-aside-sheet-back-first',
    template: `
        <rt-aside>
            <rt-aside-header title="Запись" />
            <ng-template rtAsideContent><p qa-dataid="first-body">Первый экран</p></ng-template>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideContentDirective],
})
class FirstPanelComponent {}

@Component({
    selector: 'rt-aside-sheet-back-second',
    template: `
        <rt-aside>
            <rt-aside-header title="Связанная запись" (dismiss)="onBack()" />
            <ng-template rtAsideContent><p qa-dataid="second-body">Второй экран</p></ng-template>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideContentDirective],
})
class SecondPanelComponent {
    readonly #ref: RtAsideRef<string> = inject(RtAsideRef);

    protected onBack(): void {
        this.#ref.close('back');
    }
}

/** Страница со шторкой кита: из неё открывается панель. */
@Component({
    selector: 'rt-aside-sheet-back-page',
    template: `
        <rt-bottom-sheet qa-dataid="page-sheet" [open]="open()">
            <span sheetHeader>Отборы</span>
            <p>Содержимое шторки</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class SheetPageComponent {
    public readonly open: WritableSignal<boolean> = signal<boolean>(true);
}

async function settle(): Promise<void> {
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    app.tick();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();
    await app.whenStable();
    app.tick();
}

function sheets(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="aside-sheet"]'));
}

/** Кнопка слева в шапке шторки панели: «×» или шеврон «назад». */
function startButton(sheet: HTMLElement | undefined): RtIconButtonComponent | null {
    const host: Element | null = sheet?.querySelector('.rt-aside-header__start rt-icon-button') ?? null;

    return host === null ? null : (getDebugNode(host)?.componentInstance as RtIconButtonComponent);
}

describe('Панель службы кита на телефоне — второй экран шторки', (): void => {
    let closed: (string | undefined)[];

    beforeEach((): void => {
        setMediaQueryMatches(PHONE_QUERY, true);
        TestBed.configureTestingModule({ providers: provideRtKitTesting() });
        closed = [];
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((overlays: Element): void => overlays.remove());
        resetMediaQueries();
    });

    async function openSecond(): Promise<void> {
        TestBed.inject(RtAsideService)
            .open<SecondPanelComponent, unknown, string>(SecondPanelComponent)
            .afterClosed()
            .subscribe((result: string | undefined): number => closed.push(result));
        await settle();
    }

    it('SC-UKV-1869 — панель из шторки панели рисует слева шеврон «назад», и он возвращает первый экран', async (): Promise<void> => {
        TestBed.inject(RtAsideService).open(FirstPanelComponent);
        await settle();
        await openSecond();
        const [first, second]: HTMLElement[] = sheets();
        const back: RtIconButtonComponent | null = startButton(second);

        expect(second.classList).toContain('rt-bottom-sheet--nested');
        expect(back?.icon()).toBe('chevron-left');
        expect(back?.ariaLabel()).toBe('Back');
        expect(second.querySelector('[qa-dataid="bottom-sheet-back"]')).not.toBeNull();
        expect(second.querySelector('[qa-dataid="aside-sheet-close"]')).toBeNull();
        expect(startButton(first)?.icon()).toBe('ico-close');
        expect(first.classList).toContain('rt-bottom-sheet--covered');

        second.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-back"] button')?.click();
        await settle();

        expect(closed).toEqual(['back']);
        expect(first.classList).toContain('rt-bottom-sheet--open');
        expect(first.classList).not.toContain('rt-bottom-sheet--covered');
    });

    it('SC-UKV-1869 — панель из шторки кита рисует слева шеврон «назад», и он возвращает шторку', async (): Promise<void> => {
        TestBed.createComponent(SheetPageComponent);
        await settle();
        await openSecond();
        const [panel]: HTMLElement[] = sheets();
        const page: HTMLElement | null = document.querySelector<HTMLElement>('[qa-dataid="page-sheet"]');

        expect(panel.classList).toContain('rt-bottom-sheet--nested');
        expect(startButton(panel)?.icon()).toBe('chevron-left');
        expect(page?.classList).toContain('rt-bottom-sheet--covered');

        panel.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-back"] button')?.click();
        await settle();

        expect(closed).toEqual(['back']);
        expect(page?.classList).toContain('rt-bottom-sheet--open');
        expect(page?.classList).not.toContain('rt-bottom-sheet--covered');
    });

    it('SC-UKV-1869 — панель, открытая не из шторки, рисует слева «×»', async (): Promise<void> => {
        await openSecond();

        expect(startButton(sheets()[0])?.icon()).toBe('ico-close');
    });
});
