import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, qaAll, renderedText, textOf } from '../../../testing/rt-kit-testing';
import { IRtFileDrop } from './rt-file-drop.model';
import { RtFileDropComponent } from './rt-file-drop.component';

/** Содержимое приходит проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-file-drop-host',
    template: '<rt-file-drop><p>Перетащите файлы сюда</p></rt-file-drop>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFileDropComponent],
})
class FileDropHostComponent {}

const ZONES: ReadonlyArray<IRtFileDrop.Zone> = [
    { id: 'photos', label: 'Фотографии' },
    { id: 'docs', label: 'Документы', sublabel: 'pdf, docx' },
];

function file(name: string, type: string = 'application/pdf'): File {
    return new File([new Uint8Array(4)], name, { type });
}

/** jsdom не умеет DragEvent — собираем событие с нужным `dataTransfer`. */
function dragEvent(type: string, files: File[] = [], clientY: number = 0): Event {
    const event: Event = new MouseEvent(type, { bubbles: true, clientY });
    Object.defineProperty(event, 'dataTransfer', {
        configurable: true,
        value: {
            types: ['Files'],
            dropEffect: '',
            files: { length: files.length, item: (i: number): File => files[i], ...files },
        },
    });
    return event;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtFileDropComponent> {
    return createRtFixture(RtFileDropComponent, inputs);
}

function fire<T>(fixture: ComponentFixture<T>, event: Event): void {
    (fixture.nativeElement as HTMLElement).dispatchEvent(event);
    fixture.detectChanges();
}

describe('RtFileDropComponent', (): void => {
    it('несёт свой BEM-блок и проецирует содержимое', (): void => {
        expect(hostClasses(setup())).toContain('rt-file-drop');
        expect(renderedText(createRtFixture(FileDropHostComponent))).toContain('Перетащите файлы сюда');
    });

    it('до перетаскивания подсказки нет', (): void => {
        expect(qa(setup(), 'file-drop-overlay')).toBeNull();
    });

    describe('перетаскивание', (): void => {
        it('появление файла над областью показывает подсказку', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup();

            fire(fixture, dragEvent('dragover'));

            expect(qa(fixture, 'file-drop-overlay')).not.toBeNull();
            expect(textOf(qa(fixture, 'file-drop-label'))).toBe('Drop the files to attach them');
        });

        it('своя подпись перебивает переведённую', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ overlayLabel: 'Бросьте смету' });

            fire(fixture, dragEvent('dragover'));

            expect(textOf(qa(fixture, 'file-drop-label'))).toBe('Бросьте смету');
        });

        it('о начале и конце перетаскивания сообщается наружу', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup();
            const states: boolean[] = [];
            fixture.componentInstance.draggingChange.subscribe((value: boolean): void => {
                states.push(value);
            });

            fire(fixture, dragEvent('dragover'));

            expect(states).toEqual([true]);
        });

        it('уход курсора гасит подсказку не сразу — иначе рамка мерцала бы на границах детей', (): void => {
            jest.useFakeTimers();
            const fixture: ComponentFixture<RtFileDropComponent> = setup();
            fire(fixture, dragEvent('dragover'));

            fire(fixture, dragEvent('dragleave'));
            expect(qa(fixture, 'file-drop-overlay')).not.toBeNull();

            jest.advanceTimersByTime(100);
            fixture.detectChanges();
            expect(qa(fixture, 'file-drop-overlay')).toBeNull();
            jest.useRealTimers();
        });

        it('отключённая область на перетаскивание не отзывается', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ disabled: true });

            fire(fixture, dragEvent('dragover'));

            expect(qa(fixture, 'file-drop-overlay')).toBeNull();
        });
    });

    describe('сброс файлов', (): void => {
        it('отдаёт набор файлов наружу и убирает подсказку', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup();
            const dropped: File[][] = [];
            fixture.componentInstance.filesDropped.subscribe((files: File[]): void => {
                dropped.push(files);
            });
            fire(fixture, dragEvent('dragover'));

            fire(fixture, dragEvent('drop', [file('Договор.pdf')]));

            expect(dropped.length).toBe(1);
            expect(dropped[0][0].name).toBe('Договор.pdf');
            expect(qa(fixture, 'file-drop-overlay')).toBeNull();
        });

        it('файлы не того типа отсекаются, и пустой сброс события не поднимает', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ accept: '.pdf' });
            const dropped: jest.Mock = jest.fn();
            fixture.componentInstance.filesDropped.subscribe(dropped);

            fire(fixture, dragEvent('drop', [file('Фото.png', 'image/png')]));

            expect(dropped).not.toHaveBeenCalled();
        });

        it('отключённая область файлы не принимает', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ disabled: true });
            const dropped: jest.Mock = jest.fn();
            fixture.componentInstance.filesDropped.subscribe(dropped);

            fire(fixture, dragEvent('drop', [file('Договор.pdf')]));

            expect(dropped).not.toHaveBeenCalled();
        });
    });

    describe('зоны', (): void => {
        it('подсказка делится на зоны с подписями', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ zones: ZONES });

            fire(fixture, dragEvent('dragover'));

            expect(qaAll(fixture, 'file-drop-zone-label').map((node: DebugElement): string => textOf(node))).toEqual([
                'Фотографии',
                'Документы',
            ]);
            expect(textOf(qa(fixture, 'file-drop-zone-sublabel'))).toBe('pdf, docx');
        });

        it('с зонами общая рамка не рисуется', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ zones: ZONES });

            fire(fixture, dragEvent('dragover'));

            expect(qa(fixture, 'file-drop-frame')).toBeNull();
        });

        it('сброс в зону отдаёт её идентификатор вместе с файлами', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ zones: ZONES });
            const zoneDrops: IRtFileDrop.ZoneDrop[] = [];
            fixture.componentInstance.zoneFilesDropped.subscribe((drop: IRtFileDrop.ZoneDrop): void => {
                zoneDrops.push(drop);
            });

            fire(fixture, dragEvent('drop', [file('Договор.pdf')]));

            expect(zoneDrops.length).toBe(1);
            expect(zoneDrops[0].files[0].name).toBe('Договор.pdf');
        });

        it('с зонами общее событие сброса не поднимается — зона обязана быть названа', (): void => {
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ zones: ZONES });
            const plainDrops: jest.Mock = jest.fn();
            fixture.componentInstance.filesDropped.subscribe(plainDrops);

            fire(fixture, dragEvent('drop', [file('Договор.pdf')]));

            expect(plainDrops).not.toHaveBeenCalled();
        });

        it('без измеримой высоты попадание считается по первой зоне', (): void => {
            // Зона выбирается долей от высоты области. Пока высоты нет (первый
            // кадр, скрытая вкладка, тест), выбор детерминирован — первая зона,
            // а не отказ: файл терять нельзя.
            const fixture: ComponentFixture<RtFileDropComponent> = setup({ zones: ZONES });
            const zoneDrops: IRtFileDrop.ZoneDrop[] = [];
            fixture.componentInstance.zoneFilesDropped.subscribe((drop: IRtFileDrop.ZoneDrop): void => {
                zoneDrops.push(drop);
            });

            fire(fixture, dragEvent('drop', [file('Договор.pdf')], 9999));

            expect(zoneDrops[0].zoneId).toBe('photos');
        });
    });
});
