import { SexType } from '@faker-js/faker';

export type Person = {
    id: number;
    name: string;
    email: string;
    age: number;
    status: Status;
    sex: SexType;
    bio: string;
    bill: number;
    birthdate: string;
    items: string[];
    responsible: ResponsiblePerson;
    button: string;
    image: string;
};

export type ResponsiblePerson = {
    id: string;
    name: {
        firstname: string;
        lastname: string;
    };
};

export type Status = 'active' | 'inactive' | 'invited' | 'deleted';
