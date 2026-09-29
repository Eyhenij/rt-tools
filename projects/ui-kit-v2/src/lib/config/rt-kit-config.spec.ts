import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { classesOf, createRtFixture, provideRtKitTesting } from '../../testing/rt-kit-testing';
import { RtAsideRef } from '../components/aside/rt-aside-ref';
import { RtAsideComponent } from '../components/aside/rt-aside.component';
import { RtAsideService } from '../components/aside/rt-aside.service';
import { RT_ASIDE_DATA } from '../components/aside/rt-aside.tokens';
import { RtButtonDirective } from '../components/button/rt-button.directive';
import { IRtKitConfig } from './rt-kit-config.model';
import { provideRtKit } from './rt-kit-config.providers';

/** Кнопка, о виде которой разметка молчит: умолчание должно прийти из настроек. */
@Component({
    selector: 'rt-config-silent-host',
    template: `
        <button rtButton label="Сохранить"></button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtButtonDirective],
})
class SilentHostComponent {}

/** Кнопка, о виде которой разметка говорит прямо: сказанное перебивает настройки. */
@Component({
    selector: 'rt-config-spoken-host',
    template: `
        <button rtButton label="Сохранить" size="md" appearance="filled"></button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtButtonDirective],
})
class SpokenHostComponent {}

/** Содержимое шторы: службе нужно что-то поднимать в оверлее. */
@Component({
    selector: 'rt-config-aside-content',
    template: `
        <rt-aside ariaLabel="Карточка">
            <p>{{ data }}</p>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent],
})
class AsideContentComponent {
    public readonly data: string = inject(RT_ASIDE_DATA) as string;
}

/** Модификаторы блока кнопки: рядом с ними на хосте законно стоят классы директив-хозяев. */
function modifiersOf(fixture: ComponentFixture<unknown>): string[] {
    const button: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLElement;

    return classesOf(button).filter((name: string): boolean => name.startsWith('rt-button--'));
}

function overlayPanel(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

function asideService(config?: IRtKitConfig.Config): RtAsideService {
    TestBed.configureTestingModule({
        providers: [...provideRtKitTesting(), ...(config === undefined ? [] : [provideRtKit(config)])],
    });

    return TestBed.inject(RtAsideService);
}

/** Штора живёт в оверлее — отрисовку гоним вручную. */
function render(): void {
    TestBed.inject(ApplicationRef).tick();
}

describe('настройки кита', (): void => {
    // Возврат к настоящим таймерам — в afterEach: закрытие шторы отложено на 300 мс, и чужие
    // поддельные таймеры повесили бы следующий тест до таймаута.
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-330 — кит без единой настройки рисует своими умолчаниями', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = createRtFixture(SilentHostComponent);

        // Умолчания кита не дают ни одного модификатора: средний размер, заливка, без скругления.
        expect(modifiersOf(fixture)).toEqual([]);
    });

    it('SC-UKV-330 — штора без настроек закрывается по Escape', (): void => {
        jest.useFakeTimers();
        asideService().open(AsideContentComponent, { data: '…' });
        render();

        overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        jest.advanceTimersByTime(300);

        expect(overlayPanel()).toBeNull();
    });

    it('SC-UKV-331 — вход на месте перебивает умолчание узла', (): void => {
        const fixture: ComponentFixture<SpokenHostComponent> = createRtFixture(
            SpokenHostComponent,
            {},
            { providers: [provideRtKit({ components: { button: { size: 'lg', appearance: 'outlined' } } })] }
        );

        expect(modifiersOf(fixture)).toEqual([]);
    });

    it('SC-UKV-332 — умолчание узла доходит до кнопки, о которой разметка молчит', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = createRtFixture(
            SilentHostComponent,
            {},
            { providers: [provideRtKit({ components: { button: { appearance: 'outlined' } } })] }
        );

        expect(modifiersOf(fixture)).toEqual(['rt-button--outlined']);
    });

    it('SC-UKV-333 — частично заданный объект оставляет остальное умолчаниям кита', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = createRtFixture(
            SilentHostComponent,
            {},
            { providers: [provideRtKit({ components: { button: { size: 'lg' } } })] }
        );

        // Размер пришёл из настроек, вид и скруглённость остались китовыми.
        expect(modifiersOf(fixture)).toEqual(['rt-button--lg']);
    });

    it('SC-UKV-333 — штора, о которой настройки молчат, ведёт себя по-китовому', (): void => {
        jest.useFakeTimers();
        asideService({ components: { button: { size: 'lg' } } }).open(AsideContentComponent, { data: '…' });
        render();

        overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        jest.advanceTimersByTime(300);

        expect(overlayPanel()).toBeNull();
    });

    it('SC-UKV-334 — подмена настроек после первой прорисовки не перекрашивает нарисованное', (): void => {
        const config: IRtKitConfig.Config = { components: { button: { appearance: 'outlined' } } };
        const fixture: ComponentFixture<SilentHostComponent> = createRtFixture(
            SilentHostComponent,
            {},
            { providers: [provideRtKit(config)] }
        );

        // Настройки — снимок старта: узел прочитал их при создании и больше не читает.
        (config.components as IRtKitConfig.Components).button = { appearance: 'text', size: 'lg' };
        fixture.detectChanges();

        expect(modifiersOf(fixture)).toEqual(['rt-button--outlined']);
    });

    it('SC-UKV-335 — штора берёт клавишу закрытия из настроек', (): void => {
        jest.useFakeTimers();
        const service: RtAsideService = asideService({ components: { aside: { closeOnEscape: false } } });
        const ref: RtAsideRef = service.open(AsideContentComponent, { data: '…' });
        const closed: unknown[] = [];
        ref.afterClosed().subscribe((result: unknown): void => {
            closed.push(result);
        });
        render();

        overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        jest.advanceTimersByTime(300);

        // Панель уходит из DOM через 300 мс, поэтому её наличие сразу после нажатия не доказывает
        // ничего: проверяем, что закрытия не случилось вовсе, и что панель цела после задержки.
        expect(closed).toEqual([]);
        expect(overlayPanel()).not.toBeNull();
    });

    it('SC-UKV-335 — слово на месте вызова перебивает настройку шторы', (): void => {
        jest.useFakeTimers();
        asideService({ components: { aside: { closeOnEscape: false } } }).open(AsideContentComponent, {
            data: '…',
            closeOnEscape: true,
        });
        render();

        overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        jest.advanceTimersByTime(300);

        expect(overlayPanel()).toBeNull();
    });
});
