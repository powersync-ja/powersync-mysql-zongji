const events = require('./binlog_event');
const rowsEvents = require('./rows_event');

// Mirrors the Binlog Event Type enum from here: https://dev.mysql.com/doc/dev/mysql-server/9.3.0/binlog__event_8h_source.html
const CodeEvent = [
  'UNKNOWN_EVENT', // 0
  'START_EVENT_V3', // 1
  'QUERY_EVENT', // 2
  'STOP_EVENT', // 3
  'ROTATE_EVENT', // 4
  'INTVAR_EVENT', // 5
  'LOAD_EVENT', // 6
  'SLAVE_EVENT', // 7
  'CREATE_FILE_EVENT', // 8
  'APPEND_BLOCK_EVENT', // 9
  'EXEC_LOAD_EVENT', // 10
  'DELETE_FILE_EVENT', // 11
  'NEW_LOAD_EVENT', // 12
  'RAND_EVENT', // 13
  'USER_VAR_EVENT', // 14
  'FORMAT_DESCRIPTION_EVENT', // 15
  'XID_EVENT', // 16
  'BEGIN_LOAD_QUERY_EVENT', // 17
  'EXECUTE_LOAD_QUERY_EVENT', // 18
  'TABLE_MAP_EVENT', // 19
  'PRE_GA_DELETE_ROWS_EVENT', // 20
  'PRE_GA_UPDATE_ROWS_EVENT', // 21
  'PRE_GA_WRITE_ROWS_EVENT', // 22
  'WRITE_ROWS_EVENT_V1', // 23
  'UPDATE_ROWS_EVENT_V1', // 24
  'DELETE_ROWS_EVENT_V1', // 25
  'INCIDENT_EVENT', // 26
  'HEARTBEAT_LOG_EVENT', // 27
  'IGNORABLE_LOG_EVENT', // 28
  'ROWS_QUERY_LOG_EVENT', // 29
  'WRITE_ROWS_EVENT_V2', // 30
  'UPDATE_ROWS_EVENT_V2', // 31
  'DELETE_ROWS_EVENT_V2', // 32
  'GTID_LOG_EVENT', // 33
  'ANONYMOUS_GTID_LOG_EVENT', // 34
  'PREVIOUS_GTIDS_LOG_EVENT', // 35
  'TRANSACTION_CONTEXT_EVENT', // 36
  'VIEW_CHANGE_EVENT', // 37
  'XA_PREPARE_LOG_EVENT', // 38
  'PARTIAL_UPDATE_ROWS_EVENT', // 39
  'TRANSACTION_PAYLOAD_EVENT', // 40
  'HEARTBEAT_LOG_EVENT_V2', // 41
  'GTID_TAGGED_LOG_EVENT' // 42
];

const EventClass = {
  UNKNOWN_EVENT: events.Unknown,
  QUERY_EVENT: events.Query,
  INTVAR_EVENT: events.IntVar,
  ROTATE_EVENT: events.Rotate,
  FORMAT_DESCRIPTION_EVENT: events.Format,
  XID_EVENT: events.Xid,
  GTID_LOG_EVENT: events.GtidLog,
  HEARTBEAT_LOG_EVENT: events.Heartbeat,
  HEARTBEAT_LOG_EVENT_V2: events.Heartbeat_V2,

  TABLE_MAP_EVENT: events.TableMap,
  DELETE_ROWS_EVENT_V1: rowsEvents.DeleteRows,
  UPDATE_ROWS_EVENT_V1: rowsEvents.UpdateRows,
  WRITE_ROWS_EVENT_V1: rowsEvents.WriteRows,
  WRITE_ROWS_EVENT_V2: rowsEvents.WriteRows,
  UPDATE_ROWS_EVENT_V2: rowsEvents.UpdateRows,
  DELETE_ROWS_EVENT_V2: rowsEvents.DeleteRows
};

exports.getEventClass = function (code) {
  return EventClass[CodeEvent[code]] || events.Unknown;
};
