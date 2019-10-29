import { DataFormat, DataFormatNode } from "../types";
declare type Node = DataFormatNode;
declare class Visualizer {
    data: DataFormat;
    private colors;
    private d3Manager;
    private state;
    private lastStateLink;
    private lastViewStateLink;
    constructor(data: DataFormat);
    private updateViewTypeState;
    private updateState;
    private clickExpandLink;
    private expandLink;
    private findPathToNode;
    entryCrossNodes(): void;
    onlyNodeEntry(): void;
    linkListToMap(links: {
        source: Node | string | number;
        target: Node | string | number;
    }[]): Record<string, (string | number)[]>;
    private sameChildren;
    private findNodes;
}
declare const _default: Visualizer;
export default _default;
