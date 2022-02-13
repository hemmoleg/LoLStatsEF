import { Component, Input, OnInit } from "@angular/core";
import { DBMatch, DBParticipant } from "../entitiesV5/DBMatch";

@Component({
  selector: "match",
  styleUrls: ['./../dist/styles/match.css'],
  template: `
    <div>
      <span class="gameCreation">{{match.info.gameCreation | date:'short'}}</span>
      <span class="championName">{{myParticipant.championName}}</span>
      <span class="win" *ngIf="myParticipant.win">WIN</span>
      <span class="lose"*ngIf="!myParticipant.win">LOSE</span>
      <span>{{myParticipant.kills}}</span>
      <span>{{myParticipant.deaths}}</span>
      <span>{{myParticipant.assists}}</span>
      <span>{{match.info.gameDuration * 1000 | date:'mm:ss'}}</span>
    </div>
  `
})
export class MatchComponent implements OnInit
{
  match: DBMatch;
  @Input() myPuuid: '';
  myParticipant: DBParticipant;
  test = false;

  @Input() 
  public set Match(match: DBMatch) {
    this.match = match;
    this.myParticipant = this.match.info.participants.find( p => p.puuid == this.myPuuid );
  }

  ngOnInit(): void {
    
  }
}