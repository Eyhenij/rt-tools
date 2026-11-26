import {
    effect,
    inject,
    signal,
    viewChild,
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    Injector,
    Provider,
    Signal,
    WritableSignal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtAsideService } from '../aside/rt-aside.service';
import { RtIconSetDirective } from '../icon/rt-icon-set.directive';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RT_ICON_SPRITE_ID } from '../icon/rt-icon.const';
import { provideRtIcons } from '../icon/rt-icon.providers';
import { RtMenuContentDirective } from '../menu/rt-menu-content.directive';
import { RtMenuItemComponent, rtPreloadMenuConfirmDialog } from '../menu/rt-menu-item.component';
import { RtMenuComponent } from '../menu/rt-menu.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { RtTabDirective } from '../tabs/rt-tab.directive';
import { RtTabsComponent } from '../tabs/rt-tabs.component';
import { RtDialogService } from './rt-dialog.service';

const BRAND: string = '#rt-icon-set-brand--close';

/** Содержимое окна: значок и кнопка, открывающая следующее окно. */
@Component({
    selector: 'rt-icon-set-window',
    template: `
        <rt-icon name="close" />
        <button type="button" qa-dataid="open-next" (click)="next()">Дальше</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconComponent],
})
class IconSetWindowComponent {
    readonly #dialogs: RtDialogService = inject(RtDialogService);

    protected next(): void {
        this.#dialogs.open(IconSetWindowComponent);
    }
}

/* Шаблон панели объявлен вне части, а кнопка, открывающая её, — внутри: набор окну даёт только панель. */
@Component({
    selector: 'rt-icon-set-windows-host',
    template: `
        <section rtIconSet="brand">
            <rt-menu>
                <ng-template rtMenuContent>
                    <rt-menu-item label="Удалить" confirmMessage="Удалить запись?" />
                </ng-template>
            </rt-menu>
            <button type="button" qa-dataid="origin" [rtPopover]="panel">Ещё</button>
        </section>
        <ng-template #panel>
            <button type="button" qa-dataid="open-dialog" (click)="openDialog()">Диалог</button>
            <button type="button" qa-dataid="open-aside" (click)="openAside()">Панель</button>
        </ng-template>
        <button type="button" qa-dataid="outside" (click)="openDialog()">Снаружи</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconSetDirective, RtMenuComponent, RtMenuContentDirective, RtMenuItemComponent, RtPopoverDirective],
})
class IconSetWindowsHostComponent {
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #asides: RtAsideService = inject(RtAsideService);

    protected openDialog(): void {
        this.#dialogs.open(IconSetWindowComponent);
    }

    protected openAside(): void {
        this.#asides.open(IconSetWindowComponent);
    }
}

