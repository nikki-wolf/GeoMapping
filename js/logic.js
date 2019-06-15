//retreive the last week earthquakes
let queryEarthquake = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

//retreive the faults
let queryFaults='https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json'

//adding to layer group
var earthquakeResult=new L.LayerGroup()
var faultResult=new L.LayerGroup()

// Perform a GET request to the query URLs
d3.json(queryEarthquake, function(d1) {
  L.geoJSON(d1.features, {
    onEachFeature: function (feature, marker) {
      marker.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function(feature, latlng) {
      return new L.circleMarker(latlng, 
        {radius: markerSize(feature.properties.mag)});
      },
    style: function(d){
      return {
          fillColor: getColor(d.properties.mag),
          fillOpacity: .6,
          color: "white",
          stroke: true,
          weight: .8
      }
    }
  }).addTo(earthquakeResult);

  d3.json(queryFaults, function(d2){
    console.log(d2.features)
    L.geoJson(d2.features, {
      style: function(){
        return{
              color: "orange",
              fillOpacity: 0.,
              weight: 2
            }

      },
    }).addTo(faultResult)

  });

  // Sending our earthquakes and faults layers to the createMap function
  createMap(earthquakeResult, faultResult)
});

//creat basemap and add layers to it
function createMap(earthquakeLayer,faultLayer) {

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

  // BaseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Greyscale": lightMap,
    "Outdoor": outdoorMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakeLayer,
    Faults: faultLayer
  };

  // Create our map, giving it the outdoorMap and earthquakes layers to display on load
  var myMap = L.map("map-id", {
    center: [
      29.7604, -95.3698
    ],
    zoom: 3,
    layers: [satelliteMap, earthquakeLayer]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1,2,3,4,5],
      labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
           //   '<i style="background:' + getColor(magn[i] + 1) + '"></i> ' +
           //   magn[i] + (magn[i + 1] ? '&ndash;' + magn[i + 1] + '<br>' : '+');
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(myMap);
  
}

//selecting the colors for circle markers
function getColor(d) {
  return d>5 ? 'red':
        d>4 ? "#FFEDA0":
        d>3 ? "orange":
        d>2 ? "yellow":
        d>1 ? "#bfff00":
        "#00fa00";
};

// making circles size proportional to earthquake magnitude
function markerSize(magnitude){
  return magnitude * 3;
}