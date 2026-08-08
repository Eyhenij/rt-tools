import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtuiButton, RtuiButtonComponent } from '../../rtui-button.component';

/**
 * Все оси кнопки разом, каждая ячейка подписана и помечена `data-case`.
 *
 * Пометка нужна не оформлению, а замеру: по ней снимаются вычисленные отступы,
 * скругления и кегль до правки и после, и расхождение видно числом, а не на глаз.
 */
@Component({
    selector: 'app-button-matrix',
    templateUrl: './test-button-matrix.component.html',
    styleUrl: './test-button-matrix.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiButtonComponent,
    ],
})
export class TestButtonMatrixComponent {
    public readonly types: IRtuiButton.Type[] = ['icon', 'fab', 'pill'];
    public readonly sizes: IRtuiButton.Size[] = ['xs', 'sm', 'md', 'lg'];
    public readonly variants: IRtuiButton.Variant[] = ['default', 'primary', 'danger', 'success', 'warning', 'accent'];
    public readonly radii: IRtuiButton.Radius[] = ['none', 'sm', 'md', 'lg', 'full'];
    public readonly appearances: IRtuiButton.Appearance[] = ['solid', 'outline', 'light', 'text'];
}
