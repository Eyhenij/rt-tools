# The second development server — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

- **Everything that raises a server is refused, and everything else passes.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:RUNNER` — scenarios `SC-AK-1051`, `SC-AK-1052`
- **The refusal names the addresses at which the applications are already raised.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:stands` — scenario `SC-AK-1053`
- **A ready run configuration is judged by its name, and an unnamed one by the file it is made of.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:configurationName` — scenario `SC-AK-1054`
- **The nested command is parsed, not its wrapper.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:inner` — scenario `SC-AK-1055`
- **Calls of version control are let through except the one that listens on a port.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:git` — scenario `SC-AK-1052`
- **The start of a call is the start of the line or a command separator.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:BOUND` — scenario `SC-AK-1052`
- **An unrecognised command passes.** — `projects/agent-kit/assets/hooks/dev-server-guard.sh:cmd` — scenario `SC-AK-1052`
