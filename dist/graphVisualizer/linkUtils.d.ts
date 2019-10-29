import { SvgSelection, Link, LinkSelection } from "../types";
import { D3LinkComponent } from "./lib/link.component";
export declare class LinkExpendLinkTitle extends D3LinkComponent {
    private elements;
    onTick(): void;
    onCreate(svg: SvgSelection, data: Link[]): void;
}
export declare class LinkExpendLinkClick extends D3LinkComponent {
    private onClick;
    constructor(onClick: (link: Link) => void);
    onCreate(_svg: SvgSelection, _data: Link[], newLinks: LinkSelection): void;
    onUpdate(_svg: SvgSelection, _data: Link[], updateLinks: LinkSelection): void;
}
