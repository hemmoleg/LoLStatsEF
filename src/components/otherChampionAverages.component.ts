import { Component, Input, OnInit } from "@angular/core";
import { DBInfo, DBMatch, DBParticipant } from "../entitiesV5/DBMatch";
import { ChampionAverage, ParticipantAndInfo } from "./myChampionAverages.component";
export class OtherChampionAverage extends ChampionAverage{
  winPercentOnMyTeam: number;
  gameCountOnMyTeam: number = 0;
  winPercentOnEnemyTeam: number = 0;
  gameCountOnEnemyTeam: number = 0;
  name: string;
}

enum SortBy{
  Name = 'Champion Name',
  NumberOfGamesOnEnemyTeam = 'Number of Games on Enemy Team',
  WinrateOnEnemyTeam = 'Winrate on Enemy Team',
  NumberOfGamesOnMyTeam = 'Number of Games on my Team',
  WinrateOnMyTeam = 'Winrate on my Team',
  KDA = 'KDA',
  Kills = 'Kills',
  Deaths = 'Deaths',
  Assists = 'Assissts',
  DMGPerDeath = 'DMG to Champions per Death',
  Duration = 'Game Length'
}

@Component({
  selector: "otherChampionAverages",
  styleUrls: ['./../dist/styles/championAverages.css'],
  template: `
    <span class="lblSortBy">Sort by</span> 
    <select [ngModel]="sortByValue" (ngModelChange)="onChangeDDSortBy($event)">
      <option *ngFor="let option of sortBy" [value]="option">{{option}}</option>
    </select>
    <br>

    <!-- table header -->
    <span class="championName"></span>
    <span class="angle gameCountText"># of Games</span>
    <span class="angle winPercent">WR</span>
    <span class="angle gameCountText"># of Games *</span>
    <span class="angle winPercent">WR *</span>
    <span class="angle">KDA</span>
    <span class="angle">Kills</span>
    <span class="angle">Deaths</span>
    <span class="angle">Assists</span>
    <span class="angle damageDealtToChmapionsPerDeath">DMG/Death</span>
    <span class="angle">Duration</span>
    
    <!-- table body -->
    <div id="container" *ngFor="let entry of championAverages">
      <span class="championName">{{entry.name}}</span>
      <span class="gameCount">{{entry.gameCountOnEnemyTeam}}</span>
      <span *ngIf='isNaN(entry.winPercentOnEnemyTeam); else elseSpan1' class="winPercent">
        --%
      </span>
      <ng-template #elseSpan1>
        <span class="winPercent">
          {{entry.winPercentOnEnemyTeam | number: '1.0-1'}}%
        </span>
      </ng-template>
      <span class="gameCount">{{entry.gameCountOnMyTeam}}</span>
      <span *ngIf='isNaN(entry.winPercentOnMyTeam); else elseSpan2' class="winPercent">
        --%
      </span>
      <ng-template #elseSpan2>
        <span class="winPercent">
          {{entry.winPercentOnMyTeam | number: '1.0-1'}}%
        </span>
      </ng-template>
      <span class="kda">{{entry.kda | number: '1.0-1'}}</span>
      <span class="kills">{{entry.kills | number: '1.0-1'}}</span>
      <span class="deaths">{{entry.deaths | number: '1.0-1'}}</span>
      <span class="assissts">{{entry.assists | number: '1.0-1'}}</span>
      <span class="damageDealtToChmapionsPerDeath">{{entry.damageDealtToChampionsPerDeath | number: '1.0-0'}}</span>
      <span>{{entry.duration * 1000 | date:'mm:ss' }}</span>
    </div>
    
    <!-- bottom line -->
    <div id='devider'></div>
    <span class="championName">Overall</span>
    <span class="gameCount">{{allChampsAverage.gameCount}}</span>
    <span class="winPercent">{{allChampsAverage.winPercentOnEnemyTeam | number: '1.0-1'}}%</span>
    <span class="gameCount">{{allChampsAverage.gameCountOnMyTeam}}</span>
    <span class="winPercent">{{allChampsAverage.winPercentOnMyTeam | number: '1.0-1'}}%</span>
    <span class="kda">{{allChampsAverage.kda | number: '1.0-1'}}</span>
    <span class="kills">{{allChampsAverage.kills | number: '1.0-1'}}</span>
    <span class="deaths">{{allChampsAverage.deaths | number: '1.0-1'}}</span>
    <span class="assissts">{{allChampsAverage.assists | number: '1.0-1'}}</span>
    <span class="damageDealtToChmapionsPerDeath">{{allChampsAverage.damageDealtToChampionsPerDeath | number: '1.0-0'}}</span>
    <span>{{allChampsAverage.duration * 1000 | date:'mm:ss' }}</span>
    <span style="display: block; width: 8rem">* on my team</span>
    
    `
})
export class OtherChampionAveragesComponent
{
  @Input() matches: DBMatch[];
  @Input() myPuuid: '';

