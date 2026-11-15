import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtDynamicSelectorPopupComponent } from './popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';
import { RtDynamicSelectorEmptyDirective, RtDynamicSelectorErrorDirective } from './rt-dynamic-selector.directives';
import { RtDynamicSelectorLoadStateDirective } from './rt-dynamic-selector-load-state.directive';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
];

@Component({
    selector: 'rt-test-dynamic-selector-states-host',
    template: `
        <rt-dynamic-selector
            keyExp="id"
            displayExp="name"
            [entities]="entities()"
            [loading]="loading()"
            [localSearch]="localSearch()"
            [error]="error()"
            [formControl]="control"
            (retry)="retryCount = retryCount + 1">
            @if (withSlots()) {
                <ng-template rtDynamicSelectorEmpty let-query>
                    <span qa-dataid="own-empty">пусто «{{ query }}»</span>
                </ng-template>
                <ng-template rtDynamicSelectorError let-message let-retry="retry">
                    <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
                </ng-template>
            }
        </rt-dynamic-selector>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicSelectorComponent, RtDynamicSelectorEmptyDirective, RtDynamicSelectorErrorDirective],
})
class StatesHostComponent {
    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([]);
    public readonly entities: WritableSignal<IPerson[]> = signal<IPerson[]>(PEOPLE);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly localSearch: WritableSignal<boolean> = signal<boolean>(true);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public readonly withSlots: WritableSignal<boolean> = signal<boolean>(false);
    public retryCount: number = 0;
}

type THostFixture = ComponentFixture<StatesHostComponent>;

/** Окно выбора живёт в оверлее CDK — его узлы ищут в документе. */
function inPopup(id: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`rt-dynamic-selector-popup [qa-dataid="${id}"]`);
}

async function settle<T>(fixture: ComponentFixture<T>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

async function openWith(patch: (host: StatesHostComponent) => void): Promise<THostFixture> {
    const fixture: THostFixture = createRtFixture(StatesHostComponent, {}, { providers: [provideRouter([])], skipInitialDetect: true });

    patch(fixture.componentInstance);
    fixture.detectChanges();
    (qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLButtonElement).click();
    await settle(fixture);

    return fixture;
}

describe('RtDynamicSelectorComponent — ошибка загрузки и свои виды', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1287 — на ошибке окно рисует вид ошибки вместо записей и прячет «Применить»', async (): Promise<void> => {
        await openWith((host: StatesHostComponent): void => host.error.set('Нет сети'));

        expect(inPopup('dynamic-selector-error')?.textContent).toContain('Нет сети');
        expect(inPopup('dynamic-selector-options')).toBeNull();
        expect(inPopup('dynamic-selector-apply')).toBeNull();
        expect(inPopup('dynamic-selector-select-all')).toBeNull();
    });

    it('SC-UKV-1288 — «Повторить» поднимает retry один раз', async (): Promise<void> => {
        const fixture: THostFixture = await openWith((host: StatesHostComponent): void => host.error.set('Нет сети'));

        inPopup('dynamic-selector-retry')?.click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1289 — свой вид пустого и свой вид ошибки встают в окно', async (): Promise<void> => {
        const fixture: THostFixture = await openWith((host: StatesHostComponent): void => {
            // Поиск на сервере: записей нет, а кнопка добавления остаётся — окно открывается пустым.
            host.withSlots.set(true);
            host.localSearch.set(false);
            host.entities.set([]);
        });

        expect(inPopup('own-empty')).not.toBeNull();

        fixture.componentInstance.error.set('Нет сети');
        await settle(fixture);
        inPopup('own-error')?.click();

        expect(inPopup('own-error')?.textContent).toContain('Нет сети');
        expect(fixture.componentInstance.retryCount).toBe(1);
    });

    it('SC-UKV-1293 — ошибка важнее загрузки: спиннера нет', async (): Promise<void> => {
        await openWith((host: StatesHostComponent): void => {
            host.loading.set(true);
            host.error.set('Нет сети');
        });

        expect(inPopup('dynamic-selector-error')).not.toBeNull();
        expect(inPopup('dynamic-selector-loading')).toBeNull();
    });

    it('SC-UKV-1295 — без записей и с ошибкой поле не пишет «Выбирать не из чего», окно открывается на ошибке', async (): Promise<void> => {
        const fixture: THostFixture = await openWith((host: StatesHostComponent): void => {
            host.entities.set([]);
            host.error.set('Нет сети');
        });

        expect(qa(fixture, 'dynamic-selector-nothing')).toBeNull();
        expect(inPopup('dynamic-selector-error')).not.toBeNull();
    });
});

describe('RtDynamicSelectorPopupComponent само по себе — ошибка загрузки', (): void => {
    it('SC-UKV-1287 — окно вне корня берёт свои error и retry', (): void => {
        const fixture: ComponentFixture<RtDynamicSelectorPopupComponent<IPerson>> = createRtFixture<
            RtDynamicSelectorPopupComponent<IPerson>
        >(
            RtDynamicSelectorPopupComponent,
            { entities: PEOPLE, keyExp: 'id', displayExp: 'name', error: 'Нет сети' },
            { providers: [provideRouter([])] }
        );
        let retries: number = 0;
        // Событие выходит из директивы хоста под своим именем — подписка на неё.
        fixture.debugElement.injector.get(RtDynamicSelectorLoadStateDirective).retry.subscribe((): number => (retries += 1));

        expect(qa(fixture, 'dynamic-selector-error')?.nativeElement.textContent).toContain('Нет сети');

        (qa(fixture, 'dynamic-selector-retry')?.nativeElement as HTMLButtonElement).click();

        expect(retries).toBe(1);
    });
});
