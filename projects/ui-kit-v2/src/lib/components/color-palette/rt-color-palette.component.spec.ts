import { ChangeDetectionStrategy, Component, DebugElement, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtColorPaletteComponent } from './rt-color-palette.component';

const COLORS: readonly string[] = ['#ff0000', '#00ff00', '#0000ff'];

@Component({
    selector: 'rt-color-palette-host',
    template: '<rt-color-palette [formControl]="control" [colors]="colors()" [readonly]="readonly()" [channels]="channels()" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtColorPaletteComponent, ReactiveFormsModule],
})
class ColorPaletteHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>(null);
    public readonly colors: WritableSignal<readonly string[]> = signal<readonly string[]>(COLORS);
    public readonly readonly: WritableSignal<boolean> = signal<boolean>(false);
    public readonly channels: WritableSignal<boolean> = signal<boolean>(false);
}

function host(): ComponentFixture<ColorPaletteHostComponent> {
    const fixture: ComponentFixture<ColorPaletteHostComponent> = TestBed.createComponent(ColorPaletteHostComponent);
    fixture.detectChanges();
    return fixture;
}

function swatches<T>(fixture: ComponentFixture<T>): HTMLButtonElement[] {
    return qaAll(fixture, 'color-palette-swatch').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

function keydown(target: HTMLElement, key: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

/** Панель своего цвета живёт в оверлее CDK — её ищут в документе. */
function picker(): HTMLElement | null {
    return document.querySelector('rt-color-picker');
}

function inPicker(id: string): HTMLElement {
    return document.querySelector(`[qa-dataid="${id}"]`) as HTMLElement;
}

function openPicker<T>(fixture: ComponentFixture<T>): void {
    (qa(fixture, 'color-palette-custom')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
}

describe('RtColorPaletteComponent', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.replaceChildren());
    });

    it('SC-UKV-807: форма пишет цвет в любом виде, поле держит шесть цифр строчными', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        const palette: RtColorPaletteComponent = fixture.debugElement.query(By.directive(RtColorPaletteComponent)).componentInstance;

        fixture.componentInstance.control.setValue('#00FF00');
        fixture.detectChanges();
        expect(palette.displayText()).toBe('#00ff00');
        expect(swatches(fixture)[1].getAttribute('aria-checked')).toBe('true');

        fixture.componentInstance.control.setValue('red');
        fixture.detectChanges();
        expect(palette.displayText()).toBe('');
        expect(swatches(fixture).every((swatch: HTMLButtonElement): boolean => swatch.getAttribute('aria-checked') === 'false')).toBe(true);
    });

    it('SC-UKV-808: без цветов — набор кита, чужое значение — ещё одним образцом', (): void => {
        expect(swatches(createRtFixture(RtColorPaletteComponent, {}))).toHaveLength(18);

        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        expect(swatches(fixture).map((swatch: HTMLButtonElement): string | null => swatch.getAttribute('aria-label'))).toEqual(COLORS);

        fixture.componentInstance.control.setValue('#123456');
        fixture.detectChanges();
        expect(swatches(fixture)).toHaveLength(4);
        expect(swatches(fixture)[3].getAttribute('aria-label')).toBe('#123456');
        expect(swatches(fixture)[3].getAttribute('aria-checked')).toBe('true');
    });

    it('SC-UKV-809: нажатие на образец выбирает цвет и касается поля', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();

        swatches(fixture)[2].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBe('#0000ff');
        expect(fixture.componentInstance.control.touched).toBe(true);
        expect(swatches(fixture)[2].getAttribute('aria-checked')).toBe('true');
        expect(swatches(fixture)[2].classList).toContain('rt-color-palette__swatch--checked');
    });

    it('SC-UKV-810: стрелки, Home и End двигают выбор и фокус, в порядке Tab один образец', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        const tabbable: () => number[] = (): number[] =>
            swatches(fixture)
                .map((swatch: HTMLButtonElement, index: number): number => (swatch.getAttribute('tabindex') === '0' ? index : -1))
                .filter((index: number): boolean => index >= 0);

        expect(tabbable()).toEqual([0]);

        keydown(swatches(fixture)[0], 'ArrowRight');
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#ff0000');

        keydown(swatches(fixture)[0], 'ArrowRight');
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#00ff00');
        expect(document.activeElement).toBe(swatches(fixture)[1]);
        expect(tabbable()).toEqual([1]);

        keydown(swatches(fixture)[1], 'End');
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#0000ff');

        keydown(swatches(fixture)[2], 'ArrowDown');
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#ff0000');

        keydown(swatches(fixture)[0], 'ArrowUp');
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#0000ff');

        keydown(swatches(fixture)[2], 'Home');
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#ff0000');
    });

    it('SC-UKV-811: только для чтения рисует один образец и нечего нажимать', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        fixture.componentInstance.readonly.set(true);
        fixture.componentInstance.control.setValue('#00ff00');
        fixture.detectChanges();

        const one: HTMLElement = qa(fixture, 'color-palette-readonly')?.nativeElement as HTMLElement;
        expect(one.getAttribute('aria-label')).toBe('#00ff00');
        expect(swatches(fixture)).toHaveLength(0);
        expect(qa(fixture, 'color-palette-custom')).toBeNull();

        fixture.componentInstance.control.setValue(null);
        fixture.detectChanges();
        expect(qa(fixture, 'color-palette-readonly')?.nativeElement.classList).toContain('rt-color-palette__swatch--empty');
    });

    it('SC-UKV-812: отключённая палитра не берёт ни нажатия, ни клавиши', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        fixture.componentInstance.control.setValue('#ff0000');
        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        swatches(fixture)[1].click();
        keydown(swatches(fixture)[0], 'ArrowRight');
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBe('#ff0000');
        expect(swatches(fixture).every((swatch: HTMLButtonElement): boolean => swatch.disabled)).toBe(true);
        expect((qa(fixture, 'color-palette-custom')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
    });

    it('SC-UKV-813: свой цвет пишет только «Применить», «Отмена» поле не трогает', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        fixture.componentInstance.control.setValue('#ff0000');
        fixture.detectChanges();

        openPicker(fixture);
        expect(picker()).not.toBeNull();
        expect((inPicker('color-picker-apply') as HTMLButtonElement).disabled).toBe(true);

        keydown(inPicker('color-picker-hue'), 'ArrowRight');
        fixture.detectChanges();
        expect((inPicker('color-picker-apply') as HTMLButtonElement).disabled).toBe(false);

        inPicker('color-picker-cancel').click();
        fixture.detectChanges();
        expect(picker()).toBeNull();
        expect(fixture.componentInstance.control.value).toBe('#ff0000');

        openPicker(fixture);
        keydown(inPicker('color-picker-hue'), 'ArrowRight');
        fixture.detectChanges();
        inPicker('color-picker-apply').click();
        fixture.detectChanges();

        expect(picker()).toBeNull();
        expect(fixture.componentInstance.control.value).toBe('#ff1900');
        expect(qa(fixture, 'color-palette-custom')?.nativeElement.textContent.trim()).toBe('Edit custom colour');
    });

    it('SC-UKV-814: площадь двигает насыщенность и яркость, полная запись становится цветом', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        fixture.componentInstance.control.setValue('#808080');
        fixture.detectChanges();
        openPicker(fixture);

        keydown(inPicker('color-picker-area'), 'ArrowRight');
        fixture.detectChanges();
        expect(inPicker('color-picker-area').getAttribute('aria-valuenow')).toBe('5');

        const field: HTMLInputElement = inPicker('color-picker-hex').querySelector('input') as HTMLInputElement;
        field.value = '#12';
        field.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inPicker('color-picker-area').getAttribute('aria-valuenow')).toBe('5');

        field.value = '#00ff00';
        field.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(inPicker('color-picker-area').getAttribute('aria-valuenow')).toBe('100');
        expect(inPicker('color-picker-hue').getAttribute('aria-valuenow')).toBe('120');
    });

    it('SC-UKV-847: поля каналов показывают цвет и меняют свой канал, пока значение в пределах 0–255', (): void => {
        const fixture: ComponentFixture<ColorPaletteHostComponent> = host();
        fixture.componentInstance.control.setValue('#ff0000');
        fixture.detectChanges();

        openPicker(fixture);
        // Сперва видно, что панель открыта, и только потом — что полей каналов в ней нет
        expect(picker()).not.toBeNull();
        expect(document.querySelectorAll('[qa-dataid="color-picker-channel"]')).toHaveLength(0);
        inPicker('color-picker-cancel').click();
        fixture.detectChanges();

        fixture.componentInstance.channels.set(true);
        fixture.detectChanges();
        openPicker(fixture);

        const fields: HTMLInputElement[] = [...document.querySelectorAll('[qa-dataid="color-picker-channel"] input')].map(
            (node: Element): HTMLInputElement => node as HTMLInputElement
        );
        const hex: HTMLInputElement = inPicker('color-picker-hex').querySelector('input') as HTMLInputElement;

        expect(fields.map((field: HTMLInputElement): string => field.value)).toEqual(['255', '0', '0']);
        expect(fields.map((field: HTMLInputElement): string | null => field.getAttribute('aria-label'))).toEqual([
            'Red, 0 to 255',
            'Green, 0 to 255',
            'Blue, 0 to 255',
        ]);

        fields[1].value = '300';
        fields[1].dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(hex.value).toBe('#ff0000');

        fields[1].value = '255';
        fields[1].dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(hex.value).toBe('#ffff00');

        inPicker('color-picker-apply').click();
        fixture.detectChanges();
        expect(fixture.componentInstance.control.value).toBe('#ffff00');
    });
});
