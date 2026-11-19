## This tree

- **Packages test on Jest; an e2e suite raises its own stand.** A PR adds a test of the suite its paths demand, or `E2E-skip: <reason>` in a code commit; root or harness edits demand none. Image suites never run from a temp-dir copy.
