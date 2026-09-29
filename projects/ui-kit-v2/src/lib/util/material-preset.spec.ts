import {
    carryThemeScope,
    carryThemeScopeOfFocus,
    materialPresetClassesOf,
    materialPresetClassesOfFocus,
    RT_MATERIAL_PRESET_CLASS,
    RT_THEME_SCOPE_ATTRIBUTE,
    themeScopeOf,
    themeScopeOfFocus,
} from './material-preset';

describe('materialPresetClassesOf', (): void => {
    it('SC-UKV-369 — узел под признаком набора отдаёт панели класс набора, узел вне него — ничего', (): void => {
        const page: HTMLElement = document.createElement('div');
        page.innerHTML = `
            <section data-preset="material"><button id="by-attr"></button></section>
            <section class="rt-preset-material"><span><button id="by-class"></button></span></section>
            <section><button id="plain"></button></section>`;
        document.body.appendChild(page);

        expect(materialPresetClassesOf(page.querySelector('#by-attr') as Element)).toEqual([RT_MATERIAL_PRESET_CLASS]);
        expect(materialPresetClassesOf(page.querySelector('#by-class') as Element)).toEqual([RT_MATERIAL_PRESET_CLASS]);
        expect(materialPresetClassesOf(page.querySelector('#plain') as Element)).toEqual([]);

        page.remove();
    });
});

describe('materialPresetClassesOfFocus', (): void => {
    it('SC-UKV-372 — диалог и боковая панель берут набор от кнопки в фокусе, вне признака — ничего', (): void => {
        const page: HTMLElement = document.createElement('div');
        page.innerHTML = `
            <section data-preset="material"><button id="inside"></button></section>
            <section><button id="outside"></button></section>`;
        document.body.appendChild(page);

        (page.querySelector('#inside') as HTMLButtonElement).focus();
        expect(materialPresetClassesOfFocus(document)).toEqual([RT_MATERIAL_PRESET_CLASS]);

        (page.querySelector('#outside') as HTMLButtonElement).focus();
        expect(materialPresetClassesOfFocus(document)).toEqual([]);

        page.remove();
    });
});

describe('themeScopeOf и carryThemeScope', (): void => {
    it('панель берёт тему ближайшего куска над источником, тему корня страницы — нет', (): void => {
        const page: HTMLElement = document.createElement('div');
        page.innerHTML = `
            <section data-theme="dark"><div data-theme="light"><button id="light"></button></div><button id="dark"></button></section>
            <section><button id="plain"></button></section>`;
        document.body.appendChild(page);
        document.documentElement.setAttribute('data-theme', 'dark');

        expect(themeScopeOf(page.querySelector('#dark') as Element)).toBe('dark');
        expect(themeScopeOf(page.querySelector('#light') as Element)).toBe('light');
        expect(themeScopeOf(page.querySelector('#plain') as Element)).toBeNull();

        document.documentElement.removeAttribute('data-theme');
        page.remove();
    });

    it('тема куска ставится на коробку панели и снимается, когда куска над источником больше нет', (): void => {
        const page: HTMLElement = document.createElement('div');
        page.innerHTML = `<section data-theme="dark"><button id="origin"></button></section>`;
        document.body.appendChild(page);
        const pane: HTMLElement = document.createElement('div');
        const origin: Element = page.querySelector('#origin') as Element;

        carryThemeScope(pane, origin);
        expect(pane.getAttribute(RT_THEME_SCOPE_ATTRIBUTE)).toBe('dark');

        (page.querySelector('section') as HTMLElement).removeAttribute('data-theme');
        carryThemeScope(pane, origin);
        expect(pane.hasAttribute(RT_THEME_SCOPE_ATTRIBUTE)).toBe(false);

        page.remove();
    });
});

describe('themeScopeOfFocus и carryThemeScopeOfFocus', (): void => {
    afterEach((): void => {
        document.documentElement.removeAttribute('data-theme');
    });

    it('диалог и боковая панель берут тему куска от кнопки в фокусе, тему корня — нет', (): void => {
        const page: HTMLElement = document.createElement('div');
        page.innerHTML = `
            <section data-theme="dark"><button id="inside"></button></section>
            <section><button id="outside"></button></section>`;
        document.body.appendChild(page);
        document.documentElement.setAttribute('data-theme', 'dark');
        const pane: HTMLElement = document.createElement('div');

        (page.querySelector('#inside') as HTMLButtonElement).focus();
        expect(themeScopeOfFocus(document)).toBe('dark');
        carryThemeScopeOfFocus(pane, document);
        expect(pane.getAttribute(RT_THEME_SCOPE_ATTRIBUTE)).toBe('dark');

        (page.querySelector('#outside') as HTMLButtonElement).focus();
        expect(themeScopeOfFocus(document)).toBeNull();
        carryThemeScopeOfFocus(pane, document);
        expect(pane.hasAttribute(RT_THEME_SCOPE_ATTRIBUTE)).toBe(false);

        page.remove();
    });
});
