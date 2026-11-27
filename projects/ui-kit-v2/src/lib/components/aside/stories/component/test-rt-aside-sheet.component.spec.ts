import { ComponentType } from '@angular/cdk/portal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRtKitTesting } from '../../../../../testing/rt-kit-testing';
import { RtDataListSettingsAsideComponent } from '../../../data-list/settings/rt-data-list-settings-aside.component';
import { RtAsideRef } from '../../rt-aside-ref';
import { IRtAsideConfig, RtAsideService } from '../../rt-aside.service';
import { TAsideSheetFrame, TestRtAsideSheetComponent } from './test-rt-aside-sheet.component';
import { TestRtAsideSheetPanelComponent } from './test-rt-aside-sheet-panel.component';

/** Что обёртка попросила у службы кита: какую панель, с какими данными, и что вернула служба. */
interface IOpened {
    readonly component: ComponentType<unknown>;
    readonly config: IRtAsideConfig | undefined;
    readonly ref: RtAsideRef;
}

/** Рисует обёртку кадра и записывает, что она открыла службой кита при первой отрисовке. */
function render(frame: TAsideSheetFrame): IOpened[] {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    const service: RtAsideService = TestBed.inject(RtAsideService);
    const open: RtAsideService['open'] = service.open.bind(service);
    const opened: IOpened[] = [];
    jest.spyOn(service, 'open').mockImplementation((component: ComponentType<unknown>, config?: IRtAsideConfig): RtAsideRef => {
        const ref: RtAsideRef = open(component, config);
        opened.push({ component, config, ref });
        return ref;
    });
    const fixture: ComponentFixture<TestRtAsideSheetComponent> = TestBed.createComponent(TestRtAsideSheetComponent);
    fixture.componentInstance.frame = frame;
    fixture.detectChanges();

    return opened;
}

describe('Обёртка витрины асайда-шторки', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
    });

    it('SC-UKV-1802 — кадр записи открывает панель записи службой кита, справа, без признака правок', (): void => {
        const opened: IOpened[] = render('record');

        expect(opened).toHaveLength(1);
        expect(opened[0]?.component).toBe(TestRtAsideSheetPanelComponent);
        expect(opened[0]?.config).toEqual({ data: 'record', position: 'right' });
        expect(opened[0]?.ref.unsaved()).toBe(false);
    });

    it('SC-UKV-1840 — кадр вопроса открывает ту же панель записи с признаком несохранённых правок', (): void => {
        const opened: IOpened[] = render('question');

        expect(opened[0]?.config?.data).toBe('record');
        expect(opened[0]?.ref.unsaved()).toBe(true);
    });

    it('SC-UKV-1832 — кадры панелей отдают панели свой вид данными открытия', (): void => {
        const kinds: TAsideSheetFrame[] = ['app', 'tabs', 'long-tabs', 'footer'];

        for (const kind of kinds) {
            TestBed.resetTestingModule();
            expect(render(kind).map((open: IOpened): unknown => open.config?.data)).toEqual([kind]);
        }
    });

    it('SC-UKV-1809 — кадр вида списка открывает настройки списка кита', (): void => {
        const opened: IOpened[] = render('list');

        expect(opened[0]?.component).toBe(RtDataListSettingsAsideComponent);
        expect(opened[0]?.config?.position).toBe('right');
    });

    it('SC-UKV-1806 — кадр отборов службой ничего не открывает: отборы открывает кнопка фильтров', (): void => {
        expect(render('filters')).toHaveLength(0);
    });
});
