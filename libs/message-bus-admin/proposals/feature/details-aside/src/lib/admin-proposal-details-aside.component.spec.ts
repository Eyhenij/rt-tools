import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { IProposal, PROPOSALS_PATH } from '@rt/message-bus-admin/proposals/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective } from '@rt-tools/ui-kit-v2';

import { AdminProposalDetailsAsideComponent } from './admin-proposal-details-aside.component';

/**
 * Оболочка админки: панель живёт маршрутом в аутлете `ro`, а рисует её правая шторка каркаса —
 * там же аутлет и объявлен.
 */
@Component({
    selector: 'admin-proposals-shell',
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
    selector: 'admin-proposals-list-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListStubComponent {}

function apiOne(patch: Partial<IProposal.Api> = {}): IProposal.Api {
    return {
        id: 'q1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        resource: 'rules/lists.md',
        address: 'Ловушки',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        text: 'ловушку стоит назвать',
        month: '2026-08',
        ...patch,
    };
}

describe('AdminProposalDetailsAsideComponent', () => {
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
        harness = await RouterTestingHarness.create(`/proposals(ro:proposals/${id})`);
        answer(http.expectOne((candidate): boolean => candidate.url === `${PROPOSALS_PATH}/${id}`));
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
                            { path: 'proposals', component: ListStubComponent },
                            { path: 'proposals/:id', pathMatch: 'full', outlet: 'ro', component: AdminProposalDetailsAsideComponent },
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
        await openDetails('q1', (request: TestRequest): void => request.flush(apiOne()));

        expect(router.url).toContain('(ro:proposals/q1)');
        expect(textOf('proposal-resource')).toBe('rules/lists.md');
        expect(textOf('proposal-tree')).toBe('Приёмник');
    });

    it('панель показывает и то, чего нет в строке списка: месяц записи', async () => {
        await openDetails('q1', (request: TestRequest): void => request.flush(apiOne({ month: '2026-07' })));

        expect(textOf('proposal-month')).toBe('2026-07');
    });

    it('текст предложения показан целиком и текстом, а не разметкой', async () => {
        const raw: string = '<script>alert(1)</script>ловушку стоит назвать';

        await openDetails('q1', (request: TestRequest): void => request.flush(apiOne({ text: raw })));

        expect(textOf('proposal-text')).toBe(raw);
        expect(shown('[qa-dataid="proposal-text"] script')).toBeNull();
    });

    it('записи, которой нет, панель говорит об этом, а не показывает пустые поля', async () => {
        await openDetails('gone', (request: TestRequest): void => request.flush('', { status: 404, statusText: 'Not Found' }));

        expect(textOf('proposal-details-missing')).toContain('Записи нет');
        expect(shown('[qa-dataid="proposal-text"]')).toBeNull();
    });

    it('не прочитавшаяся запись отличается от несуществующей', async () => {
        await openDetails('q1', (request: TestRequest): void => request.flush('', { status: 500, statusText: 'Server Error' }));

        expect(textOf('proposal-details-missing')).toContain('Прочитать запись не удалось');
    });

    it('открытая панель не трогает выборку списка: она остаётся в адресе', async () => {
        harness = await RouterTestingHarness.create('/proposals(ro:proposals/q1)?page=2&tree=a1b2');
        http.expectOne((candidate): boolean => candidate.url === `${PROPOSALS_PATH}/q1`).flush(apiOne());
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(router.url).toContain('page=2');
        expect(router.url).toContain('tree=a1b2');
        expect(shown('[qa-dataid="proposal-details-close"]')).not.toBeNull();
    });

    it('соседняя запись, названная адресом, читается заново', async () => {
        await openDetails('q1', (request: TestRequest): void => request.flush(apiOne()));
        await harness.navigateByUrl('/proposals(ro:proposals/q2)');
        http.expectOne((candidate): boolean => candidate.url === `${PROPOSALS_PATH}/q2`).flush(
            apiOne({ id: 'q2', resource: 'rules/testing.md' })
        );
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(textOf('proposal-resource')).toBe('rules/testing.md');
    });
});
