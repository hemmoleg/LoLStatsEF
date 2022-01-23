import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, JoinTable, ManyToOne } from "typeorm";
import Galeforce from 'galeforce';

@Entity({name: "metadata"})
export class DBMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { name: "dataVersion"})
  dataVersion: string;

  @Column("varchar", { name: "matchId"})
  matchId: string;

  @Column("simple-array", { name: "participants"})
  participants: string[];

  public static CreateFromApi(metadata: MetaData): DBMetadata {
    let dbMetadata = new DBMetadata();
    dbMetadata.dataVersion = metadata.dataVersion;
    dbMetadata.matchId = metadata.matchId;
    dbMetadata.participants = metadata.participants;
    return dbMetadata;
  }


  compareAgainstApi(apiMetadata: any): boolean{
    //console.log("comparing Metadata...");
    return (this.dataVersion == apiMetadata.dataVersion &&
        this.matchId == apiMetadata.matchId &&
        this.participants.every((p, i) => p == apiMetadata.participants[i])
    );
  }

}


@Entity({name: "selection"})
export class DBSelection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DBSelection)
  @JoinColumn({ name: 'dbStyle_id' })
  dummyFieldForManyToOne: unknown;

  @Column("integer", { name: "perk"})
  perk: number;

  @Column("integer", { name: "var1"})
  var1: number;

  @Column("integer", { name: "var2"})
  var2: number;

  @Column("integer", { name: "var3"})
  var3: number;

  public static CreateFromApi(selctions: Selection[]): DBSelection[] {
    let dbSelections = new Array<DBSelection>();
    
    selctions.forEach(selction => {
      let dbSelection = new DBSelection();
      dbSelection.perk = selction.perk;
      dbSelection.var1 = selction.var1;
      dbSelection.var2 = selction.var2;
      dbSelection.var3 = selction.var3;
      dbSelections.push(dbSelection);
    });
    
    return dbSelections;
  }

  compareAgainstApi(apiSelection: any): boolean{
    let res = (this.perk == apiSelection.perk &&
      this.var1 == apiSelection.var1 &&
      this.var2 == apiSelection.var2 &&
      this.var3 == apiSelection.var3);

    //console.log("compared Selection...", res);
    return res;
  }
}

@Entity({name: "statperks"})
export class DBStatPerks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("integer", { name: "defense"})
  defense: number;

  @Column("integer", { name: "flex"})
  flex: number;

  @Column("integer", { name: "offense"})
  offense: number;

  public static CreateFromApi(statperks: StatPerks): DBStatPerks {
    let dbStatperks = new DBStatPerks();
    dbStatperks.defense = statperks.defense;
    dbStatperks.flex = statperks.flex;
    dbStatperks.offense = statperks.offense;
    return dbStatperks;
  }

  compareAgainstApi(apiStatPerks: any): boolean{
    let res = (this.defense == apiStatPerks.defense &&
      this.flex == apiStatPerks.flex &&
      this.offense == apiStatPerks.offense);
    //console.log("compared StatPerks...", res);
    return res;
  }
}

@Entity({name: "style"})
export class DBStyle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DBStyle)
  @JoinColumn({ name: 'dbPerks_id' })
  dummyFieldForManyToOne: unknown;

  @Column("varchar", { name: "description"})
  description: string;

  @OneToMany(() => DBSelection, (selection) => selection.dummyFieldForManyToOne, {cascade: true, eager: true})
  selections: DBSelection[];

  @Column("integer", { name: "style"})
  style: number;

  public static CreateFromApi(styles: Style[]): DBStyle[] {
    let dbStyles = Array<DBStyle>();

    for(let style of styles){
      let dbStyle = new DBStyle();

      dbStyle.description = style.description;
      dbStyle.selections = DBSelection.CreateFromApi(style.selections);
      dbStyle.style = style.style;

      dbStyles.push(dbStyle);
    }
    
    return dbStyles;
  }

  compareAgainstApi(apiStyle: any): boolean{
    let res =  (this.description == apiStyle.description &&
      this.selections.every((s, i) => s.compareAgainstApi(apiStyle.selections[i])) &&
      this.style == apiStyle.style
    );
    //console.log("compared style...", res);
    return res;
  }
}

