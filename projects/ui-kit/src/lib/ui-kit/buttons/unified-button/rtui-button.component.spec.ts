import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { By } from '@angular/platform-browser';

import { IRtUiConfig, RT_UI_CONFIG } from '../../config';
import { RtuiButtonComponent } from './rtui-button.component';

@Component({
    template: '<rtui-button type="pill">Projected label</rtui-button>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiButtonComponent],
})
class ProjectionHostComponent {}

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

    function matButton(fixture: ComponentFixture<RtuiButtonComponent>): MatButton | undefined {
        return fixture.debugElement.query(By.directive(MatButton))?.componentInstance as MatButton | undefined;
    }

    it('defaults to the custom design, md size and full radius without any config', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup();
        const classes: DOMTokenList = buttonClasses(fixture);

        expect(matButton(fixture)).toBeUndefined();
        expect(classes.contains('rtui-button--design-custom')).toBe(true);
        expect(classes.contains('rtui-button--size-md')).toBe(true);
        expect(classes.contains('rtui-button--radius-full')).toBe(true);
    });

    it('renders a native Material button with the mapped appearance under a component-level material design', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            components: { button: { design: 'material', appearance: 'text' } },
        });

        expect(buttonClasses(fixture).contains('rtui-button-material')).toBe(true);
        expect(matButton(fixture)?.appearance).toBe('text');
    });

    it('maps the appearance onto the native Material appearances (solid -> filled by default)', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({ global: { design: 'material' } });

        expect(matButton(fixture)?.appearance).toBe('filled');

        fixture.componentRef.setInput('appearance', 'outline');
        fixture.detectChanges();
        expect(matButton(fixture)?.appearance).toBe('outlined');

        fixture.componentRef.setInput('appearance', 'light');
        fixture.detectChanges();
        expect(matButton(fixture)?.appearance).toBe('tonal');
    });

    it('falls back to the global design when the button entry does not set one', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({ global: { design: 'material' } });

        expect(matButton(fixture)).toBeDefined();
        expect(buttonClasses(fixture).contains('rtui-button-material')).toBe(true);
    });

    it('prefers the component entry over the global default', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            global: { design: 'material' },
            components: { button: { design: 'custom' } },
        });

        expect(matButton(fixture)).toBeUndefined();
        expect(buttonClasses(fixture).contains('rtui-button--design-custom')).toBe(true);
    });

    it('lets the instance input override every config level', () => {
        const fixture: ComponentFixture<RtuiButtonComponent> = setup({
            global: { design: 'material' },
            components: { button: { design: 'material' } },
        });
        fixture.componentRef.setInput('design', 'custom');
        fixture.detectChanges();

        expect(matButton(fixture)).toBeUndefined();
        expect(buttonClasses(fixture).contains('rtui-button--design-custom')).toBe(true);
    });

    it('renders projected content in both the custom and the material design branches', () => {
        for (const design of ['custom', 'material'] as const) {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [ProjectionHostComponent],
                providers: [{ provide: RT_UI_CONFIG, useValue: { global: { design } } }],
            });
            const fixture: ComponentFixture<ProjectionHostComponent> = TestBed.createComponent(ProjectionHostComponent);
            fixture.detectChanges();

            const button: HTMLButtonElement = (fixture.nativeElement as HTMLElement).querySelector('button')!;
            expect(button.textContent).toContain('Projected label');
        }
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
