import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Почта', value: 'mail', description: 'Письма на адрес поддержки' },
    { label: 'Телефон', value: 'phone' },
    { label: 'Чат', value: 'chat' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

type TFixture = ComponentFixture<RtMultiselectComponent<string>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}, chosen: ReadonlyArray<string> = ['phone']): TFixture {
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub() }];
    const fixture: TFixture = createRtFixture(RtMultiselectComponent<string>, { options: OPTIONS, ...inputs }, { providers });
    fixture.componentInstance.writeValue([...chosen]);
    fixture.detectChanges();
    (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();

    return fixture;
}

/** Шторка и её пункты живут в оверлее CDK — ищем их в документе. */
function all(anchor: string): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(`[qa-dataid="${anchor}"]`));
}

function panelClasses(): string[] {
    return Array.from(document.querySelector('[qa-dataid="multiselect-panel"]')?.classList ?? []);
}

describe('Карточки выбора мультиселекта в шторке (вход sheetCards)', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1715 — каждая опция — карточка с флажком кита справа, выбранная отмечена', async (): Promise<void> => {
        const fixture: TFixture = setup();
        // Значение флажку отдаёт ngModel, а он пишет его на следующем шаге очереди.
        await fixture.whenStable();
        fixture.detectChanges();
        TestBed.inject(ApplicationRef).tick();

        expect(panelClasses()).toContain('rt-multiselect__panel--cards');
        const marks: HTMLElement[] = all('multiselect-option-mark');
        expect(marks.length).toBe(3);
        expect(
            marks.map((mark: HTMLElement): string | null | undefined =>
                mark.querySelector('[role="checkbox"]')?.getAttribute('aria-checked')
            )
        ).toEqual(['false', 'true', 'false']);
        // Отметка стоит после подписи: в строке карточки она справа. Прежнего флажка браузера нет.
        expect(all('multiselect-option')[0].lastElementChild?.getAttribute('qa-dataid')).toBe('multiselect-option-mark');
        expect(all('multiselect-option-checkbox')).toEqual([]);
    });

    it('SC-UKV-1713 — «Готово» стоит справа в шапке шторки, в подвале остаются счётчик и сброс', (): void => {
        setup();

        const done: HTMLElement = all('multiselect-sheet-done')[0];
        expect(done.closest('[qa-dataid="bottom-sheet-action"]')).not.toBeNull();
        expect(done.classList).not.toContain('rt-button--outlined');
        expect(done.classList).not.toContain('rt-button--text');
        const footer: HTMLElement = all('multiselect-sheet-footer')[0];
        expect(footer.querySelector('[qa-dataid="multiselect-sheet-count"]')).not.toBeNull();
        expect(footer.querySelector('[qa-dataid="multiselect-sheet-reset"]')).not.toBeNull();
        expect(footer.querySelector('[qa-dataid="multiselect-sheet-done"]')).toBeNull();
    });

    it('SC-UKV-1716 — пояснение опции стоит второй строкой карточки', (): void => {
        setup();

        expect(all('multiselect-option-description').map((node: HTMLElement): string => node.textContent?.trim() ?? '')).toEqual([
            'Письма на адрес поддержки',
        ]);
    });

    it('нажатие на карточку отмечает опцию и оставляет шторку открытой', (): void => {
        const fixture: TFixture = setup();

        all('multiselect-option')[0].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value()).toEqual(['phone', 'mail']);
        expect(document.querySelector('.rt-popover-sheet .rt-bottom-sheet--open')).not.toBeNull();
    });

    it('вид переключателей в шторке — карточки с переключателем справа, флажка нет', (): void => {
        setup({ look: 'toggles' });

        expect(panelClasses()).toContain('rt-multiselect__panel--cards');
        expect(all('multiselect-option-switch').length).toBe(3);
        expect(all('multiselect-option-mark')).toEqual([]);
    });

    it('SC-UKV-1717 — sheetCards=false возвращает в шторку строки, какими список стоит у поля', (): void => {
        setup({ sheetCards: false });

        expect(panelClasses()).not.toContain('rt-multiselect__panel--cards');
        expect(all('multiselect-option-mark')).toEqual([]);
        expect(all('multiselect-option-description')).toEqual([]);
        expect(all('multiselect-option-checkbox').length).toBe(3);
    });
});