@Entity({name: "perks"})
export class DBPerks {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DBStatPerks, {cascade: true, eager: true})
  @JoinColumn()
  statPerks: DBStatPerks;

  @OneToMany(() => DBStyle, (style) => style.dummyFieldForManyToOne, {cascade: true, eager: true})
  styles: DBStyle[];

  public static CreateFromApi(perks: Perks): DBPerks {
    let dbPerks = new DBPerks();

    dbPerks.statPerks = DBStatPerks.CreateFromApi(perks.statPerks);
    dbPerks.styles = DBStyle.CreateFromApi(perks.styles);

    return dbPerks;
  }
  
  compareAgainstApi(apiPerks: any): boolean{
    let res = (this.statPerks.compareAgainstApi(apiPerks.statPerks) &&
      this.styles.every((style, i) => style.compareAgainstApi(apiPerks.styles[i]))
    );
    //console.log("compared perks...", res);
    return res
  }
}

@Entity({name: "participant"})
export class DBParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DBParticipant)
  @JoinColumn({ name: 'dbInfo_id' })
  dummyFieldForManyToOne: unknown;

  @Column("integer", { name: "assits"})
  assists: number;

  @Column("integer", { name: "baronKills"})
  baronKills: number;

  @Column("integer", { name: "bountyLevel"})
  bountyLevel: number;

  @Column("integer", { name: "champExperiance"})
  champExperience: number;

  @Column("integer", { name: "championLevel"})
  champLevel: number;

  @Column("integer", { name: "championId"})
  championId: number;

  @Column("varchar", { name: "championName"})
  championName: string;

  @Column("integer", { name: "championTransform"})
  championTransform: number;

  @Column("integer", { name: "consumablesPurchased"})
  consumablesPurchased: number;

  @Column("integer", { name: "damageDealtToBuildings"})
  damageDealtToBuildings: number;

  @Column("integer", { name: "damageDealtToObjectives"})
  damageDealtToObjectives: number;

  @Column("integer", { name: "damageDealtToTurrets"})
  damageDealtToTurrets: number;

  @Column("integer", { name: "damageSelfMitigated"})
  damageSelfMitigated: number;

  @Column("integer", { name: "deaths"})
  deaths: number;

  @Column("integer", { name: "detectorWardsPlaced"})
  detectorWardsPlaced: number;

  @Column("integer", { name: "doubleKills"})
  doubleKills: number;

  @Column("integer", { name: "dragonKills"})
  dragonKills: number;

  @Column("boolean", { name: "firstBloodAssist"})
  firstBloodAssist: boolean;

  @Column("boolean", { name: "firstBloodKill"})
  firstBloodKill: boolean;

  @Column("boolean", { name: "firstTowerAssist"})
  firstTowerAssist: boolean;

  @Column("boolean", { name: "firstTowerKill"})
  firstTowerKill: boolean;

  @Column("boolean", { name: "gameEndedInEarlySurrender"})
  gameEndedInEarlySurrender: boolean;

  @Column("boolean", { name: "gameEndedInSurrender"})
  gameEndedInSurrender: boolean;

  @Column("integer", { name: "goldEarned"})
  goldEarned: number;

  @Column("integer", { name: "goldSpent"})
  goldSpent: number;

  @Column("varchar", { name: "individualPosition"})
  individualPosition: string;

  @Column("integer", { name: "inhibitorKills"})
  inhibitorKills: number;

  @Column("integer", { name: "inhibitorTakedowns"})
  inhibitorTakedowns: number;

  @Column("integer", { name: "inhibitorsLost"})
  inhibitorsLost: number;

  @Column("integer", { name: "item0"})
  item0: number;

  @Column("integer", { name: "item1"})
  item1: number;

  @Column("integer", { name: "item2"})
  item2: number;

  @Column("integer", { name: "item3"})
  item3: number;

  @Column("integer", { name: "item4"})
  item4: number;

  @Column("integer", { name: "item5"})
  item5: number;

  @Column("integer", { name: "item6"})
  item6: number;

  @Column("integer", { name: "itemsPurchased"})
  itemsPurchased: number;

  @Column("integer", { name: "killingSprees"})
  killingSprees: number;

  @Column("integer", { name: "kills"})
  kills: number;

  @Column("varchar", { name: "lane"})
  lane: string;

  @Column("integer", { name: "largestCriticalStrike"})
  largestCriticalStrike: number;

  @Column("integer", { name: "largestKillingSpree"})
  largestKillingSpree: number;

  @Column("integer", { name: "largestMulitkill"})
  largestMultiKill: number;

  @Column("integer", { name: "longestTimeSpentLiving"})
  longestTimeSpentLiving: number;

  @Column("integer", { name: "magicDamageDealt"})
  magicDamageDealt: number;

  @Column("integer", { name: "magicDamageDealtToChampions"})
  magicDamageDealtToChampions: number;

  @Column("integer", { name: "magicDamageTaken"})
  magicDamageTaken: number;

  @Column("integer", { name: "neutralMonstersKilled"})
  neutralMinionsKilled: number;

  @Column("integer", { name: "nexusKills"})
  nexusKills: number;

  @Column("integer", { name: "nexusLost"})
  nexusLost: number;

  @Column("integer", { name: "nexusTakedowns"})
  nexusTakedowns: number;

  @Column("integer", { name: "objectivesStolen"})
  objectivesStolen: number;

  @Column("integer", { name: "objectivesStolenAssists"})
  objectivesStolenAssists: number;

  @Column("integer", { name: "participantId"})
  participantId: number;

  @Column("integer", { name: "pentaKills"})
  pentaKills: number;

  @OneToOne(() => DBPerks, {cascade: true, eager: true})
  @JoinColumn()
  perks: DBPerks;

  @Column("integer", { name: "physicalDamgeDealt"})
  physicalDamageDealt: number;

  @Column("integer", { name: "physicalDamageDealtToChampions"})
  physicalDamageDealtToChampions: number;

  @Column("integer", { name: "physicalDamgeTaken"})
  physicalDamageTaken: number;

  @Column("integer", { name: "profileIcon"})
  profileIcon: number;

  @Column("varchar", { name: "puuid"})
  puuid: string;

  @Column("integer", { name: "qudraKills"})
  quadraKills: number;

  @Column("varchar", { name: "riotIdName"})
  riotIdName: string;

  @Column("varchar", { name: "riotIdTagline"})
  riotIdTagline: string;

  @Column("varchar", { name: "role"})
  role: string;

  @Column("integer", { name: "sightWardsBoughtInGame"})
  sightWardsBoughtInGame: number;
  
  @Column("integer", { name: "spell1Casts"})
  spell1Casts: number;

  @Column("integer", { name: "spell2Casts"})
  spell2Casts: number;

  @Column("integer", { name: "spell3Casts"})
  spell3Casts: number;

  @Column("integer", { name: "spell4Casts"})
  spell4Casts: number;

  @Column("integer", { name: "summoner1Casts"})
  summoner1Casts: number;

  @Column("integer", { name: "summoner1Id"})
  summoner1Id: number;

  @Column("integer", { name: "summoner2Casts"})
  summoner2Casts: number;

  @Column("integer", { name: "summoner2Id"})
  summoner2Id: number;

  @Column("varchar", { name: "summonerId"})
  summonerId: string;

  @Column("integer", { name: "summonerLevel"})
  summonerLevel: number;

  @Column("varchar", { name: "summonerName"})
  summonerName: string;

  @Column("boolean", { name: "teamEarlySurrendered"})
  teamEarlySurrendered: boolean;

  @Column("integer", { name: "teamId"})
  teamId: number;

  @Column("varchar", { name: "teamPosition"})
  teamPosition: string;

  @Column("integer", { name: "timeCCingOthers"})
  timeCCingOthers: number;

  @Column("integer", { name: "timePlayed"})
  timePlayed: number;

  @Column("integer", { name: "totalDamageDealt"})
  totalDamageDealt: number;

  @Column("integer", { name: "totalDamageDealtToChampions"})
  totalDamageDealtToChampions: number;

  @Column("integer", { name: "totalDamageShieldedOnTeammates"})
  totalDamageShieldedOnTeammates: number;

  @Column("integer", { name: "totalDamageTaken"})
  totalDamageTaken: number;

  @Column("integer", { name: "totalHeal"})
  totalHeal: number;

  @Column("integer", { name: "totalHealsOnTeammates"})
  totalHealsOnTeammates: number;

  @Column("integer", { name: "totalMinionsKilled"})
  totalMinionsKilled: number;

  @Column("integer", { name: "totalTimeCCDealt"})
  totalTimeCCDealt: number;

  @Column("integer", { name: "totalTimeSpentDead"})
  totalTimeSpentDead: number;

  @Column("integer", { name: "totalUnitsHeald"})
  totalUnitsHealed: number;

  @Column("integer", { name: "tripleKills"})
  tripleKills: number;

  @Column("integer", { name: "trueDamageDealt"})
  trueDamageDealt: number;

  @Column("integer", { name: "trueDamageDealtToChampions"})
  trueDamageDealtToChampions: number;

  @Column("integer", { name: "trueDamageTaken"})
  trueDamageTaken: number;

  @Column("integer", { name: "turretKills"})
  turretKills: number;

  @Column("integer", { name: "turretTakedowns"})
  turretTakedowns: number;

  @Column("integer", { name: "turretsLost"})
  turretsLost: number;

  @Column("integer", { name: "unrealKills"})
  unrealKills: number;

  @Column("integer", { name: "visionScore"})
  visionScore: number;

  @Column("integer", { name: "visionWardsBoughtInGame"})
  visionWardsBoughtInGame: number;

  @Column("integer", { name: "wardsKilled"})
  wardsKilled: number;

  @Column("integer", { name: "wardsPlaced"})
  wardsPlaced: number;

  @Column("boolean", { name: "win"})
  win: boolean;

  //public static CreateFromApi(matchDTO: MatchDTO): DBParticipant[] {
  public static CreateFromApi(participants: Participant[]): DBParticipant[] {  
    let dbParticipants = Array<DBParticipant>();
    
    //matchDTO.info.participants.forEach(participant => {
    participants.forEach(participant => {
      let dbParticipant = new DBParticipant();

      dbParticipant.assists = participant.assists;
      dbParticipant.baronKills = participant.baronKills;
      dbParticipant.bountyLevel = participant.bountyLevel;
      dbParticipant.champExperience = participant.champExperience;
      dbParticipant.champLevel = participant.champLevel;
      dbParticipant.championId = participant.championId;
      dbParticipant.championName = participant.championName;
      dbParticipant.championTransform = participant.championTransform;
      dbParticipant.consumablesPurchased = participant.consumablesPurchased;
      dbParticipant.damageDealtToBuildings = participant.damageDealtToBuildings;
      //for some reason particpant (the object from the api) doesnt have damageDealtToBuildings
      if(dbParticipant.damageDealtToBuildings == undefined){
        dbParticipant.damageDealtToBuildings = 0;
      }
      dbParticipant.damageDealtToObjectives = participant.damageDealtToObjectives;
      dbParticipant.damageDealtToTurrets = participant.damageDealtToTurrets;
      dbParticipant.damageSelfMitigated = participant.damageSelfMitigated;
      dbParticipant.deaths = participant.deaths;
      dbParticipant.detectorWardsPlaced = participant.detectorWardsPlaced;
      dbParticipant.doubleKills = participant.doubleKills;
      dbParticipant.dragonKills = participant.dragonKills;
      dbParticipant.firstBloodAssist = participant.firstBloodAssist;
      dbParticipant.firstBloodKill = participant.firstBloodKill;
      dbParticipant.firstTowerAssist = participant.firstTowerAssist;
      dbParticipant.firstTowerKill = participant.firstTowerKill;
      dbParticipant.gameEndedInEarlySurrender = participant.gameEndedInEarlySurrender;
      dbParticipant.gameEndedInSurrender = participant.gameEndedInSurrender;
      dbParticipant.goldEarned = participant.goldEarned;
      dbParticipant.goldSpent = participant.goldSpent;
      dbParticipant.individualPosition = participant.individualPosition;
      dbParticipant.inhibitorKills = participant.inhibitorKills;
      dbParticipant.inhibitorTakedowns = participant. inhibitorKills;
      //for some reason particpant (the object from the api) doesnt have inhibitorTakedowns
      if(dbParticipant.inhibitorTakedowns == undefined){
        dbParticipant.inhibitorTakedowns = 0;
      }
      dbParticipant.inhibitorsLost = participant.inhibitorsLost;
      //for some reason particpant (the object from the api) doesnt have inhibitorLost
      if(dbParticipant.inhibitorsLost == undefined){
        dbParticipant.inhibitorsLost = 0;
      }
      dbParticipant.item0 = participant.item0;
      dbParticipant.item1 = participant.item1;
      dbParticipant.item2 = participant.item2;
      dbParticipant.item3 = participant.item3;
      dbParticipant.item4 = participant.item4;
      dbParticipant.item5 = participant.item5;
      dbParticipant.item6 = participant.item6;
      dbParticipant.itemsPurchased = participant.itemsPurchased;
      dbParticipant.killingSprees = participant.killingSprees;
      dbParticipant.kills = participant.kills;
      dbParticipant.lane = participant.lane;
      dbParticipant.largestCriticalStrike = participant.largestCriticalStrike;
      dbParticipant.largestKillingSpree = participant.largestKillingSpree;
      dbParticipant.largestMultiKill = participant.largestMultiKill;
      dbParticipant.longestTimeSpentLiving = participant.longestTimeSpentLiving;
      dbParticipant.magicDamageDealt = participant.magicDamageDealt;
      dbParticipant.magicDamageDealtToChampions = participant.magicDamageDealtToChampions;
      dbParticipant.magicDamageTaken = participant.magicDamageTaken;
      dbParticipant.neutralMinionsKilled = participant.neutralMinionsKilled;
      dbParticipant.nexusKills = participant.nexusKills;
      dbParticipant.nexusLost = participant.nexusLost;
      //for some reason particpant (the object from the api) doesnt have nexusLost
      if(dbParticipant.nexusLost == undefined){
        dbParticipant.nexusLost = 0;
      }
      dbParticipant.nexusTakedowns = participant.nexusTakedowns;
      //for some reason particpant (the object from the api) doesnt have nexusTakedowns
      if(dbParticipant.nexusTakedowns == undefined){
        dbParticipant.nexusTakedowns = 0;
      }
      dbParticipant.objectivesStolen  = participant.objectivesStolen;
      dbParticipant.objectivesStolenAssists = participant.objectivesStolenAssists;
      dbParticipant.participantId = participant.participantId;
      dbParticipant.pentaKills = participant.pentaKills;
      dbParticipant.perks = DBPerks.CreateFromApi(participant.perks);
      dbParticipant.physicalDamageDealt = participant.physicalDamageDealt;
      dbParticipant.physicalDamageDealtToChampions = participant.physicalDamageDealtToChampions;
      dbParticipant.physicalDamageTaken = participant.physicalDamageTaken;
      dbParticipant.profileIcon = participant.profileIcon;
      dbParticipant.puuid = participant.puuid;
      dbParticipant.quadraKills = participant.quadraKills;
      dbParticipant.riotIdName = participant.riotIdName;
      dbParticipant.riotIdTagline = participant.riotIdTagline;
      dbParticipant.role = participant.role;
      dbParticipant.sightWardsBoughtInGame = participant.sightWardsBoughtInGame;
      dbParticipant.spell1Casts = participant.spell1Casts;
      dbParticipant.spell2Casts = participant.spell2Casts;
      dbParticipant.spell3Casts = participant.spell3Casts;
      dbParticipant.spell4Casts = participant.spell4Casts;
      dbParticipant.summoner1Casts = participant.summoner1Casts;
      dbParticipant.summoner1Id = participant.summoner1Id;
      dbParticipant.summoner2Casts = participant.summoner2Casts;
      dbParticipant.summoner2Id = participant.summoner2Id;
      dbParticipant.summonerId = participant.summonerId;
      dbParticipant.summonerLevel = participant.summonerLevel;
      dbParticipant.summonerName = participant.summonerName;
      dbParticipant.teamEarlySurrendered = participant.teamEarlySurrendered;
      dbParticipant.teamId = participant.teamId;
      dbParticipant.teamPosition = participant.teamPosition;
      dbParticipant.timeCCingOthers = participant.timeCCingOthers;
      dbParticipant.timePlayed = participant.timePlayed;
      dbParticipant.totalDamageDealt = participant.totalDamageDealt;
      dbParticipant.totalDamageDealtToChampions = participant.totalDamageDealtToChampions;
      dbParticipant.totalDamageShieldedOnTeammates = participant.totalDamageShieldedOnTeammates;
      dbParticipant.totalDamageTaken = participant.totalDamageDealt;
      dbParticipant.totalHeal = participant.totalHeal;
      dbParticipant.totalHealsOnTeammates = participant.totalHealsOnTeammates
      dbParticipant.totalMinionsKilled = participant.totalMinionsKilled;
      dbParticipant.totalTimeCCDealt = participant.totalTimeCCDealt;
      dbParticipant.totalTimeSpentDead = participant.totalTimeSpentDead;
      dbParticipant.totalUnitsHealed = participant.totalUnitsHealed;
      dbParticipant.tripleKills = participant.tripleKills;
      dbParticipant.trueDamageDealt = participant.trueDamageDealt;
      dbParticipant.trueDamageDealtToChampions = participant.trueDamageDealtToChampions;
      dbParticipant.trueDamageTaken = participant.trueDamageTaken;
      dbParticipant.turretKills = participant.turretKills;
      dbParticipant.turretTakedowns = participant.turretTakedowns;
      //for some reason particpant (the object from the api) doesnt have turretTakedowns
      if(dbParticipant.turretTakedowns == undefined){
        dbParticipant.turretTakedowns = 0;
      }
      dbParticipant.turretsLost = participant.turretsLost;
      //for some reason particpant (the object from the api) doesnt have turretLost
      if(dbParticipant.turretsLost == undefined){
        dbParticipant.turretsLost = 0;
      }
      dbParticipant.unrealKills = participant.unrealKills;
      dbParticipant.visionScore = participant.visionScore;
      dbParticipant.visionWardsBoughtInGame = participant.visionWardsBoughtInGame;
      dbParticipant.wardsKilled = participant.wardsKilled;
      dbParticipant.wardsPlaced = participant.wardsPlaced;
      dbParticipant.win = participant.win;

      dbParticipants.push(dbParticipant);
    })

    return dbParticipants;
  } 

  compareAgainstApi(apiParticipant: any): boolean{
    //console.log("comparing Participant...", this.participantId, apiParticipant.participantId);
    
    return (this.participantId == apiParticipant.participantId &&
      this.perks.compareAgainstApi(apiParticipant.perks) &&
      this.champExperience == apiParticipant.champExperience &&
      this.champLevel == apiParticipant.champLevel &&
      this.championId == apiParticipant.championId &&
      this.championName == apiParticipant.championName &&
      this.summoner2Casts == apiParticipant.summoner2Casts &&
      this.summoner2Id == apiParticipant.summoner2Id &&
      this.visionScore == apiParticipant.visionScore);
  }
}

