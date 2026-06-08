'use strict';

const stylelint = require('stylelint');
const valueParser = require('module').createRequire(require.resolve('stylelint'))('postcss-value-parser');

/**
 * Запрещает хардкод дизайн-значений в component-SCSS rt-tools.
 *
 * Разрешённые var-префиксы: `--rt-*` (проектные токены), `--mat-*` / `--mdc-*`
 * (Angular Material bridge). Любой другой `var(--x)` — нарушение.
 *
 * По группам свойства запрещает: хардкод цветов (hex/named/rgb/hsl), magic numbers
 * в padding/margin/gap/radius/font-size/border-width/..., SCSS-функции цвета и
 * `$vars`/`#{}`-интерполяцию. Разрешает calc/min/max/clamp, color-mix/color и
 * modern-color-функции `from var()`, `0`, universal-ключевые слова.
 *
 */

const RULE_NAME = 'rt-tools/no-hardcoded-design-tokens';

const messages = stylelint.utils.ruleMessages(RULE_NAME, {
    hardcodedColor: (value) => `"${value}" — use var(--rt-*) (or --mat-*/--mdc-*). Hardcoded colors break theming.`,
    hardcodedNumeric: (value, prop) => `"${value}" in ${prop} — use var(--rt-*). No magic numbers.`,
    hardcodedNumber: (value, prop) => `"${value}" in ${prop} — use var(--rt-*) instead of a unitless literal.`,
    forbiddenVarPrefix: (name) => `var(${name}) — only --rt-*, --mat-* and --mdc-* prefixes are allowed.`,
    scssExpression: (value) => `"${value}" — SCSS expressions do not respect CSS theming. Use var(--rt-*).`,
    compositeRequired: (prop) => `${prop} must use a single var(--rt-*) composite token (or "none").`,
});

/** Префиксы CSS-переменных, признаваемые дизайн-токенами. */
const ALLOWED_VAR_PREFIX = /^--(rt|mat|mdc)-/;

const UNIVERSAL_KEYWORDS = new Set([
    'auto',
    'none',
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
    'transparent',
    'currentcolor',
]);

const BORDER_STYLE_KEYWORDS = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden']);

const FONT_STYLE_KEYWORDS = new Set(['italic', 'normal', 'oblique']);

const TIMING_FUNCTION_KEYWORDS = new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end']);

const TIMING_FUNCTION_FUNCS = new Set(['cubic-bezier', 'steps']);

const ANIMATION_DIRECTION_KEYWORDS = new Set([
    'normal',
    'reverse',
    'alternate',
    'alternate-reverse',
    'forwards',
    'backwards',
    'both',
    'running',
    'paused',
    'infinite',
]);

const SAFE_COLOR_FUNCS = new Set(['color-mix', 'color']);

const NAMED_CSS_COLORS = new Set([
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkgrey',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'grey',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'rebeccapurple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
]);

const HEX_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NUMERIC_PATTERN =
    /^-?(\d+\.?\d*|\.\d+)(px|em|rem|vh|vw|vmin|vmax|svh|svw|dvh|dvw|lvh|lvw|%|s|ms|deg|rad|turn|pt|pc|cm|mm|in|fr|ch|ex|q|cap|ic|lh|rlh|cqi|cqb|cqmin|cqmax|cqw|cqh)?$/i;
const ZERO_PATTERN = /^-?0(\.0+)?(px|em|rem|ms|s|%|vh|vw|deg)?$/i;
const SCSS_VAR_PATTERN = /^\$[\w-]/;
const SCSS_INTERP_PATTERN = /#\{/;
const SCSS_COLOR_FUNCS = new Set([
    'darken',
    'lighten',
    'saturate',
    'desaturate',
    'adjust-hue',
    'complement',
    'invert',
    'mix',
    'transparentize',
    'opacify',
    'fade-in',
    'fade-out',
]);

const ARITHMETIC_OPERATORS = new Set(['+', '-', '*', '/']);

