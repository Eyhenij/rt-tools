import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { IRtImageCropper } from './rt-image-cropper.model';
import { RtImageCropperComponent } from './rt-image-cropper.component';

/**
 * jsdom не декодирует картинки и не рисует холстом. Картинку подменяет заглушка, которой тест
 * сам говорит «прочиталась такого размера» или «не прочиталась»; холст отдаёт файл сразу, а его
 * размер запоминается — по нему видно, какой кусок исходника вырезан.
 */
class FakeImage {
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public naturalWidth: number = 0;
    public naturalHeight: number = 0;
    public src: string = '';

    public static last: FakeImage | null = null;

    constructor() {
        FakeImage.last = this;
    }

    public load(width: number, height: number): void {
        this.naturalWidth = width;
        this.naturalHeight = height;
        this.onload?.();
    }

    public fail(): void {
        this.onerror?.();
    }
}

interface ICanvasCut {
    readonly width: number;
    readonly height: number;
    readonly type: string;
    readonly quality: number;
}

const cuts: ICanvasCut[] = [];

/** Поле 200 на 200: исходник 400 на 200 ложится в него с масштабом 0.5 и отступом 50 сверху */
const FIELD: number = 200;

const originals: {
    image: typeof Image;
    create: typeof URL.createObjectURL;
    revoke: typeof URL.revokeObjectURL;
    getContext: typeof HTMLCanvasElement.prototype.getContext;
    toBlob: typeof HTMLCanvasElement.prototype.toBlob;
} = {
    image: window.Image,
    create: URL.createObjectURL,
    revoke: URL.revokeObjectURL,
    getContext: HTMLCanvasElement.prototype.getContext,
    toBlob: HTMLCanvasElement.prototype.toBlob,
};

beforeAll((): void => {
    Object.defineProperty(window, 'Image', { configurable: true, writable: true, value: FakeImage });
    URL.createObjectURL = (): string => 'blob:source';
    URL.revokeObjectURL = (): void => undefined;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        writable: true,
        value: (): unknown => ({ drawImage: (): void => undefined }),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        configurable: true,
        writable: true,
        value: function (this: HTMLCanvasElement, callback: (blob: Blob | null) => void, type: string, quality: number): void {
            cuts.push({ width: this.width, height: this.height, type, quality });
            callback(new Blob(['cut'], { type }));
        },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: (): number => FIELD });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: (): number => FIELD });
});

afterAll((): void => {
    Object.defineProperty(window, 'Image', { configurable: true, writable: true, value: originals.image });
    URL.createObjectURL = originals.create;
    URL.revokeObjectURL = originals.revoke;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { configurable: true, writable: true, value: originals.getContext });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', { configurable: true, writable: true, value: originals.toBlob });
    Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
    Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
});

beforeEach((): void => {
    cuts.length = 0;
    FakeImage.last = null;
});

function source(name: string = 'photo.png', type: string = 'image/png'): File {
    return new File([new Uint8Array(4)], name, { type });
}

interface ISetup {
    readonly fixture: ComponentFixture<RtImageCropperComponent>;
    readonly results: IRtImageCropper.Result[];
    readonly failures: number[];
}

/** Поднимает обрезку с исходником 400 на 200 и ждёт, пока он прочитается */
function setup(inputs: Readonly<Record<string, unknown>> = {}, size: readonly [number, number] = [400, 200]): ISetup {
    const results: IRtImageCropper.Result[] = [];
    const failures: number[] = [];
    const fixture: ComponentFixture<RtImageCropperComponent> = createRtFixture(RtImageCropperComponent, { file: source(), ...inputs });
    fixture.componentInstance.cropped.subscribe((result: IRtImageCropper.Result): void => {
        results.push(result);
    });
    fixture.componentInstance.loadFailed.subscribe((): void => {
        failures.push(1);
    });
    fixture.detectChanges();
    FakeImage.last?.load(size[0], size[1]);
    fixture.detectChanges();
    return { fixture, results, failures };
}

function hostVar(fixture: ComponentFixture<RtImageCropperComponent>, name: string): number {
    return parseFloat((fixture.nativeElement as HTMLElement).style.getPropertyValue(`--rt-image-cropper-${name}`));
}

function frameBox(fixture: ComponentFixture<RtImageCropperComponent>): IRtImageCropper.Rect {
    return {
        x: hostVar(fixture, 'frame-x'),
        y: hostVar(fixture, 'frame-y'),
        width: hostVar(fixture, 'frame-width'),
        height: hostVar(fixture, 'frame-height'),
    };
}

/** jsdom не знает PointerEvent — собираем событие мыши с полями указателя */
function pointer(type: string, clientX: number, clientY: number, pointerType: string = 'mouse'): Event {
    const event: MouseEvent = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY, button: 0 });
    Object.defineProperty(event, 'pointerId', { value: 1 });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    return event;
}

