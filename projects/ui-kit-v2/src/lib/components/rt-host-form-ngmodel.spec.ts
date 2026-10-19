import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, qa } from '../../testing/rt-kit-testing';
import { BreakpointsService } from '../platform';
import { RtDynamicListComponent } from './dynamic-list/rt-dynamic-list.component';
import { IRtFilterControl } from './filter-control/rt-filter-control.model';
import { RtFilterControlComponent } from './filter-control/rt-filter-control.component';
import { IRtProfileMenu } from './profile-menu/rt-profile-menu.model';
import { RtProfileMenuComponent } from './profile-menu/rt-profile-menu.component';
import { IRtSelect } from './select/rt-select.model';
import { RtSelectComponent } from './select/rt-select.component';
import { RtThemeToggleComponent } from './theme-toggle/rt-theme-toggle.component';
import { IRtTree } from './tree/rt-tree.model';
import { RtTreeSelectorComponent } from './tree-selector/rt-tree-selector.component';
import { IRtWorkspaceDetails } from './workspace-details/rt-workspace-details.model';
import { RtWorkspaceDetailsComponent } from './workspace-details/rt-workspace-details.component';

/**
 * Внутренние поля компонентов кита внутри формы страницы: каждое держит своё значение само и в форму
 * родителя не встаёт. Без этого Angular пишет NG01354 на каждом показе поля.
 */
abstract class HostForm {
    public readonly form: FormGroup<{ own: FormControl<string | null> }> = new FormGroup({
        own: new FormControl<string | null>(null),
    });
}

@Component({
    selector: 'rt-host-form-select',
    template: `
        <form [formGroup]="form"><rt-select filter [options]="options" /></form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtSelectComponent],
})
class SelectHostComponent extends HostForm {
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = [{ label: 'Москва', value: 'msk' }];
}

@Component({
    selector: 'rt-host-form-tree-selector',
    template: `
        <form [formGroup]="form"><rt-tree-selector [nodes]="nodes" /></form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtTreeSelectorComponent],
})
class TreeSelectorHostComponent extends HostForm {
    public readonly nodes: ReadonlyArray<IRtTree.Node<string>> = [{ label: 'France', value: 'fr' }];
}

@Component({
    selector: 'rt-host-form-profile-menu',
    template: `
        <form [formGroup]="form"><rt-profile-menu userName="maria" [locales]="locales" /></form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtProfileMenuComponent],
})
class ProfileMenuHostComponent extends HostForm {
    public readonly locales: ReadonlyArray<IRtProfileMenu.Locale> = [{ value: 'ru', label: 'Русский' }];
}

@Component({
    selector: 'rt-host-form-filter-control',
    template: `
        <form [formGroup]="form"><rt-filter-control [options]="options" /></form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtFilterControlComponent],
})
class FilterControlHostComponent extends HostForm {
    public readonly options: ReadonlyArray<IRtFilterControl.Option> = [{ value: 'all', label: 'Все' }];
}

@Component({
    selector: 'rt-host-form-theme-toggle',
    template: `
        <form [formGroup]="form"><rt-theme-toggle appearance="switch" /></form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtThemeToggleComponent],
})
class ThemeToggleHostComponent extends HostForm {}

@Component({
    selector: 'rt-host-form-workspace-details',
    template: `
        <form [formGroup]="form">
            <rt-workspace-details [rows]="rows" [agentEdit]="agentEdit" [toggles]="toggles" />
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtWorkspaceDetailsComponent],
})
class WorkspaceDetailsHostComponent extends HostForm {
    public readonly rows: ReadonlyArray<IRtWorkspaceDetails.Row> = [{ label: 'Агент', value: 'Иванов', agent: true }];
    public readonly agentEdit: IRtWorkspaceDetails.AgentEdit = {
        currentLabel: 'Иванов',
        currentAgentId: 1,
        options: [{ label: 'Иванов', value: 1 }],
        canEdit: true,
        editTooltip: '',
        cannotEditTooltip: '',
        loading: false,
        confirmText: '',
    };
    public readonly toggles: ReadonlyArray<IRtWorkspaceDetails.Toggle> = [{ id: 'vip', label: 'VIP', value: false }];
}

@Component({
    selector: 'rt-host-form-dynamic-list',
    template: `
        <form [formGroup]="form"><rt-dynamic-list selectable /></form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicListComponent],
})
class DynamicListHostComponent extends HostForm {}

/** Узкий экран: фильтр рисуется списком, а не группой кнопок. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

interface ICase {
    name: string;
    host: Type<HostForm>;
    /** Поле, которое должно появиться: случай проверяет его показ. */
    field: string;
    /** Действие человека, после которого поле показывается. */
    open?: string;
    narrow?: boolean;
}

const CASES: ReadonlyArray<ICase> = [
    { name: 'фильтр выпадающего списка', host: SelectHostComponent, open: 'select-trigger', field: '.rt-select__filter rt-input' },
    { name: 'поиск выбора из дерева', host: TreeSelectorHostComponent, field: '[qa-dataid="tree-selector-search"]' },
    { name: 'язык в меню профиля', host: ProfileMenuHostComponent, field: '[qa-dataid="profile-locale-select"]' },
    { name: 'фильтр на узком экране', host: FilterControlHostComponent, narrow: true, field: '[qa-dataid="filter-control-select"]' },
    { name: 'переключатель темы', host: ThemeToggleHostComponent, field: 'rt-toggle-switch[qa-dataid="theme-toggle-control"]' },
    {
        name: 'выбор агента в карточке',
        host: WorkspaceDetailsHostComponent,
        open: 'workspace-details-agent-edit',
        field: '[qa-dataid="workspace-details-agent-select"]',
    },
    { name: 'переключатель в карточке', host: WorkspaceDetailsHostComponent, field: '[qa-dataid="workspace-details-toggle"]' },
    { name: 'отметка всех в шапке списка', host: DynamicListHostComponent, field: '[qa-dataid="dynamic-list-select-all"]' },
];

function press(fixture: ComponentFixture<HostForm>, id: string): void {
    const target: HTMLElement = qa(fixture, id)?.nativeElement as HTMLElement;

    (target.querySelector<HTMLButtonElement>('button') ?? target).click();
    fixture.detectChanges();
}

describe('Поля кита внутри формы страницы', (): void => {
    let warn: jest.SpyInstance;

    beforeEach((): void => {
        warn = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
    });

    afterEach((): void => {
        warn.mockRestore();
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
    });

    it.each(CASES)('SC-UKV-940 — $name: поле показано без NG01354, форма родителя держит только свои поля', (item: ICase): void => {
        const fixture: ComponentFixture<HostForm> = createRtFixture(
            item.host,
            {},
            { providers: item.narrow ? [{ provide: BreakpointsService, useClass: NarrowBreakpointsService }] : [] }
        );

        if (item.open) {
            press(fixture, item.open);
        }

        expect(document.querySelector(item.field)).not.toBeNull();
        expect(warn.mock.calls.filter((call: unknown[]): boolean => String(call[0]).includes('NG01354'))).toEqual([]);
        expect(Object.keys(fixture.componentInstance.form.controls)).toEqual(['own']);
    });
});
