// Описание коммита пишется на языке дерева. Судится присутствие русской буквы, а не отсутствие
// латиницы: в заголовке законно стоят область правки, номер версии, имя файла и служебная
// пометка пропуска конвейера — запрет латиницы отбивал бы их вместе с английским описанием.
const RUSSIAN_LETTER = /[а-яё]/i;

module.exports = {
    extends: ['@commitlint/config-angular'],
    plugins: [
        {
            rules: {
                'subject-russian': ({ subject }) => [
                    typeof subject === 'string' && RUSSIAN_LETTER.test(subject),
                    'описание коммита пишется по-русски: в истории этого дерева все записи русские, ' +
                        'и английская строка читается в ней как чужая. Служебные пометки вроде [ci skip] ' +
                        'остаются английскими — они для хостинга, а не для человека',
                ],
            },
        },
    ],
    rules: {
        'header-max-length': [2, 'always', 150],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'type-enum': [2, 'always', ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'chore']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'subject-russian': [2, 'always'],
        'scope-enum': [2, 'always', ['rt:core', 'rt:store', 'rt:utils', 'rt:ui-kit', 'rt:ui-kit-v2', 'rt:agent-kit', 'rt:message-bus']],
    },
};
