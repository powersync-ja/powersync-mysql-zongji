const tap = require('tap');
const ZongJi = require('../');
const expectEvents = require('./helpers/expectEvents');
const testDb = require('./helpers');
const settings = require('./settings/mysql');
const assert = require('node:assert');

// @param {string} name - unique identifier of this test [a-zA-Z0-9]
// @param {[string]} fields - MySQL field description e.g. `BIGINT NULL`
// @param {[[any]]} testRows - 2D array of rows and fields to insert and test
// @param {func} customTest - optional, instead of exact row check
function defineTypeTest(name, fields, testRows, customTest) {
  const TEST_TABLE = 'type_' + name;
  const fieldText = fields.map((field, index) => `col${index} ${field}`).join(',');
  const insertColumns = fields.map((field, index) => 'col' + index).join(',');
  const testQueries = [`CREATE TABLE ${TEST_TABLE} (${fieldText})`]
    .concat(
      testRows.map(
        (row) => `INSERT INTO ${TEST_TABLE}
        (${insertColumns}) VALUES
        (${row.map((field) => (field === null ? 'null' : field)).join(',')})`
      )
    )
    .concat(['SET @@session.time_zone = "+00:00"', `SELECT * FROM ${TEST_TABLE}`]);

  tap.test('Initialise testing db', (test) => {
    testDb.init((err) => {
      if (err) {
        return test.fail(err);
      }

      test.end();
    });
  });

  tap.test(name, (test) => {
    const eventLog = [];
    const errorLog = [];

    const zongji = new ZongJi(settings.connection);
    test.teardown(() => zongji.stop());

    zongji.start({
      includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows'],
      serverId: testDb.serverId()
    });
    zongji.on('binlog', (event) => {
      // Ignore TableMap events for types test
      if (event.getTypeName() !== 'TableMap') {
        eventLog.push(event);
      }
    });
    zongji.on('error', (error) => errorLog.push(error));
    zongji.on('ready', () => {
      testDb.execute(testQueries, (error, results) => {
        if (error) {
          return test.fail(error);
        }
        const selectResult = results[results.length - 1].map((result) => ({
          ...result
        }));
        const expectedWrite = {
          _type: 'WriteRows',
          _checkTableMap: (test, event) => {
            const tableDetails = event.tableMap[event.tableId];
            test.same(tableDetails.parentSchema, testDb.SCHEMA_NAME);
            test.same(tableDetails.tableName, TEST_TABLE);
          }
        };

        expectEvents(test, eventLog, [expectedWrite], testRows.length, () => {
          test.equal(errorLog.length, 0);

          const binlogRows = eventLog.reduce((prev, curr) => {
            if (curr.getTypeName() === 'WriteRows') {
              prev = prev.concat(curr.rows);
            }
            return prev;
          }, []);

          if (customTest) {
            customTest.bind(selectResult)(test, { rows: binlogRows });
          } else {
            assert.deepEqual(selectResult, binlogRows);
          }

          test.end();
        });
      });
    });
  });
}

// Begin test case definitions

defineTypeTest(
  'set',
  [
    'SET(' +
      "'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', " +
      "'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', " +
      "'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'i2', 'j2', 'k2', " +
      "'l2', 'm2', 'n2', 'o2', 'p2', 'q2', 'r2', 's2', 't2', 'u2', 'v2', " +
      "'w2', 'x2', 'y2', 'z2')",
    "SET('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm')"
  ],
  [
    ["'a,d'", "'a,d'"],
    ["'d,a,b'", "'d,a,b'"],
    ["'a,d,i,z2'", "'a,d,i,k,l,m,c'"],
    ["'a,j,d'", "'a,j,d'"],
    ["'d,a,p'", "'d,a,m'"],
    ["''", "''"],
    [null, null]
  ]
);

defineTypeTest(
  'bit',
  ['BIT(64) NULL', 'BIT(32) NULL'],
  [
    ["b'111'", "b'111'"],
    ["b'100000'", "b'100000'"],
    [
      // 64th position
      "b'1000000000000000000000000000000000000000000000000000000000000000'",
      // 32nd position
      "b'10000000000000000000000000000000'"
    ],
    [null, null]
  ]
);

defineTypeTest(
  'enum',
  [
    'ENUM(' +
      "'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', " +
      "'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', " +
      "'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'i2', 'j2', 'k2', " +
      "'l2', 'm2', 'n2', 'o2', 'p2', 'q2', 'r2', 's2', 't2', 'u2', 'v2', " +
      "'w2', 'x2', 'y2', 'z2')",
    "ENUM('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm')"
  ],
  [
    ["'a'", "'b'"],
    ["'z2'", "'l'"],
    [null, null]
  ]
);

defineTypeTest(
  'int_signed',
  ['INT SIGNED NULL', 'BIGINT SIGNED NULL', 'TINYINT SIGNED NULL', 'SMALLINT SIGNED NULL', 'MEDIUMINT SIGNED NULL'],
  [
    [2147483647, 9007199254740992, 127, 32767, 8388607],
    [-2147483648, -9007199254740992, -128, -32768, -8388608],
    [-2147483645, -9007199254740990, -126, -32766, -8388606],
    [-1, -1, -1, -1, -1],
    [123456, 100, 96, 300, 1000],
    [-123456, -100, -96, -300, -1000]
  ]
);

