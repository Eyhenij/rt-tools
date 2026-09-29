/**
 * The config of the check for literals and direct uses of steps in the second kit's styles.
 *
 * The rules `color-no-hex` and `rt-tools/no-hardcoded-design-tokens` are hung here rather than in the
 * common `stylelint.config.js` for one reason: `lint:styles` calls stylelint over all `projects/**`
 * with `--max-warnings 0`, and stylelint has no accepted list. Switch them on there and on the very
 * first day two hundred-odd piled-up places turn red, after which the rule is taken off instead of
 * being fixed. The set is judged by a check of its own (`tools/check-tokens-styles.mjs`), and it also
 * matches the findings against the accepted list.
 *
 * The set and its exceptions are named by the agreement:
 * `docs/specs/ui-kit-v2/proposed/design-tokens/implementation.md`, the section «The set the checks
 * judge». Here it is repeated by the line `files` — there is no second place where it is declared.
 */
import base from '../stylelint.config.js';

export default {
    ...base,
    overrides: [
        ...(base.overrides ?? []),
        {
            files: ['projects/ui-kit-v2/src/lib/**/*.scss', 'projects/ui-kit-v2/src/rich-editor/lib/**/*.scss'],
            rules: {
                'color-no-hex': true,

                /* `customProperties` judges a colour code inside a block's own property declaration too.
                   It is switched on only here: the first kit has places of its own that piled up, and
                   this line does not touch its checks. */
                'rt-tools/no-hardcoded-design-tokens': [true, { customProperties: true }],

                /* Between the step of the rounding, the shadow, the border width and the duration and
                   the place of its use stands the component's own property: `--rt-<block>-<what>` with
                   the step as the default value. The rule refuses a step taken directly.

                   The property's name is selected by the expression `^(?!--)`: a declaration of one's
                   own property is the only place where a step is named lawfully, and judging it is not
                   allowed — otherwise the rule forbids the very technique it was created for.

                   The padding, the font size and the dimensions do not go here: the role of a padding
                   and of a font size is not named by one word, and a property for it would come out as
                   the name of a place rather than the name of a role. */
                'declaration-property-value-disallowed-list': {
                    '/^(?!--)/': ['/var\\(--rt-(radius|shadow|border-width|duration)-/'],
                },
            },
        },
    ],
};
