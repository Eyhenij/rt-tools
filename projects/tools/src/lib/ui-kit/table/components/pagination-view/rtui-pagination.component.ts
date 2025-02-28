import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    HostListener,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { isNumber, Nullable, WINDOW } from '../../../../util';
import { DEFAULT_PAGE_SIZE } from '../../util/default-pagination';
import { PageModel } from '../../util/lists.interface';

@Component({
    selector: 'rtui-pagination',
    templateUrl: './rtui-pagination.component.html',
    styleUrls: ['./rtui-pagination.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, BlockDirective, ElemDirective],
})
export class RtuiPaginationComponent implements OnInit, AfterViewInit {
    readonly #injector: Injector = inject(Injector);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #fb: FormBuilder = inject(FormBuilder);
    readonly #windowRef: Window = inject(WINDOW);

    /** Current Page Model */
    public currentPageModel: InputSignal<PageModel> = input.required();
    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input.required<Nullable<boolean>, boolean>({
        transform: booleanAttribute,
    });

    /** Output action when Page Model changed */
    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();

    /** Form control for selected page size */
    public control: FormControl<number> = this.#fb.nonNullable.control(DEFAULT_PAGE_SIZE);
    public readonly divider: Signal<string> = signal('...');
    /** Page size options */
    public readonly pageSizes: Signal<number[]> = computed(() => {
        return [10, 20, 40, 50].filter(
            (el: number) => el / 2 <= this.currentPageModel()?.totalCount || el === this.currentPageModel()?.pageSize
        );
    });
    /** Array of current page numbers */
    public readonly numbers: WritableSignal<Array<number | string>> = signal([]);
    /** Page Model for compare */
    public readonly previousPageModel: WritableSignal<Nullable<PageModel>> = signal(null);
    /** Value of full content width */
    public readonly minContentFitWidth: WritableSignal<number> = signal(0);
    /** Indicates is content clipped */
    public readonly isContentClipped: WritableSignal<boolean> = signal(false);

    /** Container template ref */
    public readonly containerRef: Signal<Nullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('containerRef');

    /** Set 'isContentClipped' when widow resize */
    @HostListener('window:resize', ['$event'])
    public onResize(): void {
        if (this.isContentClipped() && this.#windowRef?.innerWidth && this.minContentFitWidth() + 36 < this.#windowRef.innerWidth) {
            this.isContentClipped.set(false);
        } else if (!this.isContentClipped() && this.#windowRef.innerWidth && this.minContentFitWidth() + 36 > this.#windowRef.innerWidth) {
            this.isContentClipped.set(true);
        }
        this.#setMinContentFitWidth();
    }

    public ngOnInit(): void {
        this.numbers.set(this.#fillArray());
        this.control.patchValue(this.currentPageModel()?.pageSize ?? DEFAULT_PAGE_SIZE, { emitEvent: false });

        this.control.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((value: number) => {
            this.changePageSize(value);
        });

        /** Update Page Model */
        effect(
            () => {
                if (Boolean(this.currentPageModel()) && Boolean(this.previousPageModel())) {
                    this.numbers.set(this.#fillArray());
                    this.#setMinContentFitWidth();
                }
                this.previousPageModel.set(this.currentPageModel());
            },
            { injector: this.#injector }
        );
    }

    /** Set 'isContentClipped' on init */
    public ngAfterViewInit(): void {
        const currentContainerWidth: Nullable<number> = this.containerRef()?.nativeElement?.scrollWidth;

        if (currentContainerWidth && this.#windowRef?.innerWidth) {
            this.minContentFitWidth.set(currentContainerWidth);
            this.isContentClipped.set(currentContainerWidth > this.#windowRef.innerWidth);
        }
    }

    /** Action for change Page Model */
    public changePageSize(pageSize: number): void {
        const current_total: number = Math.ceil(this.currentPageModel().totalCount / pageSize);
        const previous_total: number = Math.ceil(this.currentPageModel().totalCount / this.currentPageModel().pageSize);
        const correction: number = Math.floor(
            ((previous_total - this.currentPageModel().pageNumber) * this.currentPageModel().pageSize) / pageSize
        );

        this.pageModelChange.emit({ pageNumber: current_total - correction, pageSize });
    }

    /** Action for select page */
    public onChangePageNumber(pageNumber: string | number): void {
        if (isNumber(pageNumber)) {
            if (!this.currentPageModel().hasNext && this.currentPageModel().pageNumber <= pageNumber) {
                return;
            }

            if (!this.currentPageModel().hasPrev && this.currentPageModel().pageNumber >= pageNumber) {
                return;
            }

            this.pageModelChange.emit({ pageNumber });
        }
    }

    /** Fill the array width current page numbers */
    #fillArray(): Array<number | string> {
        const current: number = this.currentPageModel().pageNumber;
        const total: number = Math.ceil(this.currentPageModel().totalCount / this.currentPageModel().pageSize);
        const result: Array<number | string> = Array(total)
            .fill(0, 0, total)
            .map((x: number | string, i: number) => i + 1);

        if (total <= 6) {
            return result;
        } else {
            if (current < 3 || current > total - 2) {
                return result.slice(0, 3).concat(this.divider(), ...result.slice(total - 3, total));
            }

            if (current === 3) {
                return result.slice(0, 4).concat(this.divider(), ...result.slice(total - 2, total));
            }

            if (current === 4) {
                return result.slice(0, 5).concat(this.divider(), ...result.slice(total - 1, total));
            }

            if (current > 4 && current <= total - 4) {
                return result
                    .slice(0, 1)
                    .concat(this.divider(), current - 1, current, current + 1, this.divider(), ...result.slice(total - 1, total));
            }

            if (current === total - 3) {
                return result.slice(0, 1).concat(this.divider(), ...result.slice(total - 5, total));
            }

            if (current === total - 2) {
                return result.slice(0, 2).concat(this.divider(), ...result.slice(total - 4, total));
            }

            return [];
        }
    }

    /** Set 'isContentClipped' when content changed */
    #setMinContentFitWidth(): void {
        const currentContainerWidth: Nullable<number> = this.containerRef()?.nativeElement?.scrollWidth;

        if (currentContainerWidth && this.minContentFitWidth() && this.minContentFitWidth() < currentContainerWidth) {
            this.minContentFitWidth.set(currentContainerWidth);
        }
    }
}
