import webpack from "webpack";
import { DataFormat } from './types';
export declare class DependencyGraphWebpackPlugin implements webpack.Plugin {
    constructor(opts?: {
        prod: boolean;
    });
    processData(data: webpack.Stats.ToJsonOutput, callback: () => void): void;
    showDependencyGraph(data: DataFormat): void;
    removeDuplicates<T extends TItem[], TItem extends Record<TKey, string | number>, TKey extends string>(myArr: T, prop: TKey): TItem[];
    removeDuplicatesByCoupleKeys<T extends TItem[], TItem extends Record<TKey | TKey2, string | number>, TKey extends string, TKey2 extends string>(myArr: T, prop: TKey, prop2: TKey2): TItem[];
    apply(compiler: webpack.Compiler): void;
}
