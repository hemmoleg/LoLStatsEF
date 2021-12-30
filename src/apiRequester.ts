import GaleforceModule = require("galeforce");
import { Payload } from "galeforce/dist/galeforce/actions/payload";
import { SummonerDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto/riot-api/match-v5/match";
import { RiotRegion } from "galeforce/dist/riot-api";

export class ApiRequester{

  private galeforce: GaleforceModule;
  account: SummonerDTO;

  async init(apiKey): Promise<boolean> {
    this.galeforce = new GaleforceModule({
      'riot-api': {
        //key: 'RGAPI-b3fba36c-54f5-4788-a158-71c47bd6e0a3',
        key: apiKey,
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
    try{
      this.account = await this.galeforce.lol.summoner().region(this.galeforce.region.lol.EUROPE_WEST).name("hemmoleg").exec();
      console.log(this.account);
      return true;
    }catch(e){
      return false;
    }
  }

  async getMatchById(matchId: string): Promise<MatchDTO> {
    console.log("getting MatchById", matchId);
    return await this.galeforce.lol.match.match().matchId(matchId).region(this.galeforce.region.riot.EUROPE).exec();
  }

  async getTwentyMatchesFromStartIndex(startIndex: number): Promise<string[]> {
    let payload: Payload = {
      _id: "getMatches", 
      region: RiotRegion.EUROPE, 
      puuid: this.account.puuid,
      query: {start: startIndex}
    };

    return await this.galeforce.lol.match.list().set(payload).exec();
  }

  async getAllMatchIds(): Promise<string[]> {
    let start = 0;
    let stop = false;
    let mostRecentGameTimestamp = 0;
    let matchIds = [];

    do{
      let payload: Payload = {
        _id: "getMatches", 
        region: RiotRegion.EUROPE, 
        puuid: this.account.puuid,
        query: {start: start}
      };

      console.log("getting matches from", start, "to", start+20);
      let currentMatchIds = await this.galeforce.lol.match.list().set(payload).exec();
      console.log("got matches", start, "till", start + currentMatchIds.length);
      matchIds.push(...currentMatchIds);
      // by default the above call to riot returns 20 matches. If less matches are returned that means that ther no more
      // matches than the ones which were just returned.
      if(currentMatchIds.length == 20){
        console.log("checking last match timestamp...");
        let match = await this.galeforce.lol.match.match().region(RiotRegion.EUROPE).matchId(currentMatchIds[currentMatchIds.length-1]).exec();
        if(match.info.gameCreation > mostRecentGameTimestamp){
          console.log("last match creation still bigger than mostRecentGameTimestamp", match.info.gameCreation, ">", mostRecentGameTimestamp);
          start += currentMatchIds.length;;
        }
      }
      else{
        console.log("done. latest match from riot found in range from", start, "-", start + currentMatchIds.length);
        stop = true;
        console.log("last match id", currentMatchIds[currentMatchIds.length - 1]);
      }
    }while(!stop);

    return matchIds;
  }
}