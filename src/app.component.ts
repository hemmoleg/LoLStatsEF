import { LOCALE_ID, NgModule, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { BrowserModule, SafeUrl } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { RendererProcessIpc } from "electron-better-ipc";
import { ipcRenderer } from "electron-better-ipc";
import { registerLocaleData } from "@angular/common";
import localeDe from '@angular/common/locales/de';
import { MainController } from "./mainController";


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
      <br>
      <input [(ngModel)]="apiKey">
      <button (click)='updateDB()'>update DB</button>
      <span [hidden]="apiRequesterWorking" style="color: red">API Requester NOT working</span>
      <span [hidden]="!apiRequesterWorking" style="color: green">API Requester working</span>

    `
})
export class AppComponent implements OnInit
{
    numMatches = 0;
    numWins = 0;
    numLoses = 0;
    mostRecentMatchTimestamp = 0;

    apiKey: string = 'RGAPI-b3fba36c-54f5-4788-a158-71c47bd6e0a3';
    apiRequesterWorking = false;

    async ngOnInit()
    {
        console.log("LolStatsEF", appVersion);
        console.log("storage " + storage.getDefaultDataPath());
    
        registerLocaleData(localeDe, 'de-DE');

        await ipcRenderer.callMain("initDBReader", "C:\\My Projects\\LoLStatsEF\\my_games_match_v5.db");
        this.apiRequesterWorking = await ipcRenderer.callMain("initApiRequester", this.apiKey);
        this.numMatches = await ipcRenderer.callMain("getNumMatches");
        this.numWins = await ipcRenderer.callMain("getNumWins");
        this.numLoses = await ipcRenderer.callMain("getNumLoses");
        this.mostRecentMatchTimestamp = await ipcRenderer.callMain("getMostRecentGameTimestamp");
    }

    async updateDB(){
      await ipcRenderer.callMain('updateDB', this.apiKey);
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
    imports: [BrowserModule, FormsModule],
    providers: [{ provide: LOCALE_ID, useValue: "de-DE" }],    
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }