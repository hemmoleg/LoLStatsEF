import { Column, Entity, Index } from "typeorm";

@Index("staticChampion_id", ["id"], { unique: true })
@Index("staticChampion_name", ["name"], { unique: true })
@Entity("staticChampion")
export class StaticChampion {
  @Column("integer", { name: "id", nullable: true, unique: true })
  id: number | null;

  @Column("varchar", { name: "key", nullable: true })
  key: string | null;

  @Column("varchar", { name: "name", nullable: true, unique: true })
  name: string | null;

  @Column("varchar", { name: "title", nullable: true })
  title: string | null;

  @Column("text", { name: "icon", nullable: true })
  icon: string | null;
}
