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

/** The query parameters of an entry address that carry a person's data. */
const PRIVATE_PARAMS: readonly string[] = ['key', 'login_hint'];

/**
 * The nodes that show a person's data as page text. A Keycloak message may name the address — on a
 * message page it stands in the title or the summary, on a standard page in its alert — so every
 * message node is hidden, together with the address on the confirmation page and the name the
 * standard pages show above a form.
 */
const PRIVATE_NODES: string = [
    '[qa-dataid="kc-verify-sent"]',
    '[qa-dataid="kc-message"]',
    '[qa-dataid="kc-title"]',
    '[qa-dataid="kc-info-summary"]',
    '#kc-attempted-username',
    '.pf-c-alert',
].join(', ');

/** The class by which Webvisor records a node with its text hidden. */
const WEBVISOR_HIDDEN: string = 'ym-hide-content';

/** The class by which Webvisor records no key pressed in a field. */
const WEBVISOR_NO_KEYS: string = 'ym-disable-keys';

/** The fields a person types into. */
const TYPED_FIELDS: string = 'input, textarea';

const GA_SCRIPT: string = 'https://www.googletagmanager.com/gtag/js?id=';
const METRIKA_SCRIPT: string = 'https://mc.yandex.ru/metrika/tag.js';

/** The page name the counters report: the template id without its `.ftl`, such as `login` or `register`. */
export function pageNameOf(pageId: string): string {
    return pageId.replace(/\.ftl$/, '');
}

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
 * The global `ym` of the page: the queue the Metrika tag reads on load. What is typed into the fields
 * Webvisor does not record: every field carries the class that forbids recording its keys.
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
 * Takes out of the page address the query parameters that carry a person's data: the action token
 * of a mail link holds the address, and an application may pass the address as a login hint. The
 * counters report the page address, so the address is replaced in the history before they start.
 */
export function dropPrivateParams(view: Window): void {
    const address: URL = new URL(view.location.href);
    const before: string = address.search;
    PRIVATE_PARAMS.forEach((name: string): void => address.searchParams.delete(name));
    if (address.search !== before) {
        view.history.replaceState(view.history.state, '', address.toString());
    }
}

/** Leads to a full address: in this tab, or in a new one when the person asked for a new tab. */
export type TGoTo = (href: string, newTab: boolean) => void;

/** The elements of a subtree that match a selector, the root itself included. */
function matching(root: ParentNode, selector: string): Element[] {
    const own: Element[] = root instanceof Element && root.matches(selector) ? [root] : [];

    return [...own, ...Array.from(root.querySelectorAll(selector))];
}

/**
 * Marks every node that shows a person's address, name or a message about them as hidden from
 * Webvisor, and every field as one whose keys it does not record.
 */
export function hidePrivateText(root: ParentNode): void {
    matching(root, PRIVATE_NODES).forEach((node: Element): void => node.classList.add(WEBVISOR_HIDDEN));
    matching(root, TYPED_FIELDS).forEach((node: Element): void => node.classList.add(WEBVISOR_NO_KEYS));
}

/** The address without the query parameters that carry a person's data; null when it has none of them. */
function withoutPrivateParams(href: string, base: string): string | null {
    const address: URL = new URL(href, base);
    if (!PRIVATE_PARAMS.some((name: string): boolean => address.searchParams.has(name))) {
        return null;
    }
    PRIVATE_PARAMS.forEach((name: string): void => address.searchParams.delete(name));

    return address.toString();
}

/** The full address of every link whose markup shows it without the private parameters. */
const FULL_LINKS: WeakMap<Element, string> = new WeakMap<Element, string>();

function asksNewTab(event: MouseEvent): boolean {
    return event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey;
}

function followFull(link: Element, go: TGoTo): void {
    const lead: (event: Event) => void = (event: Event): void => {
        if (!(event instanceof MouseEvent) || (event.type === 'auxclick' && event.button !== 1)) {
            return;
        }
        event.preventDefault();
        go(FULL_LINKS.get(link) ?? '', asksNewTab(event));
    };
    link.addEventListener('click', lead);
    link.addEventListener('auxclick', lead);
}

/**
 * Takes the private query parameters out of the link addresses in the markup, which Webvisor records
 * with its attributes: the «proceed» link of a mail page leads to the action token, and the token
 * holds the address. A click, a middle click and a click with a modifier still lead to the full
 * address, passed to `go`; only «open in a new tab» from the context menu gets the shown one.
 */
export function hidePrivateLinks(root: ParentNode, go: TGoTo): void {
    matching(root, 'a[href]').forEach((link: Element): void => {
        const href: string = link.getAttribute('href') ?? '';
        const shown: string | null = withoutPrivateParams(href, link.ownerDocument.baseURI);
        if (shown === null) {
            return;
        }
        if (!FULL_LINKS.has(link)) {
            followFull(link, go);
        }
        FULL_LINKS.set(link, href);
        link.setAttribute('href', shown);
    });
}

/**
 * Keeps the marks on what the page draws later: a standard page of the template is drawn after its
 * styles load, that is after the counters start, and a message appears after an action. The watch
 * is set before a tag starts, so it sees every node before the recording does.
 */
function watchPage(document: Document, go: TGoTo): void {
    const mark: (root: ParentNode) => void = (root: ParentNode): void => {
        hidePrivateText(root);
        hidePrivateLinks(root, go);
    };
    mark(document);
    new MutationObserver((records: MutationRecord[]): void => {
        records.forEach((record: MutationRecord): void => {
            if (record.type === 'attributes' && record.target instanceof Element) {
                mark(record.target);
            }
            record.addedNodes.forEach((node: Node): void => {
                if (node instanceof Element) {
                    mark(node);
                }
            });
        });
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
}

/**
 * Loads the counters whose numbers are set, sends the page view and reports every form that leaves
 * the page. A form the page held as invalid is not reported: its submit is prevented before the
 * event reaches the document. No field value goes into an event.
 */
export function startCounters(view: Window, properties: TThemeProperties | undefined, templateId: string): void {
    const counters: ICounters = countersOf(properties);
    const pageId: string = pageNameOf(templateId);
    if (counters.ga === null && counters.metrika === null) {
        return;
    }
    // Both run before a tag is loaded: the tags read the address and record the page from their start.
    dropPrivateParams(view);
    watchPage(view.document, (href: string, newTab: boolean): void => {
        if (newTab) {
            view.open(href, '_blank', 'noopener');
        } else {
            view.location.assign(href);
        }
    });
    const gtag: TQueueCall | null = counters.ga === null ? null : startGa(view, counters.ga, pageId);
    const ym: TQueueCall | null = counters.metrika === null ? null : startMetrika(view, counters.metrika, pageId);
    view.document.addEventListener('submit', (event: Event): void => {
        if (event.defaultPrevented) {
            return;
        }
        gtag?.('event', FORM_SUBMIT_EVENT, { page_id: pageId, transport_type: 'beacon' });
        ym?.(counters.metrika, 'reachGoal', FORM_SUBMIT_EVENT, { page_id: pageId });
    });
}
