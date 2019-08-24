import * as d3 from "d3";
import { isDeepEqual } from "../utils";

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

export class D3Manager<TNode extends Node, TLink extends Link<TNode>> {
    private state: State<TNode, TLink>;
    private link: d3.Selection<any, TLink, d3.BaseType, unknown>;
    private node: d3.Selection<d3.AxisContainerElement, TNode, d3.BaseType, unknown>;
    private svg: d3.Selection<d3.BaseType, unknown, any, any>;
    private simulation: d3.Simulation<TNode, TLink>;
    private edgepaths: d3.Selection<any, TLink, d3.BaseType, unknown>;
    private edgelabels: d3.Selection<any, TLink, d3.BaseType, unknown>;
    private nodeMiddlewares: Array<(selection: d3.Selection<SVGGElement, TNode, d3.BaseType, unknown>) => d3.Selection<SVGGElement, TNode, d3.BaseType, unknown>>;

    constructor(selector: string, state: State<TNode, TLink> = { nodes: [], links: [] }) {
        this.ticked = this.ticked.bind(this);
        this.dragstarted = this.dragstarted.bind(this);
        this.dragged = this.dragged.bind(this);
        this.state = state;
        this.svg = d3.select(selector);

    }

    public updateState(state: State<TNode, TLink>) {
        const removeNode = [];
        const updateNode = this.state.nodes.filter(node => {
            const findNode = state.nodes.find(newNode => node.id === newNode.id);
            if(!findNode) {
                removeNode.push(node);
                return false;
            }
            return isDeepEqual(node, findNode);
        });
        const addNode = state.nodes.filter(node => !state.nodes.find(oldNode => node.id === oldNode.id));

        const removeLink = [];
        const updateLink = this.state.links.filter(link => {
            const findLink = state.links.find(newLink => link.source === newLink.source && link.target === newLink.target);
            if(!findLink) {
                removeLink.push(link);
                return false;
            }
            return isDeepEqual(link, findLink);
        });
        const addLink = state.links.filter(link => !state.links.find(oldLink => link.source === oldLink.source && link.target === oldLink.target));
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

    private addNodes(nodes: TNode[]) {
        this.changeNodes(this.svg.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr("class", "node"));
    }
    private updateNodes(nodes: TNode[]) {
        this.changeNodes(this.svg.selectAll<SVGGElement, any>('.node')
                .data(nodes));
    }
    private removeNodes() {
        
    }

    private changeNodes(selections: d3.Selection<SVGGElement, TNode, d3.BaseType, unknown>) {
        this.node = this.nodeMiddlewares.reduce(
            (selection, middleware) => middleware(selection) || selection,
            selections
        );
    }
}

this.link = this.svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('marker-end','url(#arrowhead)')

        this.link.append("title")
            .text(function (d) {return d.type;});

        this.edgepaths = this.svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function (d, i) {return 'edgepath' + i})
            .style("pointer-events", "none");

        this.edgelabels = this.svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) {return 'edgelabel' + i})
            .attr('font-size', 10)
            .attr('fill', '#aaa');

        this.edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return d.type});

        this.node = this.svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(d3.drag<any, Node>()
                    .on("start", this.dragstarted)
                    .on("drag", this.dragged)
                    //.on("end", dragended)
            );

        this.node.append("circle")
            .attr("r", 5)
            .style("fill", (d, i) => {return this.colors(i.toString());})

        this.node.append("title")
            .text(function (d) {return d.id;});

        this.node.append("text")
            .attr("dy", -3)
            .text(function (d) {return d.id+":"+d.size;});

        this.simulation
            .nodes(nodes)
            .on("tick", this.ticked);

        (this.simulation.force("link") as any)
            .links(links);