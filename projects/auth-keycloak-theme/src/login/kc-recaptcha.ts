/** The colour scheme of the reCAPTCHA widget; Google draws only these two. */
export enum ERecaptchaTheme {
    Light = 'light',
    Dark = 'dark',
}

/** What the checkbox widget is drawn with: the site key of the realm and its scheme. */
export interface IRecaptchaParams {
    readonly sitekey: string;
    readonly theme: ERecaptchaTheme;
}

/** The part of the Google script the theme calls. */
export interface IRecaptchaApi {
    ready(done: () => void): void;
    render(container: HTMLElement, params: IRecaptchaParams): number;
    getResponse(widget: number): string;
}

/** What Keycloak says about reCAPTCHA in the context of the registration page. */
export interface IRecaptchaContext {
    readonly recaptchaRequired?: boolean;
    readonly recaptchaVisible?: boolean;
    readonly recaptchaAction?: string;
    readonly recaptchaSiteKey?: string;
}

/**
 * The site key of the checkbox widget, or `null` when the realm asks for no visible widget. A
 * Keycloak that knows no invisible check names neither the visibility nor the action, and its
 * check is the visible one — the same condition the standard page holds.
 */
export function recaptchaSiteKeyOf(context: IRecaptchaContext): string | null {
    const visible: boolean = context.recaptchaVisible === true || context.recaptchaAction === undefined;

    return context.recaptchaRequired === true && visible ? (context.recaptchaSiteKey ?? null) : null;
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
 * and for its `load`. A script that failed to load ends the wait. The returned function ends it
 * too, and after it the callback never comes.
 */
export function whenRecaptchaReady(view: Window & typeof globalThis, done: (api: IRecaptchaApi) => void): () => void {
    let stopped: boolean = false;
    let release: () => void = (): void => undefined;
    const wait: () => void = (): void => {
        const api: IRecaptchaApi | null = recaptchaOf(view);
        if (api !== null) {
            api.ready((): void => {
                if (!stopped) {
                    done(api);
                }
            });

            return;
        }
        const script: HTMLScriptElement | undefined = scriptOf(view);
        if (script !== undefined) {
            const loaded: () => void = (): void => {
                release();
                wait();
            };
            release = (): void => {
                script.removeEventListener('load', loaded);
                script.removeEventListener('error', release);
            };
            script.addEventListener('load', loaded);
            script.addEventListener('error', release);

            return;
        }
        const watch: MutationObserver = new view.MutationObserver((): void => {
            if (scriptOf(view) !== undefined) {
                watch.disconnect();
                wait();
            }
        });
        release = (): void => watch.disconnect();
        watch.observe(view.document.head, { childList: true });
    };
    wait();

    return (): void => {
        stopped = true;
        release();
    };
}

/**
 * Draws the widget into a fresh node of the slot and drops the one drawn before. Google draws a
 * node once and never changes its scheme, so a switch of the page theme draws the widget anew.
 * Returns the id of the widget Google gave it.
 */
export function drawRecaptcha(api: IRecaptchaApi, slot: HTMLElement, params: IRecaptchaParams): number {
    const node: HTMLElement = slot.ownerDocument.createElement('div');
    slot.replaceChildren(node);

    return api.render(node, params);
}
