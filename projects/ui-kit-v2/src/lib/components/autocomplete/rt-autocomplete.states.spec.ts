import { ChangeDetectionStrategy, Component, viewChild, Signal, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtAutocompleteEmptyDirective, RtAutocompleteErrorDirective } from './rt-autocomplete-states.directive';
import { RtAutocompleteComponent } from './rt-autocomplete.component';

/** Панель подсказок живёт в оверлее CDK — ищем её узлы в документе. */
function inPanel(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

@Component({
    selector: 'rt-test-autocomplete-states-host',
    template: `
        <rt-autocomplete
            [suggestions]="items()"
            [loading]="loading()"
            [error]="error()"
            [errorDescription]="hint()"
            [emptyTemplate]="byInput() ? inputEmpty : null"
            (retry)="retryCount = retryCount + 1">
            @if (withSlots()) {
                <ng-template rtAutocompleteEmpty let-query>
                    <span qa-dataid="own-empty">нет «{{ query }}»</span>
                </ng-template>
                <ng-template rtAutocompleteError let-message let-retry="retry">
                    <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
                </ng-template>
            }
        </rt-autocomplete>
        <ng-template #inputEmpty>
            <span qa-dataid="input-empty">по входу</span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAutocompleteComponent, RtAutocompleteEmptyDirective, RtAutocompleteErrorDirective],
})
class StatesHostComponent {
    public readonly autocomplete: Signal<RtAutocompleteComponent<string>> = viewChild.required(RtAutocompleteComponent);
    public readonly items: WritableSignal<ReadonlyArray<string>> = signal<ReadonlyArray<string>>([]);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public readonly hint: WritableSignal<string> = signal<string>('');
    public readonly byInput: WritableSignal<boolean> = signal<boolean>(false);
    public readonly withSlots: WritableSignal<boolean> = signal<boolean>(false);
    public retryCount: number = 0;
}

async function open(patch: (host: StatesHostComponent) => void): Promise<ComponentFixture<StatesHostComponent>> {
    const fixture: ComponentFixture<StatesHostComponent> = createRtFixture(StatesHostComponent, {}, { skipInitialDetect: true });

    patch(fixture.componentInstance);
    fixture.detectChanges();
    const input: HTMLInputElement = qa(fixture, 'autocomplete-input')?.nativeElement as HTMLInputElement;
    input.value = 'Мос';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

describe('RtAutocompleteComponent — ошибка загрузки и свои виды', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1287 — на ошибке в панели вид ошибки вместо вариантов', async (): Promise<void> => {
        await open((host: StatesHostComponent): void => {
            host.items.set(['Москва']);
            host.error.set('Нет сети');
        });

        expect(inPanel('autocomplete-error')?.textContent).toContain('Нет сети');
        expect(inPanel('autocomplete-option')).toBeNull();
    });

    it('SC-UKV-1288 — «Повторить» поднимает retry один раз', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await open((host: StatesHostComponent): void => host.error.set('Нет сети'));

        (inPanel('autocomplete-retry') as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
        expect(inPanel('autocomplete-error')).not.toBeNull();
    });

    it('SC-UKV-1287 — на ошибке стрелки и Enter ничего не выбирают', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await open((host: StatesHostComponent): void => {
            host.items.set(['Москва', 'Мосальск']);
            host.error.set('Нет сети');
        });
        const chosen: Array<string> = [];
        fixture.componentInstance.autocomplete().itemSelect.subscribe((item: string): void => {
            chosen.push(item);
        });
        const input: HTMLInputElement = qa(fixture, 'autocomplete-input')?.nativeElement as HTMLInputElement;

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();

        expect(chosen).toEqual([]);
        expect(inPanel('autocomplete-error')).not.toBeNull();
    });

    it('SC-UKV-1289 — свой вид пустого и свой вид ошибки встают в панель', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await open((host: StatesHostComponent): void => host.withSlots.set(true));

        expect(inPanel('own-empty')?.textContent).toContain('нет «Мос»');

        fixture.componentInstance.error.set('Нет сети');
        fixture.detectChanges();
        (inPanel('own-error') as HTMLButtonElement).click();

        expect(inPanel('own-error')?.textContent).toContain('Нет сети');
        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1290 — вход emptyTemplate работает, директива сильнее', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await open((host: StatesHostComponent): void => host.byInput.set(true));

        expect(inPanel('input-empty')).not.toBeNull();

        fixture.componentInstance.withSlots.set(true);
        fixture.detectChanges();

        expect(inPanel('own-empty')).not.toBeNull();
        expect(inPanel('input-empty')).toBeNull();
    });

    it('SC-UKV-1293 — ошибка важнее загрузки: спиннера нет', async (): Promise<void> => {
        await open((host: StatesHostComponent): void => {
            host.loading.set(true);
            host.error.set('Нет сети');
        });

        expect(inPanel('autocomplete-error')).not.toBeNull();
        expect(inPanel('autocomplete-loading')).toBeNull();
    });

    it('SC-UKV-1294 — пустая ошибка берёт заголовок кита, описание встаёт подсказкой', async (): Promise<void> => {
        await open((host: StatesHostComponent): void => {
            host.error.set('');
            host.hint.set('Проверьте сеть');
        });

        const text: string = inPanel('autocomplete-error')?.textContent ?? '';

        expect(text.trim().length).toBeGreaterThan('Проверьте сеть'.length);
        expect(text).toContain('Проверьте сеть');
    });
});
