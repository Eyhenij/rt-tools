'use strict';

const stylelint = require('stylelint');

/**
 * Запрещает `:host`, `:host()` и `:host-context()` в стилях кита, где у всех
 * компонентов `ViewEncapsulation.None`.
 *
 * Под `None` Angular селектор не переписывает, а в обычном документе `:host`
 * не совпадает ни с чем: правило, написанное через него, просто не работает —
 * и молча, потому что синтаксически оно верно. Так уже случалось: под `None`
 * лежали мёртвыми и `display: contents` у панелей, и тёмная тема активной
 * плитки навигации.
 *
 * Хост адресуется классом блока (`.rt-<блок>`), а если тот же класс висит ещё
 * и на корне шаблона — именем элемента (`rt-<блок>`). Предка, задающего тему,
 * вместо `:host-context()` адресуют напрямую: `[data-theme='dark'] …`.
 */

const RULE_NAME = 'rt-tools/no-host-selector';

const messages = stylelint.utils.ruleMessages(RULE_NAME, {
    rejected: (selector, pseudo) =>
        `"${selector}" — ${pseudo} под ViewEncapsulation.None не совпадает ни с чем, правило будет мёртвым. ` +
        `Хост адресуется классом блока (.rt-<блок>) либо именем элемента (rt-<блок>), ` +
        `предок с темой — напрямую ([data-theme='dark'] …).`,
});

/** `:host`, `:host(...)`, `:host-context(...)` — но не `.rt-host` и не `--host`. */
const HOST_PSEUDO = /(?<![\w-]):host(-context)?\b/g;

const ruleFunction = (primary, _secondary, _context) => {
    return (root, result) => {
        const validOptions = stylelint.utils.validateOptions(result, RULE_NAME, {
            actual: primary,
            possible: [true, false],
        });
        if (!validOptions || !primary) return;

        root.walkRules((rule) => {
            // Селекторы внутри @keyframes — это ключевые кадры (from/to/50%), не селекторы.
            if (rule.parent && rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;

            for (const selector of rule.selectors) {
                const match = selector.match(HOST_PSEUDO);
                if (!match) continue;

                stylelint.utils.report({
                    message: messages.rejected(selector, `:host${match[0].endsWith('-context') ? '-context' : ''}`),
                    node: rule,
                    word: match[0],
                    result,
                    ruleName: RULE_NAME,
                });
            }
        });
    };
};

ruleFunction.ruleName = RULE_NAME;
ruleFunction.messages = messages;
ruleFunction.meta = { fixable: false };

module.exports = stylelint.createPlugin(RULE_NAME, ruleFunction);
