import { faker } from '@faker-js/faker';

import { Person, Status } from './types';

/**
 * Картинки строк встроены в адрес, а не берутся из сети: внешний источник отдаёт каждый раз
 * новое изображение, и визуальная проверка витрины падала бы на нём при неизменной таблице.
 */
const SAMPLE_IMAGE_COLORS: readonly string[] = ['#4284d7', '#01af8d', '#ef7128', '#eb5055', '#6d96e8'];

const sampleImage: (index: number) => string = (index: number): string =>
    'data:image/svg+xml;base64,' +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40">
        <rect width="100" height="40" fill="${SAMPLE_IMAGE_COLORS[index]}"/>
    </svg>`);

export const createPerson: () => Person = (): Person => {
    const gender: 'male' | 'female' = faker.number.int({ min: 0, max: 1 }) ? 'male' : 'female';
    const birthday: Date = faker.date.between({ from: '1995-01-01', to: '2018-01-01' });
    const status: Status = faker.helpers.arrayElement(['active', 'inactive', 'invited', 'deleted']);

    return {
        id: faker.number.int(),
        name: `${faker.person.firstName(gender)} ${faker.person.lastName(gender)} ${faker.person.middleName(gender)}`,
        email: faker.internet.email(),
        age: new Date().getFullYear() - birthday.getFullYear(),
        status: status,
        sex: gender,
        bio: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.paragraph() : faker.lorem.words(1),
        items: faker.lorem.sentences().split('.'),
        birthdate: birthday.toISOString(),
        bill: faker.number.int(1000000000),
        responsible: {
            id: faker.string.uuid(),
            name: { firstname: faker.person.firstName(), lastname: faker.person.lastName() },
        },
        button: faker.helpers.arrayElement(['add', 'clear', 'person', 'save']),
        active: false,
        image: sampleImage(faker.number.int({ min: 0, max: SAMPLE_IMAGE_COLORS.length - 1 })),
    };
};

export const createPersonList: (size: number) => Person[] = (size: number) => Array.from({ length: size }, createPerson);
