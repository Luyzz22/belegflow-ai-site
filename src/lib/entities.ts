// Mandanten/Entities (Client-Side, localStorage). MVP: nur UI-Verwaltung.

export interface Entity {
  id: string;
  name: string;
}

const LIST_KEY = "flowcheck_entities";
const ACTIVE_KEY = "flowcheck_active_entity";

export const DEFAULT_ENTITIES: Entity[] = [
  { id: "sbs-de", name: "SBS Deutschland GmbH & Co. KG" },
  { id: "sbs-digital", name: "SBS Digital Solutions GmbH" },
];

export function getEntities(): Entity[] {
  if (typeof window === "undefined") return DEFAULT_ENTITIES;
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as Entity[]) : DEFAULT_ENTITIES;
  } catch {
    return DEFAULT_ENTITIES;
  }
}

export function getActiveEntityId(): string {
  if (typeof window === "undefined") return DEFAULT_ENTITIES[0].id;
  return localStorage.getItem(ACTIVE_KEY) || getEntities()[0]?.id || DEFAULT_ENTITIES[0].id;
}

export function setActiveEntityId(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(ACTIVE_KEY, id);
}

export function addEntity(name: string): Entity {
  const list = getEntities();
  const entity: Entity = { id: `e-${Date.now()}`, name: name.trim() };
  if (typeof window !== "undefined") localStorage.setItem(LIST_KEY, JSON.stringify([...list, entity]));
  return entity;
}
