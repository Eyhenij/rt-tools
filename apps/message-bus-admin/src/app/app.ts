import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const BEM_BLOCK: string = 'admin-root';

@Component({
    selector: 'admin-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class App {}
