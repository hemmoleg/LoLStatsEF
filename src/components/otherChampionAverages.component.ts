import { Component, Input, OnInit } from "@angular/core";
import { DBInfo, DBMatch, DBParticipant } from "../entitiesV5/DBMatch";
import { ChampionAverage, ParticipantAndInfo } from "./myChampionAverages.component";

// export class ParticipantAndInfo{
//   constructor(public p: DBParticipant, 
//     public i: DBInfo){}
// }

// export class ChampionAverage{
//   winPercent: number = 0;
//   gameCount: number = 0;
//   kills: number = 0;
//   deaths: number = 0;
//   assists: number = 0;
//   kda: number = 0;
//   damageDealtToChampionsPerDeath: number = 0;
//   duration: number = 0;
// }

export class OtherChampionAverage extends ChampionAverage{
  winPercentOnMyTeam: number;
  gameCountOnMyTeam: number;
}

@Component({
  selector: "otherChampionAverages",
  styleUrls: ['./../dist/styles/championAverages.css'],
  template: `
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
    
    <div id="container" *ngFor="let kvp of championAverages | keyvalue">
      <span class="championName">{{kvp.key}}</span>
      <span class="gameCount">{{kvp.value.gameCount}}</span>
      <span class="winPercent">{{kvp.value.winPercent | number: '1.0-1'}}%</span>
      <span class="gameCount">{{kvp.value.gameCountOnMyTeam}}</span>
      <span *ngIf='isNaN(kvp.value.winPercentOnMyTeam); else elseSpan' class="winPercent">
        --%
      </span>
      <ng-template #elseSpan>
        <span class="winPercent">
          {{kvp.value.winPercentOnMyTeam | number: '1.0-1'}}%
        </span>
      </ng-template>
      <span>{{kvp.value.kda | number: '1.0-1'}}</span>
      <span>{{kvp.value.kills | number: '1.0-1'}}</span>
      <span>{{kvp.value.deaths | number: '1.0-1'}}</span>
      <span>{{kvp.value.assists | number: '1.0-1'}}</span>
      <span class="damageDealtToChmapionsPerDeath">{{kvp.value.damageDealtToChampionsPerDeath | number: '1.0-0'}}</span>
      <span>{{kvp.value.duration * 1000 | date:'mm:ss' }}</span>
    </div>
    
    <div id='devider'></div>

    <span class="championName">Overall</span>
    <span class="gameCount">{{allChampsAverage.gameCount}}</span>
    <span class="winPercent">{{allChampsAverage.winPercent | number: '1.0-1'}}%</span>
    <span>{{allChampsAverage.kda | number: '1.0-1'}}</span>
    <span>{{allChampsAverage.kills | number: '1.0-1'}}</span>
    <span>{{allChampsAverage.deaths | number: '1.0-1'}}</span>
    <span>{{allChampsAverage.assists | number: '1.0-1'}}</span>
    <span class="damageDealtToChmapionsPerDeath">{{allChampsAverage.damageDealtToChampionsPerDeath | number: '1.0-0'}}</span>
    <span>{{allChampsAverage.duration * 1000 | date:'mm:ss' }}</span>
    <span style="display: block; width: 8rem">* on my team</span>
    
    `
})
export class OtherChampionAveragesComponent
{
  @Input() matches: DBMatch[];
  @Input() myPuuid: '';

  //TODO color lines with only one or two games gray background

  myParticipantsAndInfos = new Map<string, Array<ParticipantAndInfo>>();
  championAverages = new Map<string, OtherChampionAverage>(); 
  allChampsAverage = new OtherChampionAverage();

