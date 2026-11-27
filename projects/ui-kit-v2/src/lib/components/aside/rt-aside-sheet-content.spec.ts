import { ApplicationRef, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideRef } from './rt-aside-ref';
import { RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/** Компонент приложения без `<rt-aside>`: шторку ему рисовать нечем. */
@Component({
    selector: 'rt-aside-bare-content',
    template: `
        <p qa-dataid="bare-content">Без панели кита</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class BareContentComponent {}

/** Панель, чей `<rt-aside>` встаёт после загрузки данных. */
@Component({
    selector: 'rt-aside-late-content',
    template: `
        @if (ready()) {
            <rt-aside>
                <ng-template rtAsideContent>
                    <p>Запись</p>
                </ng-template>
            </rt-aside>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideContentDirective],
})
class LateContentComponent {
    public readonly ready: WritableSignal<boolean> = signal<boolean>(false);

    /** Последняя открытая панель: тест ставит ей данные после открытия. */
    public static last: LateContentComponent | null = null;

    constructor() {
        LateContentComponent.last = this;
    }
}

/** Панель без шапки кита. */
@Component({
    selector: 'rt-aside-headless-content',
    template: `
        <rt-aside ariaLabel="Без шапки">
            <ng-template rtAsideContent>
                <p>Запись</p>
            </ng-template>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideContentDirective],
})
class HeadlessContentComponent {}

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

function pane(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

describe('Содержимое панели службы на телефоне', (): void => {
    beforeEach((): void => {
        setMediaQueryMatches(PHONE_QUERY, true);
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        resetMediaQueries();
    });

    it('SC-UKV-1922 — компонент без rt-aside на телефоне открывается сбоку и закрывается по Escape', async (): Promise<void> => {
        const ref: RtAsideRef = TestBed.inject(RtAsideService).open(BareContentComponent);
        await settle();
        let closed: boolean = false;
        ref.afterClosed().subscribe((): void => {
            closed = true;
        });

        expect(pane()?.classList).not.toContain('rt-aside-overlay--sheet');
        expect(pane()?.classList).toContain('rt-aside-overlay--position-right');
        expect(document.querySelector('.rt-aside-backdrop')?.classList).toContain('rt-aside-backdrop--visible');

        pane()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await settle();

        expect(closed).toBe(true);
    });

    it('SC-UKV-1922 — свой класс подложки встаёт у панели сбоку, а у шторки не читается', async (): Promise<void> => {
        TestBed.inject(RtAsideService).open(BareContentComponent, { backdropClass: 'app-dim' });
        await settle();

        expect(document.querySelector('.cdk-overlay-backdrop')?.classList).toContain('app-dim');
    });

    it('SC-UKV-1922 — rt-aside, вставший после первой отрисовки, возвращает панель в шторку', async (): Promise<void> => {
        TestBed.inject(RtAsideService).open(LateContentComponent);
        await settle();
        expect(pane()?.classList).toContain('rt-aside-overlay--position-right');

        LateContentComponent.last?.ready.set(true);
        await settle();
        await settle();

        expect(pane()?.classList).toContain('rt-aside-overlay--sheet');
        expect(pane()?.classList).not.toContain('rt-aside-overlay--position-right');
        expect(document.querySelector('.rt-aside-backdrop')?.classList).not.toContain('rt-aside-backdrop--visible');
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1839 — у панели без шапки кита шторка рисует свою «×», и «×» закрывает панель', async (): Promise<void> => {
        const ref: RtAsideRef = TestBed.inject(RtAsideService).open(HeadlessContentComponent, { closeOnBackdropClick: false });
        await settle();
        let closed: boolean = false;
        ref.afterClosed().subscribe((): void => {
            closed = true;
        });

        const close: HTMLElement | null = node('bottom-sheet-close');
        expect(close).not.toBeNull();
        expect(document.activeElement).toBe(close?.querySelector('button'));

        close?.querySelector('button')?.click();
        await settle();

        expect(closed).toBe(true);
    });

    it('SC-UKV-1922 — снятый после шторки rt-aside ставит панель снова сбоку, и Escape её закрывает', async (): Promise<void> => {
        const ref: RtAsideRef = TestBed.inject(RtAsideService).open(LateContentComponent);
        await settle();
        LateContentComponent.last?.ready.set(true);
        await settle();
        await settle();
        let closed: boolean = false;
        ref.afterClosed().subscribe((): void => {
            closed = true;
        });

        LateContentComponent.last?.ready.set(false);
        await settle();
        await settle();

        expect(pane()?.classList).not.toContain('rt-aside-overlay--sheet');
        expect(pane()?.classList).toContain('rt-aside-overlay--position-right');
        expect(pane()?.classList).not.toContain('rt-aside-overlay--entering');
        expect(document.querySelector('.rt-aside-backdrop')?.classList).toContain('rt-aside-backdrop--visible');

        pane()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await settle();

        expect(closed).toBe(true);
    });

    it('SC-UKV-1922 — rt-aside, вставший во время ухода панели, вид не меняет', async (): Promise<void> => {
        const ref: RtAsideRef = TestBed.inject(RtAsideService).open(LateContentComponent);
        await settle();

        ref.close();
        LateContentComponent.last?.ready.set(true);
        await settle();
        await settle();

        expect(pane()?.classList).toContain('rt-aside-overlay--leaving');
        expect(pane()?.classList).not.toContain('rt-aside-overlay--sheet');
    });

    it('SC-UKV-1839 — «×» шторки у панели без шапки кита не закрывает панель под disableClose', async (): Promise<void> => {
        const ref: RtAsideRef = TestBed.inject(RtAsideService).open(HeadlessContentComponent);
        await settle();
        ref.disableClose.set(true);
        let closed: boolean = false;
        ref.afterClosed().subscribe((): void => {
            closed = true;
        });

        node('bottom-sheet-close')?.querySelector('button')?.click();
        await settle();

        expect(closed).toBe(false);
    });
});
