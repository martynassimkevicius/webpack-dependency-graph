export interface ViewButton {
    name: string;
    title: string;
}
export declare class View {
    static viewTitle: string;
    static viewName: string;
    private _viewButtons;
    private onButtonChangeCB;
    getButtonsStream(cb: (buttons: ViewButton[]) => void): void;
    viewButtons: ViewButton[];
}
