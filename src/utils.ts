import _ from 'lodash';

export const isDeepEqual = (a: any, b: any, deep = 0): boolean => {
    if (deep > 30) {
        return false;
    }
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        const aKeys = Object.keys(a);
        if (aKeys.length !== Object.keys(b).length){
            return false;
        }
        return aKeys.find(key => !isDeepEqual(a[key], b[key], deep++)) == null;
    }
    return Object.is(a, b);
}

export const removeDuplicates = <T extends TItem[], TItem extends Record<TKey, string | number>, TKey extends string>(myArr: T, prop: TKey) => {
    const array = myArr.map(mapObj => mapObj[prop]);
    return myArr.filter((obj, pos) => {
        return array.indexOf(obj[prop]) === pos;
    });
}

export const removeDuplicatesByCoupleKeys = <T extends TItem[], TItem extends Record<TKey | TKey2, string | number>, TKey extends string, TKey2 extends string>(
    myArr: T, prop: TKey, prop2: TKey2) => {
    const array = myArr.map(mapObj => `${mapObj[prop]} -|- ${mapObj[prop2]}`);
    return myArr.filter((obj, pos) => {
        return array.indexOf(`${obj[prop]} -|- ${obj[prop2]}`) === pos;
    });
}

export const uniq = <T extends number | string>(a: T[]) => {
    var seen: Record<string | number, boolean> = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

export const copyObject = <T extends {}>(obj: T) => _.cloneDeep(obj);
