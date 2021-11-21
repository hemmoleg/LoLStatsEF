import { BrowserWindow } from "electron";

const appConfig = require("electron-settings");

export class WindowStateKeeper
{
    private window: BrowserWindow;
    private windowState: any;
    private windowName: string;

    constructor(windowName: string)
    {
        this.windowName = windowName;
        this.setBounds();
    }

    setBounds()
    {
        //Restore from appConfig
        if (appConfig.has(`windowState.${this.windowName}`))
        {
            this.windowState = appConfig.get(`windowState.${this.windowName}`);
            return;
        }
        //Default
        this.windowState = {
            x: undefined,
            y: undefined,
            width: 900,
            height: 600
        };
    }

    saveState()
    {
        if (!this.windowState.isMaximized)
        {
            this.windowState = this.window.getBounds();
        }
        this.windowState.isMaximized = this.window.isMaximized();
        appConfig.set(`windowState.${this.windowName}`, this.windowState);
    }

    track(win: any)
    {
        this.window = win;
        ["resize", "move", "close"].forEach(event =>
        {
            win.on(event, this.saveState.bind(this));
        });
    }

    getSavedState()
    {
        return {
            x: this.windowState.x,
            y: this.windowState.y,
            width: this.windowState.width,
            height: this.windowState.height,
            isMaximized: this.windowState.isMaximized
        };
    }
}
