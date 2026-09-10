# Writing to the storage — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

- **There are three levels, and the boundary between them is the price of a miss.** — `projects/agent-kit/assets/hooks/sql-guard.sh:ask` — scenarios `SC-AK-1056`, `SC-AK-1057`
- **Rows are addressed by the primary key.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:sql_check_addressing` — scenario `SC-AK-1056`
- **A condition by a foreign key is asked about, not refused.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:where_tail` — scenario `SC-AK-1057`
- **The addressing is looked for in the tail after the last `where`.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:where_tail` — scenario `SC-AK-1056`
- **On the production storage a read is proven, not guessed.** — `projects/agent-kit/assets/hooks/sql-guard-target.sh:unproven` — scenario `SC-AK-1058`
- **A write to production is refused without a bypass.** — `projects/agent-kit/assets/hooks/sql-guard-target.sh:sql_check_prod` — scenario `SC-AK-1058`
- **A delivery whose content the guard does not see counts as a write.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:sql_detect_write` — scenario `SC-AK-1059`
- **Taking a dump is a read, and it is judged in the segment of its own call.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:seg_tail` — scenario `SC-AK-1059`
- **A command that delivers nothing to the server is not parsed at all.** — `projects/agent-kit/assets/hooks/sql-guard-request.sh:sql_read_request` — scenario `SC-AK-1060`
- **Applying migrations to a local address passes, to production is refused, to any other is asked about.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:sql_check_migrations` — scenario `SC-AK-1061`
- **A migration passes only when it is the sole write of the command.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:other_write` — scenario `SC-AK-1061`
- **A throwaway database is asked nothing.** — `projects/agent-kit/assets/hooks/sql-guard-target.sh:sql_pass_scratch` — scenario `SC-AK-1062`
- **The marker lowers a refusal to a question and never lifts it.** — `projects/agent-kit/assets/hooks/sql-guard-write.sh:soft` — scenario `SC-AK-1063`
- **Everything the guard could not parse passes.** — `projects/agent-kit/assets/hooks/sql-guard.sh:helper` — scenario `SC-AK-1060`
