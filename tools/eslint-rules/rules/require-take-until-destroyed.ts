import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

type TMessageIds = 'missing';
type TOptions = [];

// NOTE: The rule будет доступен в ESLint-конфигах как "@nx/workspace-require-take-until-destroyed"
export const RULE_NAME: string = 'require-take-until-destroyed';

const TERMINATING_OPERATORS: ReadonlySet<string> = new Set([
    'takeUntilDestroyed',
    'takeUntil',
    'take',
    'first',
    'last',
    'toPromise',
    'firstValueFrom',
    'lastValueFrom',
]);

const createRule: ReturnType<typeof ESLintUtils.RuleCreator> = ESLintUtils.RuleCreator(() => __filename);

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = createRule<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Require every .subscribe() to be terminated via takeUntilDestroyed() or another terminating operator (takeUntil/take/first/firstValueFrom/...).',
        },
        schema: [],
        messages: {
            missing:
                'Subscription must be terminated via takeUntilDestroyed() or another terminating operator (takeUntil/take/first/firstValueFrom/...).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        function findPipeArguments(node: TSESTree.Node | undefined): TSESTree.CallExpressionArgument[] | null {
            let current: TSESTree.Node | undefined = node;
            while (current && current.type === 'CallExpression' && current.callee.type === 'MemberExpression') {
                if (current.callee.property.type === 'Identifier' && current.callee.property.name === 'pipe') {
                    return current.arguments;
                }
                current = current.callee.object;
            }
            return null;
        }

        function hasTerminatingOperator(args: ReadonlyArray<TSESTree.CallExpressionArgument>): boolean {
            return args.some(
                (arg: TSESTree.CallExpressionArgument) =>
                    arg.type === 'CallExpression' && arg.callee.type === 'Identifier' && TERMINATING_OPERATORS.has(arg.callee.name)
            );
        }

        return {
            'CallExpression[callee.type="MemberExpression"][callee.property.name="subscribe"]'(node: TSESTree.CallExpression): void {
                const callee: TSESTree.MemberExpression = node.callee as TSESTree.MemberExpression;
                const pipeArgs: TSESTree.CallExpressionArgument[] | null = findPipeArguments(callee.object);
                if (!pipeArgs || !hasTerminatingOperator(pipeArgs)) {
                    context.report({ node, messageId: 'missing' });
                }
            },
        };
    },
});
