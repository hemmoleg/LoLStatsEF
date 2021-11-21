import { Column, Entity, Index } from "typeorm";

@Index("participantUnique", ["gameId", "participantId"], { unique: true })
@Entity("participant")
export class Participant {
  @Column("integer", { name: "GameId", nullable: true })
  gameId: number | null;

  @Column("varchar", { name: "Region", nullable: true })
  region: string | null;

  @Column("integer", { name: "ParticipantId", nullable: true })
  participantId: number | null;

  @Column("integer", { name: "teamId", nullable: true })
  teamId: number | null;

  @Column("integer", { name: "championId", nullable: true })
  championId: number | null;

  @Column("integer", { name: "spell1Id", nullable: true })
  spell1Id: number | null;

  @Column("integer", { name: "spell2Id", nullable: true })
  spell2Id: number | null;

  @Column("varchar", { name: "name", nullable: true })
  name: string | null;

  @Column("varchar", { name: "championName", nullable: true })
  championName: string | null;

  @Column("integer", { name: "winner", nullable: true })
  winner: number | null;

  @Column("integer", { name: "champLevel", nullable: true })
  champLevel: number | null;

  @Column("integer", { name: "item2", nullable: true })
  item2: number | null;

  @Column("integer", { name: "item3", nullable: true })
  item3: number | null;

  @Column("integer", { name: "item0", nullable: true })
  item0: number | null;

  @Column("integer", { name: "item1", nullable: true })
  item1: number | null;

  @Column("integer", { name: "item6", nullable: true })
  item6: number | null;

  @Column("integer", { name: "item4", nullable: true })
  item4: number | null;

  @Column("integer", { name: "item5", nullable: true })
  item5: number | null;

  @Column("integer", { name: "kills", nullable: true })
  kills: number | null;

  @Column("integer", { name: "doubleKills", nullable: true })
  doubleKills: number | null;

  @Column("integer", { name: "tripleKills", nullable: true })
  tripleKills: number | null;

  @Column("integer", { name: "quadraKills", nullable: true })
  quadraKills: number | null;

  @Column("integer", { name: "pentaKills", nullable: true })
  pentaKills: number | null;

  @Column("integer", { name: "unrealKills", nullable: true })
  unrealKills: number | null;

  @Column("integer", { name: "largestKillingSpree", nullable: true })
  largestKillingSpree: number | null;

  @Column("integer", { name: "deaths", nullable: true })
  deaths: number | null;

  @Column("integer", { name: "assists", nullable: true })
  assists: number | null;

  @Column("integer", { name: "totalDamageDealt", nullable: true })
  totalDamageDealt: number | null;

  @Column("integer", { name: "totalDamageDealtToChampions", nullable: true })
  totalDamageDealtToChampions: number | null;

  @Column("integer", { name: "totalDamageTaken", nullable: true })
  totalDamageTaken: number | null;

  @Column("integer", { name: "largestCriticalStrike", nullable: true })
  largestCriticalStrike: number | null;

  @Column("integer", { name: "totalHeal", nullable: true })
  totalHeal: number | null;

  @Column("integer", { name: "minionsKilled", nullable: true })
  minionsKilled: number | null;

  @Column("integer", { name: "neutralMinionsKilled", nullable: true })
  neutralMinionsKilled: number | null;

  @Column("integer", { name: "neutralMinionsKilledTeamJungle", nullable: true })
  neutralMinionsKilledTeamJungle: number | null;

  @Column("integer", {
    name: "neutralMinionsKilledEnemyJungle",
    nullable: true,
  })
  neutralMinionsKilledEnemyJungle: number | null;

  @Column("integer", { name: "goldEarned", nullable: true })
  goldEarned: number | null;

  @Column("integer", { name: "goldSpent", nullable: true })
  goldSpent: number | null;

  @Column("integer", { name: "combatPlayerScore", nullable: true })
  combatPlayerScore: number | null;

  @Column("integer", { name: "objectivePlayerScore", nullable: true })
  objectivePlayerScore: number | null;

  @Column("integer", { name: "totalPlayerScore", nullable: true })
  totalPlayerScore: number | null;

  @Column("integer", { name: "totalScoreRank", nullable: true })
  totalScoreRank: number | null;

  @Column("integer", { name: "physicalDamageDealtToChampions", nullable: true })
  physicalDamageDealtToChampions: number | null;

  @Column("integer", { name: "magicDamageDealtToChampions", nullable: true })
  magicDamageDealtToChampions: number | null;

  @Column("integer", { name: "trueDamageDealtToChampions", nullable: true })
  trueDamageDealtToChampions: number | null;

  @Column("integer", { name: "visionWardsBoughtInGame", nullable: true })
  visionWardsBoughtInGame: number | null;

  @Column("integer", { name: "sightWardsBoughtInGame", nullable: true })
  sightWardsBoughtInGame: number | null;

  @Column("integer", { name: "magicDamageDealt", nullable: true })
  magicDamageDealt: number | null;

  @Column("integer", { name: "physicalDamageDealt", nullable: true })
  physicalDamageDealt: number | null;

  @Column("integer", { name: "trueDamageDealt", nullable: true })
  trueDamageDealt: number | null;

  @Column("integer", { name: "magicDamageTaken", nullable: true })
  magicDamageTaken: number | null;

  @Column("integer", { name: "physicalDamageTaken", nullable: true })
  physicalDamageTaken: number | null;

  @Column("integer", { name: "trueDamageTaken", nullable: true })
  trueDamageTaken: number | null;

  @Column("integer", { name: "firstBloodKill", nullable: true })
  firstBloodKill: number | null;

  @Column("integer", { name: "firstBloodAssist", nullable: true })
  firstBloodAssist: number | null;

  @Column("integer", { name: "firstTowerKill", nullable: true })
  firstTowerKill: number | null;

  @Column("integer", { name: "firstTowerAssist", nullable: true })
  firstTowerAssist: number | null;

  @Column("integer", { name: "firstInhibitorKill", nullable: true })
  firstInhibitorKill: number | null;

  @Column("integer", { name: "firstInhibitorAssist", nullable: true })
  firstInhibitorAssist: number | null;

  @Column("integer", { name: "inhibitorKills", nullable: true })
  inhibitorKills: number | null;

  @Column("integer", { name: "towerKills", nullable: true })
  towerKills: number | null;

  @Column("integer", { name: "wardsPlaced", nullable: true })
  wardsPlaced: number | null;

  @Column("integer", { name: "wardsKilled", nullable: true })
  wardsKilled: number | null;

  @Column("integer", { name: "largestMultiKill", nullable: true })
  largestMultiKill: number | null;

  @Column("integer", { name: "killingSprees", nullable: true })
  killingSprees: number | null;

  @Column("integer", { name: "totalUnitsHealed", nullable: true })
  totalUnitsHealed: number | null;

  @Column("integer", { name: "totalTimeCrowdControlDealt", nullable: true })
  totalTimeCrowdControlDealt: number | null;
}