const PROPERTY_GROUPS = {
    inspectNumeric: new Set([
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'gap',
        'row-gap',
        'column-gap',
        'border-radius',
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-left-radius',
        'border-bottom-right-radius',
        'font-size',
        'border-width',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'letter-spacing',
    ]),
    inspectColor: new Set([
        'color',
        'background-color',
        'background-image',
        'fill',
        'stroke',
        'outline-color',
        'caret-color',
        'accent-color',
        'text-decoration-color',
        'column-rule-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
    ]),
    fontWeight: new Set(['font-weight']),
    lineHeight: new Set(['line-height']),
    fontStyle: new Set(['font-style']),
    borderStyle: new Set(['border-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style']),
    composite: new Set(['box-shadow', 'text-shadow']),
    borderShorthand: new Set(['border', 'border-top', 'border-right', 'border-bottom', 'border-left']),
    transitionList: new Set(['transition']),
    transitionTime: new Set(['transition-duration', 'transition-delay']),
    transitionTiming: new Set(['transition-timing-function']),
    animationList: new Set(['animation']),
    animationTime: new Set(['animation-duration', 'animation-delay']),
    animationTiming: new Set(['animation-timing-function']),
    animationIterationCount: new Set(['animation-iteration-count']),
    animationEnum: new Set(['animation-direction', 'animation-fill-mode', 'animation-play-state']),
};

function classifyProperty(prop) {
    for (const [group, set] of Object.entries(PROPERTY_GROUPS)) {
        if (set.has(prop)) return group;
    }
    return null;
}

function isAllowedVar(node) {
    if (node.type !== 'function' || node.value !== 'var') return false;
    const first = node.nodes.find((n) => n.type === 'word');
    if (!first) return false;
    return ALLOWED_VAR_PREFIX.test(first.value);
}

function isForbiddenVarPrefix(node) {
    if (node.type !== 'function' || node.value !== 'var') return false;
    const first = node.nodes.find((n) => n.type === 'word');
    if (!first) return false;
    return !ALLOWED_VAR_PREFIX.test(first.value);
}

function isAllowedMathFunc(node) {
    if (node.type !== 'function') return false;
    return ['calc', 'min', 'max', 'clamp'].includes(node.value);
}

function nextSignificantSibling(nodes, idx) {
    for (let j = idx + 1; j < nodes.length; j++) {
        const n = nodes[j];
        if (n.type !== 'space' && n.type !== 'div') return n;
    }
    return null;
}

function hasFromVarSource(node) {
    return node.nodes.some((n, i, arr) => {
        if (n.type !== 'word' || n.value !== 'from') return false;
        const next = nextSignificantSibling(arr, i);
        return next !== null && isAllowedVar(next);
    });
}

function isSafeColorFunc(node) {
    if (node.type !== 'function') return false;
    if (!SAFE_COLOR_FUNCS.has(node.value)) return false;
    if (node.value === 'color-mix') {
        return node.nodes.some((n) => isAllowedVar(n));
    }
    return hasFromVarSource(node);
}

function isModernColorWithVarSource(node) {
    if (node.type !== 'function') return false;
    if (!['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'].includes(node.value)) {
        return false;
    }
    return hasFromVarSource(node);
}

function isZeroWord(word) {
    return ZERO_PATTERN.test(word) && /^-?0/.test(word);
}

function isUniversalKeyword(word) {
    return UNIVERSAL_KEYWORDS.has(word.toLowerCase());
}

function isHexColor(word) {
    return HEX_PATTERN.test(word);
}

function isNamedColor(word) {
    return NAMED_CSS_COLORS.has(word.toLowerCase());
}

function isNumericLiteral(word) {
    return NUMERIC_PATTERN.test(word);
}

function isUnitlessNumber(word) {
    return /^-?\d+\.?\d*$|^-?\.\d+$/.test(word);
}

function isScssExpression(raw) {
    return SCSS_VAR_PATTERN.test(raw) || SCSS_INTERP_PATTERN.test(raw);
}

function isScssColorFunc(node) {
    return node.type === 'function' && SCSS_COLOR_FUNCS.has(node.value);
}