/* Узел внутри части, открывающий панель с собственным инжектором, как делает приложение. */
@Component({
    selector: 'rt-icon-set-owner',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class IconSetOwnerComponent {
    readonly #asides: RtAsideService = inject(RtAsideService);
    readonly #injector: Injector = inject(Injector);

    public open(iconSet?: string | null): void {
        this.#asides.open(IconSetWindowComponent, { injector: this.#injector, iconSet });
    }
}

@Component({
    selector: 'rt-icon-set-owner-host',
    template: '<section rtIconSet="brand"><rt-icon-set-owner /></section>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconSetDirective, IconSetOwnerComponent],
})
class IconSetOwnerHostComponent {
    public readonly owner: Signal<IconSetOwnerComponent> = viewChild.required(IconSetOwnerComponent);
}

@Component({
    selector: 'rt-icon-set-tabs-host',
    template: `
        <section rtIconSet="brand">
            <rt-tabs activeId="a">
                <ng-template rtTab="a" label="Брони" [contextMenu]="tabMenu">A</ng-template>
            </rt-tabs>
        </section>
        <ng-template #tabMenu><button type="button" qa-dataid="tab-item">Открыть</button></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconSetDirective, RtTabsComponent, RtTabDirective],
})
class IconSetTabsHostComponent {}

/* Панель открывается из `effect`, как делает приложение, у которого номер записи — сигнал. */
@Component({
    selector: 'rt-icon-set-effect-owner',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class IconSetEffectOwnerComponent {
    readonly #asides: RtAsideService = inject(RtAsideService);
    readonly #injector: Injector = inject(Injector);

    public readonly record: WritableSignal<string | null> = signal<string | null>(null);

    constructor() {
        effect((): void => {
            if (this.record() !== null) {
                this.#asides.open(IconSetWindowComponent, { injector: this.#injector });
            }
        });
    }
}

@Component({
    selector: 'rt-icon-set-effect-host',
    template: '<section [rtIconSet]="part()"><rt-icon-set-effect-owner /></section>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconSetDirective, IconSetEffectOwnerComponent],
})
class IconSetEffectHostComponent {
    public readonly part: WritableSignal<string> = signal<string>('brand');
    public readonly owner: Signal<IconSetEffectOwnerComponent> = viewChild.required(IconSetEffectOwnerComponent);
}

function setup(): ComponentFixture<IconSetWindowsHostComponent> {
    const declared: Provider = provideRtIcons({ sets: [{ name: 'brand', url: '/brand' }] }) as unknown as Provider;

    return createRtFixture(IconSetWindowsHostComponent, {}, { providers: [declared] });
}

function settle(fixture: ComponentFixture<IconSetWindowsHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
}

/** Нажимает так, как нажимает человек: фокус встаёт на кнопку, затем щелчок. */
function press(fixture: ComponentFixture<IconSetWindowsHostComponent>, selector: string): void {
    const node: HTMLElement = document.querySelector<HTMLElement>(selector) as HTMLElement;
    node.focus();
    node.click();
    settle(fixture);
}

/** Ссылки значков всех открытых окон с этим содержимым и набор их коробок. */
function windows(): { href: string | null; pane: string | null }[] {
    return Array.from(document.querySelectorAll('rt-icon-set-window'), (node: Element): { href: string | null; pane: string | null } => ({
        href: node.querySelector('use')?.getAttribute('href') ?? null,
        pane: node.closest('.cdk-overlay-pane')?.getAttribute('data-rt-icon-set') ?? null,
    }));
}

describe('набор значков части в открытых из неё окнах', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadMenuConfirmDialog();
    });

    afterEach((): void => {
        document.getElementById(RT_ICON_SPRITE_ID)?.remove();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1884 — подтверждение пункта открытого меню получает набор части, где бы ни стоял фокус', (): void => {
        const fixture: ComponentFixture<IconSetWindowsHostComponent> = setup();
        press(fixture, '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]');
        document.querySelector<HTMLElement>('[qa-dataid="outside"]')?.focus();

        document.querySelector<HTMLElement>('rt-menu-item')?.click();
        settle(fixture);

        const pane: Element | null = document.querySelector('rt-menu-confirm-dialog')?.closest('.cdk-overlay-pane') ?? null;
        expect(pane?.getAttribute('data-rt-icon-set')).toBe('brand');
    });

    it.each<[string]>([['open-dialog'], ['open-aside']])(
        'SC-UKV-1885 — окно по кнопке %s внутри popover получает набор части',
        (anchor: string): void => {
            const fixture: ComponentFixture<IconSetWindowsHostComponent> = setup();
            press(fixture, '[qa-dataid="origin"]');

            press(fixture, `[qa-dataid="${anchor}"]`);

            expect(windows()).toEqual([{ href: BRAND, pane: 'brand' }]);
        }
    );

    it.each<[string, string | null | undefined, { href: string; pane: string | null }]>([
        ['без своего набора берёт набор части из injector', undefined, { href: BRAND, pane: 'brand' }],
        ['с iconSet берёт названный набор', 'kit', { href: '#rt-icon-close', pane: 'kit' }],
        ['с iconSet null не берёт набор части', null, { href: '#rt-icon-close', pane: null }],
        ['с пустым iconSet берёт набор части из injector', '', { href: BRAND, pane: 'brand' }],
        ['с незнакомым iconSet берёт набор kit', 'brnd', { href: '#rt-icon-close', pane: 'kit' }],
    ])(
        'SC-UKV-1891 — aside вне фокуса части %s',
        (_title: string, iconSet: string | null | undefined, expected: { href: string; pane: string | null }): void => {
            jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
            const declared: Provider = provideRtIcons({ sets: [{ name: 'brand', url: '/brand' }] }) as unknown as Provider;
            const fixture: ComponentFixture<IconSetOwnerHostComponent> = createRtFixture(
                IconSetOwnerHostComponent,
                {},
                { providers: [declared] }
            );

            fixture.componentInstance.owner().open(iconSet);
            fixture.detectChanges();
            TestBed.inject(ApplicationRef).tick();

            expect(windows()).toEqual([expected]);
        }
    );

    it('SC-UKV-1893 — панель, открытая из effect, на смене набора части не открывается снова', (): void => {
        const declared: Provider = provideRtIcons({ sets: [{ name: 'brand', url: '/brand' }] }) as unknown as Provider;
        const fixture: ComponentFixture<IconSetEffectHostComponent> = createRtFixture(
            IconSetEffectHostComponent,
            {},
            { providers: [declared] }
        );
        const tick: () => void = (): void => {
            fixture.detectChanges();
            TestBed.inject(ApplicationRef).tick();
        };
        fixture.componentInstance.owner().record.set('1');
        tick();

        fixture.componentInstance.part.set('kit');
        tick();

        expect(windows()).toEqual([{ href: BRAND, pane: 'brand' }]);
    });

    it('SC-UKV-1894 — меню вкладки у точки нажатия берёт набор части, где стоят вкладки', (): void => {
        const declared: Provider = provideRtIcons({ sets: [{ name: 'brand', url: '/brand' }] }) as unknown as Provider;
        const fixture: ComponentFixture<IconSetTabsHostComponent> = createRtFixture(
            IconSetTabsHostComponent,
            {},
            { providers: [declared] }
        );
        const tick: () => void = (): void => {
            fixture.detectChanges();
            TestBed.inject(ApplicationRef).tick();
            fixture.detectChanges();
        };
        tick();

        (fixture.nativeElement as HTMLElement)
            .querySelector('[data-tabid="a"]')
            ?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 30 }));
        tick();

        const pane: Element | null = document.querySelector('[qa-dataid="tab-item"]')?.closest('.cdk-overlay-pane') ?? null;
        expect(pane?.getAttribute('data-rt-icon-set')).toBe('brand');
    });

    it('SC-UKV-1886 — диалог из диалога получает тот же набор, а окно, открытое вне части, — набор приложения', (): void => {
        const fixture: ComponentFixture<IconSetWindowsHostComponent> = setup();
        press(fixture, '[qa-dataid="outside"]');

        expect(windows()).toEqual([{ href: '#rt-icon-close', pane: null }]);

        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.replaceChildren());
        press(fixture, '[qa-dataid="origin"]');
        press(fixture, '[qa-dataid="open-dialog"]');
        press(fixture, 'rt-icon-set-window [qa-dataid="open-next"]');

        expect(windows().filter((it: { pane: string | null }): boolean => it.pane === 'brand')).toEqual([
            { href: BRAND, pane: 'brand' },
            { href: BRAND, pane: 'brand' },
        ]);
    });
});
