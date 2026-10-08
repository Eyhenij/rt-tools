import { placeStandardRoot, STANDARD_ROOT, THEME_ROOT } from './kc-standard-root';

describe('placeStandardRoot', () => {
    afterEach((): void => {
        document.body.innerHTML = '';
    });

    it('SC-AUTH-75 — a page the theme does not draw gets the root of the standard layout', () => {
        document.body.innerHTML = `<main><${THEME_ROOT}></${THEME_ROOT}></main>`;

        placeStandardRoot(document);

        expect(document.querySelector(`main > ${STANDARD_ROOT}`)).not.toBeNull();
        expect(document.querySelector(THEME_ROOT)).toBeNull();
    });

    it('SC-AUTH-75 — without the theme root the standard root goes to the end of the page', () => {
        placeStandardRoot(document);

        expect(document.body.lastElementChild?.tagName.toLowerCase()).toBe(STANDARD_ROOT);
    });
});
