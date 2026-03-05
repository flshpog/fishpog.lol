import Dexie, { type EntityTable } from "dexie";
import type {
  NormalizedVillager,
  NormalizedFish,
  NormalizedBug,
  NormalizedSeaCreature,
  NormalizedFossil,
  NormalizedArt,
  NormalizedItem,
  NormalizedSong,
  NormalizedDIYRecipe,
  NormalizedEvent,
  NormalizedReaction,
  NormalizedFlower,
  NormalizedMysteryIsland,
  NormalizedNPCVisitor,
  DataMeta,
  TurnipWeekData,
} from "@/types/data";

class YourHorizonDB extends Dexie {
  // Data tables (populated from static JSON)
  villagers!: EntityTable<NormalizedVillager, "id">;
  fish!: EntityTable<NormalizedFish, "id">;
  bugs!: EntityTable<NormalizedBug, "id">;
  seaCreatures!: EntityTable<NormalizedSeaCreature, "id">;
  fossils!: EntityTable<NormalizedFossil, "id">;
  art!: EntityTable<NormalizedArt, "id">;
  songs!: EntityTable<NormalizedSong, "id">;
  items!: EntityTable<NormalizedItem, "id">;
  diyRecipes!: EntityTable<NormalizedDIYRecipe, "id">;
  events!: EntityTable<NormalizedEvent, "id">;
  reactions!: EntityTable<NormalizedReaction, "id">;
  flowers!: EntityTable<NormalizedFlower, "id">;
  mysteryIslands!: EntityTable<NormalizedMysteryIsland, "id">;
  npcVisitors!: EntityTable<NormalizedNPCVisitor, "id">;

  // User data tables
  userCollected!: EntityTable<
    { id: string; category: string; collectedAt: number },
    "id"
  >;
  userDonated!: EntityTable<
    { id: string; category: string; donatedAt: number },
    "id"
  >;
  userFavorites!: EntityTable<{ id: string; category: string }, "id">;
  userIslandVillagers!: EntityTable<
    { villagerId: string; addedAt: number },
    "villagerId"
  >;
  userVisitorLog!: EntityTable<
    { id: string; npcId: string; visitDate: string },
    "id"
  >;
  userTurnipWeek!: EntityTable<
    { weekId: string; data: TurnipWeekData },
    "weekId"
  >;
  userIslandDesigns!: EntityTable<
    { id: string; name: string; grid: unknown; updatedAt: number },
    "id"
  >;

  // System tables
  meta!: EntityTable<DataMeta, "category">;
  kvStore!: EntityTable<{ key: string; value: string }, "key">;

  constructor() {
    super("YourHorizonDB");

    this.version(1).stores({
      villagers: "id, name, species, personality, hobby, gender",
      fish: "id, name, location, rarity",
      bugs: "id, name, location, rarity",
      seaCreatures: "id, name, speed, rarity",
      fossils: "id, name, partOf",
      art: "id, name, hasFake",
      songs: "id, name",
      houseware: "id, name, category, source",
      wallmounted: "id, name, category, source",
      misc: "id, name, category, source",
      diyRecipes: "id, name, category",
      events: "id, name",
      reactions: "id, name, source",
      flowers: "id, name, type",
      mysteryIslands: "id, name",
      npcVisitors: "id, name",
      userCollected: "id, category",
      userDonated: "id, category",
      userFavorites: "id, category",
      userIslandVillagers: "villagerId",
      userVisitorLog: "id, npcId, visitDate",
      userTurnipWeek: "weekId",
      userIslandDesigns: "id, updatedAt",
      meta: "category",
      kvStore: "key",
    });

    // v2: Replace houseware/wallmounted/misc with single items table
    this.version(2).stores({
      houseware: null,
      wallmounted: null,
      misc: null,
      items: "id, name, category, source",
    });
  }
}

export const db = new YourHorizonDB();
