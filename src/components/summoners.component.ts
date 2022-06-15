import { Component, Input, OnInit } from "@angular/core";
import { DBInfo, DBMatch, DBParticipant } from "../entitiesV5/DBMatch";
import { OtherChampionStats, ParticipantAndInfo } from "./championStats.component";

enum SortBy{
  Name = 'Champion Name',
  NumberOfGames = 'Number of Games',
  Winrate = 'Winrate',
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
  selector: "summoners",
  styleUrls: ['./../dist/styles/championStats.css'],
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
    <span *ngIf="othersStats" class="angle gameCountText"># of Games¹</span>
    <span *ngIf="othersStats" class="angle winPercent">WR¹</span>
    <span *ngIf="othersStats"class="angle gameCountText"># of Games²</span>
    <span *ngIf="othersStats"class="angle winPercent">WR²</span>
    <span class="angle">KDA</span>
    <span class="angle">Kills</span>
    <span class="angle">Deaths</span>
    <span class="angle">Assists</span>
    <span class="angle damageDealtToChmapionsPerDeath">DMG/Death</span>
    <span class="angle">Duration</span>
    
    <!-- table body -->
    <div id="container" *ngFor="let entry of championStats">
      <div class="otherChampionStats">
        <span class="championName">{{entry.name}}</span>
        <span *ngIf="othersStats" class="gameCount">{{entry.gameCount}}</span>
        <span *ngIf="othersStats" class="winPercent">
          <span *ngIf='isNaN(entry.winPercent); else elseSpan3'>
            --%
          </span>
          <ng-template #elseSpan3>
            <span>
              {{entry.winPercent | number: '1.0-1'}}%
            </span>
          </ng-template>
        </span>

        <span *ngIf="othersStats" class="gameCount">{{entry.gameCountOnEnemyTeam}}</span>
        <span *ngIf="othersStats" class="winPercent">
          <span *ngIf='isNaN(entry.winPercentOnEnemyTeam); else elseSpan1'>
            --%
          </span>
          <ng-template #elseSpan1>
            <span>
              {{entry.winPercentOnEnemyTeam | number: '1.0-1'}}%
            </span>
          </ng-template>
        </span>
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
        <span class="duration">{{entry.duration * 1000 | date:'mm:ss' }}</span>
      </div>
    </div>
    
    <!-- bottom line -->
    <div id='devider'></div>
    <span class="championName">Overall</span>
    <span *ngIf="othersStats" class="gameCount">{{allChampsStats.gameCount}}</span>
    <span *ngIf="othersStats" class="winPercent">{{allChampsStats.winPercent | number: '1.0-1'}}%</span>
    <span *ngIf="othersStats" class="gameCount">{{allChampsStats.gameCountOnEnemyTeam}}</span>
    <span *ngIf="othersStats" class="winPercent">{{allChampsStats.winPercentOnEnemyTeam | number: '1.0-1'}}%</span>
    <span class="gameCount">{{allChampsStats.gameCountOnMyTeam}}</span>
    <span class="winPercent">{{allChampsStats.winPercentOnMyTeam | number: '1.0-1'}}%</span>
    <span class="kda">{{allChampsStats.kda | number: '1.0-1'}}</span>
    <span class="kills">{{allChampsStats.kills | number: '1.0-1'}}</span>
    <span class="deaths">{{allChampsStats.deaths | number: '1.0-1'}}</span>
    <span class="assissts">{{allChampsStats.assists | number: '1.0-1'}}</span>
    <span class="damageDealtToChmapionsPerDeath">{{allChampsStats.damageDealtToChampionsPerDeath | number: '1.0-0'}}</span>
    <span class="duration">{{allChampsStats.duration * 1000 | date:'mm:ss' }}</span>
    <span *ngIf="othersStats" style="display: block; width: 8rem">¹ on enemy team</span>
    <span *ngIf="othersStats" style="display: block; width: 8rem">² on my team</span>
    
