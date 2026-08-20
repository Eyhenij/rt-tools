import { IConfig, parseConfig } from './config.js';

describe('parseConfig — выключенные роли', () => {
    it('список ролей читается именами файлов без расширения', () => {
        const config: IConfig = parseConfig('{"rolesOff":["strict-teacher","conscience"]}');

        expect(config.rolesOff).toEqual(['strict-teacher', 'conscience']);
    });

    it('без ключа список пуст — дерево ничего не выключало', () => {
        expect(parseConfig('{}').rolesOff).toEqual([]);
    });

    it('выключение роли не трогает остальную настройку', () => {
        const config: IConfig = parseConfig('{"rolesOff":["strict-teacher"],"skip":["rules/api-layer.md"]}');

        expect(config.skip).toEqual(['rules/api-layer.md']);
        expect(config.observe).toBe(true);
    });
});
