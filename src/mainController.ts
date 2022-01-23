import { BrowserWindow } from "electron";
import { ipcMain } from "electron-better-ipc";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { ApiRequester } from "./apiRequester";
import { DBReader } from "./dbReader";
import { DBMatch } from "./entitiesV5/DBMatch";

const electron  = require('electron');

export class MainController{
  apiRequester: ApiRequester;
  dbReader: DBReader;

  //values to updateDB
  latestMatchCreation: number;
  matchDTOsToSave: MatchDTO[];

  async initDBReader(dbFilePath: string){
    if(this.dbReader)
      return;

    this.dbReader = new DBReader();
    await this.dbReader.establishDBConnectionV5(dbFilePath);
    await this.dbReader.createTablesV5();
    await this.dbReader.createRepositories();
  }

  async initApiRequester(apiKey: string): Promise<boolean>{
    this.apiRequester = new ApiRequester();
    return await this.apiRequester.init(apiKey);
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

  async updateDBPart1(){
    this.printInRendererConsole('updatingDB...');
    this.latestMatchCreation = await this.dbReader.getLatestMatchCreation();
    if(this.latestMatchCreation == -1)
      this.printInRendererConsole('latestMatchCreation was -1 -> DB is empty');
    else
      this.printInRendererConsole('latestMatchCreation is', new Date(this.latestMatchCreation).toUTCString());
  }

  async updateDBPart2(){
    let start = 0;
    let matchIds = [];
    let foundIndex = undefined;
    this.matchDTOsToSave = [];

    do{
      matchIds = await this.apiRequester.getTwentyMatchesFromStartIndex(start);

      for(let matchId of matchIds){
        let matchDTO = await this.apiRequester.getMatchById(matchId);
        if(matchDTO.info.gameCreation == this.latestMatchCreation){
          this.printInRendererConsole('found latest match at index', start + matchIds.indexOf(matchId));
          foundIndex = start + matchIds.indexOf(matchId);
          break;
        }else if(foundIndex == undefined){
          this.printInRendererConsole('match', start + matchIds.indexOf(matchId), matchId, 'creation', matchDTO.info.gameCreation, '!=', this.latestMatchCreation);
          this.matchDTOsToSave.push(matchDTO);
        }
      }

      start += matchIds.length; 
      console.log(start);
    }while(foundIndex == undefined && matchIds.length != 0)

    if(foundIndex == 0){
      this.printInRendererConsole('no new matches');
      this.printInRendererConsole('done');
      return;
    }

    this.printInRendererConsole('----------------------------------');
    this.printInRendererConsole('found latest match at index', foundIndex);
    this.printInRendererConsole('unfiltered matchtes to save', this.matchDTOsToSave.length);

    //400 '5v5 draft pick' 420 '5v5 ranked solo' 430 '5v5 blind pick' 440 '5v5 ranked flex'
    this.matchDTOsToSave = this.matchDTOsToSave.filter(matchDTO => 
      matchDTO.info.queueId == 400 
      || matchDTO.info.queueId == 420
      || matchDTO.info.queueId == 430
      || matchDTO.info.queueId == 440
    )
    this.printInRendererConsole('filtered matchtes (by queueId) to save', this.matchDTOsToSave.length);
    this.printInRendererConsole('saving matches now...');
    this.printInRendererConsole('----------------------------------');
  }

  async updateDBPart3(){
    let successfulWrittenMatches = 0;
    for(let matchDTO of this.matchDTOsToSave){
      let writtenMatch = await this.dbReader.writeMatch(DBMatch.CreateFromApi(matchDTO))
      if(!writtenMatch.compareAgainstApiMatch(matchDTO)){
        this.printInRendererConsole('match', this.matchDTOsToSave.indexOf(matchDTO), matchDTO.info.gameId, 'did not match written match!');
      }else{
        this.printInRendererConsole('match', this.matchDTOsToSave.indexOf(matchDTO), matchDTO.info.gameId, 'saved');
        successfulWrittenMatches++;
      }
    }

    this.printInRendererConsole('updated DB, matches to save', this.matchDTOsToSave.length, 'successfully saved', successfulWrittenMatches);
    this.printInRendererConsole('done');
  }

  printInRendererConsole(msg?: string, ...optParams: Array<string | number>){
    if(optParams){
      optParams.forEach(param => msg = msg + ' ' + param);
    }

    if(electron.BrowserWindow.getFocusedWindow())
      ipcMain.callFocusedRenderer('clg', msg);
    else
      console.log('no focused window -> msg printed here:', msg);
  }
}