    `
})
export class SummonersComponent
{
  @Input() matches: DBMatch[];
  @Input() myPuuid: '';
  @Input() othersStats = true;

  //TODO check most played with/against players
  //TODO color lines with only one or two games gray background
  //TODO update stats after db was updated
  //TODO find out how to debug this in vs code

  myParticipantsAndInfos = new Map<string, Array<ParticipantAndInfo>>();
  championStats = new Array();
  allChampsStats = new OtherChampionStats();

  SortBy = SortBy;
  sortBy = Object.values(SortBy);

  onChangeDDSortBy(value: SortBy){
    switch(value){
      case SortBy.Name:
        this.championStats.sort((a,b) => {
            if(a.name < b.name){
              return -1;
            }
            if(a.name > b.name){
              return 1;
            }
            return 0;
          });
        break;
      
      case SortBy.NumberOfGames:
        this.championStats.sort((a,b) => {
            return b.gameCount - a.gameCount;
          });
        break;
      
      case SortBy.Winrate:
        this.championStats.sort((a,b) => {
          if(this.isNaN(a.winPercent)){
            return 1;
          }
          if(this.isNaN(b.winPercent)){
            return -1;
          }
          return b.winPercent - a.winPercent;
        });
        break;

      case SortBy.NumberOfGamesOnEnemyTeam:
        this.championStats.sort((a,b) => {
            return b.gameCountOnEnemyTeam - a.gameCountOnEnemyTeam;
          });
        break;
      
      case SortBy.WinrateOnEnemyTeam:
        this.championStats.sort((a,b) => {
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
        this.championStats.sort((a,b) => {
            return b.gameCountOnMyTeam - a.gameCountOnMyTeam;
          });
        break;

      case SortBy.WinrateOnMyTeam:
        this.championStats.sort((a,b) => {
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
        this.championStats.sort((a,b) => {
            return b.kda - a.kda;
          });
        break;

      case SortBy.Kills:
        this.championStats.sort((a,b) => {
            return b.kills - a.kills;
          });
        break;

      case SortBy.Deaths:
        this.championStats.sort((a,b) => {
            return b.deaths - a.deaths;
          });
        break;

      case SortBy.Assists:
        this.championStats.sort((a,b) => {
            return b.assists - a.assists;
          });
        break;

      case SortBy.DMGPerDeath:
        this.championStats.sort((a,b) => {
            return b.damageDealtToChampionsPerDeath - a.damageDealtToChampionsPerDeath;
          });
        break;

      case SortBy.Duration:
        this.championStats.sort((a,b) => {
            return b.duration - a.duration;
          });
        break;
    }
  }

  calcStats(matches?: DBMatch[]){
    if(matches)
      this.matches = matches;
    if(this.matches == undefined)
      return;

    console.log("calcchampionStats", this.matches.length);

    this.myParticipantsAndInfos.clear();
    this.championStats = [];

    let mapchampionStats = new Map<string, OtherChampionStats>();

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
        if(this.myParticipantsAndInfos.has(p.summonerName)){
          this.myParticipantsAndInfos.get(p.summonerName).push(pAndI);
        } else {
          this.myParticipantsAndInfos.set(p.summonerName, [pAndI]);
        }
      })
    })

    for (let k of this.myParticipantsAndInfos.keys()) {
      if (this.myParticipantsAndInfos.get(k).length < 2)
        this.myParticipantsAndInfos.delete(k);
    }

    this.allChampsStats = new OtherChampionStats();
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

      let championStats = new OtherChampionStats();
      championStats.winPercent = (totalWins/(totalWins + totalLoses)) * 100;
      championStats.kills = kills / value.length;
      championStats.deaths = deaths / value.length;
      championStats.assists = assists / value.length;
      championStats.kda = deaths > 0 ? (kills + assists) / deaths : 0;
      championStats.damageDealtToChampionsPerDeath = deaths > 0 ? damageDealtToChampions / deaths : 0;
      championStats.gameCount = value.length;
      championStats.duration = duration / value.length;

      championStats.gameCountOnMyTeam = gameCountOnMyTeam;
      championStats.gameCountOnEnemyTeam = gameCountOnEnemyTeam;
      championStats.winPercentOnMyTeam = (winsOnMyTeam/(winsOnMyTeam + losesOnMyTeam)) * 100;
      championStats.winPercentOnEnemyTeam = (winsOnEnemyTeam/(winsOnEnemyTeam + losesOnEnemyTeam)) * 100;

      if(winsOnEnemyTeam + losesOnEnemyTeam == 0){
        console.log(championStats.winPercentOnEnemyTeam);
      }

      mapchampionStats.set(key, championStats);
    
      //update allChampsStatss
      this.allChampsStats.gameCount += value.length;
      this.allChampsStats.gameCountOnEnemyTeam += championStats.gameCountOnEnemyTeam;
      this.allChampsStats.gameCountOnMyTeam += championStats.gameCountOnMyTeam;
      this.allChampsStats.kills += kills;
      this.allChampsStats.deaths += deaths;
      this.allChampsStats.assists += assists;
      this.allChampsStats.damageDealtToChampionsPerDeath += damageDealtToChampions;
      this.allChampsStats.duration += duration;
    })

    //damageDealtToChampionsPerDeath needs to be calculated BEFORE calculating deaths
    this.allChampsStats.damageDealtToChampionsPerDeath = this.allChampsStats.damageDealtToChampionsPerDeath / this.allChampsStats.deaths;
    this.allChampsStats.kills = this.allChampsStats.kills / this.allChampsStats.gameCount;
    this.allChampsStats.deaths = this.allChampsStats.deaths / this.allChampsStats.gameCount;
    this.allChampsStats.assists = this.allChampsStats.assists / this.allChampsStats.gameCount;
    this.allChampsStats.kda = (this.allChampsStats.kills + this.allChampsStats.assists) / this.allChampsStats.deaths;
    this.allChampsStats.winPercent = ((totalWinsOnEnemyTeam + totalWinsOnMyTeam)/(this.allChampsStats.gameCount)) * 100;
    this.allChampsStats.winPercentOnEnemyTeam = (totalWinsOnEnemyTeam/(this.allChampsStats.gameCountOnEnemyTeam)) * 100;
    this.allChampsStats.winPercentOnMyTeam = (totalWinsOnMyTeam/(this.allChampsStats.gameCountOnMyTeam)) * 100;
    this.allChampsStats.duration = this.allChampsStats.duration / this.allChampsStats.gameCount;
  
    mapchampionStats.forEach((value, key) => {
      value.name = key;
      this.championStats.push(value);
    })
  }

  isNaN(value: number){
    return Number.isNaN(value);
  }
}