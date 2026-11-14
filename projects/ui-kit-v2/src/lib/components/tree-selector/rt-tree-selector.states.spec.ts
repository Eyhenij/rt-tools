import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtTree } from '../tree/rt-tree.model';
import { RtTreeSelectorComponent } from './rt-tree-selector.component';
import { RtTreeSelectorEmptyDirective } from './rt-tree-selector.directives';

const NODES: ReadonlyArray<IRtTree.Node<string>> = [{ label: 'France', value: 'fr', children: [{ label: 'Paris', value: 'pa' }] }];

@Component({
    selector: 'rt-test-tree-selector-states-host',
    template: `
        <rt-tree-selector [nodes]="nodes()">
            @if (withSlot()) {
                <ng-template rtTreeSelectorEmpty let-term>
                    <span qa-dataid="own-empty">нет «{{ term }}»</span>
                </ng-template>
            }
        </rt-tree-selector>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTreeSelectorComponent, RtTreeSelectorEmptyDirective],
})
class StatesHostComponent {
    public readonly nodes: WritableSignal<ReadonlyArray<IRtTree.Node<string>>> = signal<ReadonlyArray<IRtTree.Node<string>>>(NODES);
    public readonly withSlot: WritableSignal<boolean> = signal<boolean>(false);
}

function inHost(fixture: ComponentFixture<StatesHostComponent>, id: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${id}"]`);
}

async function draw(patch: (host: StatesHostComponent) => void, term: string = ''): Promise<ComponentFixture<StatesHostComponent>> {
    const fixture: ComponentFixture<StatesHostComponent> = createRtFixture(StatesHostComponent, {}, { skipInitialDetect: true });

    patch(fixture.componentInstance);
    fixture.detectChanges();
    if (term !== '') {
        const field: HTMLInputElement = inHost(fixture, 'tree-selector-search')?.querySelector('input') as HTMLInputElement;
        field.value = term;
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

describe('RtTreeSelectorComponent — свой вид пустого', (): void => {
    it('SC-UKV-1291 — свой шаблон встаёт вместо «Ничего не найдено» и получает строку поиска', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await draw(
            (host: StatesHostComponent): void => host.withSlot.set(true),
            'нет такого'
        );

        expect(inHost(fixture, 'own-empty')?.textContent).toContain('нет «нет такого»');
        expect(inHost(fixture, 'tree-selector-empty')).toBeNull();
    });

    it('SC-UKV-1291 — при пустом наборе узлов шаблон уходит внутреннему дереву', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await draw((host: StatesHostComponent): void => {
            host.withSlot.set(true);
            host.nodes.set([]);
        });

        expect(inHost(fixture, 'own-empty')).not.toBeNull();
        expect(inHost(fixture, 'tree-empty')).toBeNull();
    });

    it('SC-UKV-1296 — без шаблона строка «Ничего не найдено» стоит как раньше', async (): Promise<void> => {
        const fixture: ComponentFixture<StatesHostComponent> = await draw((): void => undefined, 'нет такого');

        expect(inHost(fixture, 'tree-selector-empty')?.textContent?.trim()).toBe('Nothing found');
    });
});
