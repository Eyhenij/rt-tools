import { Injectable, signal, WritableSignal } from '@angular/core';

import { IRtActionBar } from './action-bar-config.interface';

@Injectable()
export class RtActionBarService {
    public config: WritableSignal<IRtActionBar.Config> = signal({ buttons: [] });

    public setActions(buttons: IRtActionBar.Button[]): void {
        this.config.set({ buttons });
    }

    public setCounts(selected: number, total: number): void {
        this.config.set({ ...this.config(), selected, total });
    }

    public closeActionBar(): void {
        this.config.set({ ...this.config(), selected: 0, total: 0 });
    }
}
