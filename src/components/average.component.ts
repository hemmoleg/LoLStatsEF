import { Component, Input, OnInit } from "@angular/core";
import { DBMatch, DBParticipant } from "../entitiesV5/DBMatch";

@Component({
  selector: "average",
  styleUrls: ['./../dist/styles/average.css'],
  template: `
    <div>
      <span>wins {{wins}}</span>
      <span>loses {{loses}}</span>
      <span>winrate {{(wins/(wins + loses)) * 100 | number: '1.0-2'}}%</span>
    </div>
  `
})
export class AverageComponent implements OnInit
{
  @Input() matches: DBMatch[];
  @Input() myPuuid: '';
  // myParticipant: DBParticipant;
  test = false;

  wins = 0;
  loses = 0;
  winrate = 0;

  calcAverages(matches?: DBMatch[]){
    if(matches)
      this.matches = matches;
    
    console.log("calcAverages", this.matches.length);

    this.wins = 0;
    this.loses = 0;

    this.matches.forEach(match => {
      let myParticipant = match.info.participants.find( p => p.puuid == this.myPuuid );
      myParticipant.win ? this.wins++ : this.loses++;
    })
  }

  ngOnInit(): void {
    
  }
}