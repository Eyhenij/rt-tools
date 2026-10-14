# Grill

## The owner request

> заведи эпик на оставшиеся уязвимости

Then: «делай всё сам, не останавилвайся, если остановишься - ты провалил задачу». This is the last dependency task of the epic RT-2822.

## What the tree already has

- `webpack-dev-middleware` 6.1.3 stands only under the first showcase builder of Storybook 10.6.1; every other parent already holds 8.3.0. The registry has 7.4.6, which is above the fixed 7.4.5.
- The `overrides` block of the workspace settings is the tree's single list of substituted versions.

## Decisions

- **One pin for the line 6 only: `'webpack-dev-middleware@6': '^7.4.5'`.** It leaves the 8.3.0 users untouched. Rejected: a pin without a range, which would pull 8.3.0 under the Storybook builder, a major step past what its parent declares.
- **The check is the audit and the resolved versions, plus both showcase builds and the push set.** The owner chose «pnpm audit до и после плюс проверки перед отправкой (Recommended)» for the epic.
- **The result:** the audit no longer lists the package, the line 6 resolves to 7.4.6, both showcases build.
