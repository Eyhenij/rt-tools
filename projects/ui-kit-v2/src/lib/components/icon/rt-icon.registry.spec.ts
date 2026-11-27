import { HttpResponse } from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PlatformService } from '@rt-tools/core';

import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import {
    RT_ICON_MATERIAL_FILL_SYMBOL_ID_PREFIX,
    RT_ICON_MATERIAL_SYMBOL_ID_PREFIX,
    RT_ICON_SET_SYMBOL_ID_PREFIX,
    RT_ICON_SPRITE_ID,
    RT_ICON_SYMBOL_ID_PREFIX,
} from './rt-icon.const';
import { IRtIcon } from './rt-icon.model';
import { provideRtIcons, IRtIconsOptions } from './rt-icon.providers';
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

/** Набор приложения: свой адрес, назначенный набором по умолчанию. */
function brand(options: IRtIconsOptions = { sets: [{ name: 'brand', url: '/brand' }], default: 'brand' }): Provider[] {
    return [provideRtIcons(options) as unknown as Provider];
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

        harness.registry.request('close', 'material', true);
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

    it('SC-UKV-1748 — символ спрайта несёт рисунок файла, а скрипт, вложенный HTML и обработчики в него не попадают', (): void => {
        const harness: IHarness = setup();
        const hostile: string = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onload="window.hit=1">',
            '<script>window.hit=2</script>',
            '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">чужое</div></foreignObject>',
            '<a href="javascript:window.hit=3"><path d="M0 0h20v20H0z" onclick="window.hit=4" fill="red"/></a>',
            '</svg>',
        ].join('');

        serve(harness, 'check', hostile);

        const symbol: Element | null = document.getElementById(`${RT_ICON_SYMBOL_ID_PREFIX}check`);
        expect(symbol?.getAttribute('viewBox')).toBe('0 0 20 20');
        expect(symbol?.querySelector('path')?.getAttribute('d')).toBe('M0 0h20v20H0z');
        expect(symbol?.querySelector('path')?.getAttribute('fill')).toBe('red');
        expect(symbol?.querySelectorAll('script, foreignObject')).toHaveLength(0);
        expect(symbol?.querySelector('[onclick], [onload]')).toBeNull();
        expect(symbol?.querySelector('a')?.hasAttribute('href')).toBe(false);
    });

    it('SC-UKV-1748 — стиль, анимация атрибутов, HTML в описании, внешняя картинка и схема скрипта, разбитая знаками, в символ не попадают', (): void => {
        const harness: IHarness = setup();
        const hostile: string = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">',
            '<style>body{display:none}</style>',
            '<desc><meta http-equiv="refresh" content="0;url=https://evil.example/"><link rel="stylesheet" href="https://evil.example/x.css"></desc>',
            '<image href="https://evil.example/pixel.png"/>',
            '<a href="java&#x09;script:window.hit=1"><path d="M0 0h20v20H0z"/>',
            '<set attributeName="href" to="javascript:window.hit=2"/>',
            '<animate attributeName="href" values="javascript:window.hit=3"/></a>',
            '</svg>',
        ].join('');

        serve(harness, 'check', hostile);

        const symbol: Element | null = document.getElementById(`${RT_ICON_SYMBOL_ID_PREFIX}check`);
        expect(symbol?.querySelector('path')?.getAttribute('d')).toBe('M0 0h20v20H0z');
        expect(symbol?.querySelectorAll('style, set, animate, meta, link, image')).toHaveLength(0);
        expect(symbol?.querySelector('a')?.hasAttribute('href')).toBe(false);
    });

    it('SC-UKV-1748 — файл с прологом XML и объявлением типа разбирается так же', (): void => {
        const harness: IHarness = setup();

        serve(
            harness,
            'check',
            `<?xml version="1.0"?><!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1 1"/></svg>`
        );

        const symbol: Element | null = document.getElementById(`${RT_ICON_SYMBOL_ID_PREFIX}check`);
        expect(symbol?.getAttribute('viewBox')).toBe('0 0 16 16');
        expect(symbol?.querySelectorAll('path')).toHaveLength(1);
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

    it('SC-UKV-1873 — имя, которого нет в перечне набора, берётся из запасного без лишнего запроса', (): void => {
        const harness: IHarness = setup();

        harness.registry.request('wallet', 'material');
        harness.http.expectOne('/icons/wallet.svg').flush(SVG);

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}wallet`]);
        expect(harness.registry.symbolHref('wallet', 'material')).toBe(`#${RT_ICON_SYMBOL_ID_PREFIX}wallet`);
    });

    it('SC-UKV-1874 — рисунка нет нигде: одно предупреждение с именем значка и набора', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const harness: IHarness = setup(brand());

        harness.registry.request('close', 'brand');
        harness.http.expectOne('/brand/close.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.http.expectOne('/icons/close.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.registry.request('close', 'brand');

        harness.http.verify();
        expect(warn.mock.calls).toEqual([['rt-icon: рисунка «close» нет ни в наборе «brand», ни в его запасных.']]);
        expect(symbolsInSprite()).toEqual([]);
        warn.mockRestore();
    });

    it('SC-UKV-1881 — набор приложения рисуется под своим символом, а недостающее берёт из kit', (): void => {
        const harness: IHarness = setup(brand());

        harness.registry.request('check', 'brand');
        harness.http.expectOne('/brand/check.svg').flush(SVG);
        harness.registry.request('wallet', 'brand');
        harness.http.expectOne('/brand/wallet.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.http.expectOne('/icons/wallet.svg').flush(SVG);

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--check`, `${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--wallet`]);
        expect(harness.registry.defaultSet).toBe('brand');
    });

    it('SC-UKV-1882 — один адрес скачивается один раз, и отказ по нему запоминается', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const harness: IHarness = setup(brand());

        // Два набора просят один и тот же адрес запасного, пока ответа ещё нет.
        harness.registry.request('wallet', 'kit');
        harness.registry.request('wallet', 'brand');
        harness.http.expectOne('/brand/wallet.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.http.expectOne('/icons/wallet.svg').flush(SVG);
        harness.registry.request('close', 'brand');
        harness.http.expectOne('/brand/close.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.http.expectOne('/icons/close.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });
        harness.registry.request('close', 'kit');

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}wallet`, `${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--wallet`]);
        warn.mockRestore();
    });

    it('SC-UKV-1882 — приехавший файл достаётся и тому, кто спросил его позже', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const harness: IHarness = setup(brand());

        harness.registry.request('wallet', 'kit');
        harness.http.expectOne('/icons/wallet.svg').flush(SVG);
        // Своего файла у набора нет, а запасной адрес уже скачан.
        harness.registry.request('wallet', 'brand');
        harness.http.expectOne('/brand/wallet.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}wallet`, `${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--wallet`]);
        warn.mockRestore();
    });

    it('SC-UKV-1895 — ответ без завершения потока рисует значок и ведёт в запасной набор', (): void => {
        const harness: IHarness = setup(brand());
        // `flush` завершает поток сам. Одно событие ответа без завершения отдаёт перехватчик
        // приложения, который держится за долгоживущий поток.
        const answer: (url: string, body: string) => void = (url: string, body: string): void =>
            harness.http.expectOne(url).event(new HttpResponse<string>({ body }));

        harness.registry.request('copy', 'brand');
        answer('/brand/copy.svg', '<!doctype html><html></html>');
        answer('/icons/copy.svg', SVG);

        expect(symbolsInSprite()).toEqual([`${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--copy`]);
        expect(harness.registry.ready(`${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--copy`)()).toBe(true);
    });

    it('SC-UKV-1895 — ошибка после ответа не отнимает файл у того, кто спросил его позже', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const harness: IHarness = setup(brand());

        harness.registry.request('wallet', 'kit');
        const first: TestRequest = harness.http.expectOne('/icons/wallet.svg');
        first.event(new HttpResponse<string>({ body: SVG }));
        first.error(new ProgressEvent('error'));
        harness.registry.request('wallet', 'brand');
        harness.http.expectOne('/brand/wallet.svg').flush('нет такого файла', { status: 404, statusText: 'Not Found' });

        harness.http.verify();
        expect(symbolsInSprite()).toEqual([`${RT_ICON_SYMBOL_ID_PREFIX}wallet`, `${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--wallet`]);
        warn.mockRestore();
    });

    it('SC-UKV-1890 —страница с кодом 200 вместо файла ведёт в запасной набор', (): void => {
        const harness: IHarness = setup(brand());

        harness.registry.request('copy', 'brand');
        harness.http.expectOne('/brand/copy.svg').flush('<!doctype html><html><body><svg><circle r="1"/></svg></body></html>');
        harness.http
            .expectOne('/icons/copy.svg')
            .flush(`<?xml version="1.0"?>\n<!-- рисунок -->\n<!DOCTYPE svg [ <!ENTITY ns "u"> ]>\n${SVG}`);

        const symbol: Element | null = document.getElementById(`${RT_ICON_SET_SYMBOL_ID_PREFIX}brand--copy`);

        expect(symbol?.querySelector('path')).not.toBeNull();
        expect(symbol?.querySelector('circle')).toBeNull();
    });

    it('SC-UKV-64 — на сервере набор не грузится', (): void => {
        const harness: IHarness = setup([{ provide: PlatformService, useValue: { isPlatformBrowser: false } }]);

        harness.registry.request('check');

        harness.http.expectNone('/icons/check.svg');
        expect(symbolsInSprite()).toEqual([]);
    });
});