defineTypeTest(
  'int_unsigned',
  [
    'INT UNSIGNED NULL',
    'BIGINT UNSIGNED NULL',
    'TINYINT UNSIGNED NULL',
    'SMALLINT UNSIGNED NULL',
    'MEDIUMINT UNSIGNED NULL'
  ],
  [
    [4294967295, 9007199254740992, 255, 65535, 16777215],
    [1, 1, 1, 1, 1],
    [1, 8589934591, 1, 1, 1],
    [123456, 100, 96, 300, 1000]
  ]
);

defineTypeTest(
  'double',
  ['DOUBLE NULL'],
  [[0], [1.0], [-1.0], [123.456], [-13.47], [0.00005], [-0.00005], [8589934592.123], [-8589934592.123], [null]]
);

defineTypeTest('float', ['FLOAT NULL'], [[0], [1.0], [-1.0], [123.456], [-13.47], [3999.12]], function (test, event) {
  // Ensure sum of differences is very low
  const diff = event.rows.reduce(
    function (prev, cur, index) {
      return prev + Math.abs(cur.col0 - this[index].col0);
    }.bind(this),
    0
  );
  test.ok(diff < 0.001);
});

defineTypeTest(
  'decimal',
  ['DECIMAL(30, 10) NULL', 'DECIMAL(30, 20) NULL'],
  [
    [1.0],
    [-1.0],
    [123.456],
    [-13.47],
    [123456789.123],
    [-123456789.123],
    [null],
    [1447410019.012],
    [123.00000123],
    [0.0004321]
  ].map(function (x) {
    return [x[0], x[0]];
  })
);

defineTypeTest(
  'blob',
  ['BLOB NULL', 'TINYBLOB NULL', 'MEDIUMBLOB NULL', 'LONGBLOB NULL'],
  [
    ["'something here'", "'tiny'", "'medium'", "'long'"],
    ["'nothing there'", "'small'", "'average'", "'huge'"],
    [null, null, null, null]
  ]
);

defineTypeTest(
  'geometry',
  ['GEOMETRY'],
  [["ST_GeomFromText('POINT(1 1)')"], ["ST_GeomFromText('POLYGON((0 0,10 0,10 10,0 10,0 0),(5 5,7 5,7 7,5 7, 5 5))')"]]
);

defineTypeTest(
  'time_no_fraction',
  ['TIME NULL'],
  [
    ["'-00:00:01'"],
    ["'00:00:00'"],
    ["'00:07:00'"],
    ["'20:00:00'"],
    ["'19:00:00'"],
    ["'04:00:00'"],
    ["'-838:59:59'"],
    ["'838:59:59'"],
    ["'01:07:08'"],
    ["'01:27:28'"],
    ["'-01:07:08'"],
    ["'-01:27:28'"]
  ]
);

defineTypeTest(
  'time_fraction',
  ['TIME(3) NULL', 'DATETIME(6) NULL', 'TIMESTAMP(2) NULL'],
  [["'17:51:04.777'", "'2018-09-08 17:51:04.777'", "'2018-09-08 17:51:04.777'"]],
  function (_, event) {
    assert.deepEqual(event.rows, [
      {
        col0: '17:51:04.777',
        col1: '2018-09-08 17:51:04.777000',
        col2: '2018-09-08 17:51:04.78'
      }
    ]);
  }
);

defineTypeTest(
  'datetime_no_fraction',
  ['DATETIME NULL'],
  [["'1000-01-01 00:00:00'"], ["'9999-12-31 23:59:59'"], ["'2014-12-27 01:07:08'"]]
);

defineTypeTest(
  'temporal_other',
  ['DATE NULL', 'TIMESTAMP NULL', 'YEAR NULL'],
  [
    ["'1000-01-01'", "'1970-01-01 00:00:01'", 1901],
    ["'9999-12-31'", "'2038-01-18 03:14:07'", 2155],
    ["'2014-12-27'", "'2014-12-27 01:07:08'", 2014]
  ]
);

defineTypeTest(
  'string',
  ['VARCHAR(250) NULL', 'CHAR(20) NULL', 'BINARY(3) NULL', 'VARBINARY(10) NULL'],
  [
    ["'something here'", "'tiny'", "'a'", "'binary'"],
    ["'nothing there'", "'small'", "'b'", "'test123'"],
    [null, null, null, null]
  ]
);

defineTypeTest(
  'text',
  ['TINYTEXT NULL', 'MEDIUMTEXT NULL', 'LONGTEXT NULL', 'TEXT NULL'],
  [
    ["'something here'", "'tiny'", "'a'", "'binary'"],
    ["'nothing there'", "'small'", "'b'", "'test123'"],
    [null, null, null, null]
  ]
);
