import * as d3 from "d3";
import { DataFormat, DataFormatLink, DataFormatNode } from "../types";
import { D3Manager, State } from "./d3Manager";
import { addNodeCircle, addNodeTitle } from "./nodeUtils";
import { removeDuplicatesByCoupleKeys, uniq } from "../utils";

type Node = DataFormatNode & d3.SimulationNodeDatum;
type Link = DataFormatLink & d3.SimulationLinkDatum<Node>;

class Visualizer {
    private colors = d3.scaleOrdinal(d3.schemeCategory10);
    private d3Manager: D3Manager<Node, Link> = null as any;
    private state: State<Node, Link> = { nodes: [], links: [] };

    constructor(public data: DataFormat) {
        (globalThis as any).onload = () => {
            this.d3Manager = new D3Manager<Node, Link>("#visualizer");
            this.d3Manager.nodeMiddleware.push(addNodeCircle, addNodeTitle);
            this.state = { links: this.data.links, nodes: this.data.nodes };
            this.onlyNodeEntry();
        };
    }

    public entryCrossExpendAllNodes() {
        this.d3Manager.updateState(this.sameChildrenExpendAll(this.state));
    }
    public entryCrossNodes() {
        this.d3Manager.updateState(this.sameChildren(this.state));
    }

    public onlyNodeEntry() {
        this.d3Manager.updateState({ links: [], nodes: this.state.nodes.filter((node) => node.isEntry)});
    }
    private sameChildrenExpendAll({links, nodes}: State<Node, Link>) {
        const entryNodes = nodes.filter((node) => node.isEntry);
        let nodesMark: Record<string, Record<string, { source: string, target: string}[]>> = {};
        const linksMap = links.reduce((map: Record<string, string[]>, link) => {
            if (!map[link.target]) {
                map[link.target] = [link.source];
            } else {
                map[link.target].push(link.source);
            }
            return map;
        }, {});
        let nodeIds: string[] = [];
        entryNodes.forEach((node) => {
            const result = this.markNodes(node.id, linksMap, nodeIds, nodesMark);
            nodeIds = result.nodeIds;
            const nodesMarkByEntry = result.nodesMarkByEntry;
            nodesMark = Object.keys(nodesMarkByEntry).reduce((mark, key) => {
                if (!mark[key]) {
                    mark[key] = { [node.id]: nodesMarkByEntry[key] };
                } else {
                    mark[key][node.id] = nodesMarkByEntry[key];
                }
                return mark;
            }, nodesMark);
        });
        let newLinks: Link[] = [];
        nodeIds.forEach((id) => {
            const keys = Object.keys(nodesMark[id]);
            newLinks = keys.reduce((nlinks, key) => {
                nlinks.push(...nodesMark[id][key]);
                return nlinks;
            }, newLinks);
        });
        newLinks = removeDuplicatesByCoupleKeys(newLinks, 'source', 'target');
        newLinks.forEach(link => {
            nodeIds.push(link.target);
        });
        nodeIds = uniq(nodeIds);
        const newNodes = nodes.filter((node) => nodeIds.indexOf(node.id) > -1);
        return {
            links: newLinks,
            nodes: newNodes
        }
    }

    private sameChildren({links, nodes}: State<Node, Link>) {
        const entryNodes = nodes.filter((node) => node.isEntry);
        let nodesMark: Record<string, Record<string, { source: string, target: string}[]>> = {};
        const linksMap = links.reduce((map: Record<string, string[]>, link) => {
            if (!map[link.target]) {
                map[link.target] = [link.source];
            } else {
                map[link.target].push(link.source);
            }
            return map;
        }, {});
        let nodeIds: string[] = [];
        entryNodes.forEach((node) => {
            const result = this.markNodes(node.id, linksMap, nodeIds, nodesMark);
            nodeIds = result.nodeIds;
            const nodesMarkByEntry = result.nodesMarkByEntry;
            nodesMark = Object.keys(nodesMarkByEntry).reduce((mark, key) => {
                if (!mark[key]) {
                    mark[key] = { [node.id]: nodesMarkByEntry[key] };
                } else {
                    mark[key][node.id] = nodesMarkByEntry[key];
                }
                return mark;
            }, nodesMark);
        });
        let newLinks: Link[] = [];
        nodeIds.forEach((id) => {
            const keys = Object.keys(nodesMark[id]);
            newLinks = keys.reduce((nlinks, key) => {
                nlinks.push(...nodesMark[id][key]);
                return nlinks;
            }, newLinks);
        });
        newLinks = removeDuplicatesByCoupleKeys(newLinks, 'source', 'target');
        newLinks.forEach(link => {
            nodeIds.push(link.target);
        });
        nodeIds = uniq(nodeIds);
        const newNodes = nodes.filter((node) => nodeIds.indexOf(node.id) > -1);
        return {
            links: newLinks,
            nodes: newNodes
        }
    }

    private markNodes(startNodeId: string, links: Record<string, string[]>, nodeIds: string[], nodesMark: Record<string, Record<string, { source: string, target: string}[]>>, linksToNode: { source: string, target: string}[] = [], nodesMarkByEntry: Record<string, { source: string, target: string}[]> = {}) {
        nodesMarkByEntry[startNodeId] = linksToNode;
        if (!!nodesMark[startNodeId] && Object.keys(nodesMark[startNodeId]).length > 0) {
            nodeIds.push(startNodeId);
            if (!!links[startNodeId]) {
                links[startNodeId].forEach((source) => {
                    if (!nodesMarkByEntry[source]) {
                            const result = this.markNodes(source, links, nodeIds, {}, [...linksToNode, { source: source, target: startNodeId }], nodesMarkByEntry);
                            nodeIds.push(startNodeId);
                            nodesMarkByEntry = result.nodesMarkByEntry;
                        
                    } else {
                        nodesMarkByEntry[source].push(...linksToNode, { source: source, target: startNodeId });
                    }
                });
            }
        } else {
            if (!!links[startNodeId]) {
                links[startNodeId].forEach((source) => {
                    if (!nodesMarkByEntry[source]) {
                            const result = this.markNodes(source, links, nodeIds, nodesMark, [...linksToNode, { source: source, target: startNodeId }], nodesMarkByEntry);
                            nodesMarkByEntry = result.nodesMarkByEntry;
                            nodeIds = result.nodeIds;
                        
                    } else {
                        nodesMarkByEntry[source].push(...linksToNode, { source: source, target: startNodeId });
                    }
                });
            }
        }
        return { nodesMarkByEntry, nodeIds };
    }

    private findMarked(startNodeId: string, links: Link[], nodesMark: Record<string, Record<string, Link[]>>, nodeIds: string[] = []) {
        if (Object.keys(nodesMark[startNodeId]).length > 1) {
            if (nodeIds.indexOf(startNodeId) === -1) {
                return [...nodeIds, startNodeId];
            } else {
                return nodeIds;
            }
        }
        links.forEach((link) => {
            if (link.target === startNodeId && nodeIds.indexOf(link.source) === -1) {
                nodeIds = this.findMarked(link.source, links, nodesMark, nodeIds);
            }
        });
        return nodeIds;
    }

    
}

export default new Visualizer(JSON.parse((globalThis as any).data));