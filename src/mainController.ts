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
    //TODO get matches starting with 0
    //TODO check match.info.gameCreation to find unwritten matches
  }

  async temp(){
    let match1 = await this.apiRequester.getMatchById('EUW1_5009413640')
    let match2 = await this.apiRequester.getMatchById('EUW1_5009349489')
    let match3 = await this.apiRequester.getMatchById('EUW1_5010757538')
    await this.dbReader.writeMatch(DBMatch.CreateFromApi(match1));
    await this.dbReader.writeMatch(DBMatch.CreateFromApi(match2));
    await this.dbReader.writeMatch(DBMatch.CreateFromApi(match3));

    let latestCreationTimestamp = await this.dbReader.getLatestMatchCreationDate();
    //should print Sat, 02 Jan 2021 21:27:56 GMT
    console.log("latest match creation timestamp", new Date(latestCreationTimestamp).toUTCString());
  }
}