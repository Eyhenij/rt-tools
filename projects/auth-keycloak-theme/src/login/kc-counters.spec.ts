import { countersOf, FORM_SUBMIT_EVENT, hidePrivateLinks, pageNameOf, startCounters } from './kc-counters';

const GA: string = 'G-TEST123';
const METRIKA: string = '12345678';

/** The calls a queue holds, each turned from its `arguments` object into a plain list. */
function callsOf(queue: unknown): unknown[][] {
    return Array.isArray(queue) ? queue.map((call: unknown): unknown[] => Array.from(call as ArrayLike<unknown>)) : [];
}

function scriptSources(): string[] {
    return Array.from(document.scripts, (script: HTMLScriptElement): string => script.getAttribute('src') ?? '');
}

/** A form with one filled field, submitted by the browser the way a plain submit goes. */
function submitForm(held: boolean): void {
    const form: HTMLFormElement = document.createElement('form');
    const field: HTMLInputElement = document.createElement('input');
    field.name = 'username';
    field.value = 'person@example.com';
    form.appendChild(field);
    if (held) {
        form.addEventListener('submit', (event: Event): void => event.preventDefault());
    }
    document.body.appendChild(form);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.remove();
}

describe('countersOf', () => {
    it('SC-AUTH-108 — an empty or malformed number loads no counter', () => {
        expect(countersOf(undefined)).toEqual({ ga: null, metrika: null });
        expect(countersOf({ GA_MEASUREMENT_ID: '', METRIKA_COUNTER_ID: ' ' })).toEqual({ ga: null, metrika: null });
        expect(countersOf({ GA_MEASUREMENT_ID: 'UA-1-1', METRIKA_COUNTER_ID: '12ab' })).toEqual({ ga: null, metrika: null });
        expect(countersOf({ GA_MEASUREMENT_ID: ` ${GA} `, METRIKA_COUNTER_ID: METRIKA })).toEqual({ ga: GA, metrika: 12345678 });
    });
});

describe('pageNameOf', () => {
    it('SC-AUTH-109 — the page name is the template id without its extension', () => {
        expect(pageNameOf('login-reset-password.ftl')).toBe('login-reset-password');
        expect(pageNameOf('login')).toBe('login');
    });
});

