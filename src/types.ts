
export interface DataFormat {
    nodes: DataFormatNode[];
    links: DataFormatLink[];
}

export interface DataFormatNode {
    id: string;
    chunks: number[];
    size: number;
    codeSource?: string;
    issuerPath: Array<{
        id: number | string;
        identifier: string;
        name: string;
    }>;
    isEntry: boolean;
}

export interface DataFormatLink {
    source: string;
    target: string;
    type?: string;
    userRequest?: string;
    loc?: string;
}