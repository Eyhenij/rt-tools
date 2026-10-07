/**
 * Люди стенда: запись набора и люди, которыми набор входит.
 *
 * Входят они через Keycloak: каждый заводится в области стенда с правами ролями клиента шины.
 * Своей таблицы людей у приёмника нет, и в базу стенда здесь не пишется ничего.
 */
import { seedRealmPeople } from '../../../tools/keycloak-stand.mjs';

import { ACCOUNT, CLIENT, KEYCLOAK_ORIGIN, PEOPLE, REALM, STAND_PASSWORD } from './stand.mjs';

/**
 * Заводит людей в Keycloak. Отвечает ключом записи набора в Keycloak: им приёмник узнаёт
 * вошедшего, и им же записан оператор чата.
 */
export async function seedPeople() {
    const ids = await seedRealmPeople({
        origin: KEYCLOAK_ORIGIN,
        realm: REALM,
        clientId: CLIENT,
        password: STAND_PASSWORD,
        people: [ACCOUNT, ...Object.values(PEOPLE)],
    });

    return ids.get(ACCOUNT.email);
}
