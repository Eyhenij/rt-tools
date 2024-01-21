## Interfaces & Types

* ```typescript
  IDictionary
    ```
* ```typescript
  IntersectionType
    ```
* ```typescript
  Modify
  ```
* ```typescript
  IMapper
  ```
* ```typescript
  Nullable
  ```
* ```typescript
  PartialOmit
  ```
* ```typescript
  Primitive
  ```


## Functions


* ```typescript
  isDateValid(date?: Date): boolean;
  ```
* ```typescript
  dateStringToDate(date: string | Date): Date;
  ```
* Indicates if the arguments are equal
```typescript
  isEqual<T>(f: T, s: T): boolean;
  ```
* Indicates if the content of two arrays is identical
```typescript
  areArraysEqual<T>(f: T[], s: T[]): boolean;
  ```
* Indicates if the content of two arrays is identical
```typescript
  areObjectsEqual<T>(f: T, s: T): boolean;
  ```
* ```typescript
  isNumber<T>(value: T | number | unknown | undefined): value is number;
  ```
* ```typescript
  initToday(): Date;
  ```
* ```typescript
  isToday(date: Date): boolean;
  ```
* Make shallow copy of passed object 
```typescript
  removeFieldFromObject<T extends object, K extends string>(obj: T, key: K): Omit<T, K>;
  ``` 
* Allow to compare two values by provided comparator
```typescript
  safeCompare<T>(a: T, b: T, comparator: ComparatorType<T>): number;
  ```
* Allow to safely compare two string values
```typescript
  safeStrCompare(a: string, b: string): number;
  ```
* Allow to safely compare two number values
```typescript
  safeNumCompare(a: number, b: number): number;
  ```
* Allow composing comparison chain of several comparators
that delegate comparison by the chain to the next comparators if current comparator returns 0 
```typescript
  safeComparatorPipe(...comparators: Array<() => number>): number;
  ```
* ```typescript
  sortByAlphabet: <T extends object>(a: T, b: T, field: keyof T) => number;
  ```
* ```typescript
  sortByDate: (a: { [field: string]: any }, b: { [field: string]: any }, field: string) => number
  ```
* ```typescript
  stringifyHttpLikeParams<T extends {}>(params: T): { [param: string]: string | string[] }
  ```
* ```typescript
  transformArrayInput<T>(array: unknown): T[]
  ```
