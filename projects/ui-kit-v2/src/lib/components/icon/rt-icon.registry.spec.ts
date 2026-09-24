import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PlatformService } from '@rt-tools/core';

import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import {
    RT_ICON_MATERIAL_FILL_SYMBOL_ID_PREFIX,
    RT_ICON_MATERIAL_SYMBOL_ID_PREFIX,
    RT_ICON_SPRITE_ID,
    RT_ICON_SYMBOL_ID_PREFIX,
} from './rt-icon.const';
import { IRtIcon } from './rt-icon.model';
import { RtIconRegistry } from './rt-icon.registry';

const SVG: string = '<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>';

interface IHarness {
    registry: RtIconRegistry;
    http: HttpTestingController;
}

function setup(extra: Provider[] = []): IHarness {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting(), ...extra] });

    return {
        registry: TestBed.inject(RtIconRegistry),
        http: TestBed.inject(HttpTestingController),
    };
}

/** Просит имя и отдаёт ему файл значка. Возвращает запрос, который при этом ушёл. */
function serve(harness: IHarness, name: IRtIcon.Name, body: string = SVG): TestRequest {
    harness.registry.request(name);
    const request: TestRequest = harness.http.expectOne(`/icons/${name}.svg`);
    request.flush(body);

    return request;
}

function symbolsInSprite(): string[] {
    const sprite: Element | null = document.getElementById(RT_ICON_SPRITE_ID);

    return sprite ? Array.from(sprite.children).map((symbol: Element): string => symbol.id) : [];
}

describe('RtIconRegistry', (): void => {
    afterEach((): void => {
        document.getElementById(RT_ICON_SPRITE_ID)?.remove();
    });

    it('SC-UKV-58 — страница грузит только те значки, которые нарисовала', (): void => {
        const harness: IHarness = setup();

        serve(harness, 'check');
        serve(harness, 'spinner');
        serve(harness, 'wallet');

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([
            `${RT_ICON_SYMBOL_ID_PREFIX}check`,
            `${RT_ICON_SYMBOL_ID_PREFIX}spinner`,
            `${RT_ICON_SYMBOL_ID_PREFIX}wallet`,
        ]);
    });

    it('SC-UKV-59 — повторный запрос того же имени сети не трогает', (): void => {
        const harness: IHarness = setup();

        serve(harness, 'check');
        harness.registry.request('check');

        harness.http.expectNone('/icons/check.svg');
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}check`]);
    });

    it('SC-UKV-60 — отказ одного имени гасит только его значок', (): void => {
        const harness: IHarness = setup();

        serve(harness, 'check');
        harness.registry.request('wallet');
        harness.http.expectOne('/icons/wallet.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        serve(harness, 'spinner');

        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}check`, `${RT_ICON_SYMBOL_ID_PREFIX}spinner`]);
    });

    it('SC-UKV-130 — не приехавший материальный рисунок закрывается своим', (): void => {
        const harness: IHarness = setup();

        harness.registry.request('close', 'material');
        harness.http.expectOne('/icons-material/close.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.http.expectOne('/icons/close.svg').flush(SVG);

        expect(symbolsInSprite()).toEqual([`${RT_ICON_MATERIAL_SYMBOL_ID_PREFIX}close`]);
    });

    it('SC-UKV-364 — не приехавший залитый рисунок закрывается контурным того же набора', (): void => {
        const harness: IHarness = setup();

        harness.registry.request('close', 'material-fill');
        harness.http.expectOne('/icons-material/close.fill.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.http.expectOne('/icons-material/close.svg').flush(SVG);

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([`${RT_ICON_MATERIAL_FILL_SYMBOL_ID_PREFIX}close`]);
    });

    it('SC-UKV-60 — отказ своего имени вторым запросом не закрывается', (): void => {
        const harness: IHarness = setup();

        harness.registry.request('close');
        harness.http.expectOne('/icons/close.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([]);
    });

    it('SC-UKV-62 — смена имени тянет новое, а прежний символ остаётся', (): void => {
        const harness: IHarness = setup();

        serve(harness, 'check');
        serve(harness, 'wallet');
        harness.registry.request('check');

        harness.http.expectNone('/icons/check.svg');
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}check`, `${RT_ICON_SYMBOL_ID_PREFIX}wallet`]);
    });

    it('SC-UKV-63 — символ, уже лежащий в спрайте страницы, запроса не даёт', (): void => {
        const sprite: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sprite.id = RT_ICON_SPRITE_ID;
        sprite.innerHTML = `<symbol id="${RT_ICON_SYMBOL_ID_PREFIX}check" viewBox="0 0 16 16"></symbol>`;
        document.body.insertBefore(sprite, document.body.firstChild);
        const harness: IHarness = setup();

        harness.registry.request('check');

        harness.http.expectNone('/icons/check.svg');
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}check`]);
    });

    it('символ несёт viewBox исходного файла и его содержимое', (): void => {
        const harness: IHarness = setup();

        serve(harness, 'check');

        const symbol: Element | null = document.getElementById(`${RT_ICON_SYMBOL_ID_PREFIX}check`);
        expect(symbol?.getAttribute('viewBox')).toBe('0 0 16 16');
        expect(symbol?.innerHTML).toContain('<path');
    });

    it('спрайт лежит первым узлом страницы и заводится один на все значки', (): void => {
        const harness: IHarness = setup();

        serve(harness, 'check');
        serve(harness, 'wallet');

        expect(document.body.firstChild).toBe(document.getElementById(RT_ICON_SPRITE_ID));
        expect(document.querySelectorAll(`#${RT_ICON_SPRITE_ID}`)).toHaveLength(1);
    });

    it('SC-UKV-64 — на сервере набор не грузится', (): void => {
        const harness: IHarness = setup([{ provide: PlatformService, useValue: { isPlatformBrowser: false } }]);

        harness.registry.request('check');

        harness.http.expectNone('/icons/check.svg');
        expect(symbolsInSprite()).toEqual([]);
    });
});
