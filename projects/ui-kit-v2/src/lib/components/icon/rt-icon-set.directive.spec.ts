import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformService } from '@rt-tools/core';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RT_ICON_SET_ATTRIBUTE } from '../../util/material-preset';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtIconSetDirective } from './rt-icon-set.directive';
import { RtIconSetService } from './rt-icon-set.service';
import { RT_ICON_SPRITE_ID } from './rt-icon.const';
import { RtIconComponent } from './rt-icon.component';
import { IRtIcon } from './rt-icon.model';
import { provideRtIcons } from './rt-icon.providers';

const SVG: string = '<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>';

/** Значки и кнопки: у всего приложения, под признаком material и в части со своим набором. */
@Component({
    selector: 'rt-icon-set-host',
    template: `
        <rt-icon qa-dataid="app" [name]="name()" />
        <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
        <button rtButton qa-dataid="button" label="Закрыть" icon="close" [loading]="loading()"></button>
        <div data-preset="material"><rt-icon qa-dataid="sign" name="close" /></div>
        <section qa-dataid="section" [rtIconSet]="part()">
            <rt-icon qa-dataid="part" name="close" />
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton qa-dataid="part-button" label="Закрыть" icon="close"></button>
            <div rtIconSet=""><rt-icon qa-dataid="inner" name="close" /></div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtButtonDirective, RtIconComponent, RtIconSetDirective],
})
class IconSetHostComponent {
    public readonly name: WritableSignal<IRtIcon.Name> = signal<IRtIcon.Name>('close');
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly part: WritableSignal<string> = signal<string>('material');
}

interface IHarness {
    readonly fixture: ComponentFixture<IconSetHostComponent>;
    readonly http: HttpTestingController;
    readonly sets: RtIconSetService;
    /** Ссылка значка или кнопки под якорем. */
    href(anchor: string): string | null;
    /** Отдаёт рисунок по адресу и перерисовывает страницу. */
    serve(url: string): void;
    settle(): void;
}

function setup(providers: Provider[] = []): IHarness {
    const declared: Provider = provideRtIcons({
        sets: [
            { name: 'brand', url: '/brand' },
            { name: 'other', url: '/other' },
        ],
    }) as unknown as Provider;
    const fixture: ComponentFixture<IconSetHostComponent> = createRtFixture(
        IconSetHostComponent,
        {},
        { providers: [declared, ...providers] }
    );
    const http: HttpTestingController = TestBed.inject(HttpTestingController);
    const settle: () => void = (): void => {
        fixture.detectChanges();
        TestBed.inject(ApplicationRef).tick();
    };
    settle();

    return {
        fixture,
        http,
        settle,
        sets: TestBed.inject(RtIconSetService),
        href: (anchor: string): string | null => {
            const node: Element | null = (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${anchor}"]`);
            return node?.querySelector('use')?.getAttribute('href') ?? null;
        },
        serve: (url: string): void => {
            http.match(url).forEach((request: TestRequest): void => request.flush(SVG));
            settle();
        },
    };
}

describe('набор значков: смена на ходу', (): void => {
    afterEach((): void => {
        document.getElementById(RT_ICON_SPRITE_ID)?.remove();
    });

    it('SC-UKV-1876 — use() перерисовывает нарисованные значки и кнопки, а null возвращает прежний набор', (): void => {
        const page: IHarness = setup();
        page.serve('/icons/close.svg');
        page.serve('/icons-material/close.svg');

        page.sets.use('brand');
        page.settle();
        page.serve('/brand/close.svg');

        expect(page.href('app')).toBe('#rt-icon-set-brand--close');
        expect(page.href('button')).toBe('#rt-icon-set-brand--close');

        page.sets.use(null);
        page.settle();

        expect(page.href('app')).toBe('#rt-icon-close');
        expect(page.href('button')).toBe('#rt-icon-close');
        expect(page.href('sign')).toBe('#rt-icon-material-close');
    });

    it('SC-UKV-1877 — набор части сильнее use(), а use() сильнее признака material', (): void => {
        const page: IHarness = setup();
        page.serve('/icons/close.svg');
        page.serve('/icons-material/close.svg');

        expect(page.href('part')).toBe('#rt-icon-material-close');
        expect(page.href('part-button')).toBe('#rt-icon-material-close');
        expect(page.href('inner')).toBe('#rt-icon-material-close');

        page.sets.use('kit');
        page.settle();

        expect(page.href('sign')).toBe('#rt-icon-close');
        expect(page.href('part')).toBe('#rt-icon-material-close');
        expect(page.href('part-button')).toBe('#rt-icon-material-close');
        const section: Element | null = (page.fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="section"]');
        expect(section?.getAttribute(RT_ICON_SET_ATTRIBUTE)).toBe('material');

        page.fixture.componentInstance.part.set('brand');
        page.settle();
        page.serve('/brand/close.svg');

        expect(page.href('part')).toBe('#rt-icon-set-brand--close');
        expect(page.href('part-button')).toBe('#rt-icon-set-brand--close');
        expect(page.href('inner')).toBe('#rt-icon-set-brand--close');
        expect(section?.getAttribute('data-rt-icon-set')).toBe('brand');
    });

    it('SC-UKV-1878 — пока новый рисунок не пришёл, виден старый, а два быстрых use() кончаются вторым', (): void => {
        const page: IHarness = setup();
        page.serve('/icons/close.svg');
        page.serve('/icons-material/close.svg');

        page.sets.use('brand');
        page.settle();

        expect(page.href('app')).toBe('#rt-icon-close');
        expect(page.href('button')).toBe('#rt-icon-close');

        page.sets.use('other');
        page.settle();
        page.serve('/other/close.svg');
        page.serve('/brand/close.svg');

        expect(page.href('app')).toBe('#rt-icon-set-other--close');
        expect(page.href('button')).toBe('#rt-icon-set-other--close');
    });

    it('SC-UKV-1878 — незнакомое имя в use() даёт предупреждение и набор kit', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const page: IHarness = setup();

        page.sets.use('gone');

        expect(page.sets.chosen()).toBe('kit');
        expect(warn).toHaveBeenCalledWith('rt-icon: набора «gone» среди объявленных нет, взят набор «kit».');
        warn.mockRestore();
    });

    it('SC-UKV-1883 — новое имя значка старый рисунок не держит', (): void => {
        const page: IHarness = setup();
        page.serve('/icons/close.svg');

        page.fixture.componentInstance.name.set('wallet');
        page.settle();

        expect(page.href('app')).toBe('#rt-icon-wallet');
    });

    it('SC-UKV-1883 — смена набора не трогает загрузчик кнопки', (): void => {
        const page: IHarness = setup();
        page.fixture.componentInstance.loading.set(true);
        page.settle();
        const button: Element | null = (page.fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="button"]');
        const spinner: Element | null = button?.querySelector('.rt-button__spinner') ?? null;

        page.sets.use('brand');
        page.settle();
        page.serve('/brand/close.svg');

        expect(spinner).not.toBeNull();
        expect(button?.querySelector('.rt-button__spinner')).toBe(spinner);
        expect(button?.querySelectorAll('.rt-button__icon')).toHaveLength(0);
    });

    it('SC-UKV-1883 — на сервере ссылка на символ набора стоит сразу', (): void => {
        const page: IHarness = setup([{ provide: PlatformService, useValue: { isPlatformBrowser: false } }]);

        expect(page.href('app')).toBe('#rt-icon-close');
        expect(page.href('part')).toBe('#rt-icon-material-close');
        page.http.verify();
    });
});