function walkAndReport(nodes, propName, group, report, inMathFunc) {
    for (const node of nodes) {
        if (node.type === 'space' || node.type === 'div') continue;

        if (node.type === 'function') {
            if (isAllowedVar(node)) continue;
            if (isForbiddenVarPrefix(node)) {
                const inner = node.nodes.find((n) => n.type === 'word');
                report({
                    msg: messages.forbiddenVarPrefix(inner ? inner.value : '?'),
                    word: valueParser.stringify(node),
                });
                continue;
            }
            if (isAllowedMathFunc(node)) {
                walkAndReport(node.nodes, propName, group, report, true);
                continue;
            }
            if (isSafeColorFunc(node) || isModernColorWithVarSource(node)) {
                continue;
            }
            if (isScssColorFunc(node)) {
                report({ msg: messages.scssExpression(valueParser.stringify(node)), word: valueParser.stringify(node) });
                continue;
            }
            if (['rgb', 'rgba', 'hsl', 'hsla', 'hwb'].includes(node.value)) {
                report({ msg: messages.hardcodedColor(valueParser.stringify(node)), word: valueParser.stringify(node) });
                continue;
            }
            if (
                ['linear-gradient', 'radial-gradient', 'conic-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient'].includes(
                    node.value
                )
            ) {
                walkAndReport(node.nodes, propName, 'inspectColor', report, inMathFunc);
                continue;
            }
            walkAndReport(node.nodes, propName, group, report, inMathFunc);
            continue;
        }

        if (node.type !== 'word') continue;
        const word = node.value;

        if (inMathFunc) {
            if (ARITHMETIC_OPERATORS.has(word)) continue;
            if (isUnitlessNumber(word)) continue;
            if (isNumericLiteral(word) && !isZeroWord(word)) {
                report({ msg: messages.hardcodedNumeric(word, propName), word });
                continue;
            }
            if (isHexColor(word) || isNamedColor(word)) {
                report({ msg: messages.hardcodedColor(word), word });
                continue;
            }
            if (isScssExpression(word)) {
                report({ msg: messages.scssExpression(word), word });
                continue;
            }
            continue;
        }

        if (isScssExpression(word)) {
            report({ msg: messages.scssExpression(word), word });
            continue;
        }

        if (isZeroWord(word)) continue;
        if (isUniversalKeyword(word)) continue;

        if (group === 'inspectColor' || group === 'colorSubcontext') {
            if (isHexColor(word)) {
                report({ msg: messages.hardcodedColor(word), word });
                continue;
            }
            if (isNamedColor(word)) {
                report({ msg: messages.hardcodedColor(word), word });
                continue;
            }
            if (isNumericLiteral(word) || isUnitlessNumber(word)) {
                report({ msg: messages.hardcodedNumeric(word, propName), word });
                continue;
            }
            report({ msg: messages.hardcodedColor(word), word });
            continue;
        }

        if (group === 'inspectNumeric') {
            if (isNumericLiteral(word)) {
                report({ msg: messages.hardcodedNumeric(word, propName), word });
                continue;
            }
            if (isUnitlessNumber(word)) {
                report({ msg: messages.hardcodedNumber(word, propName), word });
                continue;
            }
            if (isHexColor(word) || isNamedColor(word)) {
                report({ msg: messages.hardcodedColor(word), word });
                continue;
            }
            report({ msg: messages.hardcodedNumeric(word, propName), word });
            continue;
        }

        if (group === 'fontWeight' || group === 'lineHeight') {
            if (isUnitlessNumber(word) || isNumericLiteral(word)) {
                report({ msg: messages.hardcodedNumber(word, propName), word });
                continue;
            }
            report({ msg: messages.hardcodedNumber(word, propName), word });
            continue;
        }

        if (group === 'fontStyle') {
            if (FONT_STYLE_KEYWORDS.has(word.toLowerCase())) continue;
            report({ msg: messages.hardcodedNumeric(word, propName), word });
            continue;
        }

        if (group === 'borderStyle') {
            if (BORDER_STYLE_KEYWORDS.has(word.toLowerCase())) continue;
            report({ msg: messages.hardcodedNumeric(word, propName), word });
            continue;
        }

        if (group === 'transitionTiming' || group === 'animationTiming') {
            if (TIMING_FUNCTION_KEYWORDS.has(word.toLowerCase())) continue;
            report({ msg: messages.hardcodedNumeric(word, propName), word });
            continue;
        }

        if (group === 'transitionTime' || group === 'animationTime') {
            if (isNumericLiteral(word)) {
                report({ msg: messages.hardcodedNumeric(word, propName), word });
                continue;
            }
            continue;
        }

        if (group === 'animationIterationCount') {
            if (word.toLowerCase() === 'infinite') continue;
            if (/^\d+$/.test(word)) continue;
            report({ msg: messages.hardcodedNumeric(word, propName), word });
            continue;
        }

        if (group === 'animationEnum') {
            if (ANIMATION_DIRECTION_KEYWORDS.has(word.toLowerCase())) continue;
            continue;
        }

        if (group === 'borderShorthandContext') {
            if (BORDER_STYLE_KEYWORDS.has(word.toLowerCase())) continue;
            if (isNumericLiteral(word)) {
                report({ msg: messages.hardcodedNumeric(word, propName), word });
                continue;
            }
            if (isHexColor(word) || isNamedColor(word)) {
                report({ msg: messages.hardcodedColor(word), word });
                continue;
            }
            if (isUnitlessNumber(word)) {
                report({ msg: messages.hardcodedNumber(word, propName), word });
                continue;
            }
        }
    }
}