@Entity({name: "ban"})
export class DBBan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DBBan)
  @JoinColumn({ name: 'dbTeam_id' })
  dummyFieldForManyToOne: unknown;

  @Column("integer", { name: "championId"})
  championId: number;

  @Column("integer", { name: "pickTurn"})
  pickTurn: number;

  public static CreateFromApi(bans: Ban[]): DBBan[] {
    let dbBans = new Array<DBBan>();

    bans.forEach(ban => {

      let dbBan = new DBBan();
      dbBan.championId = ban.championId;
      dbBan.pickTurn = ban.pickTurn;

      dbBans.push(dbBan);
    })

    return dbBans;
  }

  compareAgainstApi(apiBan: any): boolean{
    //console.log("comparing ban...");
    return (this.championId == apiBan.championId &&
      this.pickTurn == apiBan.pickTurn);
  }
}

@Entity({name: "baron"})
export class DBBaron {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("boolean", { name: "first"})
  first: boolean;

  @Column("integer", { name: "kills"})
  kills: number;

  public static CreateFromApi(baron: Baron): DBBaron {
    let dbBaron = new DBBaron();

    dbBaron.first = baron.first;
    dbBaron.kills = baron.kills;

    return dbBaron;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing baron...");
    return(this.first == objective.first &&
      this.kills == objective.kills);
  }
}

