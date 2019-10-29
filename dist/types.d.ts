export interface DataFormat {
    nodes: DataFormatNode[];
    links: DataFormatLink[];
}
export interface DataFormatNode extends d3.SimulationNodeDatum {
    id: string;
    chunks: number[];
    size: number;
    codeSource?: string;
    issuerPath: Array<{
        id: number | string;
        identifier: string;
        name: string;
    }>;
    isEntry: boolean;
}
export interface DataFormatLink extends d3.SimulationLinkDatum<Node> {
    expendLinks?: DataFormatLink[];
    unExpendLink?: DataFormatLink;
    skipCount?: number;
    type?: string;
    userRequest?: string;
    loc?: string;
}
export interface DataFormatLinkWithNodes extends d3.SimulationLinkDatum<Node> {
    source: DataFormatNode;
    target: DataFormatNode;
    expendLinks?: DataFormatLink[];
    unExpendLink?: DataFormatLink;
    skipCount?: number;
    type?: string;
    userRequest?: string;
    loc?: string;
}
export declare type Node = DataFormatNode;
export declare type Link = DataFormatLink;
export declare type SvgSelection = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
export declare type Simulation = d3.Simulation<Node, Link>;
export declare type LinkSelection = d3.Selection<SVGLineElement, Link, d3.BaseType, unknown>;
export declare type NodeSelection = d3.Selection<SVGGElement, Node, d3.BaseType, unknown>;
export declare const isDataFormatLinkWithNodes: (link: any) => link is DataFormatLinkWithNodes;
