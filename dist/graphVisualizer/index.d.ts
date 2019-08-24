import { DataFormat } from "../types";
declare class Visualizer {
    data: DataFormat;
    private colors;
    private d3Manager;
    private state;
    constructor(data: DataFormat);
    entryCrossExpendAllNodes(): void;
    entryCrossNodes(): void;
    onlyNodeEntry(): void;
    private sameChildrenExpendAll;
    private sameChildren;
    private markNodes;
    private findMarked;
}
declare const _default: Visualizer;
export default _default;
