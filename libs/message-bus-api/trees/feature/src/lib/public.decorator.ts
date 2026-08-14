import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** Метка операции, открытой без токена дерева. Её читает проверка токена. */
export const PUBLIC_OPERATION: string = 'message-bus.public-operation';

/**
 * Операция, открытая без токена дерева.
 *
 * Проверка токена закрыта по умолчанию: незаявленная операция отвечает отказом. Направление
 * выбрано так намеренно — при обратном забытая метка открывала бы новую операцию наружу молча,
 * и увидеть это можно было бы только по чужому грузу в хранилище.
 *
 * Открытая операция у приёмника сегодня одна — проба живости.
 */
export function Public(): CustomDecorator<string> {
    return SetMetadata(PUBLIC_OPERATION, true);
}
