# agent-kit — где исполняются правила

Предметных правил у домена больше нет: они живут в поддоменах, и привязки лежат рядом с ними —
`layout/implementation.md`, `texts/implementation.md`, `guards/implementation.md`,
`checks/implementation.md`, `work/implementation.md`, `observations/implementation.md`.

Своё у домена одно — то, чем держится само деление.

| Правило                                                    | Где исполняется                      |
| ---------------------------------------------------------- | ------------------------------------ |
| Префикс сценариев принадлежит домену вместе с поддоменами. | `tools/check-specs.mjs:prefixOwners` |
