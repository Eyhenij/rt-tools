import { IRecaptchaApi, whenRecaptchaReady } from './kc-recaptcha';

const ADDRESS: string = 'https://www.google.com/recaptcha/api.js?hl=en';

/** The Google script as the page gets it once loaded: `ready` calls back at once. */
const API: IRecaptchaApi = {
    ready: (done: () => void): void => done(),
    render: (): number => 0,
};

/** Lets the mutation records reach their observer. */
async function settle(): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 0);
    });
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
        const script: HTMLScriptElement = document.createElement('script');
        script.src = ADDRESS;
        document.head.appendChild(script);
        await settle();

        expect(got).toEqual([]);

        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));

        expect(got).toEqual([API]);
    });

    it('SC-AUTH-91 — the page waits for the load of a script already added but not loaded yet', () => {
        const script: HTMLScriptElement = document.createElement('script');
        script.src = ADDRESS;
        document.head.appendChild(script);
        const got: IRecaptchaApi[] = [];
        whenRecaptchaReady(window, (api: IRecaptchaApi): void => {
            got.push(api);
        });

        expect(got).toEqual([]);

        Reflect.set(window, 'grecaptcha', API);
        script.dispatchEvent(new Event('load'));

        expect(got).toEqual([API]);
    });
});
