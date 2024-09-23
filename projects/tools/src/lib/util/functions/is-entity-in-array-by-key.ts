export function checkIsEntityInArrayByKey<ENTITY extends Record<string, unknown>, KEY extends Extract<keyof ENTITY, string>>(
    selectedEntities: ENTITY[],
    entity: ENTITY,
    keyExp: KEY
): boolean {
    return !!selectedEntities.find((selectedEntity: ENTITY) => {
        return (
            Object.prototype.hasOwnProperty.call(selectedEntity, keyExp) &&
            Object.prototype.hasOwnProperty.call(entity, keyExp) &&
            selectedEntity[keyExp] === entity[keyExp]
        );
    });
}
