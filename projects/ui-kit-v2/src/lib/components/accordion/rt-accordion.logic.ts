/**
 * Раскрытые пункты после нажатия на пункт `index`: раскрытый сворачивается, свёрнутый
 * раскрывается, остальные остаются как были. Читающий сравнивает два ответа, и свернуть первый
 * при раскрытии второго значило бы отнять у него то, что он читал.
 */
export function toggleAccordionItem(open: ReadonlySet<number>, index: number): ReadonlySet<number> {
    const next: Set<number> = new Set(open);

    if (next.has(index)) {
        next.delete(index);
    } else {
        next.add(index);
    }

    return next;
}

/** Раскрытые пункты при входе: пункт из входа, если такой есть в списке, иначе ни одного. */
export function initialAccordionOpen(openIndex: number | null, count: number): ReadonlySet<number> {
    if (openIndex === null || openIndex < 0 || openIndex >= count) {
        return new Set();
    }

    return new Set([openIndex]);
}
