import { SvgSelection, Link, isDataFormatLinkWithNodes, LinkSelection } from "../types";
import { D3LinkComponent } from "./lib/link.component";
import * as d3 from "d3";

const colors = d3.scaleOrdinal(d3.schemeCategory10);

export class LinkExpendLinkTitle extends D3LinkComponent {
    private elements: d3.Selection<d3.BaseType, Link, d3.BaseType, unknown> = null as any;
    public onTick() {
        this.elements.attr('transform', (d) =>
            !isDataFormatLinkWithNodes(d)
                || !d.source.x
                || !d.source.y
                || !d.target.x
                || !d.target.y
                ? ''
                : `translate(${Math.round((d.source.x + d.target.x) / 2 - 3)}, ${Math.round((d.source.y + d.target.y) / 2 - 7)})`);
    }
    public onCreate(svg: SvgSelection, data: Link[]) {
        this.elements = svg.selectAll(".linkExtendMark");
        const elementData = this.elements.data(data);
        elementData.exit().remove();
        elementData.filter((d) => !d.skipCount || d.skipCount <= 0).remove();
        elementData.enter().filter((d) => !!d.skipCount && d.skipCount > 0)
            .append('text')
            .attr('class', 'linkExtendMark')
            .attr('textLength', 14)
            .attr('style', 'font-size: 12px')
            .text((d) => (d.skipCount || 0) <= 99 ? d.skipCount || '' : '99+');
        this.elements = svg.selectAll(".linkExtendMark");
    }
}
export class LinkExpendLinkClick extends D3LinkComponent {
    constructor(private onClick: (link: Link) => void) {
        super();
    }
    public onCreate(_svg: SvgSelection, _data: Link[], newLinks: LinkSelection) {
        newLinks.on('click', (d) => !!d.skipCount && d.skipCount > 0 && this.onClick(d)).classed('click', (d) => !!d.skipCount && d.skipCount > 0);
    }
    public onUpdate(_svg: SvgSelection, _data: Link[], updateLinks: LinkSelection) {
        updateLinks.classed('click', (d) => !!d.skipCount && d.skipCount > 0);
    }
}
