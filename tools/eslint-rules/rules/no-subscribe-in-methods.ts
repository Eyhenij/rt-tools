import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

type TMessageIds = 'notAllowed';
type TOptions = [];

// Доступно в ESLint-конфигах как "@nx/workspace-no-subscribe-in-methods".
export const RULE_NAME: string = 'no-subscribe-in-methods';

const ALLOWED_METHOD_NAMES: ReadonlySet<string> = new Set(['ngOnInit']);

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow direct .subscribe() inside class methods (except constructor and ngOnInit). Action methods should emit into a Subject; the long-lived subscription belongs in a constructor, ngOnInit, or a field initializer.',
        },
        schema: [],
        messages: {
            notAllowed:
                "Direct .subscribe() is not allowed inside '{{name}}'. Declare a Subject, call subject.next() here, and place the subscription (with switchMap/exhaustMap/concatMap) in a constructor, ngOnInit, or a field initializer.",
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        type TClassMember = TSESTree.MethodDefinition | TSESTree.PropertyDefinition;

        function findEnclosingClassMember(node: TSESTree.Node): TClassMember | null {
            let current: TSESTree.Node | undefined = node.parent;
            while (current) {
                if (current.type === 'MethodDefinition' || current.type === 'PropertyDefinition') {
                    return current;
                }
                current = current.parent;
            }
            return null;
        }

        function getMethodName(method: TSESTree.MethodDefinition): string {
            const key: TSESTree.Node = method.key;
            if (key.type === 'Identifier') {
                return key.name;
            }
            if (key.type === 'PrivateIdentifier') {
                return `#${key.name}`;
            }
            if (key.type === 'Literal' && typeof key.value === 'string') {
                return key.value;
            }
            return '<computed>';
        }

        return {
            'CallExpression[callee.type="MemberExpression"][callee.property.name="subscribe"]'(node: TSESTree.CallExpression): void {
                const member: TClassMember | null = findEnclosingClassMember(node);

                if (!member) {
                    return;
                }

                if (member.type === 'PropertyDefinition') {
                    return;
                }

                if (member.kind === 'constructor') {
                    return;
                }

                const name: string = getMethodName(member);
                if (ALLOWED_METHOD_NAMES.has(name)) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'notAllowed',
                    data: { name },
                });
            },
        };
    },
});
