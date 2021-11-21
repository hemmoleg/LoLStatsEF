import { Column, Entity, Index } from "typeorm";

@Index("remakes_gameId", ["gameId"], { unique: true })
@Entity("remakes")
export class Remakes {
  @Column("integer", { name: "gameId", nullable: true, unique: true })
  gameId: number | null;

  @Column("varchar", { name: "region", nullable: true })
  region: string | null;

  @Column("integer", { name: "creation", nullable: true })
  creation: number | null;

  @Column("varchar", { name: "queueType", nullable: true })
  queueType: string | null;

  @Column("varchar", { name: "season", nullable: true })
  season: string | null;

  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("integer", { name: "duration", nullable: true })
  duration: number | null;

  @Column("integer", { name: "mapId", nullable: true })
  mapId: number | null;

  @Column("varchar", { name: "version", nullable: true })
  version: string | null;

  @Column("integer", { name: "userIndex", nullable: true })
  userIndex: number | null;

  @Column("integer", { name: "winningTeam", nullable: true })
  winningTeam: number | null;

  @Column("integer", { name: "outcome", nullable: true })
  outcome: number | null;

  @Column("varchar", { name: "team1Bans", nullable: true })
  team1Bans: string | null;

  @Column("varchar", { name: "team2Bans", nullable: true })
  team2Bans: string | null;

  @Column("varchar", { name: "title", nullable: true })
  title: string | null;

  @Column("integer", { name: "uploaded", nullable: true })
  uploaded: number | null;

  @Column("varchar", { name: "replayName", nullable: true })
  replayName: string | null;

  @Column("integer", { name: "partial", nullable: true })
  partial: number | null;

  @Column("varchar", { name: "grade", nullable: true })
  grade: string | null;
}
