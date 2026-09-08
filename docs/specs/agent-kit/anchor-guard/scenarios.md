# Scenarios — the guard of the anchors

A promise of the subdomain and the test that closes it. A number is issued once and never reused.

### SC-AK-930 — markup written by a shell command is judged the same

Given markup is written by a redirection or by the body of a heredoc, and an interactive element in it
carries no anchor
When the guard checks the call
Then it refuses it: the target is taken by the shared parse of write targets, and the new markup is
the body of the command. A read and a write to a file that is not markup pass

Covered: `projects/agent-kit/tests/qa-dataid-guard.test.sh`.

### SC-AK-931 — an interactive element is asked for an anchor, the opt-out is marked on the tag

Given a tag with an event binding goes into the markup of the application
When the guard checks the edit
Then it refuses it without an anchor and passes it with one; the opt-out marker on that same tag
passes, and markup outside the code of the application is not judged at all

Covered: `projects/agent-kit/tests/qa-dataid-guard.test.sh`.
