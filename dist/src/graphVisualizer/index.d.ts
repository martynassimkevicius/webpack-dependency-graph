import * as d3 from "d3";
import { DataFormat, DataFormatLink, DataFormatNode } from "../types";
declare type Node = DataFormatNode & d3.SimulationNodeDatum;
declare type Link = DataFormatLink & d3.SimulationLinkDatum<Node>;
declare class Visualizer {
    data: DataFormat;
    private colors;
    private d3Manager;
    constructor(data: DataFormat);
    onlyNodeEntry(links: Link[], nodes: Node[]): void;
}
declare const _default: Visualizer;
export default _default;
