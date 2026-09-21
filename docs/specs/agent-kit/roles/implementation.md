# Implementation — the roles, the skills, the blanks and the declarations the package ships

Every statement of the spec and the place it is carried out. All four kinds are files, so the
address of a statement is the file and the header field it is carried out by.

- **A role declares its name, what it is for and the tools it is allowed.** — `projects/agent-kit/assets/agents/business-analyst.md:tools` — `projects/agent-kit/assets/agents/conscience.md:tools` — `projects/agent-kit/assets/agents/project-manager.md:tools` — scenario `SC-AK-1160`
- **A role's description says when it is called, not only what it does.** — `projects/agent-kit/assets/agents/prose-editor.md:description` — `projects/agent-kit/assets/agents/qa-engineer.md:description` — `projects/agent-kit/assets/agents/skill-curator.md:description` — scenario `SC-AK-1161`
- **A role writes no files where its description says so.** — `projects/agent-kit/assets/agents/spec-critic.md:description` — `projects/agent-kit/assets/agents/spec-writer.md:description` — `projects/agent-kit/assets/agents/strict-teacher.md:description` — scenario `SC-AK-1138`
- **A skill that stands under no law is legitimate and declares no law.** — `projects/agent-kit/assets/skills/agent-kit-extend.md:name` — `projects/agent-kit/assets/skills/agent-kit.md:name` — scenario `SC-AK-1162`
- **A skill without a law declares neither the kind of a rule nor the kind of a pattern.** — `projects/agent-kit/assets/skills/write-a-skill.md:name` — scenario `SC-AK-1163`
- **A command declares what it does and what it takes.** — `projects/agent-kit/assets/commands/night.md:argument-hint` — scenario `SC-AK-1141`
- **A blank carries its places for filling in angle brackets.** — `projects/agent-kit/assets/samples/specs/_template/spec.md:name` — `projects/agent-kit/assets/samples/tasks/_template/grill.md:Grill` — `projects/agent-kit/assets/samples/tasks/_template/plan.md:name` — `projects/agent-kit/assets/samples/tasks/_template/progress.md:name` — `projects/agent-kit/assets/templates/findings.md:name` — `projects/agent-kit/assets/templates/gate-map.sh:name` — scenario `SC-AK-1142`
- **A blank of a task folder is copied without the header of the layout.** — `projects/agent-kit/assets/templates/implementation.md:name` — `projects/agent-kit/assets/templates/pattern.md:name` — `projects/agent-kit/assets/templates/project.sh:rt-kit` — `projects/agent-kit/assets/templates/proposal.md:rt-kit` — `projects/agent-kit/assets/templates/pitfalls.md:cold` — `projects/agent-kit/assets/templates/postmortem.md:date` — scenario `SC-AK-1143`
- **A declaration of the tree is data, not code.** — `projects/agent-kit/assets/defaults/turn-map.md:turn` — `projects/agent-kit/assets/variants.json:host` — scenario `SC-AK-1144`
- **Every one of the four kinds is loaded by its name, and a name that answers to nothing fails in silence.** — `projects/agent-kit/assets/checks/specs-for.mjs:entry` — the entry is asked by the name; scenario `SC-AK-1145`
- **All four kinds are described by one subdomain.** — `projects/agent-kit/assets/checks/specs-for.mjs:gapsOf` — the measure counts every kind by one pass; scenario `SC-AK-1146`
