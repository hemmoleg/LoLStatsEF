import { AfterViewInit, LOCALE_ID, NgModule, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { BrowserModule, SafeUrl } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { RendererProcessIpc } from "electron-better-ipc";
import { ipcRenderer } from "electron-better-ipc";
import { registerLocaleData } from "@angular/common";
import localeDe from '@angular/common/locales/de';
import { DBMatch } from "../entitiesV5/DBMatch";
import { MatchComponent } from "./match.component";
import { AverageComponent } from "./average.component";


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
      <button (click)='initApiRequester()'>init API Requester</button>
      <button (click)='updateDB()' [disabled]="!apiRequesterWorking">update DB</button>
      <span [hidden]="apiRequesterWorking" style="color: red">API Requester NOT working</span>
      <span [hidden]="!apiRequesterWorking" style="color: green">API Requester working</span>

      <div #scrollMe [scrollTop]="scrollMe.scrollHeight" id="console">
        <span *ngFor="let msg of msgs">{{msg}}</span>
      </div>

      <span>show last</span> 
      <select [ngModel]="matchesToShow" (ngModelChange)="onChangeMatchesToShow($event)">
        <option *ngFor="let matchesToShowOption of matchesToShowOptions" [value]="matchesToShowOption">{{matchesToShowOption}}</option>
      </select>
      <span>matches</span>

      <average #average 
        [myPuuid]=myPuuid
        [matches]=currentMatches>
      </average>

      <match *ngFor="let match of currentMatches" 
        [myPuuid]=myPuuid
        [Match]=match>
      </match>
    `
})
export class AppComponent implements OnInit, AfterViewInit
{
    myPuuid = '';
    numMatches = 0;
    numWins = 0;
    numLoses = 0;
    mostRecentMatchTimestamp = 0;

    matchesToShow;
    matchesToShowOptions = [];
    allMatchIDs: any[];
    currentMatchIDs: any[];
    currentMatches: DBMatch[];

    msgs: string[] = [];

    apiKey: string = 'RGAPI-a0c513d5-42fe-4ce5-acc4-2225e577a57b';
    apiRequesterWorking = false;

    @ViewChild('average') averageComponent:AverageComponent;

    ngOnInit(): void {
      console.log("LolStatsEF", appVersion);
      console.log("storage " + storage.getDefaultDataPath());
  
      registerLocaleData(localeDe, 'de-DE');   
    }

    async ngAfterViewInit()
    {
        await ipcRenderer.callMain("initDBReader", "C:\\My Projects\\LoLStatsEF\\my_games_match_v5.db");
        this.apiRequesterWorking = await ipcRenderer.callMain("initApiRequester", this.apiKey);
        this.myPuuid = await ipcRenderer.callMain('getMyPUUID');
        this.updateData();

        ipcRenderer.answerMain('clg', (msg: string) => this.printToConsole(msg))
    }

    async updateDB(){
      await ipcRenderer.callMain('updateDBPart1');
      this.printToConsole("next step might take a while...");
      await ipcRenderer.callMain('updateDBPart2');
      this.printToConsole("next step might take a while...");
      await ipcRenderer.callMain('updateDBPart3');
      await this.updateData();
    }

    async updateData(){
      this.numMatches = await ipcRenderer.callMain("getNumMatches");
      this.numWins = await ipcRenderer.callMain("getNumWins");
      this.numLoses = await ipcRenderer.callMain("getNumLoses");
      this.mostRecentMatchTimestamp = await ipcRenderer.callMain("getMostRecentGameTimestamp");
      this.allMatchIDs = await ipcRenderer.callMain("getAllMatchIDs");
      this.printToConsole('gotAllMatchIDs', this.allMatchIDs.length);

      this.getAllMatches();
    }

    async getAllMatches(){
      this.currentMatches = [];
      this.allMatchIDs = this.allMatchIDs.reverse();
      this.currentMatchIDs = this.allMatchIDs.slice(0, 10);
      await this.showMatches(this.currentMatchIDs);

      this.averageComponent.calcAverages();
      this.printToConsole('getting all matches done');

      this.matchesToShowOptions = [...Array(this.allMatchIDs.length).keys()].filter(i => i % 5 == 0);
      this.matchesToShowOptions.shift(); // remove 0
      this.matchesToShowOptions.push(this.allMatchIDs.length) // add current lenght as option
      this.matchesToShow = this.currentMatches.length;
    }

    async initApiRequester(){
      this.apiRequesterWorking = await ipcRenderer.callMain("initApiRequester", this.apiKey);
    }

    printToConsole(msg?: string, ...optParams: Array<string | number>){
      if(optParams){
        optParams.forEach(param => msg = msg + ' ' + param);
      }
      
      this.msgs.push(msg);
    }

    async showMatches(matchIDs: any[]){
      await matchIDs.reduce(async (memo, id) => {
        await memo;
        this.printToConsole('getting match by gameID', id.gameId);
        let match: DBMatch = await ipcRenderer.callMain("getMatchByID", id.gameId);
        this.printToConsole('getting match done', match.id);
        this.currentMatches.push(match);
      }, undefined);
    }

    async onChangeMatchesToShow(newValue: number){
      if(newValue < this.currentMatches.length){
        this.currentMatches = this.currentMatches.slice(0, -newValue);
        this.currentMatchIDs = this.currentMatchIDs.slice(0, -newValue);
      } else {
        let matchesToAdd = newValue - this.currentMatches.length;
        let newIDs = this.allMatchIDs.slice(this.currentMatches.length, this.currentMatches.length + matchesToAdd);
        this.currentMatchIDs.push(...newIDs);
        
        await this.showMatches(newIDs);
      }
      console.log("onChangesMatchesToShow curerntMatches.length", this.currentMatches.length);
      this.averageComponent.calcAverages(this.currentMatches);
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
    declarations: [AppComponent, MatchComponent, AverageComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }