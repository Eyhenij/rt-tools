/**
 * Панель, открытая из нашей — список `rt-select`, календарь, вложенное меню.
 *
 * В DOM она лежит не внутри нашей панели, а рядом, отдельным оверлеем CDK.
 * Поэтому и уход курсора на неё, и клик по ней выглядят как «ушёл наружу»:
 * меню профиля закрывалось прямо под рукой, стоило потянуться к списку
 * языков, а выбранное значение до обработчика не доходило — панель со
 * `rt-select` разрушалась раньше.
 *
 * Вложенность определяется порядком в контейнере оверлеев: CDK добавляет их
 * по мере открытия, поэтому панель, открытая из нашей, всегда следует за
 * нашей. Соседний оверлей, открытый до нас, этой проверкой не удерживается —
 * клик по нему закрывает попап, как и любой клик снаружи.
 */
export function rtIsNestedOverlay(panel: HTMLElement | undefined, target: EventTarget | null): boolean {
    if (!panel || !(target instanceof Element)) {
        return false;
    }

    const nested: Element | null = target.closest('.cdk-overlay-pane');
    const container: HTMLElement | null = panel.parentElement;
    if (nested === null || nested === panel || container === null) {
        return false;
    }

    // `querySelectorAll` отдаёт узлы в порядке документа — им и меряется,
    // какая панель открыта позже
    const panes: readonly Element[] = Array.from(container.querySelectorAll('.cdk-overlay-pane'));

    return panes.indexOf(nested) > panes.indexOf(panel);
}
