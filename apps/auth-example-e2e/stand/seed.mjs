/**
 * The seeding of the realm: the people of the stand with their rights in the example client.
 *
 * The removal, the creation and the roles are done by the shared seeding of the local Keycloak:
 * every suite of an admin seeds its people the same way.
 */
import { seedRealmPeople } from '../../../tools/keycloak-stand.mjs';

import { CLIENT, KEYCLOAK_ORIGIN, PEOPLE, REALM, STAND_PASSWORD } from './stand.mjs';

export async function seed() {
    await seedRealmPeople({
        origin: KEYCLOAK_ORIGIN,
        realm: REALM,
        clientId: CLIENT,
        password: STAND_PASSWORD,
        people: Object.values(PEOPLE),
    });
}
