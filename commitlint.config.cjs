module.exports = {
    extends: ['@commitlint/config-angular'],
    rules: {
        'header-max-length': [2, 'always', 150],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'type-enum': [2, 'always', ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'chore']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'scope-enum': [2, 'always', ['rt:ui-kit', 'rt:util']],
    },
};
