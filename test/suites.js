const tap = require('tap');

// This is a workaround to force the test suites to run sequentially
// Since the suites run off the same test database they do interfere with each other when running in parallel

tap.test('Errors', (t) => {
  require(`./errors`);
  t.end();
});

tap.test('Events', (t) => {
  require(`./events`);
  t.end();
});

tap.test('Filtering', (t) => {
  require(`./filtering`);
  t.end();
});

tap.test('RowImage', (t) => {
  require(`./rowImage`);
  t.end();
});

tap.test('Types', (t) => {
  require(`./types`);
  t.end();
});
