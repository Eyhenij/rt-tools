import { ApplicationRef, ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtAsideFooterComponent } from './footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/** Какая из двух кнопок стоит в слоте `[asidePrimary]`: приложение меняет её веткой `@if`. */
const primaryChoice: WritableSignal<'save' | 'send'> = signal<'save' | 'send'>('save');

/** Панель, у которой приложение меняет главную кнопку веткой: «Сохранить» или «Отправить». */
@Component({
    selector: 'rt-aside-sheet-swap-content',
    template: `
        <rt-aside>
            <rt-aside-header title="Письмо" />
            <rt-aside-footer>
                @if (choice() === 'save') {
                    <button rtButton asidePrimary qa-dataid="foot-save" type="button" label="Сохранить"></button>
                } @else {
                    <button rtButton asidePrimary qa-dataid="foot-send" type="button" label="Отправить"></button>
                }
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideFooterComponent, RtButtonDirective],
})
class SwapContentComponent {
    protected readonly choice: Signal<'save' | 'send'> = primaryChoice;
}

/** Панель с опасной «Удалить» в слоте закрытия; короткая подпись телефона подвалом не выключена. */
@Component({
    selector: 'rt-aside-sheet-danger-content',
    template: `
        <rt-aside>
            <rt-aside-header title="Запись" />
            <rt-aside-footer>
                <button rtButton asideDismiss theme="danger" qa-dataid="foot-remove" type="button" label="Удалить"></button>
                <button rtButton asidePrimary qa-dataid="foot-save" type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideFooterComponent, RtButtonDirective],
})
class DangerContentComponent {}

/** Панель без шапки кита: главной кнопке в шторке встать некуда. */
@Component({
    selector: 'rt-aside-sheet-headerless-content',
    template: `
        <rt-aside>
            <rt-aside-footer>
                <button rtButton asideDismiss qa-dataid="foot-close" type="button" label="Закрыть"></button>
                <button rtButton asidePrimary qa-dataid="foot-save" type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideFooterComponent, RtButtonDirective],
})
class HeaderlessContentComponent {}

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

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

describe('Панель службы кита на телефоне — кнопки подвала в шторке', (): void => {
    beforeEach((): void => {
        setMediaQueryMatches(PHONE_QUERY, true);
        TestBed.configureTestingModule({ providers: provideRtKitTesting() });
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        resetMediaQueries();
    });

    it('SC-UKV-1865 — опасная кнопка слота закрытия остаётся в подвале шторки со своей подписью', async (): Promise<void> => {
        TestBed.inject(RtAsideService).open(DangerContentComponent);
        await settle();
        const remove: HTMLElement | null = node('foot-remove');

        expect(remove?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
        expect(remove?.textContent?.trim()).toBe('Удалить');
        expect(remove?.classList).toContain('rt-button--danger');
    });

    it('SC-UKV-1866 — главная кнопка, сменённая приложением на другую, тоже встаёт в шапку', async (): Promise<void> => {
        primaryChoice.set('save');
        TestBed.inject(RtAsideService).open(SwapContentComponent);
        await settle();
        expect(node('foot-save')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();

        primaryChoice.set('send');
        await settle();

        expect(node('foot-save')).toBeNull();
        expect(node('foot-send')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
        expect(node('aside-sheet-main')?.children.length).toBe(1);
    });

    it('SC-UKV-1872 — у панели без шапки кита «Сохранить» и «Закрыть» остаются в подвале шторки', async (): Promise<void> => {
        TestBed.inject(RtAsideService).open(HeaderlessContentComponent);
        await settle();
        const footer: HTMLElement | null = node('bottom-sheet-footer');

        expect(node('foot-save')?.closest('[qa-dataid="bottom-sheet-footer"]')).toBe(footer);
        expect(node('foot-close')?.closest('[qa-dataid="bottom-sheet-footer"]')).toBe(footer);
        expect(node('aside-sheet-main')).toBeNull();
    });
});