  othersStats = true;
  	

  //TODO use this component for myStats as well as for othersStats
  //TODO implement same sorting as here in myChampionAverages
  //TODO check most played with/against players
  //TODO color lines with only one or two games gray background
  //TODO update stats after db was updated

  myParticipantsAndInfos = new Map<string, Array<ParticipantAndInfo>>();
  championAverages = new Array();
  allChampsAverage = new OtherChampionAverage();

  SortBy = SortBy;
  sortBy = Object.values(SortBy);

  onChangeDDSortBy(value: SortBy){
    switch(value){
      case SortBy.Name:
        this.championAverages.sort((a,b) => {
            if(a.name < b.name){
              return -1;
            }
            if(a.name > b.name){
              return 1;
            }
            return 0;
          });
        break;
      
      case SortBy.NumberOfGamesOnEnemyTeam:
        this.championAverages.sort((a,b) => {
            return b.gameCountOnEnemyTeam - a.gameCountOnEnemyTeam;
          });
        break;
      
      case SortBy.WinrateOnEnemyTeam:
        this.championAverages.sort((a,b) => {
          if(this.isNaN(a.winPercentOnEnemyTeam)){
            return 1;
          }
          if(this.isNaN(b.winPercentOnEnemyTeam)){
            return -1;
          }
          return b.winPercentOnEnemyTeam - a.winPercentOnEnemyTeam;
        });
        break;

      case SortBy.NumberOfGamesOnMyTeam:
        this.championAverages.sort((a,b) => {
            return b.gameCountOnMyTeam - a.gameCountOnMyTeam;
          });
        break;

      case SortBy.WinrateOnMyTeam:
        this.championAverages.sort((a,b) => {
          if(this.isNaN(a.winPercentOnMyTeam)){
            return 1;
          }
          if(this.isNaN(b.winPercentOnMyTeam)){
            return -1;
          }
          return b.winPercentOnMyTeam - a.winPercentOnMyTeam;
        });
        break;

      case SortBy.KDA:
        this.championAverages.sort((a,b) => {
            return b.kda - a.kda;
          });
        break;

      case SortBy.Kills:
        this.championAverages.sort((a,b) => {
            return b.kills - a.kills;
          });
        break;

      case SortBy.Deaths:
        this.championAverages.sort((a,b) => {
            return b.deaths - a.deaths;
          });
        break;

      case SortBy.Assists:
        this.championAverages.sort((a,b) => {
            return b.assists - a.assists;
          });
        break;

      case SortBy.DMGPerDeath:
        this.championAverages.sort((a,b) => {
            return b.damageDealtToChampionsPerDeath - a.damageDealtToChampionsPerDeath;
          });
        break;

      case SortBy.Duration:
        this.championAverages.sort((a,b) => {
            return b.duration - a.duration;
          });
        break;
    }
  }

