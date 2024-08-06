import { SexType } from '@faker-js/faker';

export type Person = {
    id: number;
    name: string;
    email: string;
    age: number;
    sex: SexType;
    bio: string;
    bill: number;
    birthdate: number;
    items: string[];
    responsible: ResponsiblePerson;
};

export type ResponsiblePerson = {
    id: string;
    name: {
        firstname: string;
        lastname: string;
    };
};
