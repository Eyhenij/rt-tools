import { InteractivityChecker } from '@angular/cdk/a11y';
import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { DRAG_DISMISS_THRESHOLD_PX } from '../bottom-sheet/rt-bottom-sheet.logic';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtAsideFooterComponent } from './footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideRef } from './rt-aside-ref';
import { RT_ASIDE_DATA } from './rt-aside.tokens';
import { RtAsideComponent } from './rt-aside.component';
import { IRtAsideConfig, RtAsideService } from './rt-aside.service';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/** Что панель показывает: заголовок, кнопки подвала, имя, удержание Tab. */
interface ISheetData {
    title: string;
    name: string | null;
    closable: boolean;
    primaries: readonly string[];
    trap: boolean;
    overline: string | null;
    /** Кнопка слота `[asideDismiss]` — опасная «Удалить» со своим смыслом, а не «Закрыть». */
    danger: boolean;
}

/** Счёт нажатий: панель пишет сюда, что сделали её кнопки. */
const presses: Record<string, number> = {};

function count(key: string): void {
    presses[key] = (presses[key] ?? 0) + 1;
}

@Component({
    selector: 'rt-aside-sheet-content',
    template: `
        <rt-aside [ariaLabel]="data.name" [trapFocus]="data.trap">
            <rt-aside-header
                [title]="data.title"
                [overline]="data.overline"
                [subtitle]="data.overline === null ? null : 'Заезд 12 мая'"
                [badges]="data.overline === null ? [] : [{ value: 'Оплачено' }]"
                [closable]="data.closable"
                (dismiss)="press('dismiss')">
                <rt-icon-button asideActions qa-dataid="head-icon" icon="undo" ariaLabel="Сбросить" (clicked)="press('icon')" />
            </rt-aside-header>
            <ng-template rtAsideContent>
                <input qa-dataid="first-field" />
                <input qa-dataid="marked-field" cdkFocusInitial />
            </ng-template>
            <rt-aside-footer [phoneCloseLabel]="!data.danger">
                <button
                    rtButton
                    asideDismiss
                    qa-dataid="foot-close"
                    type="button"
                    [theme]="data.danger ? 'danger' : 'primary'"
                    [label]="data.danger ? 'Удалить' : 'Закрыть'"
                    (click)="press('close')"></button>
                @for (label of data.primaries; track label) {
                    <button
                        rtButton
                        asidePrimary
                        type="button"
                        [attr.qa-dataid]="'foot-' + label"
                        [label]="label"
                        (click)="press(label)"></button>
                }
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideFooterComponent,
        RtAsideContentDirective,
        RtButtonDirective,
        RtIconButtonComponent,
    ],
})
class SheetContentComponent {
    protected readonly data: ISheetData = inject(RT_ASIDE_DATA) as ISheetData;

    protected press(key: string): void {
        count(key);
    }
}

const DEFAULTS: ISheetData = {
    title: 'Запись',
    name: null,
    closable: true,
    primaries: ['save'],
    trap: false,
    overline: null,
    danger: false,
};

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

/** Открывает панель службой кита и ждёт кадра, в который шторка поднимается. */
async function open(data: Partial<ISheetData> = {}, config: Partial<IRtAsideConfig> = {}): Promise<RtAsideRef> {
    const ref: RtAsideRef = TestBed.inject(RtAsideService).open(SheetContentComponent, { data: { ...DEFAULTS, ...data }, ...config });
    await settle();

    return ref;
}

function pane(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function setup(phone: boolean): void {
    setMediaQueryMatches(PHONE_QUERY, phone);
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            // jsdom не раскладывает страницу, и ловушка фокуса без подмены не видит ни одного поля
            {
                provide: InteractivityChecker,
                useValue: {
                    isDisabled: (): boolean => false,
                    isVisible: (): boolean => true,
                    isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
                    isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
                },
            },
        ],
    });
}

/** В jsdom нет `PointerEvent`: `MouseEvent` с теми же именами доходит до тех же слушателей шторки. */
function swipe(distance: number): void {
    node('bottom-sheet-handle')?.dispatchEvent(new MouseEvent('pointerdown', { clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientY: distance, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointerup', { clientY: distance, bubbles: true }));
}

describe('Панель службы кита на телефоне — шторка во всю высоту', (): void => {
    beforeEach((): void => {
        Object.keys(presses).forEach((key: string): boolean => Reflect.deleteProperty(presses, key));
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        resetMediaQueries();
    });

    describe('вид открытия', (): void => {
        it('SC-UKV-1802 — на телефоне панель службы поднимается шторкой во всю высоту и ширину окна', async (): Promise<void> => {
            setup(true);
            await open();

            expect(pane()?.classList).toContain('rt-aside-overlay--sheet');
            expect(pane()?.classList).not.toContain('rt-aside-overlay--position-right');
            expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
            expect(node('bottom-sheet-panel')?.classList).toContain('rt-bottom-sheet__panel--full');
            expect(node('bottom-sheet-body')?.querySelector('[qa-dataid="aside"]')?.classList).toContain('rt-aside--sheet');
        });

        it('SC-UKV-1802 — шторка затемняет страницу своей подложкой, своей подложки у оверлея нет', async (): Promise<void> => {
            setup(true);
            await open();

            expect(node('bottom-sheet-backdrop')).not.toBeNull();
            expect(document.querySelector('.rt-aside-backdrop')).toBeNull();
        });

        it('SC-UKV-1803 — на 481 точке панель выезжает сбоку, как прежде', async (): Promise<void> => {
            setup(false);
            await open();

            expect(pane()?.classList).toContain('rt-aside-overlay--position-right');
            expect(pane()?.classList).toContain('rt-aside-overlay--open');
            expect(pane()?.classList).not.toContain('rt-aside-overlay--sheet');
            expect(node('aside-sheet')).toBeNull();
            expect(node('aside-back')).not.toBeNull();
            expect(document.querySelector('.rt-aside-backdrop--visible')).not.toBeNull();
        });

        it('SC-UKV-1857 — панель, открытая у левого края, на телефоне поднимается снизу', async (): Promise<void> => {
            setup(true);
            await open({}, { position: 'left' });

            expect(pane()?.classList).not.toContain('rt-aside-overlay--position-left');
            expect(pane()?.classList).toContain('rt-aside-overlay--sheet');
            expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        });

        it('SC-UKV-1834 — окно, расширенное до 667 точек, шторку панелью не делает', async (): Promise<void> => {
            setup(true);
            await open();

            setMediaQueryMatches(PHONE_QUERY, false);
            await new Promise<void>((resolve: () => void): void => {
                setTimeout(resolve, 10);
            });
            await settle();

            expect(TestBed.inject(BreakpointsService).phone()).toBe(false);
            expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
            expect(pane()?.classList).toContain('rt-aside-overlay--sheet');
        });

        it('SC-UKV-1810 — панель с одной строкой содержимого стоит во всю высоту, подвал внизу экрана', async (): Promise<void> => {
            setup(true);
            await open({ primaries: ['delete', 'save'] });
            const panel: HTMLElement | null = node('bottom-sheet-panel');

            expect(panel?.classList).toContain('rt-bottom-sheet__panel--full');
            // Подвал — последний ряд панели шторки, после тела: тело тянется, и подвал прижат к низу.
            expect(panel?.lastElementChild?.getAttribute('qa-dataid')).toBe('bottom-sheet-footer');
            expect(node('bottom-sheet-footer')?.querySelector('[qa-dataid="foot-delete"]')).not.toBeNull();
        });

        it('SC-UKV-1856 — показанная клавиатура ставит шторку над собой, «×» остаётся видна', async (): Promise<void> => {
            const viewport: EventTarget & { height: number; offsetTop: number; scale: number } = Object.assign(new EventTarget(), {
                height: window.innerHeight - 300,
                offsetTop: 0,
                scale: 1,
            });
            Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
            setup(true);
            await open();

            node('first-field')?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
            await settle();

            expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--keyboard');
            expect(node('bottom-sheet-panel')?.classList).toContain('rt-bottom-sheet__panel--typing');
            expect(node('bottom-sheet-header')?.querySelector('[qa-dataid="aside-sheet-close"]')).not.toBeNull();
            Reflect.deleteProperty(window, 'visualViewport');
        });
    });

    describe('шапка и подвал шторки', (): void => {
        it('SC-UKV-1811 — шапка шторки: ручка, «×» слева, заголовок по центру, стрелки нет', async (): Promise<void> => {
            setup(true);
            await open();
            const header: HTMLElement | null = node('bottom-sheet-header');
            const columns: string[] = Array.from(node('aside-header')?.children ?? []).map(
                (column: Element): string => column.className.split(' ')[0]
            );

            expect(node('bottom-sheet-handle')).not.toBeNull();
            expect(header?.querySelector('.rt-aside-header__start [qa-dataid="aside-sheet-close"]')).not.toBeNull();
            expect(header?.querySelector('[qa-dataid="aside-title"]')?.textContent?.trim()).toBe('Запись');
            expect(node('aside-back')).toBeNull();
            expect(columns).toEqual(['rt-aside-header__start', 'rt-aside-header__heading', 'rt-aside-header__actions']);
        });

        it('SC-UKV-1811 — надзаголовок, подпись и бэйджи стоят под шапкой шторки, в шапке только заголовок', async (): Promise<void> => {
            setup(true);
            await open({ overline: 'Бронь №1042' });
            const heading: HTMLElement | null = document.querySelector('.rt-aside-header__heading');
            const meta: HTMLElement | null = node('aside-sheet-meta');
            const header: HTMLElement | null = node('aside-header');

            expect(heading?.querySelector('[qa-dataid="aside-overline"]')).toBeNull();
            expect(heading?.querySelector('[qa-dataid="aside-title"]')?.textContent?.trim()).toBe('Запись');
            expect(Array.from(meta?.children ?? []).map((part: Element): string => part.className.split(' ')[0])).toEqual([
                'rt-aside-header__overline',
                'rt-aside-header__subtitle',
                'rt-aside-header__badges',
            ]);
            expect(meta?.querySelector('[qa-dataid="aside-overline"]')?.textContent?.trim()).toBe('Бронь №1042');
            // Под шапкой, а не в ней: блок стоит после ряда «×», заголовка и кнопок.
            expect(header?.compareDocumentPosition(meta as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
            expect(header?.contains(meta)).toBe(false);
        });

        it('SC-UKV-1803 — сбоку надзаголовок стоит над заголовком в колонке шапки, блока под шапкой нет', async (): Promise<void> => {
            setup(false);
            await open({ overline: 'Бронь №1042' });
            const heading: HTMLElement | null = document.querySelector('.rt-aside-header__heading');

            expect(Array.from(heading?.children ?? []).map((part: Element): string => part.className.split(' ')[0])).toEqual([
                'rt-aside-header__overline',
                'rt-aside-header__title',
                'rt-aside-header__subtitle',
                'rt-aside-header__badges',
            ]);
            expect(node('aside-sheet-meta')).toBeNull();
        });

        it('SC-UKV-1812 — «Сохранить» справа в шапке делает то же, что кнопка подвала, и в подвале её нет', async (): Promise<void> => {
            setup(true);
            await open();
            const save: HTMLElement | null = node('foot-save');

            expect(save?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
            expect(node('bottom-sheet-footer')?.querySelector('[qa-dataid="foot-save"]') ?? null).toBeNull();
            // Залитая кнопка — вид кнопки по умолчанию, без модификатора рамки или текста.
            expect(save?.classList).not.toContain('rt-button--outlined');
            expect(save?.classList).not.toContain('rt-button--text');
            // Шаг действия шапки шторки — `sm`, как «Применить» отборов: высота подвала резала бы заголовок.
            expect(save?.classList).toContain('rt-button--sm');

            save?.click();

            expect(presses['save']).toBe(1);
        });

        it('SC-UKV-1803 — от 481 точки главная кнопка остаётся в подвале своим размером', async (): Promise<void> => {
            setup(false);
            await open();

            expect(node('foot-save')?.closest('[qa-dataid="aside-footer"]')).not.toBeNull();
            expect(node('foot-save')?.classList).not.toContain('rt-button--sm');
        });

        it('SC-UKV-1813 — без главной кнопки правая колонка пуста, заголовок по центру', async (): Promise<void> => {
            setup(true);
            await open({ primaries: [] });

            expect(node('aside-sheet-main')?.children.length).toBe(0);
            expect(node('aside-header')?.classList).toContain('rt-aside-header__content--sheet');
            expect(node('aside-header')?.children[1]?.classList).toContain('rt-aside-header__heading');
            // Кнопка подвала только закрывала: подвала у шторки нет вовсе.
            expect(node('bottom-sheet-footer')?.children.length).toBe(0);
        });

        it('SC-UKV-1837 — из двух кнопок главного слота в шапку уходит последняя', async (): Promise<void> => {
            setup(true);
            await open({ primaries: ['delete', 'save'] });

            expect(node('foot-save')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
            expect(node('foot-delete')?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
            // Кнопки подвала шторки — того же шага `sm`, что главная кнопка в шапке.
            expect(node('foot-delete')?.classList).toContain('rt-button--sm');
        });

        it('SC-UKV-1863 — опасная кнопка, помеченная панелью, остаётся в подвале шторки красной в рамке', async (): Promise<void> => {
            setup(true);
            await open({ danger: true });
            const remove: HTMLElement | null = node('foot-close');

            expect(remove?.closest('[qa-dataid="bottom-sheet-footer"]')).not.toBeNull();
            expect(remove?.classList).toContain('rt-button--danger');
            expect(remove?.classList).toContain('rt-button--outlined');
            expect(remove?.classList).not.toContain('rt-button--secondary');
            expect(remove?.classList).toContain('rt-button--sm');
        });

        it('SC-UKV-1863 — от 481 точки опасная кнопка подвала тоже красная', async (): Promise<void> => {
            setup(false);
            await open({ danger: true });

            expect(node('foot-close')?.classList).toContain('rt-button--danger');
            expect(node('foot-close')?.classList).toContain('rt-button--outlined');
        });

        it('SC-UKV-1836 — значки шапки стоят справа, левее главной кнопки', async (): Promise<void> => {
            setup(true);
            await open();
            const actions: HTMLElement | null = node('aside-actions');
            const icon: HTMLElement | null = actions?.querySelector('[qa-dataid="head-icon"]') ?? null;
            const main: HTMLElement | null = node('aside-sheet-main');

            expect(icon).not.toBeNull();
            expect(icon?.compareDocumentPosition(main as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });

        it('SC-UKV-1835 — кнопка подвала, которая только закрывает, в шторке не рисуется', async (): Promise<void> => {
            setup(true);
            await open();

            expect(node('foot-close')).toBeNull();
            expect(node('bottom-sheet-footer')?.children.length).toBe(0);
        });

        it('SC-UKV-1847 — «×» идёт дорогой стрелки: шлёт `dismiss` и закрывает панель, обработчик спрятанной кнопки молчит', async (): Promise<void> => {
            setup(true);
            const ref: RtAsideRef = await open();
            let closed: boolean = false;
            ref.afterClosed().subscribe((): void => {
                closed = true;
            });

            node('aside-sheet-close')?.querySelector('button')?.click();
            await settle();

            expect(presses['dismiss']).toBe(1);
            expect(presses['close']).toBeUndefined();
            expect(closed).toBe(true);
            expect(node('aside-sheet')?.classList).not.toContain('rt-bottom-sheet--open');
        });

        it('SC-UKV-1839 — шапка без стрелки не рисует «×», свайп за порог шторку закрывает', async (): Promise<void> => {
            setup(true);
            const ref: RtAsideRef = await open({ closable: false });
            let closed: boolean = false;
            ref.afterClosed().subscribe((): void => {
                closed = true;
            });

            expect(node('aside-sheet-close')).toBeNull();
            expect(node('aside-header')?.firstElementChild?.classList).toContain('rt-aside-header__start');

            swipe(DRAG_DISMISS_THRESHOLD_PX + 1);
            await settle();

            expect(closed).toBe(true);
        });

        it('SC-UKV-1838 — своё поле первого фокуса у панели, держащей Tab, сильнее «×»', async (): Promise<void> => {
            setup(true);
            await open({ trap: true });
            await settle();

            expect(document.activeElement).toBe(node('marked-field'));
        });

        it('SC-UKV-1861 — длинный заголовок стоит одной строкой в шапке шторки', async (): Promise<void> => {
            setup(true);
            await open({ title: 'Очень длинный заголовок записи, который не помещается в шапку шторки на телефоне' });
            const title: HTMLElement | null = node('aside-title');

            // Обрезку многоточием и одну строку держат стили шапки — их проверяет спека стилей шторки.
            expect(title?.closest('.rt-aside-header__content--sheet')).not.toBeNull();
            expect(title?.querySelector('rt-skeleton-wrapper')).not.toBeNull();
        });

        it('SC-UKV-1862 — панель без своего имени объявлена модальным диалогом по заголовку', async (): Promise<void> => {
            setup(true);
            await open();
            const dialog: HTMLElement | null = node('bottom-sheet-panel');

            expect(dialog?.getAttribute('role')).toBe('dialog');
            expect(dialog?.getAttribute('aria-modal')).toBe('true');
            expect(dialog?.getAttribute('aria-label')).toBe('Запись');
            // Рамка внутри шторки вторым диалогом не объявляется.
            expect(node('aside')?.getAttribute('role')).toBeNull();
        });

        it('SC-UKV-1862 — своё имя панели сильнее заголовка', async (): Promise<void> => {
            setup(true);
            await open({ name: 'Карточка записи' });

            expect(node('bottom-sheet-panel')?.getAttribute('aria-label')).toBe('Карточка записи');
        });
    });
});
