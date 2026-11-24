// Offline JavaScript unit tests; no Earth Engine account is required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const filename = path.join(__dirname, '../dependencies/utils.js');
const context = {exports: {}};
vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, {filename});
const {dateWindow} = context.exports.methods;

for (const [period, year, start, end] of [
  ['JANUARY', '2023', '2023-01-01', '2023-02-01'],
  ['FEBRUARY', '2024', '2024-02-01', '2024-03-01'],
  ['DECEMBER', '2023', '2023-12-01', '2024-01-01'],
  ['ALL', '2020', '2020-01-01', '2021-01-01'],
]) {
  const dates = dateWindow(period, year);
  assert.equal(dates.startDate, start);
  assert.equal(dates.endDate, end);
}
assert.throws(() => dateWindow('FAKE', 2023), /Invalid month period/);
assert.throws(() => dateWindow('ALL', 'bad'), /Invalid year/);
console.log('6 Earth Engine date-window checks passed');
