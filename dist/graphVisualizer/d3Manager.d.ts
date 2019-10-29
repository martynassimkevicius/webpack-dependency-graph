import * as d3 from "d3";
import { D3LinkComponent } from "./lib/link.component";
import { DataFormatLink, DataFormatNode } from "../types";
interface Node extends d3.SimulationNodeDatum {
    id: string;
}
interface Link<TNode> extends d3.SimulationLinkDatum<TNode> {
}
export interface State<TNode extends Node, TLink extends Link<TNode>> {
    nodes: TNode[];
    links: TLink[];
}
export declare type Middleware<TElement extends d3.BaseType, TData> = (selection: d3.Selection<TElement, TData, d3.BaseType, unknown>) => void;
export declare class D3Manager {
    private state;
    private _link;
    private _node;
    private svg;
    private wrapper;
    private simulation;
    private edgepaths;
    private edgelabels;
    nodeMiddleware: Array<Middleware<SVGGElement, DataFormatNode>>;
    linksMiddleware: Array<D3LinkComponent>;
    constructor(selector: string, state?: State<DataFormatNode, DataFormatLink>);
    link: d3.Selection<SVGLineElement, DataFormatLink, d3.BaseType, unknown>;
    node: d3.Selection<SVGGElement, DataFormatNode, d3.BaseType, unknown>;
    changeSize(width: number, height: number): void;
    updateState(state: State<DataFormatNode, DataFormatLink>): void;
    private ticked;
    private dragstarted;
    private dragged;
    private applyMiddleware_d;
}
export {};
