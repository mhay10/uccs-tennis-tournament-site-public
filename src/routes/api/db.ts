import Database from 'better-sqlite3';

export const db = new Database(`${process.cwd()}/db/tournament.db`, { verbose: console.log });
db.pragma('journal_mode = WAL');