@Entity({name: "championKills"})
export class DBChampionKills {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("boolean", { name: "first"})
  first: boolean;

  @Column("integer", { name: "kills"})
  kills: number;

  public static CreateFromApi(championKills: ChampionKills): DBChampionKills {
    let dbChampionKills = new DBChampionKills();

    dbChampionKills.first = championKills.first;
    dbChampionKills.kills = championKills.kills;

    return dbChampionKills;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing championKills...");
    return(this.first == objective.first &&
      this.kills == objective.kills);
  }
}

@Entity({name: "dragon"})
export class DBDragon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("boolean", { name: "first"})
  first: boolean;

  @Column("integer", { name: "kills"})
  kills: number;

  public static CreateFromApi(dragon: Dragon): DBDragon {
    let dbDragon = new DBDragon();

    dbDragon.first = dragon.first;
    dbDragon.kills = dragon.kills;

    return dbDragon;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing dragon...");
    return(this.first == objective.first &&
      this.kills == objective.kills);
  }
}

@Entity({name: "inhibitor"})
export class DBInhibitor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("boolean", { name: "first"})
  first: boolean;

  @Column("integer", { name: "kills"})
  kills: number;

  public static CreateFromApi(inhibitor: Inhibitor): DBInhibitor {
    let dbInhibitor = new DBInhibitor();

    dbInhibitor.first = inhibitor.first;
    dbInhibitor.kills = inhibitor.kills;

    return dbInhibitor;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing inhibitor...");
    return(this.first == objective.first &&
      this.kills == objective.kills);
  }
}

