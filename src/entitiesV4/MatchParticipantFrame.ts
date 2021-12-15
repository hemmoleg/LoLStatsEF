import { Column, Entity, Index } from "typeorm";

@Index(
  "matchParticipantFrameUnique",
  ["gameId", "participantId", "timestamp"],
  { unique: true }
)
@Entity("matchParticipantFrame")
export class MatchParticipantFrame {
  @Column("integer", { name: "GameId", nullable: true })
  gameId: number | null;

  @Column("integer", { name: "ParticipantId", nullable: true })
  participantId: number | null;

  @Column("integer", { name: "Timestamp", nullable: true })
  timestamp: number | null;

  @Column("integer", { name: "currentGold", nullable: true })
  currentGold: number | null;

  @Column("integer", { name: "jungleMinionsKilled", nullable: true })
  jungleMinionsKilled: number | null;

  @Column("integer", { name: "Level", nullable: true })
  level: number | null;

  @Column("integer", { name: "minionsKilled", nullable: true })
  minionsKilled: number | null;

  @Column("integer", { name: "PositionX", nullable: true })
  positionX: number | null;

  @Column("integer", { name: "PositionY", nullable: true })
  positionY: number | null;

  @Column("integer", { name: "teamScore", nullable: true })
  teamScore: number | null;

  @Column("integer", { name: "totalGold", nullable: true })
  totalGold: number | null;

  @Column("integer", { name: "xp", nullable: true })
  xp: number | null;
}
