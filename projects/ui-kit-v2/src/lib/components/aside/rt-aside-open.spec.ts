import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';

@Component({
    selector: 'rt-aside-open-content',
    template: `
        <rt-aside>
            <p>Содержимое</p>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent],
})
class OwnedContentComponent {}

@Component({
    selector: 'rt-aside-heading-slot-host',
    template: `
        <rt-aside-header title="Заказы" subtitle="Сегодня">
            <span asideHeadingContent qa-dataid="heading-extra">Обновлено в 12:00</span>
        </rt-aside-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideHeaderComponent],
})
class HeadingSlotHostComponent {}

function overlayPanel(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

describe('Колонка заголовка и открытие панели', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
    });

    function service(): RtAsideService {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        return TestBed.inject(RtAsideService);
    }

    function createdConfigs(): OverlayConfig[] {
        const configs: OverlayConfig[] = [];
        const overlay: Overlay = TestBed.inject(Overlay);
        const create: (config?: OverlayConfig) => OverlayRef = overlay.create.bind(overlay);
        jest.spyOn(overlay, 'create').mockImplementation((config?: OverlayConfig): OverlayRef => {
            configs.push(config ?? {});
            return create(config);
        });
        return configs;
    }

    it('SC-UKV-717 — содержимое слота колонки стоит в колонке заголовка под подписью', (): void => {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        const fixture: ComponentFixture<HeadingSlotHostComponent> = TestBed.createComponent(HeadingSlotHostComponent);
        fixture.detectChanges();
        const root: HTMLElement = fixture.nativeElement as HTMLElement;
        const extra: HTMLElement | null = root.querySelector('[qa-dataid="heading-extra"]');
        const subtitle: HTMLElement | null = root.querySelector('[qa-dataid="aside-subtitle"]');

        expect(extra?.parentElement?.classList.contains('rt-aside-header__heading')).toBe(true);
        expect(subtitle?.compareDocumentPosition(extra as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('SC-UKV-717 — без содержимого колонка заголовка держит только заголовок', (): void => {
        const fixture: ComponentFixture<RtAsideHeaderComponent> = createRtFixture(RtAsideHeaderComponent, { title: 'Заказы' });
        const heading: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector('.rt-aside-header__heading');

        expect(heading?.children.length).toBe(1);
    });

    it('SC-UKV-718 — панель, снятая до первого кадра, не получает класс открытия', (): void => {
        const frames: FrameRequestCallback[] = [];
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            frames.push(callback);
            return frames.length;
        });
        const aside: RtAsideService = service();
        const overlay: Overlay = TestBed.inject(Overlay);
        const refs: OverlayRef[] = [];
        const create: (config?: OverlayConfig) => OverlayRef = overlay.create.bind(overlay);
        jest.spyOn(overlay, 'create').mockImplementation((config?: OverlayConfig): OverlayRef => {
            const ref: OverlayRef = create(config);
            refs.push(ref);
            return ref;
        });

        aside.open(OwnedContentComponent);
        const pane: HTMLElement = refs[0].overlayElement;
        refs[0].dispose();
        frames.forEach((frame: FrameRequestCallback): void => frame(0));

        expect(pane.classList.contains('rt-aside-overlay--open')).toBe(false);
        expect(pane.classList.contains('rt-aside-overlay--entering')).toBe(true);
    });

    it('SC-UKV-718 — открытая панель на первом кадре получает класс открытия', (): void => {
        const frames: FrameRequestCallback[] = [];
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            frames.push(callback);
            return frames.length;
        });

        service().open(OwnedContentComponent);
        frames.forEach((frame: FrameRequestCallback): void => frame(0));

        expect(overlayPanel()?.classList.contains('rt-aside-overlay--open')).toBe(true);
    });

    it('SC-UKV-719 — по умолчанию переход по адресу снимает панель, а настройка оставляет её', (): void => {
        const aside: RtAsideService = service();
        const configs: OverlayConfig[] = createdConfigs();

        aside.open(OwnedContentComponent);
        aside.open(OwnedContentComponent, { disposeOnNavigation: false });

        expect(configs.map((config: OverlayConfig): boolean | undefined => config.disposeOnNavigation)).toEqual([true, false]);
    });
});
