import { Socket } from 'net';

/**
 *  The types described here were added on an adhoc basis based on requirements in the Powersync Service.
 *  They are not complete.
 */

/**
 *  Connection options for the MySQL connection that Zongji will use. For a complete list and description see:
 *  https://www.npmjs.com/package/@vlasky/mysql#connection-options
 */
export type ZongjiOptions = {
  host: string;
  port?: number;
  user: string;
  password: string;
  dateStrings?: boolean;
  timeZone?: string;
};

/**
 *  Record specifying a database and specific tables. ie. ['MyDatabase']: ['table1', 'table2']
 *  Alternatively specifying true will include all tables in the database.
 */
interface DatabaseFilter {
  [databaseName: string]: string[] | true;
}

export type StartOptions = {
  /**
   *  List specifying which binlog events to listen for. When not specified, all events are included.
   */
  includeEvents?: string[];
  excludeEvents?: string[];
  /**
   *  Describe which databases and tables to include (Only for row events). Use database names as the key and pass an array of table names or true (for the entire database).
   *  Example: { 'my_database': ['allow_table', 'another_table'], 'another_db': true }
   */
  includeSchema?: DatabaseFilter;
  /**
   *  Object describing which databases and tables to exclude (Same format as includeSchema)
   *  Example: { 'other_db': ['disallowed_table'], 'ex_db': true }
   */
  excludeSchema?: DatabaseFilter;
  /**
   * BinLog position filename to start reading events from
   */
  filename?: string;
  /**
   * BinLog position offset to start reading events from in file specified
   */
  position?: number;

  /**
   *  Unique server ID for this replication client.
   */
  serverId?: number;
};

export type ColumnSchema = {
  COLUMN_NAME: string;
  COLLATION_NAME: string;
  CHARACTER_SET_NAME: string;
  COLUMN_COMMENT: string;
  COLUMN_TYPE: string;
};

export type ColumnDefinition = {
  name: string;
  charset: string;
  /**
   *  MySQl column type constant. For a list of type mappings see:
   *  https://github.com/mysqljs/mysql/blob/master/lib/protocol/constants/types.js
   */
  type: number;
  metadata: Record<string, any>;
};

export type TableMapEntry = {
  columnSchemas: ColumnSchema[];
  parentSchema: string;
  tableName: string;
  columns: ColumnDefinition[];
};

export type BaseBinLogEvent = {
  timestamp: number;
  getEventName(): string;

  /**
   * Next position in BinLog file to read from after this event.
   */
  nextPosition: number;
  /**
   * Size in bytes of this event
   */
  size: number;
  /**
   *  Identifier for table that this event relates to. This value can change between server restarts and can be reused, so it is not a reliable identifier.
   *  Also, changes when a table schema has been altered.
   */
  tableId: number;
  flags: number;
  useChecksum: boolean;
};

export type BinLogRotationEvent = BaseBinLogEvent & {
  binlogName: string;
  position: number;
};

export type BinLogGTIDLogEvent = BaseBinLogEvent & {
  serverId: Buffer;
  transactionRange: number;
};

export type BinLogXidEvent = BaseBinLogEvent & {
  xid: number;
};

export type BinLogRowEvent = BaseBinLogEvent & {
  /**
   *  The number of columns affected by this row event
   */
  numberOfColumns: number;
  /**
   *  TableMap describing the current schema. Format:
   *  [TableId]: TableMapEntry
   */
  tableMap: Record<number, TableMapEntry>;
  rows: Record<string, any>[];
};

export type BinLogRowUpdateEvent = Omit<BinLogRowEvent, 'rows'> & {
  rows: {
    before: Record<string, any>;
    after: Record<string, any>;
  }[];
};

export type BinLogTableMapEvent = BaseBinLogEvent & {
  /**
   *  TableMap describing the current schema. Format:
   *  [TableId]: TableMapEntry
   */
  tableMap: Record<number, TableMapEntry>;
  schemaName: string;
  tableName: string;
  columnCount: number;
  /**
   *  Column types for this table. This is a list of MySQL column type ids
   */
  columnTypes: number[];
};

export type BinLogQueryEvent = BaseBinLogEvent & {
  query: string;
  executionTime: number;
  errorCode: number;
  schema: string;
  statusVars: string;
};

export type BinLogEvent =
  | BinLogRotationEvent
  | BinLogGTIDLogEvent
  | BinLogXidEvent
  | BinLogRowEvent
  | BinLogRowUpdateEvent
  | BinLogTableMapEvent
  | BinLogQueryEvent;

// @vlasky/mysql Connection
export interface MySQLConnection {
  _socket?: Socket;
  /** There are other forms of this method as well - this is the most basic one. */
  query(sql: string, callback: (error: any, results: any, fields: any) => void): void;
}

export declare class ZongJi {
  stopped: boolean;
  connection: MySQLConnection;
  constructor(options: ZongjiOptions);

  start(options: StartOptions): void;
  stop(): void;
  pause(): void;
  resume(): void;

  on(type: 'binlog' | string, callback: (event: BinLogEvent) => void): void;
}
