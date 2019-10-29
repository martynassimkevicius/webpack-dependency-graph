import * as d3 from "d3";
import { DataFormat, DataFormatLink, DataFormatNode, isDataFormatLinkWithNodes } from "../types";
import { D3Manager, State } from "./d3Manager";
import { addNodeCircle, addNodeTitle } from "./nodeUtils";
import { LinkExpendLinkTitle, LinkExpendLinkClick } from "./linkUtils";
import { copyObject, targetIdFromLink, sourceIdFromLink, removeDuplicates } from "../utils";

type Node = DataFormatNode;
type Link = DataFormatLink;

class Visualizer {
    private colors = d3.scaleOrdinal(d3.schemeCategory10);
    private d3Manager: D3Manager = null as any;
    private state: State<Node, Link> = { nodes: [], links: [] };
    private lastStateLink: State<Node, Link> = { nodes: [], links: [] };
    private lastViewStateLink: State<Node, Link> = { nodes: [], links: [] };

    constructor(public data: DataFormat) {
        this.clickExpandLink = this.clickExpandLink.bind(this);
        (globalThis as any).onload = () => {
            this.d3Manager = new D3Manager("#visualizer");
            this.d3Manager.nodeMiddleware.push(addNodeCircle, addNodeTitle);
            this.d3Manager.linksMiddleware.push(
                new LinkExpendLinkTitle(),
                new LinkExpendLinkClick(this.clickExpandLink)
            );

            this.state = {
                links: this.data.links.filter(
                    (link) => (link.source as string).indexOf('.ts') >= 0 && (link.target as string).indexOf('.ts') >= 0),
                nodes: this.data.nodes.filter((node) => node.id.indexOf('.ts') >= 0)
            };
            this.onlyNodeEntry();
        };
    }

    private updateViewTypeState(state: State<Node, Link>) {
        this.lastViewStateLink = copyObject(state);
        this.lastStateLink = this.lastViewStateLink;
        this.d3Manager.updateState(this.lastViewStateLink)
    }

    private updateState(state: State<Node, Link>) {
        this.lastStateLink = copyObject(state);
        this.d3Manager.updateState(this.lastStateLink)
    }

    private clickExpandLink(link: Link) {
        this.updateState(this.expandLink(link));
    }

    private expandLink(activeLink: Link) {
        const linksToNode = this.findPathToNode(
            targetIdFromLink(activeLink),
            sourceIdFromLink(activeLink),
            this.linkListToMap(this.state.links));
        if (linksToNode === null || linksToNode.length < 2) {
            return this.lastStateLink;
        }
        const linksToNodeMap = this.linkListToMap(linksToNode);
        let existingLinksToNode: Link[] | null = [];
        const linksMap = this.linkListToMap(this.lastViewStateLink.links);
        const addUnExpendLinks: Link[] = [];
        const newLinks = this.lastStateLink.links.filter((link) => {
            if (!!linksToNodeMap[targetIdFromLink(link)]
                && linksToNodeMap[targetIdFromLink(link)].indexOf(sourceIdFromLink(link)) >= 0) {
                existingLinksToNode!.push(link);
                return true;
            }
            if (!!linksMap[targetIdFromLink(link)]
                && linksMap[targetIdFromLink(link)].indexOf(sourceIdFromLink(link)) >= 0
                && !(sourceIdFromLink(link) === sourceIdFromLink(activeLink)
                    && targetIdFromLink(link) === targetIdFromLink(activeLink))) {
                return true
            }
            if (!!link.unExpendLink) {
                addUnExpendLinks.push(link.unExpendLink);
            }
            return false;
        });
        const existingLinksToNodeMap = this.linkListToMap(existingLinksToNode);
        existingLinksToNode = null;
        newLinks.push(...linksToNode
            .filter((link) => !(!!existingLinksToNodeMap[targetIdFromLink(link)]
                && existingLinksToNodeMap[targetIdFromLink(link)].indexOf(sourceIdFromLink(link)) >= 0))
            .map((link: Link) => {
                link.unExpendLink = activeLink;
                return link;
            }));
        newLinks.push(...removeDuplicates(addUnExpendLinks, (link) => `${targetIdFromLink(link)}-|-${sourceIdFromLink(link)}`));

        const nodesList = this.lastViewStateLink.nodes.map((n) => n.id);
        const nodesIdToNode = linksToNode.map((link) => sourceIdFromLink(link));
        let existingNodesIdToNode: string[] = [];
        const newNodes = this.lastStateLink.nodes.filter((node) => {
            if (nodesIdToNode.indexOf(node.id) >= 0) {
                existingNodesIdToNode!.push(node.id);
                return true;
            }
            if (nodesList.indexOf(node.id) >= 0) {
                return true
            }
            return false;
        });
        newNodes.push(...this.state.nodes
            .filter((node) => nodesIdToNode.indexOf(node.id) >= 0 && existingNodesIdToNode.indexOf(node.id) === -1)
            .map((node, i, array) => {
                if (isDataFormatLinkWithNodes(activeLink)) {
                    const stepX = ((activeLink.source.x || 0) - (activeLink.target.x || 0)) / (array.length + 1);
                    const stepY = ((activeLink.source.y || 0) - (activeLink.target.y || 0)) / (array.length + 1);
                    node.x = (activeLink.source.x || 0) + stepX * (i + 1);
                    node.y = (activeLink.source.y || 0) + stepY * (i + 1);
                }
                return node;
            }));

        return { links: newLinks, nodes: newNodes };
    }