describe('startCounters', () => {
    afterEach(() => {
        ['dataLayer', 'gtag', 'ym'].forEach((name: string): boolean => Reflect.deleteProperty(window, name));
        document.querySelectorAll('script').forEach((node: Element): void => node.remove());
    });

    it('SC-AUTH-108 — a page without numbers adds no script and no queue', () => {
        startCounters(window, {}, 'login');

        expect(scriptSources()).toEqual([]);
        expect(Reflect.get(window, 'dataLayer')).toBeUndefined();
        expect(Reflect.get(window, 'ym')).toBeUndefined();
    });

    it('SC-AUTH-109 — the GA queue holds `arguments` objects with the config of the page id', () => {
        startCounters(window, { GA_MEASUREMENT_ID: GA }, 'register.ftl');
        const queue: unknown = Reflect.get(window, 'dataLayer');

        expect(Array.isArray(queue) && Object.prototype.toString.call(queue[0])).toBe('[object Arguments]');
        expect(callsOf(queue)[1]).toEqual(['config', GA, { page_id: 'register' }]);
        expect(scriptSources()).toEqual([`https://www.googletagmanager.com/gtag/js?id=${GA}`]);
    });

    it('SC-AUTH-110 — Metrika starts with Webvisor and sends the hit of the page', () => {
        document.title = 'rt';
        startCounters(window, { METRIKA_COUNTER_ID: METRIKA }, 'login');
        const calls: unknown[][] = callsOf(Reflect.get(Reflect.get(window, 'ym') as object, 'a'));

        expect(calls[0]).toEqual([12345678, 'init', expect.objectContaining({ webvisor: true, defer: true })]);
        expect(calls[1]).toEqual([12345678, 'hit', window.location.href, { title: 'rt', params: { page_id: 'login' } }]);
        expect(scriptSources()).toEqual(['https://mc.yandex.ru/metrika/tag.js']);
    });

    it('SC-AUTH-111 — a form that leaves the page sends the event with the page id and no field value', () => {
        startCounters(window, { GA_MEASUREMENT_ID: GA, METRIKA_COUNTER_ID: METRIKA }, 'login');
        submitForm(false);
        const ga: unknown[][] = callsOf(Reflect.get(window, 'dataLayer'));
        const ym: unknown[][] = callsOf(Reflect.get(Reflect.get(window, 'ym') as object, 'a'));

        expect(ga.at(-1)).toEqual(['event', FORM_SUBMIT_EVENT, { page_id: 'login', transport_type: 'beacon' }]);
        expect(ym.at(-1)).toEqual([12345678, 'reachGoal', FORM_SUBMIT_EVENT, { page_id: 'login' }]);
        expect(JSON.stringify([ga, ym])).not.toContain('person@example.com');
    });

    it('SC-AUTH-113 — the address loses the action token and the login hint before a tag starts', () => {
        window.history.replaceState(
            null,
            '',
            '/realms/rt/login-actions/action-token?key=eyJ.token&client_id=app&login_hint=ann%40rt.localhost'
        );
        startCounters(window, { METRIKA_COUNTER_ID: METRIKA }, 'info.ftl');
        const calls: unknown[][] = callsOf(Reflect.get(Reflect.get(window, 'ym') as object, 'a'));

        expect(window.location.search).toBe('?client_id=app');
        expect(String(calls[1][2])).not.toContain('key=');
        expect(String(calls[1][2])).not.toContain('login_hint');
        window.history.replaceState(null, '', '/');
    });

    it('SC-AUTH-114 — the nodes that show a person are hidden from Webvisor before a tag starts', () => {
        document.body.innerHTML =
            '<p qa-dataid="kc-verify-sent">ann@rt.localhost</p><div id="kc-attempted-username">ann</div>' +
            '<div class="pf-c-alert">No account for bob@rt.localhost</div><p>other</p>';
        startCounters(window, { METRIKA_COUNTER_ID: METRIKA }, 'login-verify-email.ftl');

        expect(Array.from(document.querySelectorAll('.ym-hide-content'), (node: Element): string => node.textContent ?? '')).toEqual([
            'ann@rt.localhost',
            'ann',
            'No account for bob@rt.localhost',
        ]);
        document.body.innerHTML = '';
    });

    it('SC-AUTH-110 — every field carries the class by which Webvisor records none of its keys', () => {
        document.body.innerHTML = '<form><input name="username" /><input type="password" name="password" /><textarea></textarea></form>';
        startCounters(window, { METRIKA_COUNTER_ID: METRIKA }, 'login.ftl');

        expect(document.querySelectorAll('input, textarea')).toHaveLength(3);
        expect(document.querySelectorAll('input:not(.ym-disable-keys), textarea:not(.ym-disable-keys)')).toHaveLength(0);
        document.body.innerHTML = '';
    });

    it('SC-AUTH-113 — a link to the action token shows no token in the markup and still leads to it', () => {
        const target: string = 'http://localhost/realms/rt/login-actions/action-token?key=eyJ.token&client_id=app';
        document.body.innerHTML = `<a qa-dataid="kc-info-next" href="${target}">Next</a><a href="/realms/rt/account">Account</a>`;
        const go: jest.Mock = jest.fn();
        hidePrivateLinks(document, go);
        const next: HTMLAnchorElement = document.querySelector('[qa-dataid="kc-info-next"]') as HTMLAnchorElement;

        expect(next.getAttribute('href')).toBe('http://localhost/realms/rt/login-actions/action-token?client_id=app');
        expect(document.body.innerHTML).not.toContain('key=');
        next.click();
        next.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
        next.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }));
        expect(go.mock.calls).toEqual([
            [target, false],
            [target, true],
            [target, true],
        ]);
        expect(document.querySelector('a:not([qa-dataid])')?.getAttribute('href')).toBe('/realms/rt/account');
        document.body.innerHTML = '';
    });

    it('SC-AUTH-114 — a node the page draws after the counters start is hidden before the recording sees it', async () => {
        document.body.innerHTML = '';
        startCounters(window, { METRIKA_COUNTER_ID: METRIKA }, 'login-otp.ftl');
        document.body.insertAdjacentHTML(
            'beforeend',
            '<header><span id="kc-attempted-username">ann@rt.localhost</span></header><form><input name="otp" /></form>' +
                '<a href="/realms/rt/login-actions/action-token?key=eyJ.token">Next</a>'
        );
        await Promise.resolve();

        expect(document.querySelector('#kc-attempted-username')?.classList).toContain('ym-hide-content');
        expect(document.querySelector('input')?.classList).toContain('ym-disable-keys');
        expect(document.querySelector('a')?.getAttribute('href')).toBe('http://localhost/realms/rt/login-actions/action-token');
        document.body.innerHTML = '';
    });

    it('SC-AUTH-112 — a form the page holds as invalid sends no event', () => {
        startCounters(window, { GA_MEASUREMENT_ID: GA }, 'login');
        const before: number = callsOf(Reflect.get(window, 'dataLayer')).length;
        submitForm(true);

        expect(callsOf(Reflect.get(window, 'dataLayer'))).toHaveLength(before);
    });
});
