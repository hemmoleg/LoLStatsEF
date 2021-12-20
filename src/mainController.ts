import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { ApiRequester } from "./apiRequester";
import { DBReader } from "./dbReader";
import { DBMatch } from "./entitiesV5/DBMatch";


export class MainController{
  apiRequester: ApiRequester;
  dbReader: DBReader;
  
  static async init(): Promise<MainController>{
    let instance = new MainController();
    instance.apiRequester = await ApiRequester.init();
    
    instance.dbReader = new DBReader();
    await instance.dbReader.establishDBConnectionV5("C:\\My Projects\\LoLStatsEF\\my_games_match_v5.db");
    await instance.dbReader.createTablesV5();
    await instance.dbReader.createRepositories();
  
    return instance;
  }

  async writeTwoTestMatchesInDBAndCompareResultAgainstApi(){
    let apiMatch1 = await this.apiRequester.getMatchById("EUW1_5607406272");
  
    console.log("got match gameCreation", apiMatch1.info.gameCreation,
      "match.info.gameId", apiMatch1.info.gameId,
      "match.info.gameMode", apiMatch1.info.gameMode,
      "match.info.queueId", apiMatch1.info.queueId);

    let writtenMatch1 = await this.dbReader.writeMatch(DBMatch.CreateFromApi(apiMatch1));
    let dbMatch1 = await this.dbReader.getMatchByGameId(apiMatch1.info.gameId)

    let compareResult1 = dbMatch1.compareAgainstApiMatch(apiMatch1);
    // console.log("compare result", compareResult1);


    let apiMatch2 = await this.apiRequester.getMatchById("EUW1_5355327881");
    
    console.log("got match gameCreation", apiMatch2.info.gameCreation,
      "match.info.gameId", apiMatch2.info.gameId,
      "match.info.gameMode", apiMatch2.info.gameMode,
      "match.info.queueId", apiMatch2.info.queueId);

    let writtenMatch2 = await this.dbReader.writeMatch(DBMatch.CreateFromApi(apiMatch2));
    let dbMatch2 = await this.dbReader.getMatchByGameId(apiMatch2.info.gameId)

    let compareResult2 = dbMatch2.compareAgainstApiMatch(apiMatch2);
    // console.log("compare result", compareResult2);

    console.log("compare result 1", compareResult1, "compare result 2", compareResult2);
    console.log("saved match to DB");
  }

  async temp(){

    // let allDbMatches = await this.dbReader.getAllMatches();
    // allDbMatches.forEach(match => console.log(match.info.teams[0].bans));

    // let match4 = await this.apiRequester.getMatchById('EUW1_5550468970')
    // await this.dbReader.writeMatch(DBMatch.CreateFromApi(match4));
    // console.log('done');
    // return;

    
    return;

    let match1 = await this.apiRequester.getMatchById('EUW1_5009413640')
    let match2 = await this.apiRequester.getMatchById('EUW1_5009349489')
    let match3 = await this.apiRequester.getMatchById('EUW1_5010757538')
    await this.dbReader.writeMatch(DBMatch.CreateFromApi(match1));
    await this.dbReader.writeMatch(DBMatch.CreateFromApi(match2));
    await this.dbReader.writeMatch(DBMatch.CreateFromApi(match3));

    let writtenMatch1 = await this.dbReader.getMatchByGameId(5009413640);
    let writtenMatch2 = await this.dbReader.getMatchByGameId(5009349489);
    let writtenMatch3 = await this.dbReader.getMatchByGameId(5010757538);

    let res1 = writtenMatch1.compareAgainstApiMatch(match1);
    let res2 = writtenMatch2.compareAgainstApiMatch(match2);
    let res3 = writtenMatch3.compareAgainstApiMatch(match3);

    console.log(res1, res2, res3);

    let allDbMatches = await this.dbReader.getAllMatches();
    allDbMatches.forEach(match => console.log(match.info.teams[0].bans));

    console.log(match1.info.teams[0].bans);
    console.log(match2.info.teams[0].bans);
    console.log(match3.info.teams[0].bans);

    return;
    let latestCreationTimestamp = await this.dbReader.getLatestMatchCreation();
    //should print Sat, 02 Jan 2021 21:27:56 GMT
    console.log("latest match creation timestamp", new Date(latestCreationTimestamp).toUTCString());
  }

  async printAllMatchesCreatinInConsole(){
    let allMatchIds = await this.apiRequester.getAllMatchIds();
    console.log("----------------------------");
    console.log("got all MatchIds from ApiRequester");
    console.log("----------------------------");
    await Promise.all(allMatchIds.map(async (matchId: string) => {
      let match = await this.apiRequester.getMatchById(matchId);
      let creationDate = new Date(match.info.gameCreation);
      console.log("match", match.info.gameId, "created", creationDate.toUTCString());
    }))
    console.log("done");
  }

  async updateDB(){
    let latestMatchCreation = await this.dbReader.getLatestMatchCreation();
    if(latestMatchCreation == -1)
      console.log('latestMatchCreation was -1 -> DB is empty');

    let start = 0;
    let matchIds = [];
    let foundIndex = undefined;
    let matchDTOsToSave: Array<MatchDTO> = [];
    
    do{
      matchIds = await this.apiRequester.getTwentyMatchesFromStartIndex(start);

      for(let matchId of matchIds){
        let matchDTO = await this.apiRequester.getMatchById(matchId);
        if(matchDTO.info.gameCreation == latestMatchCreation){
          console.log('found latest match at index', start + matchIds.indexOf(matchId));
          foundIndex = start + matchIds.indexOf(matchId);
        }else if(foundIndex == undefined){
          console.log('match',start + matchIds.indexOf(matchId) , matchId, 'creation', matchDTO.info.gameCreation, '!=', latestMatchCreation);
          matchDTOsToSave.push(matchDTO);
        }
      }

      start += matchIds.length; 
    }while(foundIndex == undefined && matchIds.length != 0)

    console.log('----------------------------------');
    console.log('again, found latest match at index', foundIndex);
    console.log('unfiltered matchtes to save', matchDTOsToSave.length);
    console.log('----------------------------------');

    //400 '5v5 draft pick' 420 '5v5 ranked solo' 430 '5v5 blind pick' 440 '5v5 ranked flex'
    matchDTOsToSave = matchDTOsToSave.filter(matchDTO => 
      matchDTO.info.queueId == 400 
      || matchDTO.info.queueId == 420
      || matchDTO.info.queueId == 430
      || matchDTO.info.queueId == 440
    )
    console.log('filtered matchtes (by queueId) to save', matchDTOsToSave.length);

    console.log('----------------------------------');
    console.log('saving matches now...');
    console.log('----------------------------------');

    let successfulWrittenMatches = 0;
    for(let matchDTO of matchDTOsToSave){
      let writtenMatch = await this.dbReader.writeMatch(DBMatch.CreateFromApi(matchDTO))
      if(!writtenMatch.compareAgainstApiMatch(matchDTO)){
        console.log('match', matchDTOsToSave.indexOf(matchDTO), matchDTO.info.gameId, 'did not match written match!');
      }else{
        console.log('match', matchDTOsToSave.indexOf(matchDTO), matchDTO.info.gameId, 'saved');
        successfulWrittenMatches++;
      }
    }

    console.log('updated DB, matchtes to save', matchDTOsToSave.length, 'successfully saved', successfulWrittenMatches);
    console.log('done');
  }
}