@Entity({name: "riftHerald"})
export class DBRiftHerald {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("boolean", { name: "first"})
  first: boolean;

  @Column("integer", { name: "kills"})
  kills: number;

  public static CreateFromApi(riftHerald: RiftHerald): DBRiftHerald {
    let dbRiftHerald = new DBRiftHerald();

    dbRiftHerald.first = riftHerald.first;
    dbRiftHerald.kills = riftHerald.kills;

    return dbRiftHerald;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing riftHerald...");
    return(this.first == objective.first &&
      this.kills == objective.kills);
  }
}

@Entity({name: "tower"})
export class DBTower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("boolean", { name: "first"})
  first: boolean;

  @Column("integer", { name: "kills"})
  kills: number;

  public static CreateFromApi(tower: Tower): DBTower {
    let dbTower = new DBTower();

    dbTower.first = tower.first;
    dbTower.kills = tower.kills;

    return dbTower;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing tower...");
    return(this.first == objective.first &&
      this.kills == objective.kills);
  }
}

@Entity({name: "objectives"})
export class DBObjectives {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DBBaron, {cascade: true, eager: true})
  @JoinColumn()
  baron: DBBaron;

  @OneToOne(() => DBChampionKills, {cascade: true, eager: true})
  @JoinColumn()
  champion: DBChampionKills;

  @OneToOne(() => DBDragon, {cascade: true, eager: true})
  @JoinColumn()
  dragon: DBDragon;

  @OneToOne(() => DBInhibitor, {cascade: true, eager: true})
  @JoinColumn()
  inhibitor: DBInhibitor;

  @OneToOne(() => DBRiftHerald, {cascade: true, eager: true})
  @JoinColumn()
  riftHerald: DBRiftHerald;

  @OneToOne(() => DBTower, {cascade: true, eager: true})
  @JoinColumn()
  tower: DBTower;

  public static CreateFromApi(objectives: Objectives): DBObjectives {
    let dbObjectives = new DBObjectives();

    dbObjectives.baron = DBBaron.CreateFromApi(objectives.baron);
    dbObjectives.champion = DBChampionKills.CreateFromApi(objectives.champion);
    dbObjectives.dragon = DBDragon.CreateFromApi(objectives.dragon);
    dbObjectives.inhibitor = DBInhibitor.CreateFromApi(objectives.inhibitor);
    dbObjectives.riftHerald = DBRiftHerald.CreateFromApi(objectives.riftHerald);
    dbObjectives.tower = DBTower.CreateFromApi(objectives.tower);

    return dbObjectives;
  }

  compareAgainstApi(objective: any): boolean{
    //console.log("comparing objectives...");
    return(this.baron.compareAgainstApi(objective.baron) &&
    this.champion.compareAgainstApi(objective.champion) &&
    this.dragon.compareAgainstApi(objective.dragon) &&
    this.inhibitor.compareAgainstApi(objective.inhibitor) &&
    this.riftHerald.compareAgainstApi(objective.riftHerald) &&
    this.tower.compareAgainstApi(objective.tower))  
  }

}

