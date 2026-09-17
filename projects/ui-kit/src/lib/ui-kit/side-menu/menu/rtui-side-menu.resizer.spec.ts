import { SUB_MENU_WIDTH_MAX } from '../side-menu.logic';
import {
    drag,
    hoverFirstItem,
    installFontsStub,
    installPointerEventStub,
    ISetup,
    menu,
    pointer,
    resizer,
    setup,
} from './side-menu.harness';

beforeAll(installFontsStub);
beforeAll(installPointerEventStub);

describe('SC-UK-35 — край закреплённого подменю тянется указателем', () => {
    it('тяга отдаёт наружу новую ширину', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 260);

        expect(host.width()).toBe(260);
    });

    // Натянутая ширина кладётся своим свойством: панель берёт наибольшее из неё и той, что задало
    // оформление, и заданная оформлением ширина остаётся нижним пределом сама по себе.
    it('панель становится той ширины, которую вернул потребитель', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 260);

        const menuElement: HTMLElement = fixture.nativeElement.querySelector('rtui-side-menu') as HTMLElement;

        expect(menuElement.style.getPropertyValue('--rt-side-menu-sub-menu-dragged-width')).toBe('260px');
        expect(menuElement.style.getPropertyValue('--rt-side-menu-sub-menu-width')).toBe('');
    });

    it('тяга за предел отдаёт предельную ширину', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 5000);

        expect(host.width()).toBe(SUB_MENU_WIDTH_MAX);
    });

    it('у незакреплённого подменю края не тянут', () => {
        const { fixture }: ISetup = setup();

        hoverFirstItem(fixture);

        expect(resizer(fixture)).toBeNull();
    });
});

describe('SC-UK-69 — ручка тянется пером и пальцем', () => {
    it('перо тянет край так же, как мышь', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 260, 'pen');

        expect(host.width()).toBe(260);
    });

    it('палец тянет край так же, как мышь', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        drag(fixture, 200, 300, 'touch');

        expect(host.width()).toBe(300);
    });
});

describe('SC-UK-70 — отнятый средой указатель кончает тягу', () => {
    it('отмена указателя отдаёт наружу дотянутую ширину', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        const handle: HTMLElement = resizer(fixture) as HTMLElement;

        pointer(handle, 'pointerdown', 200);
        pointer(handle, 'pointermove', 280);
        pointer(handle, 'pointercancel', 280);
        fixture.detectChanges();

        expect(host.width()).toBe(280);
    });

    it('после отмены движение указателя ширину больше не двигает', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        const handle: HTMLElement = resizer(fixture) as HTMLElement;

        pointer(handle, 'pointerdown', 200);
        pointer(handle, 'pointercancel', 200);
        pointer(handle, 'pointermove', 400);
        fixture.detectChanges();

        expect(host.width()).toBe(200);
    });
});

describe('SC-UK-71 — начало и конец тяги уходят наружу', () => {
    it('за одну тягу каждое событие уходит ровно по разу', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const started: jest.Mock = jest.fn();
        const ended: jest.Mock = jest.fn();

        menu(fixture).subMenuResizeStart.subscribe(started);
        menu(fixture).subMenuResizeEnd.subscribe(ended);

        drag(fixture, 200, 260);

        expect(started).toHaveBeenCalledTimes(1);
        expect(ended).toHaveBeenCalledTimes(1);
    });

    it('без тяги наружу не уходит ничего', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const started: jest.Mock = jest.fn();
        const ended: jest.Mock = jest.fn();

        menu(fixture).subMenuResizeStart.subscribe(started);
        menu(fixture).subMenuResizeEnd.subscribe(ended);

        pointer(resizer(fixture) as HTMLElement, 'pointermove', 400);
        fixture.detectChanges();

        expect(started).not.toHaveBeenCalled();
        expect(ended).not.toHaveBeenCalled();
    });
});

describe('SC-UK-72 — отнятая средой тяга тоже кончается наружу', () => {
    it('отмена указателя отдаёт наружу конец тяги', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const ended: jest.Mock = jest.fn();
        const handle: HTMLElement = resizer(fixture) as HTMLElement;

        menu(fixture).subMenuResizeEnd.subscribe(ended);

        pointer(handle, 'pointerdown', 200);
        pointer(handle, 'pointermove', 280);
        pointer(handle, 'pointercancel', 280);
        fixture.detectChanges();

        expect(ended).toHaveBeenCalledTimes(1);
    });
});
