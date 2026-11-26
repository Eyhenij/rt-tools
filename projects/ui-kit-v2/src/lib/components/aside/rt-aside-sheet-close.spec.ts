import { ApplicationRef, ChangeDetectionStrategy, Component, getDebugNode, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from '../bottom-sheet/rt-bottom-sheet.component';
import { DRAG_DISMISS_THRESHOLD_PX } from '../bottom-sheet/rt-bottom-sheet.logic';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtAsideFooterComponent } from './footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideRef, TRtAsideCloseRequest } from './rt-aside-ref';
import { RtAsideComponent } from './rt-aside.component';
import { IRtAsideConfig, RtAsideService } from './rt-aside.service';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/** Что слышит открывший панель: закрытия, просьбы закрыться, просьбы записать. */
interface IHeard {
    closed: unknown[];
    requests: TRtAsideCloseRequest[];
    saves: number;
    dismisses: number;
}

let heard: IHeard;

@Component({
    selector: 'rt-aside-sheet-close-content',
    template: `
        <rt-aside>
            <rt-aside-header title="Запись" (dismiss)="onBack()" />
            <ng-template rtAsideContent><input qa-dataid="record-name" /></ng-template>
            <rt-aside-footer>
                <button rtButton asidePrimary qa-dataid="record-save" type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideFooterComponent, RtAsideContentDirective, RtButtonDirective],
})
class CloseContentComponent {
    readonly #ref: RtAsideRef<string> = inject(RtAsideRef);

    /** Стрелка шапки закрывает панель с результатом «назад»: «×» шторки обязан дать тот же. */
    protected onBack(): void {
        heard.dismisses += 1;
        this.#ref.close('back');
    }
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

/** Открывает панель службой на телефоне и слушает её хэндл. */
async function open(config: Partial<IRtAsideConfig> = {}): Promise<RtAsideRef<string>> {
    setMediaQueryMatches(PHONE_QUERY, true);
    TestBed.configureTestingModule({ providers: provideRtKitTesting() });
    heard = { closed: [], requests: [], saves: 0, dismisses: 0 };
    const ref: RtAsideRef<string> = TestBed.inject(RtAsideService).open<CloseContentComponent, unknown, string>(
        CloseContentComponent,
        config
    );
    ref.afterClosed().subscribe((result: string | undefined): number => heard.closed.push(result));
    ref.closeRequests().subscribe((request: TRtAsideCloseRequest): number => heard.requests.push(request));
    ref.saveRequests().subscribe((): void => {
        heard.saves += 1;
    });
    await settle();

    return ref;
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

/** Шторка панели — сам компонент шторки кита. */
function sheet(): RtBottomSheetComponent {
    return getDebugNode(node('aside-sheet'))?.componentInstance as RtBottomSheetComponent;
}

/** Шторка панели поднята: стоит открытой, а не уехала вниз. */
function sheetUp(): boolean {
    return node('aside-sheet')?.classList.contains('rt-bottom-sheet--open') === true;
}

/** В jsdom нет `PointerEvent`: `MouseEvent` с теми же именами доходит до тех же слушателей шторки. */
function swipe(distance: number = DRAG_DISMISS_THRESHOLD_PX + 1): void {
    node('bottom-sheet-handle')?.dispatchEvent(new MouseEvent('pointerdown', { clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientY: distance, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointerup', { clientY: distance, bubbles: true }));
}

function escape(target: EventTarget = document.body): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
}

describe('Панель службы кита на телефоне — закрытие шторки', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((overlays: Element): void => overlays.remove());
        resetMediaQueries();
    });

    describe('жесты чистой панели', (): void => {
        it('SC-UKV-1814 — свайп за порог закрывает чистую панель, и она сообщает о закрытии', async (): Promise<void> => {
            await open();

            swipe();
            await settle();

            expect(heard.closed).toEqual([undefined]);
            expect(sheetUp()).toBe(false);
        });

        it('SC-UKV-1815 — короткий свайп возвращает шторку на место', async (): Promise<void> => {
            await open();

            swipe(DRAG_DISMISS_THRESHOLD_PX - 1);
            await settle();

            expect(heard.closed).toEqual([]);
            expect(sheetUp()).toBe(true);
        });

        it('SC-UKV-1816 — «×» закрывает панель дорогой стрелки: открывший слышит тот же результат', async (): Promise<void> => {
            await open();

            node('aside-sheet-close')?.querySelector('button')?.click();
            await settle();

            expect(heard.dismisses).toBe(1);
            expect(heard.closed).toEqual(['back']);
        });

        it('SC-UKV-1817 — нажатие по полосе над шторкой закрывает панель', async (): Promise<void> => {
            await open();

            node('bottom-sheet-backdrop')?.click();
            await settle();

            expect(heard.closed).toEqual([undefined]);
        });

        it('SC-UKV-1842 — панель службы без признака закрывается свайпом без вопроса', async (): Promise<void> => {
            await open();

            swipe();
            await settle();

            expect(node('bottom-sheet-confirm')).toBeNull();
            expect(heard.closed).toEqual([undefined]);
        });
    });

    describe('выключенный жест и удержание', (): void => {
        it('SC-UKV-1818 — выключенное нажатие по затемнению оставляет шторку и сообщает просьбу', async (): Promise<void> => {
            await open({ closeOnBackdropClick: false });

            node('bottom-sheet-backdrop')?.click();
            await settle();

            expect(heard.closed).toEqual([]);
            expect(heard.requests).toEqual(['backdrop']);
            expect(sheetUp()).toBe(true);
        });

        it('SC-UKV-1850 — свайп слушается выключателя нажатия по затемнению', async (): Promise<void> => {
            await open({ closeOnBackdropClick: false });

            swipe();
            await settle();

            expect(heard.closed).toEqual([]);
            expect(heard.requests).toEqual(['backdrop']);
            expect(sheetUp()).toBe(true);
        });

        it('SC-UKV-1819 — удержанная приложением панель отказывает свайпу и сообщает `backdrop`', async (): Promise<void> => {
            const ref: RtAsideRef<string> = await open();
            ref.disableClose.set(true);

            swipe();
            await settle();

            expect(heard.closed).toEqual([]);
            expect(heard.requests).toEqual(['backdrop']);
            expect(sheetUp()).toBe(true);
        });
    });

    describe('признак несохранённого', (): void => {
        it('SC-UKV-1840 — панель службы с признаком спрашивает внизу, шторка стоит под вопросом', async (): Promise<void> => {
            const ref: RtAsideRef<string> = await open();
            ref.unsaved.set(true);

            swipe();
            await settle();

            expect(node('bottom-sheet-confirm-title')?.textContent?.trim()).toBe('Unsaved changes');
            expect(sheetUp()).toBe(true);
            expect(heard.closed).toEqual([]);
        });

        it('SC-UKV-1841 — «Сохранить и закрыть» сообщает просьбу записать, панель ждёт приложения', async (): Promise<void> => {
            const ref: RtAsideRef<string> = await open();
            ref.unsaved.set(true);
            swipe();
            await settle();

            node('bottom-sheet-confirm-apply')?.click();
            await settle();

            expect(heard.saves).toBe(1);
            expect(heard.closed).toEqual([]);
            expect(sheetUp()).toBe(true);

            ref.close('saved');
            await settle();

            expect(heard.closed).toEqual(['saved']);
        });

        it('SC-UKV-1848 — закрытие кодом признак не читает и ни о чём не спрашивает', async (): Promise<void> => {
            const ref: RtAsideRef<string> = await open();
            ref.unsaved.set(true);

            ref.close();
            await settle();

            expect(node('bottom-sheet-confirm')).toBeNull();
            expect(heard.closed).toEqual([undefined]);
        });

        it('SC-UKV-1860 — повторный свайп и полоса при показанном вопросе не задают его снова', async (): Promise<void> => {
            const ref: RtAsideRef<string> = await open();
            ref.unsaved.set(true);
            swipe();
            await settle();

            swipe();
            node('bottom-sheet-backdrop')?.click();
            await settle();

            expect(document.querySelectorAll('[qa-dataid="bottom-sheet-confirm"]').length).toBe(1);
            expect(heard.closed).toEqual([]);
        });

        it('SC-UKV-1860 — Escape при показанном вопросе отвечает «Остаться»: вопрос уходит, шторка открыта', async (): Promise<void> => {
            const ref: RtAsideRef<string> = await open();
            ref.unsaved.set(true);
            swipe();
            await settle();
            expect(document.querySelectorAll('[qa-dataid="bottom-sheet-confirm"]').length).toBe(1);

            escape(document.activeElement ?? document.body);
            await settle();

            expect(document.querySelectorAll('[qa-dataid="bottom-sheet-confirm"]').length).toBe(0);
            expect(heard.closed).toEqual([]);
            expect(heard.saves).toBe(0);
            expect(sheetUp()).toBe(true);
        });
    });

    describe('выключатель Escape', (): void => {
        it('SC-UKV-1864 — выключенный у открытия Escape шторку не закрывает и сообщает просьбу `escape`', async (): Promise<void> => {
            await open({ closeOnEscape: false });

            escape();
            await settle();

            expect(heard.closed).toEqual([]);
            expect(heard.requests).toEqual(['escape']);
            expect(sheetUp()).toBe(true);
        });

        it('SC-UKV-1864 — Escape самой шторки, без пути клавиши через документ, называется `escape`', async (): Promise<void> => {
            await open({ closeOnEscape: false });

            // Так Escape отдаёт шторке её оверлей; в браузере же между слушателями клавиши проходят
            // микрозадачи, и отметка на пути клавиши к шторке до неё не доживала.
            sheet().closeByEscape();
            await settle();

            expect(heard.closed).toEqual([]);
            expect(heard.requests).toEqual(['escape']);
        });

        it('SC-UKV-1864 — Escape слушается своего выключателя, а не выключателя затемнения', async (): Promise<void> => {
            await open({ closeOnBackdropClick: false });

            escape();
            await settle();

            expect(heard.requests).toEqual([]);
            expect(heard.closed).toEqual([undefined]);
        });
    });
});
