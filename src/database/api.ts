import DB from "@/database/manager";
import type { BoardData, BoardRow, BoardType, Direction, DocV1, Preferences, Theme } from "@/types";

export async function init() {
  const db = await DB();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      type TEXT NOT NULL,
      position INTEGER,
      doc JSON NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_card_title
    ON boards (json_extract(doc, '$.title'))
    WHERE type = 'card';
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL CHECK (
        theme IN ('system', 'latte', 'mocha', 'frappe', 'macchiato')
      ),
      opened_board_id TEXT
    );
  `);

  await initPreferences();
}

export async function initPreferences() {
  const db = await DB();
  await db.execute(`
    INSERT OR IGNORE INTO preferences (id, theme)
    VALUES (1, 'mocha');
  `);
}

export async function getPreferences(): Promise<Preferences> {
  const db = await DB();
  const result = (await db.select(`SELECT * FROM preferences WHERE id = 1`)) as { theme: Theme; opened_board_id: string }[];
  return result[0]!;
}

export async function setPreferences(preferences: Preferences) {
  const db = await DB();
  await db.execute(`UPDATE preferences SET
    ${preferences.theme !== undefined ? `theme = '${preferences.theme}'` : ""}
    ${preferences.opened_board_id !== undefined ? `opened_board_id = '${preferences.opened_board_id}'` : ""}
    WHERE id = 1`);
}

export async function insert(
  type: BoardType,
  data: {
    parentId?: string;
    position?: number;
    doc: Record<string, any>;
  },
) {
  const db = await DB();
  const id = crypto.randomUUID();
  const position = type === "board" ? await getBoardCount() : data.parentId && (await getItemCount(data.parentId));
  await db.execute(`INSERT INTO boards (id, type, parent_id, position, doc) VALUES (?, ?, ?, ?, ?)`, [id, type, data.parentId ?? null, data.position ?? position, JSON.stringify(data.doc)]);
  return id;
}

export async function updateById(id: string, data: { parent_id?: string; position?: number; doc?: Record<string, any> }) {
  const db = await DB();
  await db.execute(
    `UPDATE boards SET 
      ${data.parent_id !== undefined ? `parent_id = '${data.parent_id}'` : ""}
      ${data.position !== undefined ? `position = ${data.position}` : ""}
      ${data.doc !== undefined ? `doc = '${JSON.stringify(data.doc)}'` : ""}
    WHERE id = '${id}'`,
  );
}

export async function removeById(id: string) {
  const db = await DB();
  await db.execute(
    `
    WITH RECURSIVE
    target AS (
      SELECT id, parent_id, position AS deleted_pos
      FROM boards
      WHERE id = ?
    ),
    subtree AS (
      SELECT id FROM boards WHERE id = (SELECT id FROM target)
      UNION ALL
      SELECT b.id
      FROM boards b
      JOIN subtree s ON b.parent_id = s.id
    )
    DELETE FROM boards
    WHERE id IN (SELECT id FROM subtree);

    WITH RECURSIVE
    target AS (
      SELECT id, parent_id, position AS deleted_pos
      FROM boards
      WHERE id = ?
    )
    UPDATE boards

    SET
    position = position - 1,
    updated_at = CURRENT_TIMESTAMP

    WHERE
    position > (SELECT deleted_pos FROM target)
    AND (
      parent_id IS (SELECT parent_id FROM target)
      OR (parent_id IS NULL AND (SELECT parent_id FROM target) IS NULL)
    )`,
    [id, id],
  );
}

export async function removeByParentId(parentId: string) {
  const db = await DB();
  await db.execute(`DELETE FROM boards WHERE parent_id = ?`, [parentId]);
}

export async function getListByType(type: BoardType) {
  const db = await DB();
  return rowsToBoards(await db.select(`SELECT * FROM boards WHERE type = ? ORDER BY position ASC`, [type]));
}

export async function getListByParentId(id: string) {
  const db = await DB();
  return rowsToBoards(await db.select(`SELECT * FROM boards WHERE parent_id = ? ORDER BY position ASC`, [id]));
}

export async function getNeighborByParentId(parent_id: string, position: number, direction: Direction) {
  const db = await DB();
  return direction === "prev"
    ? (rowsToBoards(await db.select(`SELECT * FROM boards WHERE parent_id = ? AND position = ?`, [parent_id, position - 1]))[0] as BoardData)
    : (rowsToBoards(await db.select(`SELECT * FROM boards WHERE parent_id = ? AND position = ?`, [parent_id, position + 1]))[0] as BoardData);
}

export async function getBoardCount(): Promise<number> {
  const db = await DB();
  const result = (await db.select(`SELECT COUNT(*) as count FROM boards WHERE type = 'board'`)) as {
    count: number;
  }[];
  return result[0]?.count!;
}

export async function getItemCount(id: string): Promise<number> {
  const db = await DB();
  const result = (await db.select(`SELECT COUNT(*) as count FROM boards WHERE parent_id = ?`, [id])) as { count: number }[];
  return result[0]?.count!;
}

export async function getInfo(id: string): Promise<BoardData> {
  const db = await DB();
  return rowsToBoards(await db.select(`SELECT * FROM boards WHERE id = ?`, [id]))[0] as BoardData;
}

function rowsToBoards(rows: BoardRow[]): BoardData[] {
  return rows.map(row => ({ ...row, doc: JSON.parse(row.doc) as DocV1 }));
}
