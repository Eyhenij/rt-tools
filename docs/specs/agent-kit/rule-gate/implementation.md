# The binding — the rules gate

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The config of the linter demands a rule under it.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **The check of repeats demands the rule whose signs it carries out, and only it.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **Creating a working tree loads the rule of delivery.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **The layers on top of the domain rule are declared by a file of their own, not by lines in the gate.** — `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_add`
- **A layer demands a rule in addition, not instead of the domain one.** — `projects/agent-kit/assets/hooks/skill-gate.sh:want`
- **A sign invisible in the path is judged by the text of the edit.** — `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_payload`
- **A layer that has nothing to read the text of the edit with lets the action go.** — `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_is_spec`
- **The gate calls the file of the layers in its own shell, not as a separate process.** — `projects/agent-kit/assets/hooks/skill-gate.sh:rt_hooks_dir`
- **The gate map counts as a command a call, not a mention.** — `projects/agent-kit/assets/defaults/gate-map.sh:rt_gate_invokes`
- **A redirection into the empty device and into the error stream does not count as a write.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_writes_default`
- **An arrow in the text of a command does not count as a redirection.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_writes_default` — scenario `SC-AK-675`
- **The target of a redirection looks like a path, not like a word in words.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_writes_default` — scenarios `SC-AK-676`, `SC-AK-677`
- **The paths are taken from the heading of the command, not from the body of a document in place.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_paths_default`
- **The paths are taken at the writing piece of the command, not at the whole line.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_paths_default`
- **A command publishing the body of a task or a request demands the rule of the wording.** — `projects/agent-kit/assets/defaults/gate-map.sh:doc-style-human` — scenario SC-AK-850
- **Two signs are judged at once: the call of the client and the body in the arguments.** — `projects/agent-kit/assets/defaults/gate-map.sh:rt_gate_invokes` — scenario SC-AK-850
- **An interpreter is checked by its body, not by its name.** — `projects/agent-kit/assets/defaults/shell.sh:interp` — a document at the input and code as an argument; scenario `SC-AK-857`