@Entity({name: "team"})
export class DBTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DBTeam)
  @JoinColumn({ name: 'dbInfo_id' })
  dummyFieldForManyToOne: unknown;

  @OneToMany(() => DBBan, (ban) => ban.dummyFieldForManyToOne, {cascade: true, eager: true})
  bans: DBBan[];
  
  // @OneToMany(() => DBFoo, (foo) => foo.dummyFieldForManyToOne, {cascade: true, eager: true})
  // foos: DBFoo[];

  @OneToOne(() => DBObjectives, {cascade: true, eager: true})
  @JoinColumn()
  objectives: DBObjectives;
  
  @Column("integer", { name: "teamId"})
  teamId: number;

  @Column("boolean", { name: "win"})
  win: boolean;

  //public static CreateFromApi(matchDTO: MatchDTO): DBTeam[] {
  public static CreateFromApi(teams: Team[]): DBTeam[] {  
    let dbTeams = new Array<DBTeam>();

    //matchDTO.info.teams.forEach(team => {
    teams.forEach(team => {
      let dbTeam = new DBTeam();
      dbTeam.bans = DBBan.CreateFromApi(team.bans);
      dbTeam.objectives = DBObjectives.CreateFromApi(team.objectives);
      dbTeam.teamId = team.teamId;
      dbTeam.win = team.win;

      dbTeams.push(dbTeam);
    })

    return dbTeams;
  }

  compareAgainstApi(apiTeam: any): boolean{
    //console.log("comparing Team...");
    return (this.teamId == apiTeam.teamId &&
      this.win == apiTeam.win &&
      this.bans.every((ban: DBBan, i: number) => ban.compareAgainstApi(apiTeam.bans[i])) &&
      this.objectives.compareAgainstApi(apiTeam.objectives)
    );
  }
}

