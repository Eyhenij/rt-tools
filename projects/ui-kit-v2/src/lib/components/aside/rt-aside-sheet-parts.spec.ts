import { ApplicationRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtAsideFooterComponent } from './footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/**
 * Панель со всеми проекциями: шапка с надзаголовком, бэйджем и своим содержимым колонки заголовка,
 * тело и подвал с «Закрыть» и двумя кнопками главного слота — в шторке подвал остаётся.
 */
@Component({
    selector: 'rt-aside-sheet-parts-content',
    template: `
        <rt-aside>
            <rt-aside-header title="Запись" overline="Бронь №1042" [badges]="[{ value: 'Оплачено' }]">
                <span asideHeadingContent qa-dataid="heading-extra">Обновлено в 12:00</span>
            </rt-aside-header>
            <ng-template rtAsideContent>
                <p qa-dataid="body-line">Сочи, 7 ночей</p>
            </ng-template>
            <rt-aside-footer>
                <button rtButton asideDismiss qa-dataid="foot-close" type="button" label="Закрыть"></button>
                <button rtButton asidePrimary qa-dataid="foot-copy" type="button" label="Дублировать"></button>
                <button rtButton asidePrimary qa-dataid="foot-save" type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideFooterComponent, RtAsideContentDirective, RtButtonDirective],
})
class PartsContentComponent {}

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

/** Открывает панель службой кита в окне телефона или шире. */
async function open(phone: boolean): Promise<void> {
    setMediaQueryMatches(PHONE_QUERY, phone);
    TestBed.configureTestingModule({ providers: provideRtKitTesting() });
    TestBed.inject(RtAsideService).open(PartsContentComponent);
    await settle();
}

describe('Проекции панели — одни и те же узлы сбоку и в шторке', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        resetMediaQueries();
    });

    it('SC-UKV-1811 — в шторке рамка стоит в теле шторки, шапка панели — в её шапке, подвал — в её подвале', async (): Promise<void> => {
        await open(true);
        const frame: HTMLElement | null = node('aside');

        expect(frame?.parentElement?.getAttribute('qa-dataid')).toBe('bottom-sheet-body');
        expect(frame?.querySelector('[qa-dataid="body-line"]')).not.toBeNull();
        expect(document.querySelector('rt-aside-header')?.parentElement?.getAttribute('qa-dataid')).toBe('bottom-sheet-header');
        expect(document.querySelector('rt-aside-footer')?.parentElement?.getAttribute('qa-dataid')).toBe('bottom-sheet-footer');
        expect(frame?.querySelector('rt-aside-header, rt-aside-footer')).toBeNull();
        // Роль, имя и размер — у шторки: рамка в ней не второй диалог.
        expect(frame?.getAttribute('role')).toBeNull();
        expect(frame?.classList).toContain('rt-aside--sheet');
        expect(frame?.classList).not.toContain('rt-aside--size--md');
    });

    it('SC-UKV-1803 — сбоку шапка и подвал стоят в рамке панели: шапка первой, подвал последним', async (): Promise<void> => {
        await open(false);
        const frame: HTMLElement | null = node('aside');

        expect(node('aside-sheet')).toBeNull();
        expect(frame?.firstElementChild?.tagName.toLowerCase()).toBe('rt-aside-header');
        expect(frame?.lastElementChild?.tagName.toLowerCase()).toBe('rt-aside-footer');
        expect(frame?.getAttribute('role')).toBe('complementary');
        expect(frame?.classList).toContain('rt-aside--size--md');
        expect(frame?.classList).not.toContain('rt-aside--sheet');
    });

    it('SC-UKV-1811 — содержимое колонки заголовка в шторке стоит под шапкой последним', async (): Promise<void> => {
        await open(true);
        const meta: HTMLElement | null = node('aside-sheet-meta');

        expect(node('heading-extra')?.parentElement).toBe(meta);
        expect(meta?.lastElementChild).toBe(node('heading-extra'));
        expect(document.querySelector('.rt-aside-header__heading [qa-dataid="heading-extra"]')).toBeNull();
    });

    it('SC-UKV-1803 — сбоку содержимое колонки заголовка стоит в колонке, после бэйджей', async (): Promise<void> => {
        await open(false);
        const heading: HTMLElement | null = document.querySelector('.rt-aside-header__heading');
        const extra: HTMLElement | null = node('heading-extra');

        expect(heading?.lastElementChild).toBe(extra);
        expect(heading?.querySelector('.rt-aside-header__badges')?.compareDocumentPosition(extra as Node)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(node('aside-sheet-meta')).toBeNull();
    });

    it('SC-UKV-1835 — у подвала с другой кнопкой «Закрыть» в шторке спрятана модификатором подвала', async (): Promise<void> => {
        await open(true);
        const footer: HTMLElement | null = document.querySelector('rt-aside-footer');

        expect(footer?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
        expect(footer?.classList).toContain('rt-aside-footer--close-hidden');
        expect(node('foot-close')?.parentElement?.getAttribute('qa-dataid')).toBe('aside-footer');
        expect(node('foot-copy')?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
        expect(node('foot-save')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
    });

    it('SC-UKV-1803 — сбоку «Закрыть» подвала видна: модификатора подвала нет', async (): Promise<void> => {
        await open(false);

        expect(document.querySelector('rt-aside-footer')?.classList).not.toContain('rt-aside-footer--close-hidden');
        expect(node('foot-close')?.closest('[qa-dataid="aside-footer"]')).not.toBeNull();
    });
});
