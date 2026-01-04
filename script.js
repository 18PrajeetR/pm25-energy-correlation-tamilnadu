
// ================================================
//   Sentinel-5P Air Pollution Monitoring Over Tamil Nadu
//   Period: Jan 2019 – Jan 2024
// ================================================

// 1. Load Tamil Nadu boundary
var tamilNadu = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1")
  .filter(ee.Filter.eq('ADM1_NAME', 'Tamil Nadu'));
Map.centerObject(tamilNadu, 7);
Map.addLayer(tamilNadu, {}, 'Tamil Nadu');

// 2. Define cities
var cities = ee.FeatureCollection('projects/profound-surge-473000-c4/assets/TNadded');

// 3. Load Sentinel-5P NO2 data (proxy for PM2.5)
var dataset = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2")
                .select('tropospheric_NO2_column_number_density');

// 4. Yearly averages
function getYearlyPM25(year) {
  var start = ee.Date.fromYMD(year,1,1);
  var end = start.advance(1, 'year');
  
  var yearly = dataset.filterDate(start, end).mean().clip(tamilNadu);
  return yearly.set('year', year);
}

var years = [2018,2019,2020,2021,2022];
var yearlyImages = ee.ImageCollection(years.map(getYearlyPM25));

// 5. Visualization parameters
var pm25Vis = {
  min: 0,
  max: 0.0002,
  palette: ['#00e400','#ffff00','#ff7e00','#ff0000','#8f3f97','#7e0023']
};

// Add all year layers
years.forEach(function(year) {
  var img = yearlyImages.filter(ee.Filter.eq('year', year)).first();
  Map.addLayer(img, pm25Vis, 'PM2.5 ' + year, false);
});

// ================== Highlight Undermonitored Cities ==================
var fixedUndermonitored = ["Neyveli", "Ranipet", "Tirupur", "Tiruppur"];
var underCities = cities.filter(ee.Filter.inList('name', fixedUndermonitored));
var otherCities = cities.filter(ee.Filter.inList('name', fixedUndermonitored).not());

Map.addLayer(otherCities, {color: 'blue'}, 'Other Cities');
Map.addLayer(underCities, {color: 'red'}, 'Undermonitored Cities');

// 6. UI Panels
var mainPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {width: '350px'}
});
ui.root.insert(0, mainPanel);

// Title
mainPanel.add(ui.Label({
  value: 'Tamil Nadu PM2.5 Monitoring (2018–2022)',
  style: {fontWeight: 'bold', fontSize: '18px', margin: '10px 5px'}
}));

// Year Selector
var yearSelect = ui.Select({
  items: years.map(String),
  value: '2020',
  style: {stretch: 'horizontal'}
});
mainPanel.add(ui.Label('Select Year:', {fontWeight: 'bold'}));
mainPanel.add(yearSelect);

// PM2.5 Results Panel
var resultsPanel = ui.Panel();
mainPanel.add(ui.Label('PM2.5 City Statistics', {fontWeight: 'bold', margin: '10px 5px'}));
mainPanel.add(resultsPanel);

// Undermonitored Cities Panel
var underPanel = ui.Panel({
  style: {margin: '10px 5px', padding: '8px', backgroundColor: '#f0f0f0'}
});
mainPanel.add(ui.Label('Undermonitored Cities (Fixed)', {fontWeight: 'bold'}));
mainPanel.add(underPanel);

// Time-series Chart Panel
var chartPanel = ui.Panel({style: {margin: '10px 5px'}});
mainPanel.add(ui.Label('City Time-Series (Click a City)', {fontWeight: 'bold'}));
mainPanel.add(chartPanel);

// 7. Legend
var legend = ui.Panel({style: {position: 'bottom-left', padding: '8px'}});
legend.add(ui.Label('PM2.5 Levels (µmol/m²)', {fontWeight: 'bold'}));

var palette = pm25Vis.palette;
var names = ['Good','Moderate','Unhealthy (SG)','Unhealthy','Very Unhealthy','Hazardous'];
for (var i = 0; i < palette.length; i++) {
  var colorBox = ui.Label('', {backgroundColor: palette[i], padding: '8px', margin: '0'});
  var desc = ui.Label(names[i], {margin: '0 0 4px 6px'});
  legend.add(ui.Panel([colorBox, desc], ui.Panel.Layout.Flow('horizontal')));
}
Map.add(legend);

// 8. Function to update UI Panels
function updateYear(year) {
  var img = yearlyImages.filter(ee.Filter.eq('year', year)).first();
  
  var cityStats = img.reduceRegions({
    collection: cities,
    reducer: ee.Reducer.mean(),
    scale: 1000
  });
  
  cityStats.evaluate(function(fc) {
    resultsPanel.clear();
    underPanel.clear();
    fc.features.forEach(function(f) {
      var val = f.properties.mean;
      if (val) {
        resultsPanel.add(ui.Label(f.properties.name + ': ' + (val*1e6).toFixed(2) + ' µg/m³'));
      }
      if (fixedUndermonitored.indexOf(f.properties.name) !== -1 && val) {
        underPanel.add(ui.Label(f.properties.name + ': ' + (val*1e6).toFixed(2) + ' µg/m³'));
      }
    });
  });
}

