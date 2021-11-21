import { LOCALE_ID, NgModule, ViewChild } from "@angular/core";
import { BrowserModule, SafeUrl } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { RendererProcessIpc } from "electron-better-ipc";
import { ipcRenderer } from "electron-better-ipc";
import { registerLocaleData } from "@angular/common";
import localeDe from '@angular/common/locales/de';
import { Match } from "./entities/Match";


// const browserWindow = require('electron').remote.BrowserWindow;
const appVersion = require('electron').remote.app.getVersion(); 
const storage = require('electron-json-storage');

@Component({
    selector: "App",
    styleUrls: ['./../dist/styles/main.css'],
    template: `
      <span>games in db: {{numMatches}} (wins: {{numWins}} / loses: {{numLoses}})</span>
      <br>
      <span>most recent game date: {{mostRecentMatchTimestamp | date:'short'}}</span>
    `
})
export class AppComponent implements OnInit
{
    numMatches = 0;
    numWins = 0;
    numLoses = 0;
    mostRecentMatchTimestamp = 0;

    async ngOnInit()
    {
        console.log("LolStatsEF", appVersion);
        console.log("storage " + storage.getDefaultDataPath());
    
        registerLocaleData(localeDe, 'de-DE');

        await ipcRenderer.callMain("establishDBConnection", "C:\\My Projects\\LoLStats\\my_games_new.db");
        this.numMatches = await ipcRenderer.callMain("getNumMatches");
        this.numWins = await ipcRenderer.callMain("getNumWins");
        this.numLoses = await ipcRenderer.callMain("getNumLoses");
        this.mostRecentMatchTimestamp = await ipcRenderer.callMain("getMostRecentGameTimestamp");
    }

  async compareDBs(){
    // await ipcRenderer.callMain("establishDBConnection2", "C:\\My Projects\\LoLStats\\games_new.db");
    // let gameIds: any = await ipcRenderer.callMain("getAllMatchIds");

    // console.log(gameIds[0].gameId);

    // let match: Array<Match> = await ipcRenderer.callMain("getMatchById", 1963819451)
    // if(match.length > 0){
    //   console.log("game 1963819451 found");
    // }else{
    //   console.log("game 1963819451 NOT found");
    // }

    // let matchesSearched = 0;
    // let matchesFound = 0;
    // let matchesNotFound = 0;
    // await Promise.all(gameIds.map(async (gameIdObject: any) => {
    //   matchesSearched++;
    //   let match: Array<Match> = await ipcRenderer.callMain("getMatchById", gameIdObject.gameId)
    //   if(match.length > 0){
    //     console.log("game", gameIdObject.gameId, "found");
    //     matchesFound++;
    //   }else{
    //     console.log("game", gameIdObject.gameId, "NOT found");
    //     matchesNotFound++;
    //   }
    // }));

    // console.log("matchesSearched", matchesSearched, "matchesFound", matchesFound, "matchesNotFound", matchesNotFound);
  }

    async delay(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

@NgModule({
    imports: [BrowserModule],
    providers: [{ provide: LOCALE_ID, useValue: "de-DE" }],    
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }