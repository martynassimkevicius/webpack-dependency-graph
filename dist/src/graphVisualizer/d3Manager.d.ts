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
    private colors;
    private _link;
    private _node;
    private svg;
    private simulation;
    private edgepaths;
    private edgelabels;
    private nodeMiddleware;
    private linksMiddleware;
    constructor(selector: string, state?: State<TNode, TLink>);
    link: d3.Selection<SVGLineElement, TLink, d3.BaseType, unknown>;
    node: d3.Selection<SVGGElement, TNode, d3.BaseType, unknown>;
    updateState(state: State<TNode, TLink>): void;
    private ticked;
    private dragstarted;
    private dragged;
    private applyMiddleware;
}
export {};
