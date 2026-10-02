import {
    cropArea,
    fieldDelta,
    fitSource,
    frameInField,
    frameRatio,
    handleDirection,
    initialFrame,
    keyDelta,
    moveFrame,
    resizeFrame,
    resultFileName,
    resultQuality,
    resultType,
    RT_IMAGE_CROPPER_HANDLES,
} from './rt-image-cropper.logic';
import { IRtImageCropper } from './rt-image-cropper.model';

const SOURCE: IRtImageCropper.Size = { width: 400, height: 200 };

describe('fitSource', () => {
    it('SC-UKV-491 — исходник шире поля ложится целиком, с пропорциями и по центру', () => {
        const fit: IRtImageCropper.Fit = fitSource(SOURCE, { width: 200, height: 200 });

        expect(fit.scale).toBe(0.5);
        expect(fit.width).toBe(200);
        expect(fit.height).toBe(100);
        expect(fit.offsetX).toBe(0);
        expect(fit.offsetY).toBe(50);
    });

    it('SC-UKV-491 — маленький исходник растягивается до поля, не искажаясь', () => {
        const fit: IRtImageCropper.Fit = fitSource({ width: 50, height: 100 }, { width: 400, height: 400 });

        expect(fit.scale).toBe(4);
        expect(fit.width / fit.height).toBe(0.5);
        expect(fit.offsetX).toBe(100);
    });

    it('пустое поле или пустой исходник дают нулевое вписывание', () => {
        expect(fitSource(SOURCE, { width: 0, height: 100 }).scale).toBe(0);
        expect(fitSource({ width: 0, height: 0 }, { width: 100, height: 100 }).scale).toBe(0);
    });
});

describe('frameRatio', () => {
    it('SC-UKV-497 — круглый вид держит один к одному при любой заданной пропорции', () => {
        expect(frameRatio(16 / 9, true)).toBe(1);
        expect(frameRatio(null, true)).toBe(1);
    });

    it('заданная пропорция берётся как есть, негодная — это свободная рамка', () => {
        expect(frameRatio(1.5, false)).toBe(1.5);
        expect(frameRatio(0, false)).toBeNull();
        expect(frameRatio(-2, false)).toBeNull();
        expect(frameRatio(Number.NaN, false)).toBeNull();
        expect(frameRatio(undefined, false)).toBeNull();
    });
});

describe('initialFrame', () => {
    it('SC-UKV-493 — исходник 400 на 200 с пропорцией один к одному даёт рамку 200 на 200 посередине', () => {
        expect(initialFrame(SOURCE, 1)).toEqual({ x: 100, y: 0, width: 200, height: 200 });
    });

    it('SC-UKV-493 — свободная рамка начинается как весь исходник', () => {
        expect(initialFrame(SOURCE, null)).toEqual({ x: 0, y: 0, width: 400, height: 200 });
    });

    it('узкая пропорция упирается в высоту и встаёт по центру', () => {
        expect(initialFrame(SOURCE, 0.5)).toEqual({ x: 150, y: 0, width: 100, height: 200 });
    });
});

describe('moveFrame', () => {
    const frame: IRtImageCropper.Rect = { x: 300, y: 50, width: 100, height: 100 };

    it('SC-UKV-494 — рамка у правого края дальше вправо не идёт', () => {
        expect(moveFrame(frame, { dx: 50, dy: 0 }, SOURCE)).toEqual(frame);
    });

    it('SC-UKV-494 — сдвиг за верхний и левый край останавливается на нуле', () => {
        expect(moveFrame(frame, { dx: -500, dy: -500 }, SOURCE)).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    });

    it('SC-UKV-496 — сдвиг изнутри двигает рамку и не меняет её размер', () => {
        expect(moveFrame(frame, { dx: -40, dy: 20 }, SOURCE)).toEqual({ x: 260, y: 70, width: 100, height: 100 });
    });
});

describe('handleDirection', () => {
    it('каждая из восьми ручек тянет свою сторону или угол', () => {
        expect(RT_IMAGE_CROPPER_HANDLES.map(handleDirection)).toEqual([
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
            { x: -1, y: 0 },
        ]);
    });
});

