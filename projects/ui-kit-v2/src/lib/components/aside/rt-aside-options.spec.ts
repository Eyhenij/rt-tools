import { InteractivityChecker } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';
import {
    inject,
    signal,
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    InjectionToken,
    Injector,
    RendererFactory2,
    WritableSignal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable, Subject } from 'rxjs';

import { createRtFixture, provideRtKitTesting, qa } from '../../../testing/rt-kit-testing';
import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideRef, TRtAsideCloseRequest } from './rt-aside-ref';
import { RtAsideComponent } from './rt-aside.component';
import { IRtAsideConfig, RtAsideService } from './rt-aside.service';

/** Провайдер хозяина панели: содержимое видит его, только если injector хозяина — родитель портала. */
const OWNER_NAME: InjectionToken<string> = new InjectionToken<string>('OWNER_NAME');

const OWNER_VALUE: string = 'Карточка заказа';

@Component({
    selector: 'rt-aside-owned-content',
    template: `
        <rt-aside>
            <p qa-dataid="owner-name">{{ ownerName }}</p>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent],
})
class OwnedContentComponent {
    public readonly ownerName: string | null = inject(OWNER_NAME, { optional: true });
}

/** Хозяин: открывает панель своим injector'ом и держит провайдер, которого нет в корне. */
@Component({
    selector: 'rt-aside-owner',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: OWNER_NAME, useValue: OWNER_VALUE }],
})
class OwnerComponent {
    public readonly service: RtAsideService = inject(RtAsideService);
    public readonly injector: Injector = inject(Injector);
}

@Component({
    selector: 'rt-aside-focus-host',
    template: `
        <rt-aside [trapFocus]="trap()">
            <input qa-dataid="first" />
            <input qa-dataid="initial" cdkFocusInitial />
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent],
})
class FocusHostComponent {
    public readonly trap: WritableSignal<boolean> = signal(false);
}

