import { loadPageScripts } from './kc-page-scripts';

/** The theme properties that carry the counter numbers; the login node sets them in its environment. */
export enum ECounterProperty {
    Ga = 'GA_MEASUREMENT_ID',
    Metrika = 'METRIKA_COUNTER_ID',
}

/** The event a form that leaves the page sends; it carries the page id and no field value. */
export const FORM_SUBMIT_EVENT: string = 'auth_form_submit';

/** The counters a page loads; a number that is absent or malformed loads nothing. */
export interface ICounters {
    readonly ga: string | null;
    readonly metrika: number | null;
}

/** The theme properties Keycloak puts on the page. */
export type TThemeProperties = Readonly<Record<string, string | undefined>>;

type TQueueCall = (...args: unknown[]) => void;

const GA_ID: RegExp = /^G-[A-Z0-9]+$/;
const METRIKA_ID: RegExp = /^[1-9]\d*$/;

const GA_SCRIPT: string = 'https://www.googletagmanager.com/gtag/js?id=';
const METRIKA_SCRIPT: string = 'https://mc.yandex.ru/metrika/tag.js';

/** The counter numbers of the page, read from the theme properties. */
export function countersOf(properties: TThemeProperties | undefined): ICounters {
    const ga: string = (properties?.[ECounterProperty.Ga] ?? '').trim();
    const metrika: string = (properties?.[ECounterProperty.Metrika] ?? '').trim();

    return {
        ga: GA_ID.test(ga) ? ga : null,
        metrika: METRIKA_ID.test(metrika) ? Number(metrika) : null,
    };
}

function queueOf(view: Window, name: string): unknown[] {
    const current: unknown = Reflect.get(view, name);
    if (Array.isArray(current)) {
        return current;
    }
    const created: unknown[] = [];
    Reflect.set(view, name, created);

    return created;
}

/**
 * The global `gtag` of the page. gtag.js reads only `arguments` objects from its queue and skips an
 * array without a word, so the call pushes `arguments` itself and not a copy of it.
 */
function startGa(view: Window, id: string, pageId: string): TQueueCall {
    const queue: unknown[] = queueOf(view, 'dataLayer');
    const gtag: TQueueCall = function (): void {
        // The tag tells a command by its `arguments` object: a rest array would be skipped.
        // eslint-disable-next-line sonarjs/arguments-usage
        queue.push(arguments);
    };
    Reflect.set(view, 'gtag', gtag);
    gtag('js', new Date());
    // The tag sends the page view of the load itself; the page id goes with every event of the page.
    gtag('config', id, { page_id: pageId });
    loadPageScripts(view.document, [`${GA_SCRIPT}${id}`]);

    return gtag;
}

/**
 * The global `ym` of the page: the queue the Metrika tag reads on load. Webvisor masks what is
 * typed into the fields: a field is recorded only when its markup asks for it, and the theme marks
 * none.
 */
function startMetrika(view: Window, id: number, pageId: string): TQueueCall {
    const ym: TQueueCall & { a?: unknown[]; l?: number } = function (): void {
        ym.a = ym.a ?? [];
        // The tag reads its queue as the `arguments` objects of the calls, the way its snippet keeps them.
        // eslint-disable-next-line sonarjs/arguments-usage
        ym.a.push(arguments);
    };
    ym.l = Date.now();
    Reflect.set(view, 'ym', ym);
    ym(id, 'init', { defer: true, webvisor: true, clickmap: true, trackLinks: true, accurateTrackBounce: true });
    ym(id, 'hit', view.location.href, { title: view.document.title, params: { page_id: pageId } });
    loadPageScripts(view.document, [METRIKA_SCRIPT]);

    return ym;
}

/**
 * Loads the counters whose numbers are set, sends the page view and reports every form that leaves
 * the page. A form the page held as invalid is not reported: its submit is prevented before the
 * event reaches the document. No field value goes into an event.
 */
export function startCounters(view: Window, properties: TThemeProperties | undefined, pageId: string): void {
    const counters: ICounters = countersOf(properties);
    const gtag: TQueueCall | null = counters.ga === null ? null : startGa(view, counters.ga, pageId);
    const ym: TQueueCall | null = counters.metrika === null ? null : startMetrika(view, counters.metrika, pageId);
    if (gtag === null && ym === null) {
        return;
    }
    view.document.addEventListener('submit', (event: Event): void => {
        if (event.defaultPrevented) {
            return;
        }
        gtag?.('event', FORM_SUBMIT_EVENT, { page_id: pageId, transport_type: 'beacon' });
        ym?.(counters.metrika, 'reachGoal', FORM_SUBMIT_EVENT, { page_id: pageId });
    });
}