describe('resizeFrame — свободная рамка', () => {
    const frame: IRtImageCropper.Rect = { x: 100, y: 50, width: 100, height: 100 };

    it('SC-UKV-496 — правый нижний угол растягивает рамку, левый верхний стоит на месте', () => {
        expect(resizeFrame(frame, 'se', { dx: 30, dy: 20 }, SOURCE, null, 1)).toEqual({ x: 100, y: 50, width: 130, height: 120 });
    });

    it('SC-UKV-496 — левая ручка двигает левую сторону, правая стоит на месте', () => {
        expect(resizeFrame(frame, 'w', { dx: -40, dy: 99 }, SOURCE, null, 1)).toEqual({ x: 60, y: 50, width: 140, height: 100 });
    });

    it('SC-UKV-494 — растяжение за край исходника останавливается на краю', () => {
        expect(resizeFrame(frame, 'se', { dx: 999, dy: 999 }, SOURCE, null, 1)).toEqual({ x: 100, y: 50, width: 300, height: 150 });
        expect(resizeFrame(frame, 'nw', { dx: -999, dy: -999 }, SOURCE, null, 1)).toEqual({ x: 0, y: 0, width: 200, height: 150 });
    });

    it('SC-UKV-495 — при наименьшем размере 50 рамку не сжать до 10 в ширину', () => {
        const next: IRtImageCropper.Rect = resizeFrame(frame, 'e', { dx: -90, dy: 0 }, SOURCE, null, 50);

        expect(next.width).toBe(50);
        expect(next.x).toBe(100);
    });

    it('SC-UKV-495 — сжатие с левой стороны тоже останавливается на наименьшем размере', () => {
        expect(resizeFrame(frame, 'w', { dx: 90, dy: 0 }, SOURCE, null, 50)).toEqual({ x: 150, y: 50, width: 50, height: 100 });
    });

    it('исходник меньше наименьшего размера не выпускает рамку за край', () => {
        const small: IRtImageCropper.Size = { width: 30, height: 30 };

        expect(resizeFrame({ x: 0, y: 0, width: 30, height: 30 }, 'se', { dx: -5, dy: -5 }, small, null, 50)).toEqual({
            x: 0,
            y: 0,
            width: 30,
            height: 30,
        });
    });
});

describe('resizeFrame — рамка с пропорцией', () => {
    const wide: IRtImageCropper.Size = { width: 1600, height: 900 };
    const frame: IRtImageCropper.Rect = { x: 400, y: 225, width: 320, height: 180 };

    it('SC-UKV-497 — боковая ручка держит 16 к 9 и тянет рамку вокруг центра второй оси', () => {
        const next: IRtImageCropper.Rect = resizeFrame(frame, 'e', { dx: 160, dy: 0 }, wide, 16 / 9, 1);

        expect(next.width).toBe(480);
        expect(next.height).toBeCloseTo(270);
        expect(next.x).toBe(400);
        expect(next.y + next.height / 2).toBeCloseTo(frame.y + frame.height / 2);
    });

    it('SC-UKV-497 — угол держит пропорцию и оставляет противоположный угол на месте', () => {
        const next: IRtImageCropper.Rect = resizeFrame(frame, 'nw', { dx: -32, dy: -5 }, wide, 16 / 9, 1);

        expect(next.width / next.height).toBeCloseTo(16 / 9);
        expect(next.x + next.width).toBeCloseTo(720);
        expect(next.y + next.height).toBeCloseTo(405);
    });

    it('SC-UKV-497 — в круглом виде ручка держит один к одному', () => {
        const next: IRtImageCropper.Rect = resizeFrame(
            { x: 100, y: 50, width: 100, height: 100 },
            's',
            { dx: 0, dy: 40 },
            SOURCE,
            frameRatio(16 / 9, true),
            1
        );

        expect(next.width).toBe(next.height);
        expect(next.height).toBe(140);
    });

    it('SC-UKV-494 — рамка с пропорцией упирается в край и не теряет пропорцию', () => {
        const next: IRtImageCropper.Rect = resizeFrame(frame, 'se', { dx: 5000, dy: 0 }, wide, 16 / 9, 1);

        expect(next.x + next.width).toBeLessThanOrEqual(1600);
        expect(next.y + next.height).toBeCloseTo(900);
        expect(next.width / next.height).toBeCloseTo(16 / 9);
    });

    it('SC-UKV-495 — наименьший размер держится по меньшей стороне', () => {
        const next: IRtImageCropper.Rect = resizeFrame(frame, 'se', { dx: -1000, dy: 0 }, wide, 16 / 9, 90);

        expect(next.height).toBeCloseTo(90);
        expect(next.width).toBeCloseTo(160);
    });
});