  calcAverages(matches?: DBMatch[]){
    if(matches)
      this.matches = matches;
    if(this.matches == undefined)
      return;

    console.log("calcChampionAverages", this.matches.length);

    this.myParticipantsAndInfos.clear();
    this.championAverages.clear();

    this.matches.forEach(match => {
      let myTeamId = match.info.participants.find( p => p.puuid == this.myPuuid).teamId;
      
      match.info.participants.forEach( p => {
          if(p.puuid == this.myPuuid) 
            return;

          let pAndI = new ParticipantAndInfo(p, match.info);
          pAndI.onMyTeam = p.teamId == myTeamId;
          if(this.myParticipantsAndInfos.has(p.championName)){
            this.myParticipantsAndInfos.get(p.championName).push(pAndI);
          } else {
            this.myParticipantsAndInfos.set(p.championName, [pAndI]);
          }
        } 
      )
    })

    this.allChampsAverage = new OtherChampionAverage();
    let totalWins = 0;

    this.myParticipantsAndInfos.forEach((value, key) => {
      let wins = 0;
      let loses = 0;
      let winsOnMyTeam = 0;
      let losesOnMyTeam = 0;
      let gameCountOnMyTeam = 0;
      let kills = 0;
      let deaths = 0;
      let assists = 0;
      let damageDealtToChampions = 0;
      let duration = 0;
      
      value.forEach((pAndI) => {
        pAndI.p.win ? wins++ : loses++;
        pAndI.p.win && pAndI.onMyTeam ? winsOnMyTeam++ : ''; 
        !pAndI.p.win && pAndI.onMyTeam ? losesOnMyTeam++ : ''; 
        pAndI.onMyTeam ? gameCountOnMyTeam++ : ''
        kills += pAndI.p.kills;
        deaths += pAndI.p.deaths;
        assists += pAndI.p.assists;
        damageDealtToChampions += pAndI.p.totalDamageDealtToChampions;
        duration += pAndI.i.gameDuration;

        totalWins += pAndI.p.win ? 1 : 0;
      })

      let championAverage = new OtherChampionAverage();
      championAverage.winPercent = (wins/(wins + loses)) * 100;
      championAverage.kills = kills / value.length;
      championAverage.deaths = deaths / value.length;
      championAverage.assists = assists / value.length;
      championAverage.kda = (kills + assists) / deaths;
      championAverage.damageDealtToChampionsPerDeath = damageDealtToChampions / deaths;
      championAverage.gameCount = value.length;
      championAverage.duration = duration / value.length;

      championAverage.gameCountOnMyTeam = gameCountOnMyTeam;
      championAverage.winPercentOnMyTeam = (winsOnMyTeam/(winsOnMyTeam + losesOnMyTeam)) * 100;

      this.championAverages.set(key, championAverage);
    
      //update allChampsAverages
      this.allChampsAverage.kills += kills;
      this.allChampsAverage.deaths += deaths;
      this.allChampsAverage.assists += assists;
      this.allChampsAverage.damageDealtToChampionsPerDeath += damageDealtToChampions;
      this.allChampsAverage.gameCount += value.length;
      this.allChampsAverage.duration += duration;
    })

    //damageDealtToChampionsPerDeath needs to be calculated BEFORE calculating deaths
    this.allChampsAverage.damageDealtToChampionsPerDeath = this.allChampsAverage.damageDealtToChampionsPerDeath / this.allChampsAverage.deaths;
    this.allChampsAverage.kills = this.allChampsAverage.kills / this.allChampsAverage.gameCount;
    this.allChampsAverage.deaths = this.allChampsAverage.deaths / this.allChampsAverage.gameCount;
    this.allChampsAverage.assists = this.allChampsAverage.assists / this.allChampsAverage.gameCount;
    this.allChampsAverage.kda = (this.allChampsAverage.kills + this.allChampsAverage.assists) / this.allChampsAverage.deaths;
    this.allChampsAverage.winPercent = (totalWins/(this.allChampsAverage.gameCount)) * 100;
    this.allChampsAverage.duration = this.allChampsAverage.duration / this.allChampsAverage.gameCount;
  }

  isNaN(value: number){
    return Number.isNaN(value);
  }
}