export function initToday(): Date {
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    return today;
}

export function isToday(date: Date): boolean {
    const today: Date = initToday();

    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}
