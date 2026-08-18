import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IPostmortem, POSTMORTEMS_PATH } from '@rt/message-bus-admin/postmortems/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective } from '@rt-tools/ui-kit-v2';

import { AdminPostmortemDetailsAsideComponent } from './admin-postmortem-details-aside.component';

/**
 * Оболочка админки: панель живёт маршрутом в аутлете `ro`, а рисует её правая шторка каркаса —
 * там же аутлет и объявлен.
 */
@Component({
    selector: 'admin-postmortems-shell',
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
    selector: 'admin-postmortems-list-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListStubComponent {}

function apiOne(patch: Partial<IPostmortem.Api> = {}): IPostmortem.Api {
    return {
        id: 'p1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        file: '2026-08-14-incident.md',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        updatedAt: '2026-08-15T06:00:00.000Z',
        text: '# Разбор',
        ...patch,
    };
}

describe('AdminPostmortemDetailsAsideComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /**
     * Разметка панели: она уезжает в шторку контейнера, и в дереве фикстуры её уже нет.
     * Значение свойства лежит внутри строки кита и носит её признак: свой признак у панели
     * стоит на самой строке, а не на теге значения.
     */
    function textOf(qaId: string): string {
        const own: Element | null = document.querySelector(`[qa-dataid="${qaId}"]`);
        const value: Element | null = own?.querySelector('[qa-dataid="detail-row-value"]') ?? null;

        return (value ?? own)?.textContent?.trim() ?? '';
    }

    function shown(selector: string): Element | null {
        return document.querySelector(selector);
    }

    /** Открывает панель по признаку записи и отвечает за приёмник тем, чем сказано. */
    async function openDetails(id: string, answer: (request: TestRequest) => void): Promise<void> {
        harness = await RouterTestingHarness.create(`/postmortems(ro:postmortems/${id})`);
        answer(http.expectOne((candidate): boolean => candidate.url === `${POSTMORTEMS_PATH}/${id}`));
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
                            { path: 'postmortems', component: ListStubComponent },
                            { path: 'postmortems/:id', pathMatch: 'full', outlet: 'ro', component: AdminPostmortemDetailsAsideComponent },
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
        await openDetails('p1', (request: TestRequest): void => request.flush(apiOne()));

        expect(router.url).toContain('(ro:postmortems/p1)');
        expect(textOf('postmortem-file')).toBe('2026-08-14-incident.md');
        expect(textOf('postmortem-tree')).toBe('Приёмник');
    });

    it('текст разбора показан целиком и текстом, а не разметкой', async () => {
        const raw: string = '<script>alert(1)</script>упало ночью';

        await openDetails('p1', (request: TestRequest): void => request.flush(apiOne({ text: raw })));

        expect(textOf('postmortem-text')).toBe(raw);
        expect(shown('[qa-dataid="postmortem-text"] script')).toBeNull();
    });

    it('записи, которой нет, панель говорит об этом, а не показывает пустые поля', async () => {
        await openDetails('gone', (request: TestRequest): void => request.flush('', { status: 404, statusText: 'Not Found' }));

        expect(textOf('postmortem-details-missing')).toContain('Записи нет');
        expect(shown('[qa-dataid="postmortem-text"]')).toBeNull();
    });

    it('не прочитавшаяся запись отличается от несуществующей', async () => {
        await openDetails('p1', (request: TestRequest): void => request.flush('', { status: 500, statusText: 'Server Error' }));

        expect(textOf('postmortem-details-missing')).toContain('Прочитать запись не удалось');
    });

    it('открытая панель не трогает выборку списка: она остаётся в адресе', async () => {
        harness = await RouterTestingHarness.create('/postmortems(ro:postmortems/p1)?page=2&tree=a1b2');
        http.expectOne((candidate): boolean => candidate.url === `${POSTMORTEMS_PATH}/p1`).flush(apiOne());
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
        expect(shown('[qa-dataid="postmortem-details-close"]')).not.toBeNull();
    });

    it('соседняя запись, названная адресом, читается заново', async () => {
        await openDetails('p1', (request: TestRequest): void => request.flush(apiOne()));
        await harness.navigateByUrl('/postmortems(ro:postmortems/p2)');
        http.expectOne((candidate): boolean => candidate.url === `${POSTMORTEMS_PATH}/p2`).flush(apiOne({ id: 'p2', file: 'second.md' }));
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(textOf('postmortem-file')).toBe('second.md');
    });
});
