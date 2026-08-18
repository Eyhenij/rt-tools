import { SexType } from '@faker-js/faker';

export type TPerson = {
    id: number;
    name: string;
    email: string;
    age: number;
    status: TStatus;
    sex: SexType;
    bio: string;
    bill: number;
    birthdate: string;
    items: string[];
    responsible: TResponsiblePerson;
    button: string;
    active: boolean;
    image: string;
};

export type TResponsiblePerson = {
    id: string;
    name: {
        firstname: string;
        lastname: string;
    };
};

export type TStatus = 'active' | 'inactive' | 'invited' | 'deleted';
