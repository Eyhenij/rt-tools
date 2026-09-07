'use strict';

const stylelint = require('stylelint');

/**
 * It forbids `:host`, `:host()` and `:host-context()` in the kit's styles, where all
 * the components have `ViewEncapsulation.None`.
 *
 * Under `None` Angular does not rewrite the selector, and in an ordinary document `:host`
 * matches nothing: a rule written through it simply does not work —
 * and silently, because syntactically it is right. That has happened already: under `None`
 * both `display: contents` at the panels and the dark theme of the active
 * navigation tile lay dead.
 *
 * The host is addressed by the block's class (`.rt-<block>`), and if the same class hangs
 * on the template root as well — by the element's name (`rt-<block>`). An ancestor setting the
 * theme is addressed directly instead of `:host-context()`: `[data-theme='dark'] …`.
 */

const RULE_NAME = 'rt-tools/no-host-selector';

const messages = stylelint.utils.ruleMessages(RULE_NAME, {
    rejected: (selector, pseudo) =>
        `"${selector}" — ${pseudo} under ViewEncapsulation.None matches nothing, the rule will be dead. ` +
        `The host is addressed by the block's class (.rt-<block>) or by the element's name (rt-<block>), ` +
        `an ancestor with a theme — directly ([data-theme='dark'] …).`,
});

/** `:host`, `:host(...)`, `:host-context(...)` — but not `.rt-host` and not `--host`. */
const HOST_PSEUDO = /(?<![\w-]):host(-context)?\b/g;

const ruleFunction = (primary, _secondary, _context) => {
    return (root, result) => {
        const validOptions = stylelint.utils.validateOptions(result, RULE_NAME, {
            actual: primary,
            possible: [true, false],
        });
        if (!validOptions || !primary) return;

        root.walkRules((rule) => {
            // The selectors inside @keyframes are keyframes (from/to/50%), not selectors.
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