describe('keyDelta и fieldDelta', () => {
    it('SC-UKV-498 — стрелка сдвигает на пиксель поля, со Shift на десять', () => {
        expect(keyDelta('ArrowRight', false, 0.5)).toEqual({ dx: 2, dy: 0 });
        expect(keyDelta('ArrowUp', true, 0.5)).toEqual({ dx: 0, dy: -20 });
        expect(keyDelta('ArrowLeft', false, 2)).toEqual({ dx: -0.5, dy: 0 });
        expect(keyDelta('ArrowDown', true, 1)).toEqual({ dx: 0, dy: 10 });
    });

    it('не стрелка и незаданный масштаб ничего не двигают', () => {
        expect(keyDelta('Enter', false, 1)).toBeNull();
        expect(keyDelta('ArrowLeft', false, 0)).toBeNull();
    });

    it('сдвиг указателя в поле переводится в пиксели исходника', () => {
        expect(fieldDelta(10, -4, 0.5)).toEqual({ dx: 20, dy: -8 });
        expect(fieldDelta(10, 10, 0)).toEqual({ dx: 0, dy: 0 });
    });
});

describe('frameInField и cropArea', () => {
    it('рамка в пикселях поля ложится поверх вписанной картинки', () => {
        const fit: IRtImageCropper.Fit = fitSource(SOURCE, { width: 200, height: 200 });

        expect(frameInField({ x: 100, y: 0, width: 200, height: 200 }, fit)).toEqual({ x: 50, y: 50, width: 100, height: 100 });
    });

    it('SC-UKV-501 — вырезается рамка в целых пикселях исходника, внутри него', () => {
        expect(cropArea({ x: 10.4, y: 19.6, width: 99.5, height: 50.2 }, SOURCE)).toEqual({ x: 10, y: 20, width: 100, height: 50 });
        expect(cropArea({ x: 399.9, y: 0, width: 5, height: 0.1 }, SOURCE)).toEqual({ x: 399, y: 0, width: 1, height: 1 });
    });
});

describe('resultType, resultQuality, resultFileName', () => {
    it('SC-UKV-501 — выбранный формат берётся как есть', () => {
        expect(resultType('jpeg', 'image/png')).toBe('image/jpeg');
        expect(resultType('webp', 'image/png')).toBe('image/webp');
    });

    it('SC-UKV-501 — без выбранного формата берётся формат исходника, а чужой становится png', () => {
        expect(resultType(null, 'image/webp')).toBe('image/webp');
        expect(resultType(undefined, 'image/gif')).toBe('image/png');
    });

    it('SC-UKV-501 — качество 80 даёт холсту 0.8, выход за пределы обрезается', () => {
        expect(resultQuality(80)).toBe(0.8);
        expect(resultQuality(150)).toBe(1);
        expect(resultQuality(-3)).toBe(0);
        expect(resultQuality(Number.NaN)).toBe(0.92);
    });

    it('имя файла сохраняет основу и берёт расширение результата', () => {
        expect(resultFileName('avatar.photo.PNG', 'image/jpeg')).toBe('avatar.photo.jpg');
        expect(resultFileName('cover', 'image/webp')).toBe('cover.webp');
        expect(resultFileName('', 'image/png')).toBe('image.png');
        expect(resultFileName('.hidden', 'image/png')).toBe('.hidden.png');
    });
});
