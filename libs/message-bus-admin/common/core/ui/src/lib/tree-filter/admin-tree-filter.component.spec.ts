import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ITreeChoice } from '@rt/message-bus-common';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

import { AdminTreeFilterComponent } from './admin-tree-filter.component';

const CHOICES: readonly ITreeChoice[] = [
    { slug: 'a1b2', name: 'Приёмник' },
    { slug: 'c3d4', name: 'Витрина' },
];

/** Выбор кита, каким его видит человек: подписи и значения опций. */
function optionsOf(fixture: ComponentFixture<AdminTreeFilterComponent>): ReadonlyArray<IRtSelect.Option<string>> {
    return fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.options();
}

describe('AdminTreeFilterComponent', () => {
    let fixture: ComponentFixture<AdminTreeFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminTreeFilterComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRtUtils(), provideRtStorage(), provideRtIDBStorage()],
        });

        fixture = TestBed.createComponent(AdminTreeFilterComponent);
        fixture.componentRef.setInput('choices', CHOICES);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('деревья названы именами, а сужают признаком', () => {
        expect(optionsOf(fixture)).toEqual([
            { label: 'Все проекты', value: '' },
            { label: 'Приёмник', value: 'a1b2' },
            { label: 'Витрина', value: 'c3d4' },
        ]);
    });

    it('снятие отбора поднимается наверх пустым признаком, а не пустотой', () => {
        const picked: string[] = [];

        fixture.componentInstance.treeChange.subscribe((slug: string): void => {
            picked.push(slug);
        });

        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit(null);

        expect(picked).toEqual(['']);
    });

    it('выбранное дерево поднимается наверх признаком', () => {
        const picked: string[] = [];

        fixture.componentInstance.treeChange.subscribe((slug: string): void => {
            picked.push(slug);
        });

        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit('c3d4');

        expect(picked).toEqual(['c3d4']);
    });
});