@Entity({name: "info"})
export class DBInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("integer", { name: "gameCreation", unique: true })
  gameCreation: number;

  @Column("integer", { name: "gameDuration"})
  gameDuration: number;

  @Column("integer", { name: "gameId", unique: true })
  gameId: number;

  @Column("varchar", { name: "gameMode"})
  gameMode: string;

  @Column("varchar", { name: "gameName"})
  gameName: string;

  @Column("integer", { name: "gameStartTimestamp"})
  gameStartTimestamp: number;

  @Column("varchar", { name: "gameType"})
  gameType: string;

  @Column("varchar", { name: "gameVersion"})
  gameVersion: string;

  @Column("integer", { name: "mapId"})
  mapId: number;

  @OneToMany(() => DBParticipant, (participant) => participant.dummyFieldForManyToOne, {cascade: true, eager: true})
  participants: DBParticipant[];

  @Column("varchar", { name: "platformId"})
  platformId: string;

  @Column("integer", { name: "queueId"})
  queueId: number;

  // @OneToMany(() => DBTeam, "", {cascade: true})
  @OneToMany(() => DBTeam, (team) => team.dummyFieldForManyToOne, {cascade: true, eager: true})
  teams: DBTeam[];

  @Column("varchar", { name: "tournamentCode", nullable: true,})
  tournamentCode: string;

  public static CreateFromApi(info: Info): DBInfo{
    //let info = matchDTO.info;
    let dbInfo = new DBInfo();
    dbInfo.gameCreation = info.gameCreation;
    dbInfo.gameDuration = info.gameDuration;
    dbInfo.gameId = info.gameId;
    dbInfo.gameMode = info.gameMode;
    dbInfo.gameName = info.gameName;
    dbInfo.gameStartTimestamp = info.gameStartTimestamp;
    dbInfo.gameType = info.gameType;
    dbInfo.gameVersion = info.gameVersion;
    dbInfo.mapId = info.mapId;
    dbInfo.participants = DBParticipant.CreateFromApi(info.participants);
    dbInfo.platformId = info.platformId;
    dbInfo.queueId = info.queueId;
    dbInfo.teams = DBTeam.CreateFromApi(info.teams);
    dbInfo.tournamentCode = info.tournamentCode;

    return dbInfo;
  }

  compareAgainstApi(apiInfo: any): boolean{
    //console.log("comparing Info...");
    return (this.gameCreation == apiInfo.gameCreation &&
      this.gameDuration == apiInfo.gameDuration &&
      this.gameId == apiInfo.gameId &&
      this.gameMode == apiInfo.gameMode &&
      this.gameStartTimestamp == this.gameStartTimestamp &&
      this.participants.every((p: DBParticipant, i: number) => p.compareAgainstApi(apiInfo.participants[i])) &&
      this.teams.every((t: DBTeam, i: number) => t.compareAgainstApi(apiInfo.teams[i]))
    );
  }
}

