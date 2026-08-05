import { ERtAsideCloseIntent, IRtAsideCloseState, resolveCloseIntent } from './rt-aside-unsaved.logic';

function closeState(overrides: Partial<IRtAsideCloseState> = {}): IRtAsideCloseState {
    return {
        submitting: false,
        guarded: true,
        pristine: false,
        ...overrides,
    };
}

describe('resolveCloseIntent', () => {
    it('спрашивает, когда форма тронута: и на закрытии, и на смене маршрута панели', () => {
        expect(resolveCloseIntent(closeState())).toBe(ERtAsideCloseIntent.Ask);
    });

    it('закрывает нетронутую форму без вопроса', () => {
        expect(resolveCloseIntent(closeState({ pristine: true }))).toBe(ERtAsideCloseIntent.Close);
    });

    it('закрывает панель без гарда так же, как раньше', () => {
        expect(resolveCloseIntent(closeState({ guarded: false }))).toBe(ERtAsideCloseIntent.Close);
    });

    it('во время записи не закрывает и не спрашивает', () => {
        expect(resolveCloseIntent(closeState({ submitting: true }))).toBe(ERtAsideCloseIntent.Ignore);
        expect(resolveCloseIntent(closeState({ submitting: true, pristine: true }))).toBe(ERtAsideCloseIntent.Ignore);
    });
});
