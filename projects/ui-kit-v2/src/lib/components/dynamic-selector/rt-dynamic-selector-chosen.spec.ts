import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const ANNA: IPerson = { id: 1, name: 'Anna' };
const BORIS: IPerson = { id: 2, name: 'Boris' };
const CLARA: IPerson = { id: 3, name: 'Clara' };

const LONG_NAME: IPerson = { id: 4, name: 'Анна Сергеевна Константинопольская-Преображенская' };

/** Родитель без формы: выбранное приходит входом, а изменение выбора возвращается тем же списком. */
@Component({
    selector: 'rt-dynamic-selector-chosen-host',
    template: `
        <rt-dynamic-selector
            keyExp="id"
            displayExp="name"
            [entities]="entities()"
            [chosenEntities]="chosen()"
            [titleWrap]="titleWrap()"
            (selectionChange)="onSelection($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicSelectorComponent],
})
class ChosenHostComponent {
    public readonly entities: WritableSignal<IPerson[]> = signal<IPerson[]>([ANNA, BORIS, CLARA]);
    public readonly chosen: WritableSignal<IPerson[]> = signal<IPerson[]>([]);
    public readonly titleWrap: WritableSignal<boolean> = signal(true);

    /** Родитель, что возвращает выбранное в порядке каталога, а не в порядке строк. */
    public readonly catalogEcho: WritableSignal<boolean> = signal(false);

    public onSelection(list: IPerson[]): void {
        this.chosen.set(this.catalogEcho() ? this.entities().filter((person: IPerson): boolean => list.includes(person)) : list);
    }
}

function host(configure: (it: ChosenHostComponent) => void): ComponentFixture<ChosenHostComponent> {
    const fixture: ComponentFixture<ChosenHostComponent> = createRtFixture(
        ChosenHostComponent,
        {},
        { providers: [provideRouter([])], skipInitialDetect: true }
    );
    configure(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
}

async function settle(fixture: ComponentFixture<ChosenHostComponent>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

function rowTitles(fixture: ComponentFixture<ChosenHostComponent>): string[] {
    return qaAll(fixture, 'dynamic-selector-row').map((row: { nativeElement: HTMLElement }): string =>
        textOf(row.nativeElement.querySelector<HTMLElement>('.rt-dynamic-selector-list__title'))
    );
}

function button(fixture: ComponentFixture<ChosenHostComponent>, id: string): HTMLButtonElement {
    return qa(fixture, id)?.nativeElement.querySelector('button') as HTMLButtonElement;
}

describe('RtDynamicSelectorComponent — выбранное входом chosenEntities', (): void => {
    it('SC-UKV-721 — список входа рисует строки, эхо изменения оставляет сброс включённым, сброс возвращает список', async (): Promise<void> => {
        const fixture: ComponentFixture<ChosenHostComponent> = host((it: ChosenHostComponent): void => it.chosen.set([ANNA, BORIS]));
        await settle(fixture);

        expect(rowTitles(fixture)).toEqual(['Anna', 'Boris']);
        expect(button(fixture, 'dynamic-selector-reset').disabled).toBe(true);

        (qaAll(fixture, 'dynamic-selector-remove')[0].nativeElement.querySelector('button') as HTMLButtonElement).click();
        await settle(fixture);

        expect(fixture.componentInstance.chosen()).toEqual([BORIS]);
        expect(rowTitles(fixture)).toEqual(['Boris']);
        expect(button(fixture, 'dynamic-selector-reset').disabled).toBe(false);

        button(fixture, 'dynamic-selector-reset').click();
        await settle(fixture);

        expect(rowTitles(fixture)).toEqual(['Anna', 'Boris']);
    });

    it('SC-UKV-721 — эхо тех же ключей в другом порядке оставляет строки и сброс включённым', async (): Promise<void> => {
        const fixture: ComponentFixture<ChosenHostComponent> = host((it: ChosenHostComponent): void => {
            it.catalogEcho.set(true);
            it.chosen.set([CLARA, BORIS, ANNA]);
        });
        await settle(fixture);

        (qaAll(fixture, 'dynamic-selector-remove')[0].nativeElement.querySelector('button') as HTMLButtonElement).click();
        await settle(fixture);

        // Родитель вернул тот же набор в порядке каталога — это эхо, а не новый список
        expect(fixture.componentInstance.chosen()).toEqual([ANNA, BORIS]);
        expect(rowTitles(fixture)).toEqual(['Boris', 'Anna']);
        expect(button(fixture, 'dynamic-selector-reset').disabled).toBe(false);

        button(fixture, 'dynamic-selector-reset').click();
        await settle(fixture);

        expect(rowTitles(fixture)).toEqual(['Clara', 'Boris', 'Anna']);
    });

    it('SC-UKV-721 — новый список входа с другими ключами заменяет выбранное и исходное для сброса', async (): Promise<void> => {
        const fixture: ComponentFixture<ChosenHostComponent> = host((it: ChosenHostComponent): void => it.chosen.set([ANNA]));
        await settle(fixture);

        fixture.componentInstance.chosen.set([CLARA]);
        await settle(fixture);

        expect(rowTitles(fixture)).toEqual(['Clara']);
        expect(button(fixture, 'dynamic-selector-reset').disabled).toBe(true);
    });

    it('SC-UKV-721 — записи из списка входа рисуются, даже если их нет среди предложенных', async (): Promise<void> => {
        const fixture: ComponentFixture<ChosenHostComponent> = host((it: ChosenHostComponent): void => {
            it.entities.set([]);
            it.chosen.set([BORIS]);
        });
        await settle(fixture);

        expect(rowTitles(fixture)).toEqual(['Boris']);
    });
});

describe('RtDynamicSelectorComponent — название строки одной строкой', (): void => {
    function title(fixture: ComponentFixture<ChosenHostComponent>): HTMLElement {
        return qa(fixture, 'dynamic-selector-row')?.nativeElement.querySelector('.rt-dynamic-selector-list__title') as HTMLElement;
    }

    function tooltipText(fixture: ComponentFixture<ChosenHostComponent>): string | undefined {
        return qa(fixture, 'dynamic-selector-row')
            ?.query((node: { nativeElement: unknown }): boolean => node.nativeElement === title(fixture))
            ?.injector.get(RtTooltipDirective)
            .text();
    }

    it('SC-UKV-722 — без переноса название помечено одной строкой и несёт подсказку с полным текстом', async (): Promise<void> => {
        const fixture: ComponentFixture<ChosenHostComponent> = host((it: ChosenHostComponent): void => {
            it.entities.set([LONG_NAME]);
            it.chosen.set([LONG_NAME]);
            it.titleWrap.set(false);
        });
        await settle(fixture);

        expect(title(fixture).classList.contains('rt-dynamic-selector-list__title--nowrap')).toBe(true);
        expect(tooltipText(fixture)).toBe(LONG_NAME.name);
    });

    it('SC-UKV-722 — с переносом по умолчанию у названия нет ни метки, ни подсказки', async (): Promise<void> => {
        const fixture: ComponentFixture<ChosenHostComponent> = host((it: ChosenHostComponent): void => {
            it.entities.set([LONG_NAME]);
            it.chosen.set([LONG_NAME]);
        });
        await settle(fixture);

        expect(title(fixture).classList.contains('rt-dynamic-selector-list__title--nowrap')).toBe(false);
        expect(tooltipText(fixture)).toBe('');
    });
});
