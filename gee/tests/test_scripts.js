// Offline behavioral checks for the independent Earth Engine entry-point scripts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function run(name, context) {
  const filename = path.join(__dirname, '..', name);
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
}

{
  const exports = [];
  const context = {
    ee: { FeatureCollection: () => ({filter: () => ({})}), Filter: {eq: () => ({})}},
    require: () => ({methods: {googleDriveExport: (...args) => exports.push(args)}})
  };
  run('export_pre_interpolation.js', context);
  assert.equal(exports.length, 56);
  assert.equal(exports.filter(e => e[2] === 'ALL' && e[3] === '2020').length, 4);
  assert.equal(exports.filter(e => e[2] === 'ALL' && e[3] === '2023').length, 4);
  assert.equal(exports.filter(e => e[2] !== 'ALL' && e[3] === '2023').length, 48);
}

{
  const calls = [];
  const context = {
    print: () => {},
    require: () => ({methods: {exportDifferenceTIFF: (...args) => calls.push(args)}})
  };
  run('results/comparison_2020_2023.js', context);
  assert.equal(calls.length, 4);
  for (const args of calls) {
    assert.match(args[0], /^projects\/YOUR_PROJECT_ID\/assets\/interpolated_data\//);
    assert.match(args[0], /\/2020\//);
    assert.match(args[1], /\/2023\//);
    assert.match(args[2], /_difference_2020_2023$/);
  }
}

{
  const calls = [];
  const charts = [];
  const context = {
    require: () => ({methods: {
      meanAllValuesTIFF: name => {calls.push(name); return name;},
      exportLineGraph: (values, unit) => charts.push({values, unit})
    }})
  };
  run('results/export_graphs_months_2023.js', context);
  assert.equal(charts.length, 4);
  assert.equal(calls.length, 47);
  assert.ok(calls.every(id => id.startsWith('projects/YOUR_PROJECT_ID/assets/interpolated_data/JANUARY_DECEMBER_2023/')));
  assert.equal(charts[3].values.length, 12);
  assert.equal(charts[3].values[11], null);
}

{
  const calls = [];
  const context = {
    print: () => {},
    require: () => ({methods: {valueUTM: (...args) => calls.push(args)}})
  };
  run('results/comparison_ARPA.js', context);
  assert.equal(calls.length, 11);
  assert.ok(calls.every(([id]) => id.startsWith('projects/YOUR_PROJECT_ID/assets/interpolated_data/2023/')));
  assert.deepEqual(calls[0].slice(1), [690889, 4488018]);
  assert.deepEqual(calls[calls.length-1].slice(1), [679111, 4495815]);
}

{
  const calls = [];
  const context = {
    ee: {Geometry: {Polygon: data => ({ data })}},
    print: () => {},
    require: () => ({methods: {meanAllValuesGeometryTIFF: (...args) => calls.push(args)}})
  };
  run('results/taranto_neighboring_cities.js', context);
  assert.equal(calls.length, 12);
}


{
  // The covariate-export entry point should create three tasks without a private asset dependency.
  const exports = [];
  const dateFilters = [];
  const projection = {nominalScale: () => ({getInfo: () => 1000})};
  const image = {
    projection: () => projection,
    reproject: () => image,
    select: () => image
  };
  const collection = {
    filterBounds: () => collection,
    filterDate: (...args) => {dateFilters.push(args); return collection;},
    first: () => image,
    reduce: () => image
  };
  const province = {filter: () => ({geometry: () => ({bounds: () => 'region'})})};
  const context = {
    ee: {
      FeatureCollection: () => province,
      ImageCollection: () => collection,
      Filter: {eq: () => ({})},
      Reducer: {mean: () => ({})}
    },
    Export: {image: {toDrive: args => exports.push(args)}}
  };
  run('export_RFsp_co_variables.js', context);
  assert.deepEqual(exports.map(e => e.description), [
    'DEM_mean_ALL_2023', 'GPM_mean_ALL_2023', 'MOD11A1_061_mean_ALL_2023'
  ]);
  assert.equal(dateFilters.length, 2);
  assert.ok(exports.every(e => e.region === 'region' && e.crs === 'EPSG:4326'));
}

console.log('6 Earth Engine script behavior checks passed (including asset-ID mappings)');
