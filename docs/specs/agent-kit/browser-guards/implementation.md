# The browser guards — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

- **The sign of the pinned profile is taken from the environment variable, and where there is none — from the file of the tree.** — `projects/agent-kit/assets/hooks/browser-device-id.sh:file`
- **An unconfigured tree hears that it is unconfigured but loses no work.** — `projects/agent-kit/assets/hooks/browser-device-id.sh:marker`
- **The word about being unconfigured is said once per session.** — `projects/agent-kit/assets/hooks/browser-device-id.sh:marker`
- **A question to the owner about choosing a browser is refused.** — `projects/agent-kit/assets/hooks/browser-guard-no-asking.sh:questions`
- **The word "browser" in the name of a rule or of a hook does not make a question a choice question.** — `projects/agent-kit/assets/hooks/browser-guard-no-asking.sh:questions`
- **A foreign device sign is refused before the call, and the freshness mark is set by its outcome.** — `projects/agent-kit/assets/hooks/browser-guard-device-id.sh:requested`
- **Raising the browser by a driver of one's own is refused, and the refusal names the file.** — `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh:launch`
- **Code passed to the interpreter as an argument is judged by the same sample as a file.** — `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh:launch`
- **Without a pinned profile the guards let through both the question and a driver of one's own.** — `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh:device_id`
- **The browser choice goes stale, and a call after a pause demands choosing anew.** — `projects/agent-kit/assets/hooks/browser-guard-require-select.sh:ttl`
- **The reason for a refusal about the choice arrives as a field of the answer.** — `projects/agent-kit/assets/hooks/browser-guard-require-select.sh:deny`
