import { ComponentFixture } from '@angular/core/testing';

import { SUB_MENU_WIDTH_MAX, SUB_MENU_WIDTH_MIN, SUB_MENU_WIDTH_STEP } from '../side-menu.logic';
import {
    drag,
    hoverFirstItem,
    installFontsStub,
    installPointerEventStub,
    HostComponent,
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

describe('SC-UK-73 — наружу уходит то число, которым панель нарисована', () => {
    it('тяга влево за ширину оформления отдаёт нарисованное, а не натянутое', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(300);
        fixture.detectChanges();

        // Стилей компонента спека не применяет, и ширина панели там нулевая: замер подменяется —
        // оформление потребителя держит нижний предел в 300, и панель нарисована им.
        const panel: HTMLElement = menu(fixture).subMenuPanelRef()?.nativeElement as HTMLElement;

        jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        drag(fixture, 300, 150);

        expect(host.width()).toBe(300);
    });

    it('тяга вправо по-прежнему отдаёт натянутое', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(300);
        fixture.detectChanges();

        const panel: HTMLElement = menu(fixture).subMenuPanelRef()?.nativeElement as HTMLElement;

        jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        drag(fixture, 300, 400);

        expect(host.width()).toBe(400);
    });
});

/** Нажатие клавиши на ручке. Возвращается само событие: у него спрашивают, съедено ли умолчание. */
function pressOnResizer(fixture: ComponentFixture<HostComponent>, key: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key });

    (resizer(fixture) as HTMLElement).dispatchEvent(event);
    fixture.detectChanges();

    return event;
}

describe('SC-UK-74 — стрелки двигают ширину шагом', () => {
    it('вправо шире на шаг, влево — обратно на него же', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        pressOnResizer(fixture, 'ArrowRight');

        expect(host.width()).toBe(200 + SUB_MENU_WIDTH_STEP);

        pressOnResizer(fixture, 'ArrowLeft');

        expect(host.width()).toBe(200);
    });

    it('клавиша не о ширине умолчания не отменяет', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);

        expect(pressOnResizer(fixture, 'Tab').defaultPrevented).toBe(false);
        expect(pressOnResizer(fixture, 'ArrowRight').defaultPrevented).toBe(true);
    });
});

describe('SC-UK-75 — Home и End ведут ширину к пределам', () => {
    it('Home даёт нижний предел, End — верхний', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        pressOnResizer(fixture, 'Home');

        expect(host.width()).toBe(SUB_MENU_WIDTH_MIN);

        pressOnResizer(fixture, 'End');

        expect(host.width()).toBe(SUB_MENU_WIDTH_MAX);
    });
});

describe('SC-UK-76 — клавиша тяги не ведёт, и событий тяги нет', () => {
    it('ни начало, ни конец наружу не уходят', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);
        const started: jest.Mock = jest.fn();
        const ended: jest.Mock = jest.fn();

        host.width.set(200);
        fixture.detectChanges();
        menu(fixture).subMenuResizeStart.subscribe(started);
        menu(fixture).subMenuResizeEnd.subscribe(ended);

        pressOnResizer(fixture, 'ArrowRight');

        expect(host.width()).toBe(200 + SUB_MENU_WIDTH_STEP);
        expect(started).not.toHaveBeenCalled();
        expect(ended).not.toHaveBeenCalled();
    });
});

describe('SC-UK-77 — диктор называет ширину и оба предела', () => {
    it('ручка стоит в обходе табуляцией и несёт три числа', () => {
        const { fixture, host }: ISetup = setup('pinned', ['refs']);

        host.width.set(200);
        fixture.detectChanges();

        const handle: HTMLElement = resizer(fixture) as HTMLElement;

        expect(handle.getAttribute('tabindex')).toBe('0');
        expect(handle.getAttribute('aria-valuenow')).toBe('200');
        expect(handle.getAttribute('aria-valuemin')).toBe(String(SUB_MENU_WIDTH_MIN));
        expect(handle.getAttribute('aria-valuemax')).toBe(String(SUB_MENU_WIDTH_MAX));
    });

    it('потребитель ширины не назвал — числа кит не выдумывает', () => {
        const { fixture }: ISetup = setup('pinned', ['refs']);
        const handle: HTMLElement = resizer(fixture) as HTMLElement;

        expect(handle.getAttribute('aria-valuenow')).toBeNull();
        expect(handle.getAttribute('aria-valuemin')).toBeNull();
        expect(handle.getAttribute('aria-valuemax')).toBeNull();
    });
});
