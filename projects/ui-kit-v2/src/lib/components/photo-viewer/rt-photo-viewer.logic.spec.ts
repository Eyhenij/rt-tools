import { indexFromParam, indexFromScroll, nextPhotoIndex, paramFromIndex, shouldRenderPhoto } from './rt-photo-viewer.logic';

describe('nextPhotoIndex', () => {
    it('шаг вперёд переходит к следующему кадру', () => {
        expect(nextPhotoIndex(0, 5, 1)).toBe(1);
    });

    it('с последнего кадра вперёд попадаем на первый', () => {
        expect(nextPhotoIndex(4, 5, 1)).toBe(0);
    });

    it('с первого кадра назад попадаем на последний', () => {
        expect(nextPhotoIndex(0, 5, -1)).toBe(4);
    });

    it('на пустом списке индекс остаётся нулевым', () => {
        expect(nextPhotoIndex(0, 0, 1)).toBe(0);
    });
});

describe('indexFromParam', () => {
    it('первый кадр в адресе — это нулевой индекс', () => {
        expect(indexFromParam('1', 10)).toBe(0);
    });

    it('номер за пределами списка игнорируется', () => {
        expect(indexFromParam('11', 10)).toBe(-1);
    });

    it('ноль и отрицательные значения игнорируются', () => {
        expect(indexFromParam('0', 10)).toBe(-1);
        expect(indexFromParam('-3', 10)).toBe(-1);
    });

    it('мусор в параметре не открывает просмотрщик', () => {
        expect(indexFromParam('abc', 10)).toBe(-1);
        expect(indexFromParam(null, 10)).toBe(-1);
    });
});

describe('paramFromIndex', () => {
    it('нумерация в адресе начинается с единицы', () => {
        expect(paramFromIndex(0)).toBe('1');
        expect(paramFromIndex(41)).toBe('42');
    });
});

describe('shouldRenderPhoto', () => {
    it('текущий кадр рендерится', () => {
        expect(shouldRenderPhoto(3, 3, 10)).toBe(true);
    });

    it('соседние кадры готовятся заранее', () => {
        expect(shouldRenderPhoto(2, 3, 10)).toBe(true);
        expect(shouldRenderPhoto(4, 3, 10)).toBe(true);
    });

    it('дальние кадры не грузятся — это сотни килобайт на каждый', () => {
        expect(shouldRenderPhoto(6, 3, 10)).toBe(false);
    });

    it('соседство считается по кругу', () => {
        expect(shouldRenderPhoto(9, 0, 10)).toBe(true);
    });
});

describe('indexFromScroll', () => {
    it('позиция в начале дорожки — первый кадр', () => {
        expect(indexFromScroll(0, 1000, 5)).toBe(0);
    });

    it('прокрутка на две ширины даёт третий кадр', () => {
        expect(indexFromScroll(2000, 1000, 5)).toBe(2);
    });

    it('незавершённый свайп округляется к ближайшему кадру', () => {
        expect(indexFromScroll(1400, 1000, 5)).toBe(1);
        expect(indexFromScroll(1600, 1000, 5)).toBe(2);
    });

    it('за пределы списка индекс не уходит', () => {
        expect(indexFromScroll(99000, 1000, 3)).toBe(2);
        expect(indexFromScroll(-50, 1000, 3)).toBe(0);
    });

    it('нулевая ширина не делит на ноль', () => {
        expect(indexFromScroll(500, 0, 3)).toBe(0);
    });
});
