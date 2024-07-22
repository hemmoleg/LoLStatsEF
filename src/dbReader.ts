import { webContents } from "electron";
import { Connection, createConnection, Repository, Brackets } from 'typeorm';
import { Match } from './entitiesV4/Match';

import { DBBan, DBChampionKills, DBDragon, DBInfo, DBInhibitor, DBMatch, DBMetadata, DBObjectives, DBParticipant, DBPerks, DBRiftHerald, DBSelection, DBStatPerks, DBStyle, DBTeam, DBTower, DBBaron } from "./entitiesV5/DBMatch";

// const ipc = require("electron-better-ipc");


export class DBReader
{
    mainWebContents: webContents;

    private connection: Connection;

    MatchRepositoryV5: Repository<DBMatch>;
    InfoRepository: Repository<DBInfo>;
    ParticipantRepository: Repository<DBParticipant>;

    MatchRepository: Repository<Match>;

    

    constructor()
    {
        // ipc.answerMain("establishDBConnection", this.establishDBConnection.bind(this));
        // ipc.answerMain("getDBInfo", this.getDBInfo.bind(this));
        // ipc.answerMain("getConversations", this.getConversations.bind(this));
        // ipc.answerMain("getRelevantMessages", this.getRelevantMessages.bind(this));
        // ipc.answerMain("getCurrentParticipants", this.getCurrentParticipants.bind(this));
        // ipc.answerMain("getCurrentContacts", this.getCurrentContacts.bind(this));
        // ipc.answerMain("getCurrentMessages", this.getCurrentMessages.bind(this)); //from exporter

        // //'from' exoporter
        // ipc.answerMain("getFirstAndLastMessageOfConvo", this.getFirstAndLastMessageOfConvo.bind(this));
        // ipc.answerMain("getAllFileAndLinkMessagesFromDBOwner", this.getAllFileAndLinkMessagesFromDBOwner.bind(this));
        // ipc.answerMain("getConvoDisplayname", this.getConvoDisplayname.bind(this));
        // ipc.answerMain("getParticipantsForTimeOfCrime", this.getParticipantsForTimeOfCrime.bind(this));

        // ipc.answerMain("setFileIsOk", this.setFileIsOk.bind(this));
        console.log("DBReader", "reader inited");
    }

    async establishDBConnectionV5(filePath: string){
      this.connection = await this.openConnectionV5(filePath);
    }

    async createTablesV5(){
      try{ await this.connection.synchronize(); }
      catch(e){
        console.log("ERRORRROOROR", e);
      }
      console.log("DBReader DB synchronized");
    }

    async createRepositories(){
      this.MatchRepositoryV5 = this.connection.getRepository(
        DBMatch
      );

      this.InfoRepository = this.connection.getRepository(
        DBInfo
      );

      this.ParticipantRepository = this.connection.getRepository(
        DBParticipant
      )
    }

    async getNumMatches(): Promise<number>{
      return await this.MatchRepositoryV5.createQueryBuilder().getCount();
    }

    async getNumWins(puuid: string): Promise<number> {
      return await this.ParticipantRepository.count({where: {puuid: puuid, win: 1}});
    }

    async getNumLoses(puuid: string): Promise<number> {
      return await this.ParticipantRepository.count({where: {puuid: puuid, win: 0}});
    }

    async writeMatch(dbMatch: DBMatch): Promise<DBMatch>{
      let savedMatch: DBMatch;
      try{
        savedMatch= await this.MatchRepositoryV5.save(dbMatch);
        console.log("saved match");
      }catch(e){
        console.log("could not save match", e);
      }
      return savedMatch;
    }

    async getMatchByGameId(matchId: number): Promise<DBMatch> {
      let match = await this.MatchRepositoryV5.findOne({
        where: {
          info:{gameId: matchId}
        },
        relations:['info']
      })

      //fix random sorting of participants
      match.info.participants = match.info.participants.sort(function(a, b) {
        return a.participantId - b.participantId;
      });

      //fix gameDuration (was in milliseconds before patch 11.20 and seconds after 11.20)
      //patch was deployed on 5th october 2021
      //if game was befoer that duration is in ms so convert it to s
      if(match.info.gameCreation < 1633474800000)
        match.info.gameDuration = match.info.gameDuration / 1000;

      //commented bc eager loading of perks is disabled
      //fix random sorting of selections
      // match.info.participants.forEach(p => p.perks.styles.forEach(s => {
      //   s.selections = s.selections.sort(function(a, b) {
      //     return a.id - b.id;
      //   });
      // }));

      //commented bc eager loading of bans is disabled
      //fix random sorting of bans
      // match.info.teams.forEach(t => 
      //   t.bans = t.bans.sort(function(a, b){
      //     return a.id - b.id;
      //   })
      // );

      return match;
    }

    async getAllMatchIDs(): Promise<any[]>{
      let x = await this.InfoRepository.createQueryBuilder()
        .select('gameId')
        .getRawMany();
  
      return x;
    }

    async getAllMatches(): Promise<DBMatch[]> {
      // return await this.MatchRepositoryV5
      //   .createQueryBuilder('match')
      //   .leftJoinAndSelect('match.info', 'info')
      //   .leftJoinAndSelect('match.info.teams', 'team')
      //   .leftJoinAndSelect('match.metadata', 'metadata')
      //   .getMany();

      //WARNING: this crashes the code

      console.log('dbreader trying to get all matches...');
      let x = await this.MatchRepositoryV5.find();
      console.log('dbreader trying to get all matches... done');
      return x;
    }

    async getAllInfos(): Promise<DBInfo[]> {
      return await this.InfoRepository.find();
    }

    async getLatestMatchCreation(): Promise<number>{
      let info = await this.InfoRepository
        .createQueryBuilder()
        .addSelect("MAX(gameCreation)")
        .getOne();
      if(info)
        return info.gameCreation;
      else
        return -1;
    }

    async openConnectionV5(filePath: string)
    {
        if (this.connection && this.connection.isConnected) {
            console.log("DBReader", "Closing old connection...");
            try {
                await this.connection.close();
            } catch (e) {
                console.log("DBReader", e);
            }
            console.log("DBReader", "Old connection closed");
        }
        else { console.log("DBReader", "No old connection"); }

        console.log("DBReader", "Opening new connection to:", filePath);
        
        let connectionTemp: Connection;
        try{
          connectionTemp = await createConnection({
              type: "sqljs",
              location: filePath,
              entities: [DBMatch, DBInfo, DBTeam, DBBan, DBParticipant, DBPerks, 
                DBStyle, DBSelection, DBStatPerks, DBMetadata, DBObjectives, DBTower,
                DBRiftHerald, DBInhibitor, DBDragon, DBChampionKills, DBBaron],
              name: "MyConnection1",
              //logging: true,
              autoSave: true
          });
          console.log("DBReader", "connection open");
        } catch (e){
          console.log("DBReader", "could not open connection", e);
      }

      return connectionTemp;
    }

    async delay(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
