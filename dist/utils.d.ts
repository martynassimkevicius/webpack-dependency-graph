export declare const isDeepEqual: (a: any, b: any, deep?: number) => boolean;
export declare const removeDuplicates: <T extends TItem[], TItem extends Record<TKey, string | number>, TKey extends string>(myArr: T, prop: TKey) => TItem[];
export declare const removeDuplicatesByCoupleKeys: <T extends TItem[], TItem extends Record<TKey | TKey2, string | number>, TKey extends string, TKey2 extends string>(myArr: T, prop: TKey, prop2: TKey2) => TItem[];
export declare const uniq: <T extends string | number>(a: T[]) => T[];
export declare const copyObject: <T extends {}>(obj: T) => T;
