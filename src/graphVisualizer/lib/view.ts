export interface ViewButton {
    name: string;
    title: string;
}

export class View {
    static viewTitle: string;
    static viewName: string;
    private _viewButtons: ViewButton[];
    private onButtonChangeCB: Array<(buttons: ViewButton[]) => void> = [];
    public getButtonsStream(cb: (buttons: ViewButton[]) => void) {
        this.onButtonChangeCB.push(cb);
    }
    get viewButtons() {
        return this._viewButtons;
    }
    set viewButtons(variable) {
        this._viewButtons = variable;

    }

}