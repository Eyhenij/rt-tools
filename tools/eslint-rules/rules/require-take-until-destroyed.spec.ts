import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-take-until-destroyed';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: ['const example = true;'],
    invalid: [],
});