@Component({
    selector: 'rt-aside-header-row-host',
    template: `
        <rt-aside-header title="Заказы" [closable]="false">
            <input asideHeaderContent qa-dataid="search" />
        </rt-aside-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideHeaderComponent],
})
class HeaderRowHostComponent {}

/** Слой без CDK: снятие отзывается в detachments(), как у настоящего. */
interface IOverlayDouble {
    overlayRef: OverlayRef;
    detach: () => void;
}

/** Что пришло в поток, и завершился ли он. */
interface IRecord<T> {
    values: T[];
    completed: () => boolean;
}

function overlayDouble(): IOverlayDouble {
    const detachments: Subject<void> = new Subject<void>();
    const detach: () => void = (): void => {
        detachments.next();
        detachments.complete();
    };
    const overlayElement: HTMLElement = document.createElement('div');
    const overlayRef: OverlayRef = {
        overlayElement,
        dispose: detach,
        detachments: (): Observable<void> => detachments.asObservable(),
    } as OverlayRef;
    return { overlayRef, detach };
}

function asideRefOn(overlay: IOverlayDouble): RtAsideRef<string> {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    return new RtAsideRef<string>(overlay.overlayRef, TestBed.inject(RendererFactory2).createRenderer(null, null));
}

function record<T>(source: Observable<T>): IRecord<T> {
    const values: T[] = [];
    let completed: boolean = false;
    source.subscribe({
        next: (value: T): void => {
            values.push(value);
        },
        complete: (): void => {
            completed = true;
        },
    });
    return { values, completed: (): boolean => completed };
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function backdrop(): HTMLElement | null {
    return document.querySelector('.rt-aside-backdrop');
}

function overlayPanel(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

function render(): void {
    TestBed.inject(ApplicationRef).tick();
}

function pressEscape(): void {
    overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('Снятый слой и хэндлы', (): void => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-603 — панель, снятая без close(), отдаёт undefined и завершается', (): void => {
        const overlay: IOverlayDouble = overlayDouble();
        const closed: IRecord<string | undefined> = record(asideRefOn(overlay).afterClosed());

        overlay.detach();

        expect(closed.values).toEqual([undefined]);
        expect(closed.completed()).toBe(true);
    });

    it('SC-UKV-603 — диалог, снятый без close(), отдаёт undefined и завершается', (): void => {
        const overlay: IOverlayDouble = overlayDouble();
        const closed: IRecord<boolean | undefined> = record(new RtDialogRef<boolean>(overlay.overlayRef).afterClosed());

        overlay.detach();

        expect(closed.values).toEqual([undefined]);
        expect(closed.completed()).toBe(true);
    });

    it('SC-UKV-604 — панель отдаёт результат close() один раз, и снятие слоя после ухода ничего не добавляет', (): void => {
        jest.useFakeTimers();
        const overlay: IOverlayDouble = overlayDouble();
        const ref: RtAsideRef<string> = asideRefOn(overlay);
        const closed: IRecord<string | undefined> = record(ref.afterClosed());

        ref.close('сохранено');
        jest.advanceTimersByTime(300);

        expect(closed.values).toEqual(['сохранено']);
        expect(closed.completed()).toBe(true);
    });

    it('SC-UKV-604 — диалог отдаёт результат close(), хотя снимает слой раньше, чем отдаёт его', (): void => {
        const overlay: IOverlayDouble = overlayDouble();
        const ref: RtDialogRef<boolean> = new RtDialogRef<boolean>(overlay.overlayRef);
        const closed: IRecord<boolean | undefined> = record(ref.afterClosed());

        ref.close(true);
        ref.close(false);

        expect(closed.values).toEqual([true]);
        expect(closed.completed()).toBe(true);
    });
});

describe('Хозяин панели', (): void => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    function owner(): ComponentFixture<OwnerComponent> {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        return TestBed.createComponent(OwnerComponent);
    }

    it('SC-UKV-605 — содержимое видит провайдеры хозяина', (): void => {
        const fixture: ComponentFixture<OwnerComponent> = owner();

        fixture.componentInstance.service.open(OwnedContentComponent, { injector: fixture.componentInstance.injector });
        render();

        expect(node('owner-name')?.textContent?.trim()).toBe(OWNER_VALUE);
    });

    it('SC-UKV-605 — уничтожение хозяина закрывает панель', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<OwnerComponent> = owner();
        const ref: RtAsideRef = fixture.componentInstance.service.open(OwnedContentComponent, {
            injector: fixture.componentInstance.injector,
        });
        render();
        const closed: IRecord<unknown> = record(ref.afterClosed());

        fixture.destroy();
        jest.advanceTimersByTime(300);

        expect(closed.values).toEqual([undefined]);
        expect(overlayPanel()).toBeNull();
    });

    it('SC-UKV-605 — без хозяина его провайдеров содержимое не видит', (): void => {
        const fixture: ComponentFixture<OwnerComponent> = owner();

        fixture.componentInstance.service.open(OwnedContentComponent);
        render();

        expect(node('owner-name')).not.toBeNull();
        expect(node('owner-name')?.textContent?.trim()).toBe('');
    });
});

describe('Отказанные жесты закрытия', (): void => {
    function open(config: IRtAsideConfig = {}): RtAsideRef {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        const ref: RtAsideRef = TestBed.inject(RtAsideService).open(OwnedContentComponent, config);
        render();
        return ref;
    }

    it('SC-UKV-606 — под запретом закрытия подложка и Escape приходят просьбами', (): void => {
        const ref: RtAsideRef = open();
        const requests: IRecord<TRtAsideCloseRequest> = record(ref.closeRequests());
        ref.disableClose.set(true);

        backdrop()?.click();
        pressEscape();

        expect(requests.values).toEqual(['backdrop', 'escape']);
    });

    it('SC-UKV-606 — выключенные настройкой жесты тоже приходят просьбами', (): void => {
        const ref: RtAsideRef = open({ closeOnBackdropClick: false, closeOnEscape: false });
        const requests: IRecord<TRtAsideCloseRequest> = record(ref.closeRequests());

        backdrop()?.click();
        pressEscape();

        expect(requests.values).toEqual(['backdrop', 'escape']);
    });

    it('SC-UKV-606 — жест, который закрыл панель, просьбой не приходит, а поток завершается', (): void => {
        const ref: RtAsideRef = open();
        const requests: IRecord<TRtAsideCloseRequest> = record(ref.closeRequests());

        pressEscape();

        expect(requests.values).toEqual([]);
        expect(requests.completed()).toBe(true);
    });
});

describe('Ловушка фокуса панели', (): void => {
    /**
     * У jsdom нет раскладки, и проверка видимости CDK считает невидимым всё подряд. Подменяем её:
     * доступен любой элемент, а по Tab — тот, у кого неотрицательный tabIndex.
     */
    function focusHost(): ComponentFixture<FocusHostComponent> {
        TestBed.configureTestingModule({
            providers: [
                ...provideRtKitTesting(),
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
        const fixture: ComponentFixture<FocusHostComponent> = TestBed.createComponent(FocusHostComponent);
        document.body.appendChild(fixture.nativeElement as HTMLElement);
        fixture.detectChanges();
        return fixture;
    }

    /** Кнопка, от которой открыли панель: стоит вне неё и переживает её уход. */
    function opener(): HTMLButtonElement {
        const button: HTMLButtonElement = document.createElement('button');
        button.setAttribute('qa-dataid', 'opener');
        document.body.appendChild(button);
        button.focus();
        return button;
    }

    async function settle(fixture: ComponentFixture<FocusHostComponent>): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function anchors(): number {
        return document.querySelectorAll('.cdk-focus-trap-anchor').length;
    }

    afterEach((): void => {
        node('opener')?.remove();
    });

    it('SC-UKV-607 — ловушка ставит фокус на отмеченный элемент и возвращает его, когда гаснет', async (): Promise<void> => {
        const button: HTMLButtonElement = opener();
        const fixture: ComponentFixture<FocusHostComponent> = focusHost();

        fixture.componentInstance.trap.set(true);
        await settle(fixture);

        expect(document.activeElement).toBe(node('initial'));
        expect(anchors()).toBe(2);

        fixture.componentInstance.trap.set(false);
        await settle(fixture);

        expect(document.activeElement).toBe(button);
        expect(anchors()).toBe(0);
    });

    it('SC-UKV-607 — уходящая панель снимает ловушку и возвращает фокус', async (): Promise<void> => {
        const button: HTMLButtonElement = opener();
        const fixture: ComponentFixture<FocusHostComponent> = focusHost();
        fixture.componentInstance.trap.set(true);
        await settle(fixture);

        fixture.destroy();

        expect(document.activeElement).toBe(button);
        expect(anchors()).toBe(0);
    });

    it('SC-UKV-608 — без ловушки фокус остаётся, где стоял', async (): Promise<void> => {
        const button: HTMLButtonElement = opener();
        const fixture: ComponentFixture<FocusHostComponent> = focusHost();

        await settle(fixture);

        expect(node('initial')).not.toBeNull();
        expect(document.activeElement).toBe(button);
        expect(anchors()).toBe(0);
    });
});

describe('Ожидание панели и строка шапки', (): void => {
    it('SC-UKV-609 — панель в ожидании накрыта слоем с крутилкой и помечена занятой', (): void => {
        const fixture: ComponentFixture<RtAsideComponent> = createRtFixture(RtAsideComponent, { pending: true });
        const layer: HTMLElement | undefined = qa(fixture, 'aside-pending')?.nativeElement as HTMLElement | undefined;

        expect(layer?.querySelector('rt-spinner')).not.toBeNull();
        expect((qa(fixture, 'aside')?.nativeElement as HTMLElement).getAttribute('aria-busy')).toBe('true');
    });

    it('SC-UKV-609 — без ожидания слоя нет и панель не занята', (): void => {
        const fixture: ComponentFixture<RtAsideComponent> = createRtFixture(RtAsideComponent);

        expect(qa(fixture, 'aside')).not.toBeNull();
        expect(qa(fixture, 'aside-pending')).toBeNull();
        expect((qa(fixture, 'aside')?.nativeElement as HTMLElement).hasAttribute('aria-busy')).toBe(false);
    });

    it('SC-UKV-610 — строка шапки стоит под заголовком и несёт своё содержимое', (): void => {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        const fixture: ComponentFixture<HeaderRowHostComponent> = TestBed.createComponent(HeaderRowHostComponent);
        fixture.detectChanges();
        const root: HTMLElement = fixture.nativeElement as HTMLElement;
        const row: HTMLElement | null = root.querySelector('[qa-dataid="aside-header-row"]');
        const header: HTMLElement | null = root.querySelector('[qa-dataid="aside-header"]');

        expect(row?.querySelector('[qa-dataid="search"]')).not.toBeNull();
        expect(header?.compareDocumentPosition(row as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('SC-UKV-610 — без содержимого строка шапки пуста', (): void => {
        const fixture: ComponentFixture<RtAsideHeaderComponent> = createRtFixture(RtAsideHeaderComponent, { title: 'Заказы' });
        const row: HTMLElement | undefined = qa(fixture, 'aside-header-row')?.nativeElement as HTMLElement | undefined;

        expect(row).toBeDefined();
        expect(row?.childNodes.length).toBe(0);
    });
});
