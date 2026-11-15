import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RtCollapsibleTextComponent } from '../lib/components/collapsible-text/rt-collapsible-text.component';
import { RtToggleSwitchComponent } from '../lib/components/toggle-switch/rt-toggle-switch.component';
import { createRtFixture, qa } from '../testing/rt-kit-testing';

/**
 * Плитка настройки нажимается целиком потому, что её запись написана тегом `label`: нажатие по
 * названию браузер передаёт выключателю. Своего обработчика у словаря формы нет, поэтому спека
 * собирает ту же разметку, что пишет потребитель, без связки `for`.
 */
@Component({
    selector: 'rt-form-setting-tile-host',
    template: `
        <div class="rt-form">
            <div class="rt-form__framed-list">
                <label class="rt-form__framed-item">
                    <span class="rt-form__control-item rt-form__control-item--split">
                        <span class="rt-form__label" qa-dataid="setting-tile-title">Название настройки</span>
                        <rt-toggle-switch size="md" />
                    </span>
                    <rt-collapsible-text tone="muted" [clampLines]="2" [paragraphs]="paragraphs" />
                </label>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleSwitchComponent, RtCollapsibleTextComponent],
})
class SettingTileHostComponent {
    public readonly paragraphs: string[] = ['Длинное пояснение настройки, которое не помещается в две строки плитки.'];
}

function checked(fixture: ComponentFixture<SettingTileHostComponent>): string | undefined {
    return qa(fixture, 'toggle-switch-control')?.attributes['aria-checked'] ?? undefined;
}

describe('плитка настройки словаря формы', (): void => {
    it('SC-UKV-1303 — нажатие по названию плитки переключает выключатель', (): void => {
        const fixture: ComponentFixture<SettingTileHostComponent> = createRtFixture(SettingTileHostComponent);

        qa(fixture, 'setting-tile-title')?.nativeElement.click();
        fixture.detectChanges();

        expect(checked(fixture)).toBe('true');
    });

    it('SC-UKV-1303 — нажатие по кнопке сворачивания пояснения выключатель не трогает', (): void => {
        const fixture: ComponentFixture<SettingTileHostComponent> = createRtFixture(SettingTileHostComponent);
        const text: DebugElement = fixture.debugElement.query(By.directive(RtCollapsibleTextComponent));

        // Переполнение замеряется раскладкой, которой в тестовом окружении нет: кнопку показывает
        // раскрытие, как в спеке самого компонента.
        (text.componentInstance as unknown as { toggle(): void }).toggle();
        fixture.detectChanges();
        qa(fixture, 'collapsible-text-toggle')?.nativeElement.click();
        fixture.detectChanges();

        expect(qa(fixture, 'collapsible-text-toggle')).toBeNull();
        expect(checked(fixture)).toBe('false');
    });
});
