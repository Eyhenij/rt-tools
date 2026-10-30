/** The colour scheme of the reCAPTCHA widget; Google draws only these two. */
export type TRecaptchaTheme = 'light' | 'dark';

/** What the widget is drawn with: the site key of the realm, its scheme and its action. */
export interface IRecaptchaParams {
    readonly sitekey: string;
    readonly theme: TRecaptchaTheme;
    readonly action?: string;
}

/** The part of the Google script the theme calls. */
export interface IRecaptchaApi {
    ready(done: () => void): void;
    render(container: HTMLElement, params: IRecaptchaParams): number;
}

/** The address part of the Google script Keycloak lists for the page. */
const SCRIPT_PATH: string = '/recaptcha/api.js';

function recaptchaOf(view: Window): IRecaptchaApi | null {
    const api: unknown = Reflect.get(view, 'grecaptcha');

    return typeof api === 'object' && api !== null && typeof Reflect.get(api, 'ready') === 'function' ? (api as IRecaptchaApi) : null;
}

function scriptOf(view: Window): HTMLScriptElement | undefined {
    return Array.from(view.document.scripts).find((node: HTMLScriptElement): boolean => node.src.includes(SCRIPT_PATH));
}

/**
 * Calls back once the Google script is ready. The frame of the page adds the script after the
 * first draw, and the page may ask before that: then the call waits for the script to be added
 * and for its `load`.
 */
export function whenRecaptchaReady(view: Window & typeof globalThis, done: (api: IRecaptchaApi) => void): void {
    const api: IRecaptchaApi | null = recaptchaOf(view);
    if (api !== null) {
        api.ready((): void => done(api));

        return;
    }
    const script: HTMLScriptElement | undefined = scriptOf(view);
    if (script !== undefined) {
        script.addEventListener('load', (): void => whenRecaptchaReady(view, done), { once: true });

        return;
    }
    const watch: MutationObserver = new view.MutationObserver((): void => {
        if (scriptOf(view) !== undefined) {
            watch.disconnect();
            whenRecaptchaReady(view, done);
        }
    });
    watch.observe(view.document.head, { childList: true });
}

/**
 * Draws the widget into a fresh node of the block and drops the one drawn before. Google draws a
 * node once and never changes its scheme, so a switch of the page theme draws the widget anew.
 */
export function drawRecaptcha(api: IRecaptchaApi, block: HTMLElement, params: IRecaptchaParams): void {
    const slot: HTMLElement = block.ownerDocument.createElement('div');
    block.replaceChildren(slot);
    api.render(slot, params);
}
