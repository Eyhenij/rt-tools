import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, Signal, viewChild } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable, RtIconOutlinedDirective } from '../../util';
import { IRtSnackBar } from './snack-bar-config.interface';

@Component({
    selector: 'rtui-snack-bar',
    templateUrl: './snack-bar.component.html',
    styleUrls: ['./snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButton, MatIconButton, MatIcon, ElemDirective, BlockDirective, RtIconOutlinedDirective],
})
export class RtuiSnackBarComponent {
    public readonly data: IRtSnackBar.Data = inject(MAT_SNACK_BAR_DATA);
    readonly #snackBarRef: MatSnackBarRef<RtuiSnackBarComponent> = inject(MatSnackBarRef<RtuiSnackBarComponent>);
    readonly #animationBuilder: AnimationBuilder = inject(AnimationBuilder);

    public player: AnimationPlayer | undefined;

    public readonly progressTplRef: Signal<Nullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('progressTpl');

    constructor() {
        afterNextRender(() => {
            if (this.data.isProgressBarShown && this.data.duration) {
                this.#startAnimation();
            }
        });
    }

    @HostListener('mouseover')
    public onMouseOver(): void {
        this.#pauseAnimation();
    }

    @HostListener('mouseout')
    public onMouseOut(): void {
        this.#resumeAnimation();
    }

    public dismiss(): void {
        this.#snackBarRef.dismissWithAction();
    }

    public close(): void {
        this.#snackBarRef.dismiss();
    }

    #startAnimation(): void {
        const element: HTMLElement | undefined = this.progressTplRef()?.nativeElement;

        if (element) {
            const factory: AnimationFactory = this.#animationBuilder.build([
                style({ width: '100%', 'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }),
                animate('{{ time }} linear', style({ width: '0', 'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)' })),
            ]);

            this.player = factory.create(element, { params: { time: this.data.duration + 'ms' } });
            this.player.onDone(() => this.close());
            this.player.play();
        }
    }

    #pauseAnimation(): void {
        this.player?.pause();
    }

    #resumeAnimation(): void {
        this.player?.play();
    }
}
