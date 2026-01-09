import Database from "@tauri-apps/plugin-sql";

class DatabaseManager {
  private static dbPromise: Promise<Database> | null = null;

  private constructor() {}

  public static async getDb(): Promise<Database> {
    if (!DatabaseManager.dbPromise) {
      DatabaseManager.dbPromise = Database.load("sqlite:default.db");
      // 迁移
      // DatabaseManager.dbPromise = DatabaseManager.dbPromise.then(async (db) => {
      //   await migrate(db);
      //   return db;
      // });
    }
    return DatabaseManager.dbPromise;
  }

  public static async close() {
    if (!DatabaseManager.dbPromise) return;
    await (await DatabaseManager.dbPromise).close?.();
    DatabaseManager.dbPromise = null;
  }
}

export default DatabaseManager.getDb;
export { DatabaseManager };
