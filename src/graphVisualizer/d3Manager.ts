import * as d3 from "d3";
import { D3LinkComponent } from "./lib/link.component";
import { DataFormatLink, DataFormatNode } from "../types";
import ResizeObserver from "resize-observer-polyfill";

interface Node extends d3.SimulationNodeDatum {
    id: string;
}

interface Link<TNode> extends d3.SimulationLinkDatum<TNode> { }

export interface State<TNode extends Node, TLink extends Link<TNode>> {
    nodes: TNode[];
    links: TLink[];
}

export type Middleware<TElement extends d3.BaseType, TData> = (selection: d3.Selection<TElement, TData, d3.BaseType, unknown>) => void;

export class D3Manager {
    private state: State<DataFormatNode, DataFormatLink>;
    private _link: d3.Selection<SVGLineElement, DataFormatLink, d3.BaseType, unknown> = null as any;
    private _node: d3.Selection<SVGGElement, DataFormatNode, d3.BaseType, unknown> = null as any;
    private svg: d3.Selection<SVGSVGElement, unknown, any, any> = null as any;
    private wrapper: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private simulation: d3.Simulation<DataFormatNode, DataFormatLink> = null as any;
    private edgepaths: d3.Selection<any, DataFormatLink, d3.BaseType, unknown> = null as any;
    private edgelabels: d3.Selection<any, DataFormatLink, d3.BaseType, unknown> = null as any;
    public nodeMiddleware: Array<Middleware<SVGGElement, DataFormatNode>> = [];
    public linksMiddleware: Array<D3LinkComponent> = [];

    constructor(selector: string, state: State<DataFormatNode, DataFormatLink> = { nodes: [], links: [] }) {
        this.ticked = this.ticked.bind(this);
        this.dragstarted = this.dragstarted.bind(this);
        this.dragged = this.dragged.bind(this);
        this.state = state;
        this.wrapper = d3.select(selector);
        const wrapperNode = this.wrapper.node();
        if (!wrapperNode) {
            return;
        }
        wrapperNode.append(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        this.svg = this.wrapper.select('svg');

        this.simulation = d3.forceSimulation(this.state.nodes)
            .force("link", d3.forceLink<DataFormatNode, DataFormatLink>().id((d) => d.id).distance(100).strength(0.1))
            .force("charge", d3.forceManyBody<DataFormatNode>()
                .strength((d) => d.isEntry ? -10000 : -30))
            .force("collide", d3.forceCollide().radius(d => 10));

        const ro = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.changeSize(width, height);
            }
        });
        ro.observe(wrapperNode);
        this.changeSize(wrapperNode.clientWidth, wrapperNode.clientHeight);
        this.svg.append('defs').append('marker')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');

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

    get link(): d3.Selection<SVGLineElement, DataFormatLink, d3.BaseType, unknown> {
        return this._link || this.svg.selectAll(".link")
    }

    get node(): d3.Selection<SVGGElement, DataFormatNode, d3.BaseType, unknown> {
        return this._node || this.svg.selectAll(".node")
    }

    set link(link: d3.Selection<SVGLineElement, DataFormatLink, d3.BaseType, unknown>) {
        this._link = link || this.svg.selectAll(".link");
    }

    set node(node: d3.Selection<SVGGElement, DataFormatNode, d3.BaseType, unknown>) {
        this._node = node || this.svg.selectAll(".node");
    }

    public changeSize(width: number, height: number) {
        this.svg
            .attr('width', width)
            .attr('height', height);
        this.simulation
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX<DataFormatNode>(width / 2).strength((d) => d.isEntry ? 0.1 : 0.6))
            .force("y", d3.forceY<DataFormatNode>(height / 2).strength((d) => d.isEntry ? 0.1 : 0.6))
            .alpha(1);
    }

    public updateState(state: State<DataFormatNode, DataFormatLink>) {
        this.simulation.nodes(state.nodes);
        this.simulation.alpha(1);
        this.state = state;
        this.link
            .data(this.state.links)
            .exit()
            .remove();
        const newLink = this.link
            .data(this.state.links)
            .enter()
            .append("line")
            .attr("marker-end", "url(#end)")
            .attr("class", "link");
        this.linksMiddleware.forEach((middleware) => middleware.onCreate(this.svg, this.state.links, newLink));
        this.link = this.svg.selectAll(".link");
        const updateLink = this.link
            .data(this.state.links);
        this.linksMiddleware.forEach((middleware) => middleware.onUpdate(this.svg, this.state.links, updateLink));

        this.node
            // .data(this.state.nodes)
            // .exit()
            .remove();
        this.node = this.svg.selectAll(".node");
        this.applyMiddleware_d(this.node
            .data(this.state.nodes)
            .enter()
            .append("svg:g")
            .attr("class", "node").call(d3.drag<any, DataFormatNode>()
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
                .attr("x1", function (d: any) { return Math.round(d.source.x); })
                .attr("y1", function (d: any) { return Math.round(d.source.y); })
                .attr("x2", function (d: any) { return Math.round(d.target.x); })
                .attr("y2", function (d: any) { return Math.round(d.target.y); });
        }
        this.linksMiddleware.forEach((middleware) => middleware.onTick(this.svg, this.simulation, this.link));

        if (this.node) {
            this.node
                .attr("transform", function (d) { return "translate(" + Math.round(d.x || 0) + ", " + Math.round(d.y || 0) + ")"; });
        }
    }

    private dragstarted(d: DataFormatNode) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    private dragged(d: DataFormatNode) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    private applyMiddleware_d(selection: d3.Selection<any, any, d3.BaseType, unknown>, middleware: Array<Middleware<any, any>>) {
        middleware.forEach(
            (middleware) => middleware(selection)
        );
    }
}