  calcAverages(matches?: DBMatch[]){
    if(matches)
      this.matches = matches;
    if(this.matches == undefined)
      return;

    console.log("calcChampionAverages", this.matches.length);

    this.myParticipantsAndInfos.clear();
    this.championAverages = [];

    let mapChampionAverages = new Map<string, OtherChampionAverage>();

    this.matches.forEach(match => {
      let myTeamId = match.info.participants.find( p => p.puuid == this.myPuuid).teamId;
      
      match.info.participants.forEach( p => {
        if(this.othersStats){
          //collect others ParticipantsAndInfo objects 
          if(p.puuid == this.myPuuid)
            return;

        } else {
          //collect my ParticipantAndInfo objects
          if(p.puuid != this.myPuuid)
            return;
        }
        
        let pAndI = new ParticipantAndInfo(p, match.info);
        pAndI.onMyTeam = p.teamId == myTeamId;
        if(this.myParticipantsAndInfos.has(p.championName)){
          this.myParticipantsAndInfos.get(p.championName).push(pAndI);
        } else {
          this.myParticipantsAndInfos.set(p.championName, [pAndI]);
        }
      })
    })

    this.allChampsAverage = new OtherChampionAverage();
    let totalWinsOnEnemyTeam = 0;
    let totalWinsOnMyTeam = 0;

    this.myParticipantsAndInfos.forEach((value, key) => {
      let totalWins = 0;
      let totalLoses = 0;
      let winsOnMyTeam = 0;
      let losesOnMyTeam = 0;
      let winsOnEnemyTeam = 0;
      let losesOnEnemyTeam = 0;
      let gameCountOnMyTeam = 0;
      let gameCountOnEnemyTeam = 0;
      let kills = 0;
      let deaths = 0;
      let assists = 0;
      let damageDealtToChampions = 0;
      let duration = 0;
      
      value.forEach((pAndI) => {
        pAndI.p.win ? totalWins++ : totalLoses++;
        pAndI.p.win && pAndI.onMyTeam ? winsOnMyTeam++ : ''; 
        !pAndI.p.win && pAndI.onMyTeam ? losesOnMyTeam++ : ''; 
        pAndI.onMyTeam ? gameCountOnMyTeam++ : gameCountOnEnemyTeam++;
        kills += pAndI.p.kills;
        deaths += pAndI.p.deaths;
        assists += pAndI.p.assists;
        damageDealtToChampions += pAndI.p.totalDamageDealtToChampions;
        duration += pAndI.i.gameDuration;

        totalWinsOnEnemyTeam += pAndI.p.win && !pAndI.onMyTeam ? 1 : 0;
        totalWinsOnMyTeam += pAndI.p.win && pAndI.onMyTeam ? 1 : 0;
      })
      winsOnEnemyTeam = totalWins - winsOnMyTeam;
      losesOnEnemyTeam = totalLoses - losesOnMyTeam;

      let championAverage = new OtherChampionAverage();
      championAverage.winPercent = (totalWins/(totalWins + totalLoses)) * 100;
      championAverage.kills = kills / value.length;
      championAverage.deaths = deaths / value.length;
      championAverage.assists = assists / value.length;
      championAverage.kda = deaths > 0 ? (kills + assists) / deaths : 0;
      championAverage.damageDealtToChampionsPerDeath = deaths > 0 ? damageDealtToChampions / deaths : 0;
      //championAverage.gameCount = value.length;
      championAverage.duration = duration / value.length;

      championAverage.gameCountOnMyTeam = gameCountOnMyTeam;
      championAverage.gameCountOnEnemyTeam = gameCountOnEnemyTeam;
      championAverage.winPercentOnMyTeam = (winsOnMyTeam/(winsOnMyTeam + losesOnMyTeam)) * 100;
      championAverage.winPercentOnEnemyTeam = (winsOnEnemyTeam/(winsOnEnemyTeam + losesOnEnemyTeam)) * 100;

      if(winsOnEnemyTeam + losesOnEnemyTeam == 0){
        console.log(championAverage.winPercentOnEnemyTeam);
      }

      mapChampionAverages.set(key, championAverage);
    
      //update allChampsAverages
      this.allChampsAverage.gameCount += championAverage.gameCountOnEnemyTeam;
      this.allChampsAverage.gameCountOnMyTeam += championAverage.gameCountOnMyTeam;
      this.allChampsAverage.kills += kills;
      this.allChampsAverage.deaths += deaths;
      this.allChampsAverage.assists += assists;
      this.allChampsAverage.damageDealtToChampionsPerDeath += damageDealtToChampions;
      this.allChampsAverage.gameCount += value.length;
      this.allChampsAverage.gameCountOnMyTeam += (winsOnMyTeam + losesOnMyTeam);
      this.allChampsAverage.duration += duration;
    })

    //damageDealtToChampionsPerDeath needs to be calculated BEFORE calculating deaths
    this.allChampsAverage.damageDealtToChampionsPerDeath = this.allChampsAverage.damageDealtToChampionsPerDeath / this.allChampsAverage.deaths;
    this.allChampsAverage.kills = this.allChampsAverage.kills / this.allChampsAverage.gameCount;
    this.allChampsAverage.deaths = this.allChampsAverage.deaths / this.allChampsAverage.gameCount;
    this.allChampsAverage.assists = this.allChampsAverage.assists / this.allChampsAverage.gameCount;
    this.allChampsAverage.kda = (this.allChampsAverage.kills + this.allChampsAverage.assists) / this.allChampsAverage.deaths;
    //this.allChampsAverage.winPercent = (totalWins/(this.allChampsAverage.gameCount)) * 100;
    this.allChampsAverage.winPercentOnMyTeam = (totalWinsOnMyTeam/(this.allChampsAverage.gameCountOnMyTeam)) * 100;
    this.allChampsAverage.duration = this.allChampsAverage.duration / this.allChampsAverage.gameCount;
  
    console.log(this.allChampsAverage.winPercentOnMyTeam, this.allChampsAverage.gameCountOnMyTeam);

    mapChampionAverages.forEach((value, key) => {
      value.name = key;
      this.championAverages.push(value);
    })
  }

  isNaN(value: number){
    return Number.isNaN(value);
  }
}