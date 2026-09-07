import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

type TMessageIds = 'missingBase';
type TOptions = [];

// In the ESLint configs it is available as "@nx/workspace-require-list-store-base".
export const RULE_NAME: string = 'require-list-store-base';

const BASE_CLASS_NAME: string = 'AdminListStoreBase';

/** There is one entry for a list — `readPage`: a list store is recognised by it */
const LIST_CALL_NAME: string = 'readPage';

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'A store that fetches a list must extend BaseListStoreService instead of repeating page, sort, filter and search handling of its own.',
        },
        schema: [],
        messages: {
            missingBase:
                "Store '{{name}}' calls getList() but does not extend {{base}}. Pages, sorting, filters, search and the mutation wrapper already live in the base — extend it instead of writing them again.",
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        if (!context.filename.endsWith('.store.ts')) {
            return {};
        }

        function baseClassNameOf(node: TSESTree.ClassDeclaration): string | null {
            const superClass: TSESTree.LeftHandSideExpression | null = node.superClass;
            if (!superClass) {
                return null;
            }
            if (superClass.type === 'Identifier') {
                return superClass.name;
            }
            if (superClass.type === 'MemberExpression' && superClass.property.type === 'Identifier') {
                return superClass.property.name;
            }

            return null;
        }

        function findEnclosingClass(node: TSESTree.Node): TSESTree.ClassDeclaration | null {
            let current: TSESTree.Node | undefined = node.parent;
            while (current) {
                if (current.type === 'ClassDeclaration') {
                    return current;
                }
                current = current.parent;
            }

            return null;
        }

        const reported: Set<TSESTree.ClassDeclaration> = new Set<TSESTree.ClassDeclaration>();

        return {
            [`CallExpression[callee.type="MemberExpression"][callee.property.name="${LIST_CALL_NAME}"]`](
                node: TSESTree.CallExpression
            ): void {
                const declaration: TSESTree.ClassDeclaration | null = findEnclosingClass(node);
                if (!declaration || reported.has(declaration)) {
                    return;
                }
                if (baseClassNameOf(declaration) === BASE_CLASS_NAME) {
                    return;
                }

                reported.add(declaration);
                context.report({
                    node: declaration.id ?? declaration,
                    messageId: 'missingBase',
                    data: { name: declaration.id?.name ?? '<anonymous>', base: BASE_CLASS_NAME },
                });
            },
        };
    },
});
