import { materialPresetClassesOf, materialPresetClassesOfFocus, RT_MATERIAL_PRESET_CLASS } from './material-preset';

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
