import { RT_COLOR_PALETTE_DEFAULT } from './rt-color-palette.const';
import {
    colorPaletteArea,
    colorPaletteChannel,
    colorPaletteFromHsv,
    colorPaletteFromRgb,
    colorPaletteHex,
    colorPaletteNextIndex,
    colorPaletteSpectrum,
    colorPaletteStep,
    colorPaletteSwatches,
    colorPaletteToHsv,
    colorPaletteToRgb,
} from './rt-color-palette.logic';
import { IRtColorPalette } from './rt-color-palette.model';

describe('Логика палитры цветов', (): void => {
    it('SC-UKV-807: значение — шесть цифр строчными, остальное — не цвет', (): void => {
        expect(colorPaletteHex('#ABC')).toBe('#aabbcc');
        expect(colorPaletteHex('00FF00')).toBe('#00ff00');
        expect(colorPaletteHex(' #123456 ')).toBe('#123456');
        expect(colorPaletteHex('red')).toBeNull();
        expect(colorPaletteHex('#12345')).toBeNull();
        expect(colorPaletteHex(null)).toBeNull();
        expect(colorPaletteHex(42)).toBeNull();
    });

    it('SC-UKV-808: образцы — цвета входа по порядку, набор кита без них, чужое значение — в конце', (): void => {
        const hexes: (swatches: IRtColorPalette.Swatch[]) => string[] = (swatches: IRtColorPalette.Swatch[]): string[] =>
            swatches.map((swatch: IRtColorPalette.Swatch): string => swatch.hex);

        expect(hexes(colorPaletteSwatches([], null))).toEqual(RT_COLOR_PALETTE_DEFAULT);
        expect(RT_COLOR_PALETTE_DEFAULT).toHaveLength(18);
        expect(hexes(colorPaletteSwatches(['#F00', '#00ff00', 'nope', '#ff0000'], null))).toEqual(['#ff0000', '#00ff00']);

        const outside: IRtColorPalette.Swatch[] = colorPaletteSwatches(['#ff0000'], '#123456');
        expect(outside).toEqual([
            { hex: '#ff0000', custom: false },
            { hex: '#123456', custom: true },
        ]);
        expect(colorPaletteSwatches(['#ff0000'], '#ff0000')).toEqual([{ hex: '#ff0000', custom: false }]);
    });

    it('SC-UKV-810: стрелки идут по кругу, Home и End берут крайние, без выбора — первый и последний', (): void => {
        expect(colorPaletteNextIndex('ArrowRight', 0, 3)).toBe(1);
        expect(colorPaletteNextIndex('ArrowDown', 2, 3)).toBe(0);
        expect(colorPaletteNextIndex('ArrowLeft', 0, 3)).toBe(2);
        expect(colorPaletteNextIndex('ArrowUp', 1, 3)).toBe(0);
        expect(colorPaletteNextIndex('Home', 2, 3)).toBe(0);
        expect(colorPaletteNextIndex('End', 0, 3)).toBe(2);
        expect(colorPaletteNextIndex('ArrowRight', -1, 3)).toBe(0);
        expect(colorPaletteNextIndex('ArrowLeft', -1, 3)).toBe(2);
        expect(colorPaletteNextIndex('Enter', 0, 3)).toBeNull();
        expect(colorPaletteNextIndex('ArrowRight', 0, 0)).toBeNull();
    });

    it('SC-UKV-814: цвет переводится в оттенок, насыщенность и яркость и обратно без потерь', (): void => {
        for (const hex of [...RT_COLOR_PALETTE_DEFAULT, '#000000', '#ffffff', '#808080', '#123456']) {
            expect(colorPaletteFromHsv(colorPaletteToHsv(hex))).toBe(hex);
        }

        expect(colorPaletteToHsv('#ff0000')).toEqual({ h: 0, s: 1, v: 1 });
        expect(colorPaletteToHsv('#808080').s).toBe(0);
        expect(colorPaletteFromHsv({ h: 120, s: 1, v: 1 })).toBe('#00ff00');
        expect(colorPaletteFromHsv({ h: 360, s: 2, v: -1 })).toBe('#000000');
    });

    it('SC-UKV-814: стрелки двигают насыщенность и яркость по площади и оттенок по полосе', (): void => {
        const start: IRtColorPalette.Hsv = { h: 0, s: 0.5, v: 0.5 };

        expect(colorPaletteStep('area', 'ArrowRight', start)).toEqual({ h: 0, s: 0.55, v: 0.5 });
        expect(colorPaletteStep('area', 'ArrowDown', start)).toEqual({ h: 0, s: 0.5, v: 0.45 });
        expect(colorPaletteStep('area', 'ArrowUp', { h: 0, s: 0.5, v: 1 })).toEqual({ h: 0, s: 0.5, v: 1 });
        expect(colorPaletteStep('hue', 'ArrowLeft', start)?.h).toBe(354);
        expect(colorPaletteStep('hue', 'ArrowRight', start)?.h).toBe(6);
        expect(colorPaletteStep('area', 'Enter', start)).toBeNull();
        expect(colorPaletteStep('hue', 'Home', start)).toBeNull();
    });

    it('SC-UKV-814: полоса идёт по вершинам круга оттенков, площадь — от белого и чёрного к оттенку', (): void => {
        expect(colorPaletteSpectrum()).toBe('linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)');
        expect(colorPaletteArea('#00ff00')).toBe(
            'linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, #00ff00)'
        );
    });

    it('SC-UKV-847: каналы переводятся в запись и обратно, поле канала берёт целое от 0 до 255', (): void => {
        expect(colorPaletteToRgb('#1a80ff')).toEqual({ r: 26, g: 128, b: 255 });
        expect(colorPaletteFromRgb({ r: 26, g: 128, b: 255 })).toBe('#1a80ff');
        expect(colorPaletteFromRgb({ r: 0, g: 0, b: 0 })).toBe('#000000');
        expect(colorPaletteChannel(' 255 ')).toBe(255);
        expect(colorPaletteChannel('0')).toBe(0);
        expect(colorPaletteChannel('256')).toBeNull();
        expect(colorPaletteChannel('-1')).toBeNull();
        expect(colorPaletteChannel('1.5')).toBeNull();
        expect(colorPaletteChannel('')).toBeNull();
    });
});
