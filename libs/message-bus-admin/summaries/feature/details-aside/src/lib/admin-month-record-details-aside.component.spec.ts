import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IMonthRecord, SUMMARIES_PATH } from '@rt/message-bus-admin/summaries/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective } from '@rt-tools/ui-kit-v2';

import { AdminMonthRecordDetailsAsideComponent } from './admin-month-record-details-aside.component';

/**
 * Оболочка админки: панель живёт маршрутом в аутлете `ro`, а рисует её правая шторка каркаса —
 * там же аутлет и объявлен.
 */
@Component({
    selector: 'admin-summaries-shell',
    imports: [RouterOutlet, RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective],
    template: `
        <rt-container>
            <ng-template rtContainerContent><router-outlet /></ng-template>
            <ng-template rtContainerRightSidenav><router-outlet name="ro" /></ng-template>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ShellComponent {}

/** Экран раздела: спеке нужен занятый первичный аутлет, а не его содержимое. */
@Component({
    selector: 'admin-summaries-list-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListStubComponent {}

function apiOne(patch: Partial<IMonthRecord.Api> = {}): IMonthRecord.Api {
    return {
        id: 'm1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        month: '2026-08',
        sessions: 19,
        schema: '1',
        ranAt: '2026-08-15T09:20:05.257Z',
        summary: { days: 3, tree: 'a1b2' },
        ...patch,
    };
}

describe('AdminMonthRecordDetailsAsideComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /** Разметка панели: она уезжает в шторку контейнера, и в дереве фикстуры её уже нет. */
    function textOf(qaId: string): string {
        return document.querySelector(`[qa-dataid="${qaId}"]`)?.textContent?.trim() ?? '';
    }

    function shown(selector: string): Element | null {
        return document.querySelector(selector);
    }

    /** Открывает панель по признаку записи и отвечает за приёмник тем, чем сказано. */
    async function openDetails(id: string, answer: (request: TestRequest) => void): Promise<void> {
        harness = await RouterTestingHarness.create(`/summaries(ro:summaries/${id})`);
        answer(http.expectOne((candidate): boolean => candidate.url === `${SUMMARIES_PATH}/${id}`));
        await harness.fixture.whenStable();
        harness.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
                provideRtIDBStorage(),
                provideRouter([
                    {
                        path: '',
                        component: ShellComponent,
                        children: [
                            { path: 'summaries', component: ListStubComponent },
                            {
                                path: 'summaries/:id',
                                pathMatch: 'full',
                                outlet: 'ro',
                                component: AdminMonthRecordDetailsAsideComponent,
                            },
                        ],
                    },
                ]),
            ],
        });

        http = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    /**
     * Шторка каркаса дорисовывается следующим кадром, и кадр этот приходит уже после теста:
     * снятый до него стенд оставляет наложение уничтоженным, а кадр — упавшим на пустом узле.
     * Прогон валится не проверкой, а этой ошибкой, поэтому кадру дают случиться.
     */
    afterEach(async () => {
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 50);
        });
        TestBed.resetTestingModule();
    });

    it('панель читает запись признаком из адреса', async () => {
        await openDetails('m1', (request: TestRequest): void => request.flush(apiOne()));

        expect(router.url).toContain('(ro:summaries/m1)');
        expect(textOf('month-record-month')).toBe('2026-08');
        expect(textOf('month-record-tree')).toBe('Приёмник');
    });

    it('сводка показана текстом, а не разметкой', async () => {
        await openDetails('m1', (request: TestRequest): void => request.flush(apiOne({ summary: { note: '<script>alert(1)</script>' } })));

        expect(textOf('month-record-summary')).toContain('<script>alert(1)</script>');
        expect(shown('[qa-dataid="month-record-summary"] script')).toBeNull();
    });

    it('месяц без сводки объясняет себя словами, а не пустым местом', async () => {
        await openDetails('m1', (request: TestRequest): void => request.flush(apiOne({ summary: null, sessions: null })));

        expect(shown('[qa-dataid="month-record-summary"]')).toBeNull();
        expect(textOf('month-record-summary-missing')).toContain('Сводки в этом месяце ещё не было');
        expect(textOf('month-record-sessions')).toBe('0');
    });

    it('записи, которой нет, панель говорит об этом, а не показывает пустые поля', async () => {
        await openDetails('gone', (request: TestRequest): void => request.flush('', { status: 404, statusText: 'Not Found' }));

        expect(textOf('month-record-details-missing')).toContain('Записи нет');
        expect(shown('[qa-dataid="month-record-summary"]')).toBeNull();
    });

    it('не прочитавшаяся запись отличается от несуществующей', async () => {
        await openDetails('m1', (request: TestRequest): void => request.flush('', { status: 500, statusText: 'Server Error' }));

        expect(textOf('month-record-details-missing')).toContain('Прочитать запись не удалось');
    });

    it('открытая панель не трогает выборку списка: она остаётся в адресе', async () => {
        harness = await RouterTestingHarness.create('/summaries(ro:summaries/m1)?page=2&tree=a1b2');
        http.expectOne((candidate): boolean => candidate.url === `${SUMMARIES_PATH}/m1`).flush(apiOne());
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
        expect(shown('[qa-dataid="month-record-details-close"]')).not.toBeNull();
    });

    it('соседняя запись, названная адресом, читается заново', async () => {
        await openDetails('m1', (request: TestRequest): void => request.flush(apiOne()));
        await harness.navigateByUrl('/summaries(ro:summaries/m2)');
        http.expectOne((candidate): boolean => candidate.url === `${SUMMARIES_PATH}/m2`).flush(apiOne({ id: 'm2', month: '2026-07' }));
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(textOf('month-record-month')).toBe('2026-07');
    });
});
