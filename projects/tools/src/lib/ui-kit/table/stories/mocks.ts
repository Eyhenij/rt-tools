import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

import { Person, Status } from './types';

export const createPerson: () => Person = (): Person => {
    const gender: 'male' | 'female' = faker.number.int({ min: 0, max: 1 }) ? 'male' : 'female';
    const birthday: Date = faker.date.between({ from: '1995-01-01', to: '2018-01-01' });
    const status: Status = faker.helpers.arrayElement(['active', 'inactive', 'invited', 'deleted']);

    return {
        id: faker.number.int(),
        name: `${faker.person.firstName(gender)} ${faker.person.lastName(gender)} ${faker.person.middleName(gender)}`,
        email: faker.internet.email(),
        age: dayjs().year() - dayjs(birthday).year(),
        status: status,
        sex: gender,
        bio: Math.random() > 0.7 ? faker.lorem.paragraph() : faker.lorem.words(1),
        items: faker.lorem.sentences().split('.'),
        birthdate: birthday.toISOString(),
        bill: faker.number.int(1000000000),
        responsible: {
            id: faker.string.uuid(),
            name: { firstname: faker.person.firstName(), lastname: faker.person.lastName() },
        },
        button: faker.helpers.arrayElement(['add', 'clear', 'person', 'save']),
        active: false,
        image: faker.image.url({ width: 100, height: 40 }),
    };
};

export const createPersonList: (size: number) => Person[] = (size: number) => Array.from({ length: size }, createPerson);
