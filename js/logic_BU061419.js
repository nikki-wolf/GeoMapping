// Store our API endpoint inside queryUrl
//let baseurl="https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&"
//let starttime="2019-06-01"
//let endtime="2019-06-10"
//let minlongitude= "-123.83789062"
//let minlatitude="25.16517337"
//let maxlongitude= "-69.52148437"
//let maxlatitude="48.74894534"

//let queryUrl = `${baseurl}starttime=${starttime}&endtime=${endtime}
//                &maxlongitude=${maxlongitude}&minlongitude=${minlongitude}&maxlatitude=${maxlatitude}&minlatitude=${minlatitude}`;

let queryEarthQuake = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
let queryFaults='https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json'
// Perform a GET request to the query URL
d3.json(queryEarthQuake, function(dataEQ) {
  d3.json(queryFaults, function(dataF) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(dataEQ.features);
  console.log('dataF=',dataF)
  })
});

function createFeatures(earthquakeData) {
  //console.log(earthquakeData);
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // var geojson_result = L.geoJSON(earthquakeData, {
  //   onEachFeature: functiona
  // });

  //Earthquake popups
  var Earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, marker) {
      //console.log(feature.geometry.coordinates, feature.properties.time, feature.properties.mag);
      marker.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      //console.log(marker.feature.geometry.coordinates);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(Earthquakes, Faults);
}

var tectonicPlates = new L.LayerGroup();
// Adding tile layer

d3.json(tectonic_link, function(geoJson){
  L.geoJson(geoJson.features, {
    style: function(gF){
      return{
    color: "yellow",
    weight: 2
      }
    },
  }).addTo(tectonicPlates);
});



function createMap(Earthquake, Fault) {

  // Define outdoorMap and satelliteMap layers
  mapBoxURLBase="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
  
  var outdoorMap = L.tileLayer(mapBoxURLBase, {
    attribution: "Map data &copy; <a href=\"https://www.openoutdoorMap.org/\">OpenoutdoorMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var lightMap = L.tileLayer(mapBoxURLBase, {
    attribution: "Map data &copy; <a href=\"https://www.openoutdoorMap.org/\">OpenoutdoorMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satelliteMap = L.tileLayer(mapBoxURLBase, {
    attribution: "Map data &copy; <a href=\"https://www.openoutdoorMap.org/\">OpenoutdoorMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Greyscale": lightMap,
    "Outdoor": outdoorMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: Earthquake,
    Faults: Fault
  };

  // Create our map, giving it the outdoorMap and earthquakes layers to display on load
  var myMap = L.map("map-id", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorMap, geojson_result]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      magn = [0, 1,2,3,4,5],
      labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < magn.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(magn[i] + 1) + '"></i> ' +
              magn[i] + (magn[i + 1] ? '&ndash;' + magn[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(myMap);
  
}

// // adding legend
// var legend = L.control({position: 'bottomright'});
//   legend.onAdd = function (map) {
  
//       var div = L.DomUtil.create('div', 'info legend'),
//          magnitudes = [0,1,2,3,4,5],
//          labels = [];
  
//       // loop through our density intervals and generate a label with a colored square for each interval
//       for (var i =0; i < magnitudes.length; i++) {
//           div.innerHTML +=
//               '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
//               magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
//       }
  
//       return div;
//   };
  
//   // Update the legend's innerHTML with the last updated time and station count
// function updateLegend() {
//   magn = [0,1,2,3,4,5],
//   labels = [];
//   //document.querySelector(".legend").innerHTML = [
  
//   for (let i=0; i<magn.length; i++){
//     document.querySelector(".legend").innerHTML +=
//         `<i style="background: ${getColor(i)+1}"></i>${i}`+ (i<magn.length-1 ? `- ${i+1}<br>`: '+ <br>');

//     }
//   }

 


function getColor(d) {
  return d>5 ? 'red':
        d>4 ? "#ff8000":
        d>3 ? "orange":
        d>2 ? "yellow":
        d>1 ? "#bfff00":
        "#00fa00";
};