// Реализация живёт рядом с `areArraysEqual`: две функции зовут друг друга, и порознь это круг
// импортов. Здесь остаётся прежний адрес символа.
export { areObjectsEqual } from '../deep-equal/deep-equal.js';
