import { Column, Entity } from "typeorm";

@Entity("staticItem")
export class StaticItem {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @Column("varchar", { name: "from", nullable: true })
  from: string | null;

  @Column("varchar", { name: "description", nullable: true })
  description: string | null;

  @Column("integer", { name: "totalCost", nullable: true })
  totalCost: number | null;

  @Column("varchar", { name: "plainText", nullable: true })
  plainText: string | null;

  @Column("varchar", { name: "imageFull", nullable: true })
  imageFull: string | null;

  @Column("varchar", { name: "imageSprite", nullable: true })
  imageSprite: string | null;

  @Column("varchar", { name: "name", nullable: true })
  name: string | null;
}