type MetaData = Galeforce.dto.MatchDTO['metadata'];
type Info = Galeforce.dto.MatchDTO['info'];
type Participant = Galeforce.dto.MatchDTO['info']['participants'][0];
type Team = Galeforce.dto.MatchDTO['info']['teams'][0];
type Objectives = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives'];
type Baron = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives']['baron'];
type ChampionKills = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives']['champion'];
type Dragon = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives']['dragon'];
type Inhibitor = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives']['inhibitor'];
type RiftHerald = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives']['riftHerald'];
type Tower = Galeforce.dto.MatchDTO['info']['teams'][0]['objectives']['tower'];
type Ban = Galeforce.dto.MatchDTO['info']['teams'][0]['bans'][0];
type Perks = Galeforce.dto.MatchDTO['info']['participants'][0]['perks'];
type StatPerks = Galeforce.dto.MatchDTO['info']['participants'][0]['perks']['statPerks'];
type Style = Galeforce.dto.MatchDTO['info']['participants'][0]['perks']['styles'][0];
type Selection = Galeforce.dto.MatchDTO['info']['participants'][0]['perks']['styles'][0]['selections'][0];

@Entity({name: "match"})
export class DBMatch {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DBMetadata, {cascade: true, eager: true})
  @JoinColumn()
  metadata: DBMetadata;

  @OneToOne(() => DBInfo, {cascade: true, eager: true})
  @JoinColumn()
  info: DBInfo;

  public static CreateFromApi(matchDTO: MatchDTO): DBMatch{
    let dbMatch = new DBMatch();
    dbMatch.metadata = DBMetadata.CreateFromApi(matchDTO.metadata);
    dbMatch.info = DBInfo.CreateFromApi(matchDTO.info);

    return dbMatch;
  }

  compareAgainstApiMatch(apiMatch: MatchDTO): boolean {
    return (this.metadata.compareAgainstApi(apiMatch.metadata) &&
      this.info.compareAgainstApi(apiMatch.info))
  }
}