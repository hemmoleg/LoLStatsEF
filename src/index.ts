import { app, BrowserWindow } from "electron";
import { enableLiveReload } from "electron-compile";
import { DBReader } from "./dbReader";

import { WindowStateKeeper } from "./windowStateKeeper";
import { ipcMain } from "electron-better-ipc";

import GaleforceModule = require("galeforce");

const ipc = require("electron-better-ipc");

//const GaleforceModule = require('galeforce');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload();

// global.window1 = null;
// global.window2 = null;

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
        title: "SkypeTimelineAnalyzer",
        x: savedStateMain.x,
        y: savedStateMain.y,
        width: savedStateMain.width,
        height: savedStateMain.height,
        minWidth: 970,
        minHeight: 640,
        frame: false,
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

    console.log("argTest", process.argv[2]);

    mainWindow.on("ready-to-show", () =>
    {
        //splash.destroy();
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

    let dbReaderMyGamesNew = new DBReader();
    // let dbReaderGamesNew = new DBReader();
    ipcMain.answerRenderer("establishDBConnection", async (filePath:string) => dbReaderMyGamesNew.establishDBConnection(filePath))
    ipcMain.answerRenderer("getNumMatches", async () => await dbReaderMyGamesNew.getNumMatches());
    ipcMain.answerRenderer("getNumWins", async () => await dbReaderMyGamesNew.getNumWins());
    ipcMain.answerRenderer("getNumLoses", async () => await dbReaderMyGamesNew.getNumLoses());
    ipcMain.answerRenderer("getMostRecentGameTimestamp", async () => await dbReaderMyGamesNew.getMostRecentGameTimestamp());
    ipcMain.answerRenderer("getMatchById", async (matchId: number) => await dbReaderMyGamesNew.getMatchById(matchId))

    // ipcMain.answerRenderer("establishDBConnection2", async (filePath:string) => dbReaderGamesNew.establishDBConnection(filePath))
    // ipcMain.answerRenderer("getAllMatchIds", async () => dbReaderGamesNew.getAllMatchIds())
    
    const galeforce = new GaleforceModule({
      'riot-api': {
        key: 'RGAPI-cc4802a5-ecb7-477f-a0da-4af5364de12c',
      },
    });

    let test = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).name("hemmoleg").exec();
    console.log(test);
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
