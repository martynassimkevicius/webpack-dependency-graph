import * as d3 from "d3";
interface Node extends d3.SimulationNodeDatum {
    id: string;
}
interface Link<TNode> extends d3.SimulationLinkDatum<TNode> {
    target: string;
    source: string;
}
interface State<TNode extends Node, TLink extends Link<TNode>> {
    nodes: TNode[];
    links: TLink[];
}
export declare class D3Manager<TNode extends Node, TLink extends Link<TNode>> {
    private state;
    private link;
    private node;
    private svg;
    private simulation;
    private edgepaths;
    private edgelabels;
    private nodeMiddlewares;
    constructor(selector: string, state?: State<TNode, TLink>);
    updateState(state: State<TNode, TLink>): void;
    private ticked;
    private dragstarted;
    private dragged;
    private addNodes;
    private updateNodes;
    private removeNodes;
    private changeNodes;
}
export {};
