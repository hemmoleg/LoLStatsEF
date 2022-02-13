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
import { ChampionAveragesComponent } from "./championAverages.component";


// const browserWindow = require('electron').remote.BrowserWindow;
const appVersion = require('electron').remote.app.getVersion(); 
const storage = require('electron-json-storage');

enum MatchType{
  all = "all",
  normal = "normal",
  ranked = "ranked"
}

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
      <select [ngModel]="matchesToShow" (ngModelChange)="onChangeDDMatchAmountToShow($event)">
        <option *ngFor="let matchesToShowOption of matchesToShowOptions" [value]="matchesToShowOption">{{matchesToShowOption}}</option>
      </select>
      <span>matches</span>
      <span>filter</span>
      <select [ngModel]="matchTypeToShow" (ngModelChange)="onChangeDDMatchTypeToShow($event)">
        <option *ngFor="let matcheType of matchTypes" [value]="matcheType">{{matcheType}}</option>
      </select>
      <span>matches</span>

      <average #average 
        [myPuuid]=myPuuid
        [matches]=currentMatches>
      </average>

      <div id="containerMatches">
        <match *ngFor="let match of currentMatches" 
          [myPuuid]=myPuuid
          [Match]=match>
        </match>
      </div>

      <championAverages #championAverages 
        [myPuuid]=myPuuid
        [matches]=currentMatches>
      </championAverages>
    `
})
export class AppComponent implements OnInit, AfterViewInit
{
    public MatchType = MatchType;
    public matchTypes = Object.keys(MatchType);
    static MatchTypeIDs: Map<MatchType, Array<number>> = new Map([
      [MatchType.all, [400, 430, 420, 440]],
      [MatchType.normal, [400, 430]],
      [MatchType.ranked, [420, 440]]
    ])

    myPuuid = '';
    numMatches = 0;
    numWins = 0;
    numLoses = 0;
    mostRecentMatchTimestamp = 0;

    matchesToShow;
    matchTypeToShow;
    matchesToShowOptions = [];
    allMatchIDs: any[];
    currentMatchIDs: any[];
    loadedMatches: DBMatch[];
    currentMatches: DBMatch[];

    msgs: string[] = [];

    apiKey: string = 'RGAPI-b2e4e01c-9263-445b-aae4-defb98ecbd33';
    apiRequesterWorking = false;

    @ViewChild('average') averageComponent:AverageComponent;
    @ViewChild('championAverages') championAveragesComponent:ChampionAveragesComponent;

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

      await this.getLastTenMatches();
      this.updateGUI();
    }

    updateGUI(){
      this.filterLoadedMatchesByType();
      this.averageComponent.calcAverages(this.currentMatches);
      this.championAveragesComponent.calcAverages(this.currentMatches);
    }

    async getLastTenMatches(){
      this.loadedMatches = [];
      this.allMatchIDs = this.allMatchIDs.reverse();
      this.currentMatchIDs = this.allMatchIDs.slice(0, 20);
      await this.getDBMatches(this.currentMatchIDs);

      this.printToConsole('getting all matches done');

      this.matchesToShowOptions = [...Array(this.allMatchIDs.length).keys()].filter(i => i % 5 == 0);
      this.matchesToShowOptions.shift(); // remove 0
      this.matchesToShowOptions.push(this.allMatchIDs.length) // add current lenght as option
      this.matchesToShow = this.loadedMatches.length;

      this.matchTypeToShow = MatchType.all;
      this.currentMatches = this.loadedMatches;
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

    async getDBMatches(matchIDs: any[]){
      await matchIDs.reduce(async (memo, id) => {
        await memo;
        this.printToConsole('getting match by gameID', id.gameId);
        let match: DBMatch = await ipcRenderer.callMain("getMatchByID", id.gameId);
        this.printToConsole('getting match done', match.id);
        this.loadedMatches.push(match);
      }, undefined);
    }

    async onChangeDDMatchAmountToShow(newValue: number){
      if(newValue < this.loadedMatches.length){
        this.loadedMatches = this.loadedMatches.slice(0, newValue);
        console.log('this.loadedMatches.length', this.loadedMatches.length);
        this.currentMatchIDs = this.currentMatchIDs.slice(0, newValue);
      } else {
        let matchesToAdd = newValue - this.loadedMatches.length;
        let newIDs = this.allMatchIDs.slice(this.loadedMatches.length, this.loadedMatches.length + matchesToAdd);
        this.currentMatchIDs.push(...newIDs);
        
        await this.getDBMatches(newIDs);
      }
      console.log("onChangesMatchesToShow loadedMatches.length", this.loadedMatches.length);
      
      this.updateGUI()
    }

    async onChangeDDMatchTypeToShow(newValue: MatchType){
      console.log(newValue);
      this.matchTypeToShow = newValue;
      this.updateGUI();
    }

    filterLoadedMatchesByType(){
      this.currentMatches = this.loadedMatches.filter(dbMatch => {
        return AppComponent.MatchTypeIDs.get(this.matchTypeToShow).includes(dbMatch.info.queueId); 
      })
      console.log('filtered matches', this.currentMatches);
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
    declarations: [AppComponent, MatchComponent, AverageComponent, ChampionAveragesComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }