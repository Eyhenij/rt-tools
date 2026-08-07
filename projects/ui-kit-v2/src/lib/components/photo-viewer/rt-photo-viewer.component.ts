import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    Signal,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

// rt-tools
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../dialog/rt-dialog.tokens';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { indexFromScroll, nextPhotoIndex, shouldRenderPhoto } from './rt-photo-viewer.logic';
import { IRtPhotoViewer } from './rt-photo-viewer.model';

const BEM_BLOCK: string = 'rt-photo-viewer';

/**
 * Полноэкранный просмотрщик фотографий поверх `RtDialogService`.
 *
 * Листание — нативный `scroll-snap`: свайп, инерцию и прилипание даёт сам
 * браузер, и на телефоне это ощущается правильнее любой реализации на
 * обработчиках. Готовую библиотеку не берём — весь кит здесь собственный, а
 * токены, BEM и `qa-dataid` ложатся естественно.
 *
 * Руками сделаны: стрелки, клавиши `←` `→`, счётчик и предзагрузка соседних
 * кадров. `Esc`, блокировку прокрутки фона и затемнение даёт сам диалог.
 */
@Component({
    selector: 'rt-photo-viewer',
    templateUrl: './rt-photo-viewer.component.html',
    styleUrl: './rt-photo-viewer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        CdkTrapFocus,
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtIconButtonComponent,

        // transloco
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'dialog',
        'aria-modal': 'true',
        // Клавиши слушает сам просмотрщик, поэтому фокус переводится на него
        // сразу после открытия — иначе стрелки и Esc не работали бы, пока
        // пользователь куда-нибудь не кликнет
        tabindex: '-1',
        '(keydown.escape)': 'close()',
        '(keydown.arrowLeft)': 'move(-1)',
        '(keydown.arrowRight)': 'move(1)',
    },
})
export class RtPhotoViewerComponent {
    readonly #data: IRtPhotoViewer.Data = inject(RT_DIALOG_DATA) as IRtPhotoViewer.Data;
    readonly #dialogRef: RtDialogRef<number> = inject(RtDialogRef<number>);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

    protected readonly track: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('track');

    protected readonly photos: readonly IRtPhotoViewer.Photo[] = this.#data.photos;

    /** Панель правки под дорожкой; там, где кадр только смотрят, её нет */
    protected readonly panel: TemplateRef<IRtPhotoViewer.PanelContext> | null = this.#data.panel ?? null;

    protected readonly currentIndex: WritableSignal<number> = signal<number>(this.#data.startIndex);

    protected readonly counter: Signal<string> = computed((): string => `${this.currentIndex() + 1} / ${this.photos.length}`);

    /** Соседние кадры готовятся заранее, дальние в разметку не попадают */
    protected readonly rendered: Signal<readonly boolean[]> = computed((): readonly boolean[] =>
        this.photos.map((_photo: IRtPhotoViewer.Photo, index: number): boolean =>
            shouldRenderPhoto(index, this.currentIndex(), this.photos.length)
        )
    );

    constructor() {
        // Открытие может быть не с первого кадра: без явной прокрутки счётчик
        // показывал бы второй кадр, а на экране остался бы первый
        afterNextRender((): void => {
            this.#host.nativeElement.focus();
            this.#scrollToCurrent();
        });
    }

    /** Наружу отдаётся кадр, на котором закрыли: по нему вызывающая сторона чистит адрес */
    public close(): void {
        this.#dialogRef.close(this.currentIndex());
    }

    protected move(step: number): void {
        this.select(nextPhotoIndex(this.currentIndex(), this.photos.length, step));
    }

    protected select(index: number): void {
        this.currentIndex.set(index);
        this.#scrollToCurrent();
    }

    /** Свайп листает мимо стрелок — счётчик догоняет позицию дорожки */
    protected onScroll(): void {
        const track: HTMLElement | undefined = this.track()?.nativeElement;
        if (track) {
            this.currentIndex.set(indexFromScroll(track.scrollLeft, track.clientWidth, this.photos.length));
        }
    }

    /**
     * Прокрутка ленты вслед за выбором. Позиция считается от ширины дорожки, а
     * не от `scrollWidth`: кадры за пределами окна ещё не отрисованы, и общая
     * ширина до их появления меньше реальной.
     *
     * Переход мгновенный: `behavior: 'smooth'` внутри оверлея молча не двигает
     * дорожку — счётчик менялся, а кадр оставался прежним. Свайп при этом
     * по-прежнему анимирует сам браузер через scroll-snap.
     */
    #scrollToCurrent(): void {
        const track: HTMLElement | undefined = this.track()?.nativeElement;
        if (!track) {
            return;
        }
        track.scrollTo({ left: track.clientWidth * this.currentIndex(), behavior: 'instant' });
    }
}
