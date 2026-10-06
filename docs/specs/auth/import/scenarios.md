# Scenarios — the import of users

The identifier goes at the start of the test title, followed by a dash.

### SC-AUTH-38 — an argon2 hash in PHC becomes a Keycloak credential

Given a hash `$argon2id$v=19$m=…,t=…,p=…$salt$hash`
When the command reads it
Then Keycloak gets the algorithm argon2, the type id, the version, the memory, the passes, the
lanes, the length and the salt and the hash in standard base64

### SC-AUTH-39 — a pbkdf2 hash moves in PHC and as an object

Given a hash `$pbkdf2-sha256$i=…$salt$hash` and an object with the algorithm, the passes, the salt
and the hash
When the command reads them
Then Keycloak gets the algorithm and the passes of each, and the salt and the hash unchanged

### SC-AUTH-40 — a person with another hash must set a password

Given a person with a scrypt hash, a person with a bcrypt hash and a person without a hash
When the command builds them
Then none of them carries a password, and each must set one

### SC-AUTH-41 — the letter goes only by the flag and only to the added

Given a file of a person without a password, already in the realm, and another one who is not
When the command runs with the flag and without it
Then the letter goes once, to the added person, and only in the run with the flag

### SC-AUTH-42 — a second run skips the people already in the realm

Given a file of people
When the command runs twice
Then the second run finds every person already in the realm and reports them as skipped

### SC-AUTH-43 — the rights move as client roles

Given a person with rights in the admin client
When the command builds them
Then Keycloak gets these rights as roles of that client

### SC-AUTH-44 — a file with an error is refused before the first write

Given a file where one line has no address and another has a role the client does not have
When the command runs
Then it names both lines and writes nothing to Keycloak

### SC-AUTH-45 — the secret is read from the environment

Given the arguments of the command and the secret in the environment
When the command starts
Then it takes the secret from the environment and refuses to start without it

### SC-AUTH-46 — on the stand the old password enters

Given the stand with the import client
When the command moves a person with an argon2 hash, one with a pbkdf2 hash and one with scrypt
Then the first two get a token by their old passwords, and the third must set a password

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files
