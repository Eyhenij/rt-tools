import { computed, Service, Signal, signal, WritableSignal } from '@angular/core';

import { IRtToolbar } from './rt-toolbar.model';

/**
 * Связка полосы с панелью отборов приложения.
 *
 * Полоса с `filtersPanel="app"` отдаёт сюда свои отборы, пока живёт, а `rt-toolbar-filters-panel`
 * в маршруте приложения берёт их отсюда: полоса и панель стоят в разных местах страницы и друг друга
 * не видят. Отвечает полоса, отдавшая отборы последней.
 */
@Service()
export class RtToolbarFiltersHub {
    readonly #sources: WritableSignal<readonly IRtToolbar.IFiltersSource[]> = signal<readonly IRtToolbar.IFiltersSource[]>([]);

    /** Отборы полосы, отданные последними; `null`, пока ни одна полоса их не отдала. */
    public readonly current: Signal<IRtToolbar.IFiltersSource | null> = computed(
        (): IRtToolbar.IFiltersSource | null => this.#sources().at(-1) ?? null
    );

    /** Отдаёт отборы полосы и возвращает снятие. */
    public register(source: IRtToolbar.IFiltersSource): () => void {
        this.#sources.update((sources: readonly IRtToolbar.IFiltersSource[]): readonly IRtToolbar.IFiltersSource[] => [...sources, source]);

        return (): void =>
            this.#sources.update((sources: readonly IRtToolbar.IFiltersSource[]): readonly IRtToolbar.IFiltersSource[] =>
                sources.filter((item: IRtToolbar.IFiltersSource): boolean => item !== source)
            );
    }
}
