import { app, BrowserWindow } from "electron";
import { enableLiveReload } from "electron-compile";
import { DBReader } from "./dbReader";

import { WindowStateKeeper } from "./windowStateKeeper";
import { ipcMain } from "electron-better-ipc";

import { MainController } from "./mainController";

const ipc = require("electron-better-ipc");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload();

const createWindow = async () =>
{
    // let splash = new BrowserWindow({
    //     width: 600, 
    //     height: 100,
    //     resizable: false, 
    //     frame: false,
    //     show: false });

    // splash.on("ready-to-show", () =>
    // { 
    //     splash.show();
    // });
    // splash.loadURL(`file://${__dirname}/splash.html`);

    const windowStateKeeperMain = new WindowStateKeeper("main");
    const savedStateMain = windowStateKeeperMain.getSavedState();

    const windowOptionsMain = { 
        title: "LoLStats",
        x: savedStateMain.x,
        y: savedStateMain.y,
        width: savedStateMain.width,
        height: savedStateMain.height,
        minWidth: 970,
        minHeight: 640,
        show: false
    };

   

    // splash.webContents.openDevTools();
    // return;
    // Create the browser window
    mainWindow = new BrowserWindow(windowOptionsMain);

    //track window state
    windowStateKeeperMain.track(mainWindow);

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    if (isDevMode || process.argv[2] == "rest") {
        //splash.webContents.openDevTools();
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("ready-to-show", () =>
    {
        //splash.destroy();
        mainWindow.setMenu(null);
        mainWindow.show();
        mainWindow.moveTop();
    })

    //Emitted when the window is closed.
    mainWindow.on("closed", () =>
    {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // mainWindow.close();
        app.quit();
    });
};

const init = async () =>
{
    createWindow();

    // let dbReaderGamesNew = new DBReader();
    let mainController = new MainController();
    ipcMain.answerRenderer('initDBReader', async (filePath:string) => {await mainController.initDBReader(filePath); return 0;})
    ipcMain.answerRenderer('initApiRequester', async (apiKey: string) => await mainController.initApiRequester(apiKey));
    ipcMain.answerRenderer('getMyPUUID', () => mainController.apiRequester.myPuuid);
    ipcMain.answerRenderer("getNumWins", async () => await mainController.dbReader.getNumWins(mainController.apiRequester.myPuuid));
    ipcMain.answerRenderer("getNumLoses", async () => await mainController.dbReader.getNumLoses(mainController.apiRequester.myPuuid));
    ipcMain.answerRenderer("getNumMatches", async () => await mainController.dbReader.getNumMatches());
    ipcMain.answerRenderer("getMostRecentGameTimestamp", async () =>  await mainController.dbReader.getLatestMatchCreation());
    ipcMain.answerRenderer("updateDBPart1", async () => {await mainController.updateDBPart1()});
    ipcMain.answerRenderer("updateDBPart2", async () => {await mainController.updateDBPart2()});
    ipcMain.answerRenderer("updateDBPart3", async () => {await mainController.updateDBPart3()});
    ipcMain.answerRenderer("getAllMatchIDs", async () => await mainController.dbReader.getAllMatchIDs());
    ipcMain.answerRenderer("getMatchByID", async (id:number) => await mainController.dbReader.getMatchByGameId(id));
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", init);

// Quit when all windows are closed.
app.on("window-all-closed", () =>
{
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () =>
{
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
