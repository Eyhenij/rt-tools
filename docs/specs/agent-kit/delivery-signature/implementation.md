# The signature of a machine commit — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **The signature of a machine commit is judged before the commit leaves.** — `projects/agent-kit/assets/hooks/git-guard-delivery-signature.sh:strangers`
- **A machine commit is recognised by its claim, not by its mail.** — `projects/agent-kit/assets/hooks/git-guard-delivery-signature.sh:bot_login`
- **The mail of the machine record is checked as a whole value.** — `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`
- **The contribution of the branch is judged, not the whole history.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:main_branch`
- **The signature is read on the machine, without the network.** — `projects/agent-kit/assets/hooks/git-guard-delivery-signature.sh:strangers`
- **The repair named in the refusal is let through by the refusal itself.** — `projects/agent-kit/assets/hooks/git-guard-delivery-signature.sh:repair`
- **A refusal about the signature names the commit by name and both mails.** — `projects/agent-kit/assets/hooks/git-guard-delivery-signature.sh:strangers`
- **A tree that named no mail of a machine record gets no demand.** — `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`
