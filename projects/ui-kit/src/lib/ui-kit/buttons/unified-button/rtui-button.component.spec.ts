import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IRtUiConfig, RT_UI_CONFIG } from '../../config';
import { RtuiButtonComponent } from './rtui-button.component';

describe('RtuiButtonComponent', () => {
    function setup(config?: IRtUiConfig.Config): ComponentFixture<RtuiButtonComponent> {
        TestBed.configureTestingModule({
            imports: [RtuiButtonComponent],
            providers: [{ provide: RT_UI_CONFIG, useValue: config ?? {} }],
        });

        const fixture: ComponentFixture<RtuiButtonComponent> = TestBed.createComponent(RtuiButtonComponent);
        fixture.componentRef.setInput('type', 'pill');
        fixture.detectChanges();

        return fixture;
    }

    function buttonClasses(fixture: ComponentFixture<RtuiButtonComponent>): DOMTokenList {
        return (fixture.nativeElement as HTMLElement).querySelector('button')!.classList;
    }

    it('defaults to the custom design, md size and full radius without any config', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup();
        const classes: DOMTokenList = buttonClasses(fixture);

        expect(classes.contains('rtui-button--design-custom')).toBe(true);
        expect(classes.contains('rtui-button--size-md')).toBe(true);
        expect(classes.contains('rtui-button--radius-full')).toBe(true);
    });

    it('applies component-level config defaults (design, size, appearance)', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            components: { button: { design: 'material', size: 'lg', appearance: 'text' } },
        });
        const classes: DOMTokenList = buttonClasses(fixture);

        expect(classes.contains('rtui-button--design-material')).toBe(true);
        expect(classes.contains('rtui-button--size-lg')).toBe(true);
        expect(classes.contains('rtui-button--appearance-text')).toBe(true);
    });

    it('falls back to the global design when the button entry does not set one', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({ global: { design: 'material' } });

        expect(buttonClasses(fixture).contains('rtui-button--design-material')).toBe(true);
    });

    it('prefers the component entry over the global default', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            global: { design: 'material' },
            components: { button: { design: 'custom' } },
        });

        expect(buttonClasses(fixture).contains('rtui-button--design-custom')).toBe(true);
    });

    it('lets the instance input override every config level', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            global: { design: 'material' },
            components: { button: { design: 'material' } },
        });
        fixture.componentRef.setInput('design', 'custom');
        fixture.detectChanges();

        expect(buttonClasses(fixture).contains('rtui-button--design-custom')).toBe(true);
    });

    it('lets explicit size/radius inputs override the config defaults', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            components: { button: { size: 'lg', radius: 'none' } },
        });
        fixture.componentRef.setInput('size', 'xs');
        fixture.componentRef.setInput('radius', 'sm');
        fixture.detectChanges();

        const classes: DOMTokenList = buttonClasses(fixture);
        expect(classes.contains('rtui-button--size-xs')).toBe(true);
        expect(classes.contains('rtui-button--radius-sm')).toBe(true);
    });
});
