import { app, BrowserWindow } from "electron";
import { enableLiveReload } from "electron-compile";
import { DBReader } from "./dbReader";

import { WindowStateKeeper } from "./windowStateKeeper";
import { ipcMain } from "electron-better-ipc";

import GaleforceModule = require("galeforce");
import { RiotRegion } from "galeforce/dist/riot-api";
import { CreatePayloadProxy, Payload } from "galeforce/dist/galeforce/actions/payload";
import { DBMatch } from "./entitiesV5/DBMatch";

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
    
    await dbReaderMyGamesNew.establishDBConnectionV5("C:\\My Projects\\LoLStatsEF\\my_games_match_v5.db");
    await dbReaderMyGamesNew.createTablesV5();
    await dbReaderMyGamesNew.createRepositories();

    const galeforce = new GaleforceModule({
      'riot-api': {
        key: 'RGAPI-c2a95aa3-7c93-4415-9ea4-be4445c04e27',
      },
      'rate-limit': {
        type: 'bottleneck',
        options: {
          intervals: {
              120: 100,
              1: 20,
          },
          'max-concurrent': 1
        },
      },
      'debug':['rate-limit']
    });

    //my puuid: 8KF6_NTmY0iDJaesoSAhkKOw8ylDc9yWi7_zggXCfI3ZRQYqWDNoCCwTVeVyQgVIdNRyx-RBBg12xQ
    let account = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).name("hemmoleg").exec();
    console.log(account);

    let apiMatch1 = await galeforce.lol.match.match().matchId("EUW1_5607406272").region(galeforce.region.riot.EUROPE).exec();
    
    console.log("got match gameCreation", apiMatch1.info.gameCreation,
      "match.info.gameId", apiMatch1.info.gameId,
      "match.info.gameMode", apiMatch1.info.gameMode,
      "match.info.queueId", apiMatch1.info.queueId);

    let writtenMatch1 = await dbReaderMyGamesNew.writeMatch(DBMatch.CreateFromApi(apiMatch1));
    let dbMatch1 = await dbReaderMyGamesNew.getMatchByGameId(apiMatch1.info.gameId)

    let compareResult1 = dbMatch1.compareAgainstApiMatch(apiMatch1);
    // console.log("compare result", compareResult1);


    let apiMatch2 = await galeforce.lol.match.match().matchId("EUW1_5355327881").region(galeforce.region.riot.EUROPE).exec();
    
    console.log("got match gameCreation", apiMatch2.info.gameCreation,
      "match.info.gameId", apiMatch2.info.gameId,
      "match.info.gameMode", apiMatch2.info.gameMode,
      "match.info.queueId", apiMatch2.info.queueId);

    let writtenMatch2 = await dbReaderMyGamesNew.writeMatch(DBMatch.CreateFromApi(apiMatch2));
    let dbMatch2 = await dbReaderMyGamesNew.getMatchByGameId(apiMatch2.info.gameId)

    let compareResult2 = dbMatch2.compareAgainstApiMatch(apiMatch2);
    // console.log("compare result", compareResult2);

    console.log("compare result 1", compareResult1, "compare result 2", compareResult2);
    console.log("saved match to DB");

    return;

    let start = 0;
    let stop = false;

    let mostRecentGameTimestamp = await dbReaderMyGamesNew.getMostRecentGameTimestamp();
    console.log("most recent game time in db:", mostRecentGameTimestamp);

    do{
      let payload: Payload = {
        _id: "getMatches", 
        region:RiotRegion.EUROPE, 
        puuid:account.puuid,
        query: {start: start}
      };

      console.log("getting matches from", start, "to", start+20);
      let matches = await galeforce.lol.match.list().set(payload).exec();
      console.log("got matches", start, "till", start + matches.length);
      // by default the above call to riot returns 20 matches. If less matches are returned that means that ther no more
      // matches than the ones which were just returned.
      if(matches.length == 20){
        console.log("checking last match timestamp...");
        let match = await galeforce.lol.match.match().region(RiotRegion.EUROPE).matchId(matches[matches.length-1]).exec();
        if(match.info.gameCreation > mostRecentGameTimestamp){
          console.log("last match creation still bigger than mostRecentGameTimestamp", match.info.gameCreation, ">", mostRecentGameTimestamp);
          start += matches.length;;
        }
      }
      else{
        console.log("done. latest match from riot found in range from", start, "-", start + matches.length);
        stop = true;
        console.log("last match id", matches[matches.length - 1]);
      }
    }while(!stop);
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
