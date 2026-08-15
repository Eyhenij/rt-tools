/**
 * Разбор доводов командной строки.
 *
 * Проверяется единственное, ради чего он заведён: незнакомый довод виден, а знакомый вместе со
 * своим значением — нет. Промах в любую сторону одинаково плох: пропущенный незнакомый довод
 * пускает вызов дальше, а значение, принятое за довод, отбивает законный вызов.
 */
import { unknownFlagsIn } from './argv.js';

const KNOWN: readonly string[] = ['--dry-run', '--root <>'];

describe('unknownFlagsIn', () => {
    it('SC-AK-185 — знакомый довод незнакомым не считается', () => {
        expect(unknownFlagsIn(['--dry-run'], KNOWN)).toEqual([]);
    });

    it('SC-AK-186 — незнакомый довод назван', () => {
        expect(unknownFlagsIn(['--help'], KNOWN)).toEqual(['--help']);
    });

    it('SC-AK-187 — значение при доводе доводом не считается', () => {
        expect(unknownFlagsIn(['--root', '/дерево'], KNOWN)).toEqual([]);
    });

    it('SC-AK-188 — значение, начатое с дефиса, за довод не принимается', () => {
        expect(unknownFlagsIn(['--root', '-путь'], KNOWN)).toEqual([]);
    });

    it('SC-AK-189 — значение через равенство читается тем же доводом', () => {
        expect(unknownFlagsIn(['--root=/дерево'], KNOWN)).toEqual([]);
    });

    it('SC-AK-190 — довод с параметром, стоящий последним, вызова не роняет', () => {
        expect(unknownFlagsIn(['--root'], KNOWN)).toEqual([]);
    });

    it('SC-AK-191 — путь без дефиса доводом не считается', () => {
        expect(unknownFlagsIn(['докладная.md'], KNOWN)).toEqual([]);
    });

    it('SC-AK-192 — незнакомое называется целиком, а не первым совпадением', () => {
        expect(unknownFlagsIn(['--help', '--dry-run', '-v'], KNOWN)).toEqual(['--help', '-v']);
    });

    it('SC-AK-193 — у пустого набора незнакомо всё, начатое с дефиса', () => {
        expect(unknownFlagsIn(['--dry-run'], [])).toEqual(['--dry-run']);
    });
});