updateYear(2020);
yearSelect.onChange(function(val) { updateYear(parseInt(val)); });

// 9. Time-series chart on city click
Map.onClick(function(coords) {
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var city = cities.filterBounds(point).first();
  
  city.evaluate(function(c) {
    if (!c) return;
    var cityName = c.properties.name;
    
    var chartData = years.map(function(y) {
      var img = yearlyImages.filter(ee.Filter.eq('year', y)).first();
      var val = img.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: ee.Geometry.Point(c.geometry.coordinates),
        scale: 1000
      }).get('tropospheric_NO2_column_number_density');
      
      return [y, ee.Number(val).multiply(1e6)];
    });
    
    chartData = ee.List(chartData);
    
    var chart = ui.Chart.array.values(
      chartData.map(function(d){return ee.List(d).get(1)}), 
      0, 
      chartData.map(function(d){return ee.List(d).get(0)})
    )
      .setChartType('LineChart')
      .setOptions({
        title: 'PM2.5 Trend for ' + cityName,
        hAxis: {title: 'Year'},
        vAxis: {title: 'PM2.5 (µg/m³)'},
        lineWidth: 3,
        pointSize: 5
      });
    
    chartPanel.clear();
    chartPanel.add(chart);
  });
});

// 10. Export yearly results
years.forEach(function(year) {
  var img = yearlyImages.filter(ee.Filter.eq('year', year)).first();
  var cityStats = img.reduceRegions({
    collection: cities,
    reducer: ee.Reducer.mean(),
    scale: 1000
  });
  Export.table.toDrive({
    collection: cityStats,
    description: 'TN_PM25_Cities_' + year,
    fileFormat: 'CSV'
  });
});

// =====================================================
// EXTRA: Monthly PM2.5 values for ALL cities (2018–2022)
// =====================================================
function getMonthlyPM25(year, month) {
  var start = ee.Date.fromYMD(year, month, 1);
  var end = start.advance(1, 'month');
  
  var img = dataset.filterDate(start, end).mean();
  
  return ee.Algorithms.If(img.bandNames().size().gt(0),
    img.reduceRegions({
      collection: cities,
      reducer: ee.Reducer.mean(),
      scale: 1000
    }).map(function(f){
      var meanVal = f.get('mean');
      var pm25 = ee.Algorithms.If(meanVal, ee.Number(meanVal).multiply(1e6), null);
      return f.set('year', year)
              .set('month', month)
              .set('PM25', pm25);
    }),
    ee.FeatureCollection([])
  );
}

var monthlyCollections = [];
years.forEach(function(y){
  for (var m = 1; m <= 12; m++) {
    monthlyCollections.push(getMonthlyPM25(y, m));
  }
});

var monthlyResults = ee.FeatureCollection(monthlyCollections).flatten()
                        .filter(ee.Filter.notNull(['PM25']));

Export.table.toDrive({
  collection: monthlyResults,
  description: 'TN_PM25_Cities_Monthly_2018_2022',
  fileFormat: 'CSV'
});

// =====================================================
// EXTRA: Weekly PM2.5 values for ALL cities (2018–2022)
// =====================================================
function getWeeklyPM25(startDate, endDate) {
  var img = dataset.filterDate(startDate, endDate).mean();
  return ee.Algorithms.If(img.bandNames().size().gt(0),
    img.reduceRegions({
      collection: cities,   // ✅ all cities
      reducer: ee.Reducer.mean(),
      scale: 1000
    }).map(function(f){
      var meanVal = f.get('mean');
      var pm25 = ee.Algorithms.If(meanVal, ee.Number(meanVal).multiply(1e6), null);
      return f.set('start', startDate.format('YYYY-MM-dd'))
              .set('end', endDate.format('YYYY-MM-dd'))
              .set('PM25', pm25);
    }),
    ee.FeatureCollection([])
  );
}

var start = ee.Date('2018-01-01');
var end = ee.Date('2022-12-31');
var nSteps = end.difference(start,'day').divide(7).ceil(); // weekly

var weeklyIntervals = ee.List.sequence(0, nSteps.subtract(1)).map(function(i){
  var s = start.advance(ee.Number(i).multiply(7), 'day');
  var e = s.advance(7,'day');
  return getWeeklyPM25(s,e);
});

var weeklyResults = ee.FeatureCollection(weeklyIntervals).flatten()
                       .filter(ee.Filter.notNull(['PM25']));

Export.table.toDrive({
  collection: weeklyResults,
  description: 'TN_PM25_AllCities_Weekly_2018_2022',
  fileFormat: 'CSV'
});
