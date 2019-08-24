import { Middleware } from "./d3Manager";
import { DataFormatNode } from "../types";
import * as d3 from "d3";

const colors = d3.scaleOrdinal(d3.schemeCategory10);

export const addNodeCircle: Middleware<any, DataFormatNode> = (node) => {
    node.append("svg:circle")
        .attr("r", (d) => d.isEntry ? 10 : 5)
        .style("fill", (d, i) => {return colors(i.toString());})
}

export const addNodeTitle: Middleware<any, DataFormatNode> = (node) => {
    node.append("svg:title")
        .text(function (d) {return d.id;});
}
