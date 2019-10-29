export class D3Component<TData, TNode extends d3.SimulationNodeDatum, TLink extends d3.SimulationLinkDatum<TNode>, TElement extends d3.BaseType> {
    public onTick(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, simulation: d3.Simulation<TNode, TLink>, selection: d3.Selection<TElement, TData, d3.BaseType, unknown>) { }
    public onCreate(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, data: TData[], selection: d3.Selection<TElement, TData, d3.BaseType, unknown>) { }
    public onUpdate(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, data: TData[], selection: d3.Selection<TElement, TData, d3.BaseType, unknown>) { }
}