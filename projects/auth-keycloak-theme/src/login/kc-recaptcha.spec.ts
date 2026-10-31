import { IRecaptchaApi, recaptchaSiteKeyOf, whenRecaptchaReady } from './kc-recaptcha';

const ADDRESS: string = 'https://www.google.com/recaptcha/api.js?hl=en';

/** The Google script as the page gets it once loaded: `ready` calls back at once. */
const API: IRecaptchaApi = {
    ready: (done: () => void): void => done(),
    render: (): number => 0,
    getResponse: (): string => '',
};

/** Lets the mutation records reach their observer. */
async function settle(): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 0);
    });
}

/** The Google script as the frame adds it to the page. */
function addScript(): HTMLScriptElement {
    const script: HTMLScriptElement = document.createElement('script');
    script.src = ADDRESS;
    document.head.appendChild(script);

    return script;
}

describe('whenRecaptchaReady', () => {
    afterEach(() => {
        Reflect.deleteProperty(window, 'grecaptcha');
        document.querySelectorAll(`script[src="${ADDRESS}"]`).forEach((node: Element): void => node.remove());
    });

    it('SC-AUTH-91 — the page waits for a script the frame adds after it asked, and for its load', async () => {
        const got: IRecaptchaApi[] = [];
        whenRecaptchaReady(window, (api: IRecaptchaApi): void => {
            got.push(api);
        });
        const script: HTMLScriptElement = addScript();
        await settle();

        expect(got).toEqual([]);

        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));

        expect(got).toEqual([API]);
    });

    it('SC-AUTH-91 — the page waits for the load of a script already added but not loaded yet', () => {
        const script: HTMLScriptElement = addScript();
        const got: IRecaptchaApi[] = [];
        whenRecaptchaReady(window, (api: IRecaptchaApi): void => {
            got.push(api);
        });

        expect(got).toEqual([]);

        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));

        expect(got).toEqual([API]);
    });

    it('SC-AUTH-93 — a script that failed to load ends the wait', () => {
        const script: HTMLScriptElement = addScript();
        const got: IRecaptchaApi[] = [];
        whenRecaptchaReady(window, (api: IRecaptchaApi): void => {
            got.push(api);
        });
        script.dispatchEvent(new Event('error'));
        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));

        expect(got).toEqual([]);
    });

    it('SC-AUTH-96 — a script that loaded without the API ends the wait and is not waited for again', () => {
        const script: HTMLScriptElement = addScript();
        const listen: jest.SpyInstance = jest.spyOn(script, 'addEventListener');
        const got: IRecaptchaApi[] = [];
        whenRecaptchaReady(window, (api: IRecaptchaApi): void => {
            got.push(api);
        });
        listen.mockClear();
        script.dispatchEvent(new Event('load'));

        expect(listen).not.toHaveBeenCalled();
        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));
        expect(got).toEqual([]);
    });

    it('SC-AUTH-92 — a wait ended by the page stops watching the document and never calls back', async () => {
        const disconnect: jest.SpyInstance = jest.spyOn(MutationObserver.prototype, 'disconnect');
        const got: IRecaptchaApi[] = [];
        const stop: () => void = whenRecaptchaReady(window, (api: IRecaptchaApi): void => {
            got.push(api);
        });
        stop();
        const script: HTMLScriptElement = addScript();
        await settle();
        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));
        const disconnected: number = disconnect.mock.calls.length;
        disconnect.mockRestore();

        expect(disconnected).toBe(1);
        expect(got).toEqual([]);
    });
});

describe('recaptchaSiteKeyOf', () => {
    it('SC-AUTH-94 — the widget is drawn by the condition of the standard page', () => {
        const key: string = 'site-key';

        expect(
            recaptchaSiteKeyOf({ recaptchaRequired: true, recaptchaVisible: true, recaptchaAction: 'register', recaptchaSiteKey: key })
        ).toBe(key);
        expect(recaptchaSiteKeyOf({ recaptchaRequired: true, recaptchaSiteKey: key })).toBe(key);
        expect(
            recaptchaSiteKeyOf({ recaptchaRequired: true, recaptchaVisible: false, recaptchaAction: 'register', recaptchaSiteKey: key })
        ).toBeNull();
        expect(recaptchaSiteKeyOf({ recaptchaRequired: false, recaptchaVisible: true, recaptchaSiteKey: key })).toBeNull();
        expect(recaptchaSiteKeyOf({ recaptchaSiteKey: key })).toBeNull();
    });
});
