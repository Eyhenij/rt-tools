import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { resetMediaQueries, setMediaQueryMatches } from '../../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../../testing/rt-kit-testing';
import { RtAsideRef } from '../../aside/rt-aside-ref';
import { RtAsideService } from '../../aside/rt-aside.service';
import { ERtDataTableColumnType, IRtDataTable } from '../../data-table/rt-data-table.model';
import { RtDataListSettingsAsideComponent } from './rt-data-list-settings-aside.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

function configOf(): IRtDataTable.Config.Data<IEntity> {
    return {
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: true,
        columns: [
            {
                align: 'left',
                propName: 'title',
                type: ERtDataTableColumnType.TEXT,
                copyable: false,
                header: { align: 'left', label: 'Название' },
                displayName: 'Название',
                hidden: false,
            },
        ],
    };
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

describe('Настройки списка на телефоне — шторка', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        resetMediaQueries();
    });

    it('SC-UKV-1809 — настройки списка поднимаются шторкой, «Сохранить» справа в шапке', async (): Promise<void> => {
        setMediaQueryMatches('(max-width: 480px)', true);
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        // Тем же вызовом панель открывает сам список кита.
        const ref: RtAsideRef<IRtDataTable.Config.Data<IEntity> | undefined> = TestBed.inject(RtAsideService).open<
            RtDataListSettingsAsideComponent<IEntity>,
            IRtDataTable.Config.Data<IEntity>,
            IRtDataTable.Config.Data<IEntity> | undefined
        >(RtDataListSettingsAsideComponent, { data: configOf(), position: 'right' });
        const results: Array<IRtDataTable.Config.Data<IEntity> | undefined> = [];
        ref.afterClosed().subscribe((result: IRtDataTable.Config.Data<IEntity> | undefined): number => results.push(result));
        const app: ApplicationRef = TestBed.inject(ApplicationRef);
        app.tick();
        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame((): void => resolve());
        });
        app.tick();

        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('data-list-settings-save')?.closest('[qa-dataid="aside-sheet-main"]')).not.toBeNull();
        // «Отмена» подвала только закрывает: в шторке её роль у «×», и подвала нет.
        expect(node('data-list-settings-cancel')).toBeNull();
        expect(node('aside-subtitle')?.closest('[qa-dataid="bottom-sheet-header"]')).not.toBeNull();

        // Кнопка в шапке — та же кнопка подвала: до правки она так же заперта.
        expect(node('data-list-settings-save')?.hasAttribute('disabled')).toBe(true);
        document.querySelector<HTMLElement>('[qa-dataid="data-list-settings-vertical"] [qa-dataid="toggle-switch-control"]')?.click();
        app.tick();
        node('data-list-settings-save')?.click();

        expect(results.length).toBe(1);
        expect(results[0]?.columns.length).toBe(1);
    });
});