    private findPathToNode(
        startNodeId: string | number,
        secondNodeId: string | number,
        linksMap: Record<string, Array<string | number>>,
        nodeIds: Array<string | number> = []
    ) {
        if (startNodeId === secondNodeId) {
            return [];
        }
        if (nodeIds.indexOf(startNodeId) >= 0) {
            return null;
        }
        nodeIds.push(startNodeId);
        if (!!linksMap[startNodeId]) {
            const links = linksMap[startNodeId].reduce((
                result: { source: string | number, target: string | number }[],
                sourceId
            ) => {
                const r = this.findPathToNode(sourceId, secondNodeId, linksMap, nodeIds);
                if (r != null) {
                    result.push({ target: startNodeId, source: sourceId }, ...r);
                }
                return result;
            }, []);
            if (links.length > 0) {
                return links;
            }
        }
        return null;
    }

    public entryCrossNodes() {
        this.updateViewTypeState(this.sameChildren(this.state));
    }

    public onlyNodeEntry() {
        this.updateViewTypeState({ links: [], nodes: this.state.nodes.filter((node) => node.isEntry) });
    }

    public linkListToMap(links: { source: Node | string | number; target: Node | string | number; }[]) {
        return links.reduce((map, link) => {
            if (!map[targetIdFromLink(link)]) {
                map[targetIdFromLink(link)] = [sourceIdFromLink(link)];
            } else {
                map[targetIdFromLink(link)].push(sourceIdFromLink(link));
            }
            return map;
        }, {} as Record<string, Array<string | number>>);
    }

    private sameChildren({ links, nodes }: State<Node, Link>) {
        const entryNodes = nodes.filter((node) => node.isEntry).map(d => d.id).filter((node) => node === './src/Htg/Frontend/ThemeBundle/Resources/assets/scripts/modules/interstitial-white.ts' || node === 'multi ./src/Htg/Frontend/ThemeBundle/Resources/assets/scripts/modules/search.ts');
        const linksMap = this.linkListToMap(links);
        const { nodeIds: sourceNodeIds, nodesMark } = entryNodes.reduce((result: { nodeIds: Array<string | number>, nodesMark: Record<string, Record<string, number>> }, nodeId) =>
            this.findNodes(nodeId, nodeId, linksMap, result.nodeIds, result.nodesMark), { nodeIds: [], nodesMark: {} });
        let newLinks: Link[] = [];
        sourceNodeIds.forEach((id) => {
            const keys = Object.keys(nodesMark[id]);
            newLinks = keys.reduce((nlinks, key) => {
                nlinks.push({ target: key, source: id, skipCount: nodesMark[id][key] });
                return nlinks;
            }, newLinks);
        });
        const nodeIds = [...sourceNodeIds, ...entryNodes];
        const newNodes = nodes.filter((node) => nodeIds.indexOf(node.id) > -1);
        return {
            links: newLinks,
            nodes: newNodes
        }
    }

    private findNodes(
        entryId: string | number,
        startNodeId: string | number,
        links: Record<string, Array<string | number>>,
        nodeIds: Array<string | number>,
        nodesMark: Record<string, Record<string, number>>,
        linksToNode: number = 0,
        isNodeFound: boolean = false
    ) {
        if (!nodesMark[startNodeId]) {
            nodesMark[startNodeId] = {};
        }
        nodesMark[startNodeId][entryId] = linksToNode;
        if (!isNodeFound && Object.keys(nodesMark[startNodeId]).length > 1) {
            nodeIds.push(startNodeId);
            isNodeFound = true;
        }
        if (!!links[startNodeId]) {
            links[startNodeId].forEach((sourceId) => {
                if (!nodesMark[sourceId] || nodesMark[sourceId][entryId] == null) {
                    return this.findNodes(entryId, sourceId, links, nodeIds, nodesMark, linksToNode++, isNodeFound);
                }
            });
        }
        return { nodesMark, nodeIds };
    }


}

export default new Visualizer((globalThis as any).data);