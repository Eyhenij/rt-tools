# The import of users — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **An argon2 or pbkdf2 hash moves as it is, and the old password enters.** — `projects/auth-import/src/lib/password-hash.ts:credentialOf`
- **A person with another hash or without one moves without a password and must set one.** — `projects/auth-import/src/lib/import-user.ts:keycloakUserOf`
- **The letter to set a password is sent only by the flag and only to people added by this run.** — `projects/auth-import/src/lib/import-users.ts:importUsers`
- **A second run skips the people already in the realm.** — `projects/auth-import/src/lib/keycloak-admin.ts:createUser`
- **The rights move with the person as client roles of the admin.** — `projects/auth-import/src/lib/import-users.ts:unknownRoles`
- **The secret of the import client is read from the environment, not from the arguments.** — `projects/auth-import/src/cli.ts:SECRET_VARIABLE`
- **A file with an error is refused whole before the first write.** — `projects/auth-import/src/lib/import-user.ts:readUsers`
