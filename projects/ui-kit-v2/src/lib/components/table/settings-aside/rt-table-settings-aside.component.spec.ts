import { DebugElement, OutputRef, OutputRefSubscription, Signal, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideRtKitTesting, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { IRtTable } from '../rt-table.model';
import { IRtTableSettingsRegistration, RtTableSettingsRegistry } from '../rt-table-settings.registry';
import { RtContainerComponent } from '../../container/rt-container.component';
import { RtTableSettingsAsideComponent } from './rt-table-settings-aside.component';

const COLUMNS: ReadonlyArray<IRtTable.ColumnSettingItem> = [
    { key: 'title', label: 'Договор', locked: true, hidden: false },
    { key: 'city', label: 'Город', hidden: false },
    { key: 'manager', label: 'Менеджер', hidden: true },
];

const DEFAULTS: ReadonlyArray<IRtTable.ColumnSettingItem> = [
    { key: 'title', label: 'Договор', locked: true, hidden: false },
    { key: 'city', label: 'Город', hidden: false },
    { key: 'manager', label: 'Менеджер', hidden: false },
];

/**
 * Выход, на который можно подписаться и который ничего не шлёт. Настоящий `output()` живёт
 * только в области внедрения, а двойник каркаса создаётся обычным `new`.
 */
function outputStub(): OutputRef<void> {
    return {
        subscribe: (): OutputRefSubscription => ({ unsubscribe: (): void => undefined }),
    };
}

/**
 * Двойник каркаса: панель просит у него признак готовности перекрытия и три выхода жизненного
 * цикла. Настоящий тянет за собой перекрытие CDK и замер ширины — то есть показ каркаса, а не
 * панели настроек.
 */
class ContainerDouble {
    public readonly backdropClick: OutputRef<void> = outputStub();
    public readonly rightOpened: OutputRef<void> = outputStub();
    public readonly rightClosed: OutputRef<void> = outputStub();

    public readonly rightOverlayReady: Signal<boolean> = signal<boolean>(true);

    /** Открыта ли правая панель: по этому признаку директива решает, закрывать ли её при уходе. */
    public readonly rightOpen: Signal<boolean> = signal<boolean>(false);

    public opened: number = 0;
    public closed: number = 0;

    public openRight(): void {
        this.opened += 1;
    }

    public closeRight(): void {
        this.closed += 1;
    }
}

let registry: RtTableSettingsRegistry;
let applied: IRtTable.ColumnSettings[];
let columns: WritableSignal<ReadonlyArray<IRtTable.ColumnSettingItem>>;

/** Регистрация таблицы в реестре — тот же мост, которым пользуется настоящая `rt-table`. */
function registration(): IRtTableSettingsRegistration {
    columns = signal<ReadonlyArray<IRtTable.ColumnSettingItem>>(COLUMNS);

    return {
        columns: columns.asReadonly(),
        defaults: signal<ReadonlyArray<IRtTable.ColumnSettingItem>>(DEFAULTS).asReadonly(),
        apply: (settings: IRtTable.ColumnSettings): void => void applied.push(settings),
    };
}

/**
 * Панель настроек с зарегистрированной таблицей.
 *
 * `active` задаётся до подъёма панели: она читает его в поле, и выставленный позже он означал бы
 * для неё восстановление после перезагрузки страницы, а не штатное открытие.
 */
function setup(withActive: boolean = true): ComponentFixture<RtTableSettingsAsideComponent> {
    applied = [];

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        imports: [RtTableSettingsAsideComponent],
        providers: [...provideRtKitTesting(), provideRouter([]), { provide: RtContainerComponent, useValue: new ContainerDouble() }],
    });

    // Реестр наполняется до подъёма панели: признак активной таблицы она читает полем в
    // конструкторе, и выставленный позже он означал бы восстановление после перезагрузки
    // страницы, а не штатное открытие.
    registry = TestBed.inject(RtTableSettingsRegistry);
    registry.register('contracts', registration());

    if (withActive) {
        registry.setActive('contracts');
    }

    const fixture: ComponentFixture<RtTableSettingsAsideComponent> = TestBed.createComponent(RtTableSettingsAsideComponent);

    fixture.detectChanges();

    return fixture;
}

function rows(fixture: ComponentFixture<RtTableSettingsAsideComponent>): string[] {
    return qaAll(fixture, 'table-settings-label').map((node: DebugElement): string => textOf(node));
}

describe('RtTableSettingsAsideComponent', (): void => {
    it('показывает колонки активной таблицы', (): void => {
        expect(rows(setup())).toEqual(['Договор', 'Город', 'Менеджер']);
    });

    it('правки идут в рабочую копию и до сохранения таблицы не касаются', (): void => {
        // Иначе колонка исчезала бы из таблицы прямо во время выбора, а отказ от
        // сохранения вернуть её уже не мог бы.
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup();
        const toggle: HTMLElement = qaAll(fixture, 'table-settings-toggle')[1].nativeElement as HTMLElement;

        toggle.querySelector('button')?.click();
        fixture.detectChanges();

        expect(applied).toEqual([]);
    });

    it('сохранение отдаёт таблице порядок колонок и скрытые', (): void => {
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup();

        (qa(fixture, 'table-settings-save')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(applied).toEqual([{ order: ['title', 'city', 'manager'], hidden: ['manager'] }]);
    });

    it('сохранение снимает признак активной таблицы — панель закрылась', (): void => {
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup();

        (qa(fixture, 'table-settings-save')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(registry.active()).toBeNull();
    });

    it('сброс возвращает умолчания конфига, а не прежнюю рабочую копию', (): void => {
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup();

        (qa(fixture, 'table-settings-reset')?.nativeElement as HTMLElement).querySelector('button')?.click();
        fixture.detectChanges();
        (qa(fixture, 'table-settings-save')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(applied).toEqual([{ order: ['title', 'city', 'manager'], hidden: [] }]);
    });

    it('после перезагрузки страницы панель усыновляет единственную таблицу', (): void => {
        // Реестр пересоздаётся вместе с приложением, и признак активной теряется:
        // без усыновления панель закрылась бы на первом же промахе, хотя таблица
        // на странице ровно одна.
        const fixture: ComponentFixture<RtTableSettingsAsideComponent> = setup(false);

        expect(registry.active()).toBe('contracts');
        expect(rows(fixture)).toEqual(['Договор', 'Город', 'Менеджер']);
    });
});
