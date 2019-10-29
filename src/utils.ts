import _ from 'lodash';
import { Link, isDataFormatLinkWithNodes } from './types';

export const isDeepEqual = (a: any, b: any, deep = 0): boolean => {
    if (deep > 30) {
        return false;
    }
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        const aKeys = Object.keys(a);
        if (aKeys.length !== Object.keys(b).length) {
            return false;
        }
        return aKeys.find(key => !isDeepEqual(a[key], b[key], deep++)) == null;
    }
    return Object.is(a, b);
}

export const removeDuplicates = <TItem extends Record<any, any>>(
    myArr: TItem[], prop: (item: TItem) => string | number) => {
    const array = myArr.map(mapObj => prop(mapObj));
    return myArr.filter((obj, pos) => {
        return array.indexOf(prop(obj)) === pos;
    });
}

export const uniq = <T extends number | string>(a: T[]) => {
    var seen: Record<string | number, boolean> = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

export const copyObject = <T extends {}>(obj: T) => _.cloneDeep(obj);

export const targetIdFromLink = (a: Link) => isDataFormatLinkWithNodes(a) ? a.target.id : a.target as string | number;
export const sourceIdFromLink = (a: Link) => isDataFormatLinkWithNodes(a) ? a.source.id : a.source as string | number;


