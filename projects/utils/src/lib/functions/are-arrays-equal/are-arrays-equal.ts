// Реализация живёт рядом с `areObjectsEqual`: две функции зовут друг друга, и порознь это круг
// импортов. Здесь остаётся прежний адрес символа.
export { areArraysEqual } from '../deep-equal/deep-equal.js';
