# Scenarios — the utils package

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain together with the subdomains.

| Subdomain                                                           | Scenarios           |
| ------------------------------------------------------------------- | ------------------- |
| [The text colour on a background](color-on-background/scenarios.md) | `SC-UT-1`…`SC-UT-5` |

The package-wide rule is held by the coverage gate of the package, not by a scenario: a function
without a spec fails the whole run.
