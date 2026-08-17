import { RULE_NAME as noMethodCallInTemplateName, rule as noMethodCallInTemplate } from './rules/no-method-call-in-template';
import { RULE_NAME as noSubscribeInMethodsName, rule as noSubscribeInMethods } from './rules/no-subscribe-in-methods';
import { RULE_NAME as requireBemDirectivesName, rule as requireBemDirectives } from './rules/require-bem-directives';
import { RULE_NAME as requireEnumPrefixName, rule as requireEnumPrefix } from './rules/require-enum-prefix';
import { RULE_NAME as requireHostBemBlockName, rule as requireHostBemBlock } from './rules/require-host-bem-block';
import { RULE_NAME as requireInterfacePrefixName, rule as requireInterfacePrefix } from './rules/require-interface-prefix';
import { RULE_NAME as requireListStoreBaseName, rule as requireListStoreBase } from './rules/require-list-store-base';
import { RULE_NAME as requireModDirectiveImportName, rule as requireModDirectiveImport } from './rules/require-mod-directive-import';
import {
    RULE_NAME as requireSourceSuffixForSubjectsName,
    rule as requireSourceSuffixForSubjects,
} from './rules/require-source-suffix-for-subjects';
import { RULE_NAME as requireSuffixDeclarationName, rule as requireSuffixDeclaration } from './rules/require-suffix-declaration';
import { RULE_NAME as requireTakeUntilDestroyedName, rule as requireTakeUntilDestroyed } from './rules/require-take-until-destroyed';
import { RULE_NAME as requireTypePrefixName, rule as requireTypePrefix } from './rules/require-type-prefix';

/**
 * Import your custom workspace rules at the top of this file.
 *
 * For example:
 *
 * import { RULE_NAME as myCustomRuleName, rule as myCustomRule } from './rules/my-custom-rule';
 *
 * In order to quickly get started with writing rules you can use the
 * following generator command and provide your desired rule name:
 *
 * ```sh
 * npx nx g @nx/eslint:workspace-rule {{ NEW_RULE_NAME }}
 * ```
 */

module.exports = {
    /**
     * Apply the imported custom rules here.
     *
     * For example (using the example import above):
     *
     * rules: {
     *  [myCustomRuleName]: myCustomRule
     * }
     */
    rules: {
        [requireTakeUntilDestroyedName]: requireTakeUntilDestroyed,
        [requireBemDirectivesName]: requireBemDirectives,
        [requireHostBemBlockName]: requireHostBemBlock,
        [requireModDirectiveImportName]: requireModDirectiveImport,
        [requireSourceSuffixForSubjectsName]: requireSourceSuffixForSubjects,
        [noSubscribeInMethodsName]: noSubscribeInMethods,
        [noMethodCallInTemplateName]: noMethodCallInTemplate,
        [requireInterfacePrefixName]: requireInterfacePrefix,
        [requireTypePrefixName]: requireTypePrefix,
        [requireEnumPrefixName]: requireEnumPrefix,
        [requireListStoreBaseName]: requireListStoreBase,
        [requireSuffixDeclarationName]: requireSuffixDeclaration,
    },
};
