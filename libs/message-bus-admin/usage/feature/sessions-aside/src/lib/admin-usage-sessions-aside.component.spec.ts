import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { USAGE_PATH } from '@rt/message-bus-admin/usage/util';
import { IUsageSessionRow } from '@rt/message-bus-common';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective } from '@rt-tools/ui-kit-v2';

import { AdminUsageSessionsAsideComponent } from './admin-usage-sessions-aside.component';

/**
 * Оболочка админки: панель живёт маршрутом в аутлете `ro`, а рисует её правая шторка каркаса —
 * там же аутлет и объявлен.
 */
@Component({
    selector: 'admin-usage-shell',
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
    selector: 'admin-usage-list-stub',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListStubComponent {}

const SESSIONS: readonly IUsageSessionRow[] = [
    { day: '2026-08-13', sid: 'b2', count: 1 },
    { day: '2026-08-12', sid: 'a1', count: 2 },
];

describe('AdminUsageSessionsAsideComponent', () => {
    let harness: RouterTestingHarness;
    let http: HttpTestingController;
    let router: Router;

    /** Разметка панели уезжает в шторку контейнера, и в дереве фикстуры её уже нет. */
    function shown(selector: string): Element | null {
        return document.querySelector(selector);
    }

    function textsOf(qaId: string): readonly string[] {
        return Array.from(document.querySelectorAll(`[qa-dataid="${qaId}"]`)).map(
            (node: Element): string => node.textContent?.trim() ?? ''
        );
    }

    /** Открывает панель по адресу и отвечает за приёмник тем, чем сказано. */
    async function openPanel(url: string, answer: (request: TestRequest) => void): Promise<TestRequest> {
        harness = await RouterTestingHarness.create(url);

        const request: TestRequest = http.expectOne((candidate): boolean => candidate.url.startsWith(`${USAGE_PATH}/`));

        answer(request);
        await harness.fixture.whenStable();
        harness.detectChanges();

        return request;
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
                            { path: 'usage', component: ListStubComponent },
                            { path: 'usage/:skill', pathMatch: 'full', outlet: 'ro', component: AdminUsageSessionsAsideComponent },
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
     */
    afterEach(async () => {
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 50);
        });
        TestBed.resetTestingModule();
    });

    it('SC-MB-350 — панель читает сессии скила из адреса за дерево и период из той же выборки', async () => {
        const request: TestRequest = await openPanel(
            '/usage(ro:usage/testing)?tree=a1b2&from=2026-08-01&to=2026-08-31',
            (asked: TestRequest): void => asked.flush(SESSIONS)
        );

        expect(request.request.url).toBe(`${USAGE_PATH}/testing/sessions`);
        expect(request.request.params.get('tree')).toBe('a1b2');
        expect(request.request.params.get('from')).toBe('2026-08-01');
        expect(request.request.params.get('to')).toBe('2026-08-31');
        expect(router.url).toContain('(ro:usage/testing)');
        expect(textsOf('usage-session-sid')).toEqual(['b2', 'a1']);
        expect(textsOf('usage-session-count')).toEqual(['Раз: 1', 'Раз: 2']);
    });

    it('SC-MB-353 — период, которого адрес не назвал, в запрос сессий не уходит: его подставит приёмник', async () => {
        const request: TestRequest = await openPanel('/usage(ro:usage/testing)?tree=a1b2', (asked: TestRequest): void => asked.flush([]));

        expect(request.request.params.has('from')).toBe(false);
        expect(request.request.params.has('to')).toBe(false);
        expect(textsOf('usage-sessions-missing')).toEqual(['За период этот скил не грузила ни одна сессия']);
    });

    it('не прочитавшиеся сессии объясняют себя словами, а не пустым местом', async () => {
        await openPanel('/usage(ro:usage/testing)?tree=a1b2', (asked: TestRequest): void =>
            asked.flush('', { status: 500, statusText: 'Server Error' })
        );

        expect(shown('[qa-dataid="usage-sessions-failed"]')?.textContent).toContain('Прочитать сессии не удалось');
        expect(shown('[qa-dataid="usage-sessions-missing"]')).toBeNull();
    });

    it('соседний скил, названный адресом, читается заново', async () => {
        await openPanel('/usage(ro:usage/testing)?tree=a1b2', (asked: TestRequest): void => asked.flush(SESSIONS));
        await harness.navigateByUrl('/usage(ro:usage/lists)?tree=a1b2');
        http.expectOne((candidate): boolean => candidate.url === `${USAGE_PATH}/lists/sessions`).flush([
            { day: '2026-08-13', sid: 'c3', count: 4 },
        ]);
        await harness.fixture.whenStable();
        harness.detectChanges();

        expect(textsOf('usage-session-sid')).toEqual(['c3']);
        expect(shown('[qa-dataid="usage-sessions-close"]')).not.toBeNull();
    });
});
