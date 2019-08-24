import * as d3 from "d3";
import { copyObject } from "../utils";

interface Node extends d3.SimulationNodeDatum {
    id: string;
}

interface Link<TNode> extends d3.SimulationLinkDatum<TNode> {
    target: string;
    source: string;
}

export interface State<TNode extends Node, TLink extends Link<TNode>> {
    nodes: TNode[];
    links: TLink[];
}

export type Middleware<TElement extends d3.BaseType, TData> = (selection: d3.Selection<TElement, TData, d3.BaseType, unknown>) => void;

export class D3Manager<TNode extends Node, TLink extends Link<TNode>> {
    private state: State<TNode, TLink>;
    private _link: d3.Selection<SVGLineElement, TLink, d3.BaseType, unknown> = null as any;
    private _node: d3.Selection<SVGGElement, TNode, d3.BaseType, unknown> = null as any;
    private svg: d3.Selection<d3.BaseType, unknown, any, any>;
    private simulation: d3.Simulation<TNode, TLink>= null as any;
    private edgepaths: d3.Selection<any, TLink, d3.BaseType, unknown> = null as any;
    private edgelabels: d3.Selection<any, TLink, d3.BaseType, unknown> = null as any;
    public nodeMiddleware: Array<Middleware<SVGGElement, TNode>> = [];
    public linksMiddleware: Array<Middleware<SVGLineElement, TLink>> = [];

    constructor(selector: string, state: State<TNode, TLink> = { nodes: [], links: [] }) {
        this.ticked = this.ticked.bind(this);
        this.dragstarted = this.dragstarted.bind(this);
        this.dragged = this.dragged.bind(this);
        this.state = state;
        this.svg = d3.select(selector);
        this.svg.attr('width')
        this.svg.append('defs').append('marker')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke','none');

        this.svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
    }

    get link(): d3.Selection<SVGLineElement, TLink, d3.BaseType, unknown> {
        return this._link || this.svg.selectAll(".link")
    }

    get node(): d3.Selection<SVGGElement, TNode, d3.BaseType, unknown> {
        return this._node || this.svg.selectAll(".node")
    }

    set link(link: d3.Selection<SVGLineElement, TLink, d3.BaseType, unknown>) {
        this._link = link || this.svg.selectAll(".link");
    }

    set node(node: d3.Selection<SVGGElement, TNode, d3.BaseType, unknown>) {
        this._node = node || this.svg.selectAll(".node");
    }

    public updateState(state: State<TNode, TLink>) {
        this.state = copyObject(state);
        const width = +this.svg.attr("width");
        const height = +this.svg.attr("height");
        this.simulation = d3.forceSimulation(this.state.nodes as any[])
        .force("link", d3.forceLink().id(function (d: any) {return d.id;}).distance(100).strength(1))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));
        this.link
            .data(this.state.links)
            .exit()
            .remove();
        this.applyMiddleware(this.link
            .data(this.state.links)
            .enter()
            .append("svg:line")
            .attr("class", "link")
            .attr("marker-end", "url(#end)"), this.linksMiddleware);
        this.link = this.svg.selectAll(".link");

        this.node
            // .data(this.state.nodes)
            // .exit()
            .remove();
        this.node = this.svg.selectAll(".node");
        this.applyMiddleware(this.node
            .data(this.state.nodes)
            .enter()
            .append("svg:g")
            .attr("class", "node").call(d3.drag<any, TNode>()
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                //.on("end", dragended)
            ), this.nodeMiddleware);
        this.node = this.svg.selectAll(".node");

    this.simulation
        .nodes(this.state.nodes)
        .on("tick", this.ticked);

    (this.simulation.force("link") as any)
        .links(this.state.links);
    }

    private ticked() {
        if (this.link) {
        this.link
            .attr("x1", function (d: any) {return d.source.x;})
            .attr("y1", function (d: any) {return d.source.y;})
            .attr("x2", function (d: any) {return d.target.x;})
            .attr("y2", function (d: any) {return d.target.y;});
        }

        if (this.node) {
            this.node
            .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});
        }

        if (this.edgepaths) {
            this.edgepaths.attr('d', function (d: any) {
                return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
            });
        }

        if (this.edgepaths) {
            this.edgelabels.attr('transform', function (d: any) {
                if (d.target.x < d.source.x) {
                    var bbox = this.getBBox();

                    const rx = bbox.x + bbox.width / 2;
                    const ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                }
                else {
                    return 'rotate(0)';
                }
            });
        }
    }

    private dragstarted(d: TNode) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    private dragged(d: TNode) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    private applyMiddleware(selection: d3.Selection<any, any, d3.BaseType, unknown>, middleware: Array<Middleware<any, any>>) {
        middleware.forEach(
            (middleware) => middleware(selection)
        );
    }
}

