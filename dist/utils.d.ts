export declare const isDeepEqual: (a: any, b: any, deep?: number) => boolean;
export declare const removeDuplicates: <TItem extends Record<any, any>>(myArr: TItem[], prop: (item: TItem) => string | number) => TItem[];
export declare const uniq: <T extends string | number>(a: T[]) => T[];
export declare const copyObject: <T extends {}>(obj: T) => T;
export declare const targetIdFromLink: (a: import("./types").DataFormatLink) => string | number;
export declare const sourceIdFromLink: (a: import("./types").DataFormatLink) => string | number;