function target(fixture: ComponentFixture<RtImageCropperComponent>, id: string): HTMLElement {
    const node: DebugElement | null = qa(fixture, id);
    if (node === null) {
        throw new Error(`нет узла ${id}`);
    }
    return node.nativeElement as HTMLElement;
}

function drag(
    fixture: ComponentFixture<RtImageCropperComponent>,
    id: string,
    to: readonly [number, number],
    steps: number = 1,
    pointerType: string = 'mouse'
): void {
    const node: HTMLElement = target(fixture, id);
    node.dispatchEvent(pointer('pointerdown', 0, 0, pointerType));
    for (let step: number = 1; step <= steps; step++) {
        node.dispatchEvent(pointer('pointermove', (to[0] * step) / steps, (to[1] * step) / steps, pointerType));
    }
    node.dispatchEvent(pointer('pointerup', to[0], to[1], pointerType));
    fixture.detectChanges();
}

function press(fixture: ComponentFixture<RtImageCropperComponent>, id: string, key: string, shiftKey: boolean = false): void {
    target(fixture, id).dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
    fixture.detectChanges();
}

describe('RtImageCropperComponent', (): void => {
    it('пока исходник читается, в поле крутится загрузка и рамки нет', (): void => {
        const fixture: ComponentFixture<RtImageCropperComponent> = createRtFixture(RtImageCropperComponent, { file: source() });

        expect(qa(fixture, 'image-cropper-spinner')).not.toBeNull();
        expect(qa(fixture, 'image-cropper-frame')).toBeNull();
    });

    it('SC-UKV-410 — без исходника в поле подсказка кита, а не рамка', (): void => {
        const fixture: ComponentFixture<RtImageCropperComponent> = createRtFixture(RtImageCropperComponent);

        expect(textOf(qa(fixture, 'image-cropper-placeholder'))).toBe('Choose an image to crop');
        expect(qa(fixture, 'image-cropper-spinner')).toBeNull();
        expect(qa(fixture, 'image-cropper-frame')).toBeNull();
        expect(qa(fixture, 'image-cropper-refusal')).toBeNull();
    });

    it('SC-UKV-410 — своя подсказка приложения заменяет подпись кита', (): void => {
        const fixture: ComponentFixture<RtImageCropperComponent> = createRtFixture(RtImageCropperComponent, {
            placeholder: 'Перетащите аватар',
        });

        expect(textOf(qa(fixture, 'image-cropper-placeholder'))).toBe('Перетащите аватар');
    });

    it('SC-UKV-383 — исходник шире поля лежит в нём целиком и по центру', (): void => {
        const { fixture }: ISetup = setup();

        expect(hostVar(fixture, 'image-x')).toBe(0);
        expect(hostVar(fixture, 'image-y')).toBe(50);
        expect(hostVar(fixture, 'image-width')).toBe(200);
        expect(hostVar(fixture, 'image-height')).toBe(100);
    });

    it('SC-UKV-385 — с пропорцией один к одному рамка встаёт квадратом посередине', (): void => {
        const { fixture }: ISetup = setup({ ratio: 1 });

        expect(frameBox(fixture)).toEqual({ x: 50, y: 50, width: 100, height: 100 });
    });

    it('SC-UKV-393 — после прочтения приходит файл формата исходника во весь исходник', (): void => {
        const { results }: ISetup = setup();

        expect(results).toHaveLength(1);
        expect(results[0].file.type).toBe('image/png');
        expect(results[0].file.name).toBe('photo.png');
        expect(results[0].frame).toEqual({ x: 0, y: 0, width: 400, height: 200 });
        expect(cuts[0]).toMatchObject({ width: 400, height: 200 });
    });

    it('SC-UKV-393 — jpeg с качеством 80 режется в пикселях исходника', (): void => {
        const { fixture, results }: ISetup = setup({ format: 'jpeg', quality: 80, ratio: 1 });

        press(fixture, 'image-cropper-frame', 'ArrowRight');

        const last: IRtImageCropper.Result = results[results.length - 1];
        expect(last.file.type).toBe('image/jpeg');
        expect(last.file.name).toBe('photo.jpg');
        expect(last.frame).toEqual({ x: 102, y: 0, width: 200, height: 200 });
        expect(cuts[cuts.length - 1]).toEqual({ width: 200, height: 200, type: 'image/jpeg', quality: 0.8 });
    });

    it('SC-UKV-392 — один жест из десяти движений даёт один результат, после отпускания', (): void => {
        const { fixture, results }: ISetup = setup({ ratio: 1 });
        results.length = 0;

        drag(fixture, 'image-cropper-frame', [-30, 0], 10);

        expect(results).toHaveLength(1);
        expect(results[0].frame.x).toBe(40);
    });

    it('SC-UKV-388 — сдвиг изнутри двигает рамку, правый нижний угол растягивает её', (): void => {
        const { fixture }: ISetup = setup({ ratio: 1 });

        drag(fixture, 'image-cropper-frame', [-20, 0]);
        expect(frameBox(fixture)).toEqual({ x: 30, y: 50, width: 100, height: 100 });

        drag(fixture, 'image-cropper-handle-nw', [10, 10]);
        const box: IRtImageCropper.Rect = frameBox(fixture);
        expect(box.x + box.width).toBe(130);
        expect(box.y + box.height).toBe(150);
        expect(box.width).toBe(90);
    });

    it('SC-UKV-391 — палец тянет рамку за поле, и она останавливается у края', (): void => {
        const { fixture, results }: ISetup = setup({ ratio: 1 });
        results.length = 0;

        drag(fixture, 'image-cropper-frame', [500, 0], 3, 'touch');

        expect(frameBox(fixture).x).toBe(100);
        expect(results).toHaveLength(1);
    });

    it('SC-UKV-390 — стрелка двигает рамку на пиксель поля, со Shift — на десять', (): void => {
        const { fixture }: ISetup = setup({ ratio: 1 });

        press(fixture, 'image-cropper-frame', 'ArrowLeft');
        expect(frameBox(fixture).x).toBe(49);

        press(fixture, 'image-cropper-frame', 'ArrowLeft', true);
        expect(frameBox(fixture).x).toBe(39);
    });

    it('SC-UKV-390 — стрелка на ручке растягивает рамку', (): void => {
        const { fixture }: ISetup = setup();

        press(fixture, 'image-cropper-handle-e', 'ArrowLeft', true);

        expect(frameBox(fixture)).toEqual({ x: 0, y: 50, width: 190, height: 100 });
    });

    it('SC-UKV-406 — круглый вид держит один к одному и отдаёт квадрат', (): void => {
        const { fixture, results }: ISetup = setup({ round: true, ratio: 16 / 9 });

        expect(hostClasses(fixture)).toContain('rt-image-cropper--round');
        expect(results[0].frame).toEqual({ x: 100, y: 0, width: 200, height: 200 });
    });

    it('SC-UKV-407 — нечитаемый исходник показывает отказ без рамки и сообщает наружу', (): void => {
        const failures: number[] = [];
        const fixture: ComponentFixture<RtImageCropperComponent> = createRtFixture(RtImageCropperComponent, {
            file: source('notes.txt', 'text/plain'),
        });
        fixture.componentInstance.loadFailed.subscribe((): void => {
            failures.push(1);
        });

        FakeImage.last?.fail();
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'image-cropper-refusal'))).toBe('The image could not be read');
        expect(qa(fixture, 'image-cropper-frame')).toBeNull();
        expect(failures).toHaveLength(1);
    });

    it('SC-UKV-408 — недоступная обрезка не двигает рамку ни указателем, ни клавишами', (): void => {
        const { fixture, results }: ISetup = setup({ ratio: 1 });
        results.length = 0;
        setInputs(fixture, { disabled: true });
        fixture.detectChanges();

        drag(fixture, 'image-cropper-frame', [-30, 0]);
        press(fixture, 'image-cropper-frame', 'ArrowLeft');

        expect(frameBox(fixture)).toEqual({ x: 50, y: 50, width: 100, height: 100 });
        expect(results).toHaveLength(0);
        expect(target(fixture, 'image-cropper-frame').getAttribute('tabindex')).toBe('-1');
        expect(target(fixture, 'image-cropper-frame').getAttribute('aria-disabled')).toBe('true');
    });

    it('SC-UKV-409 — рамка и восемь ручек называют себя подписями кита', (): void => {
        const { fixture }: ISetup = setup();

        expect(target(fixture, 'image-cropper-frame').getAttribute('aria-label')).toBe('Crop frame');
        const labels: (string | null)[] = qaAll(fixture, 'image-cropper-frame')
            .flatMap((frame: DebugElement): HTMLElement[] =>
                Array.from((frame.nativeElement as HTMLElement).querySelectorAll('[role="button"]'))
            )
            .map((handle: HTMLElement): string | null => handle.getAttribute('aria-label'));
        expect(labels).toHaveLength(8);
        expect(new Set(labels).size).toBe(8);
        expect(labels).toContain('Top left corner of the crop frame');
        expect(labels).toContain('Right edge of the crop frame');
    });

    it('смена пропорции ставит рамку заново и отдаёт новый результат', (): void => {
        const { fixture, results }: ISetup = setup();
        results.length = 0;

        setInputs(fixture, { ratio: 1 });
        fixture.detectChanges();

        expect(frameBox(fixture)).toEqual({ x: 50, y: 50, width: 100, height: 100 });
        expect(results).toHaveLength(1);
    });

    it('новый исходник сбрасывает старый: поздний ответ прежней картинки не принимается', (): void => {
        const { fixture }: ISetup = setup();
        const stale: FakeImage | null = FakeImage.last;

        setInputs(fixture, { file: source('second.webp', 'image/webp') });
        fixture.detectChanges();
        stale?.fail();
        fixture.detectChanges();

        expect(qa(fixture, 'image-cropper-refusal')).toBeNull();
        expect(qa(fixture, 'image-cropper-spinner')).not.toBeNull();
    });
});