function checkComposite(parsed, propName, report) {
    const sigNodes = parsed.nodes.filter((n) => n.type !== 'space' && n.type !== 'div');
    if (sigNodes.length === 1) {
        const only = sigNodes[0];
        if (only.type === 'word' && (isUniversalKeyword(only.value) || isZeroWord(only.value))) {
            return;
        }
        if (only.type === 'function' && isAllowedVar(only)) return;
    }
    const allAllowed = sigNodes.every((n) => {
        if (n.type === 'word') return isUniversalKeyword(n.value) || isZeroWord(n.value);
        if (n.type === 'function') return isAllowedVar(n) || isAllowedMathFunc(n);
        return false;
    });
    if (allAllowed) return;
    report({ msg: messages.compositeRequired(propName), word: valueParser.stringify(parsed) });
}

function checkTransitionOrAnimationList(parsed, propName, report) {
    const items = [];
    let current = [];
    for (const node of parsed.nodes) {
        if (node.type === 'div' && node.value === ',') {
            items.push(current);
            current = [];
            continue;
        }
        current.push(node);
    }
    if (current.length) items.push(current);

    for (const item of items) {
        for (const node of item) {
            if (node.type === 'space' || node.type === 'div') continue;
            if (node.type === 'word') {
                const w = node.value;
                if (isUniversalKeyword(w) || isZeroWord(w)) continue;
                if (TIMING_FUNCTION_KEYWORDS.has(w.toLowerCase())) continue;
                if (ANIMATION_DIRECTION_KEYWORDS.has(w.toLowerCase())) continue;
                if (/^\d+$/.test(w)) continue;
                if (isNumericLiteral(w)) {
                    report({ msg: messages.hardcodedNumeric(w, propName), word: w });
                    continue;
                }
                if (isScssExpression(w)) {
                    report({ msg: messages.scssExpression(w), word: w });
                    continue;
                }
                continue;
            }
            if (node.type === 'function') {
                if (isAllowedVar(node)) continue;
                if (isForbiddenVarPrefix(node)) {
                    const inner = node.nodes.find((n) => n.type === 'word');
                    report({
                        msg: messages.forbiddenVarPrefix(inner ? inner.value : '?'),
                        word: valueParser.stringify(node),
                    });
                    continue;
                }
                if (TIMING_FUNCTION_FUNCS.has(node.value)) continue;
                if (isAllowedMathFunc(node)) {
                    walkAndReport(node.nodes, propName, 'inspectNumeric', report);
                    continue;
                }
            }
        }
    }
}

const ruleFunction = (primary, _options, _context) => {
    return (root, result) => {
        const validOptions = stylelint.utils.validateOptions(result, RULE_NAME, {
            actual: primary,
            possible: [true, false],
        });
        if (!validOptions || !primary) return;

        root.walkDecls((decl) => {
            const propName = decl.prop.toLowerCase();
            if (propName.startsWith('--')) return;
            if (propName.startsWith('$')) return;

            const group = classifyProperty(propName);
            if (!group) return;

            const parsed = valueParser(decl.value);

            const report = ({ msg, word }) => {
                stylelint.utils.report({
                    message: msg,
                    node: decl,
                    word: word || decl.value,
                    result,
                    ruleName: RULE_NAME,
                });
            };

            if (group === 'composite') {
                checkComposite(parsed, propName, report);
                return;
            }
            if (group === 'transitionList' || group === 'animationList') {
                checkTransitionOrAnimationList(parsed, propName, report);
                return;
            }
            if (group === 'borderShorthand') {
                walkAndReport(parsed.nodes, propName, 'borderShorthandContext', report);
                return;
            }
            walkAndReport(parsed.nodes, propName, group, report);
        });
    };
};

ruleFunction.ruleName = RULE_NAME;
ruleFunction.messages = messages;
ruleFunction.meta = { fixable: false };

module.exports = stylelint.createPlugin(RULE_NAME, ruleFunction);
