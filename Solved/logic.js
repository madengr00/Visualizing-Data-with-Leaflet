// Store our API endpoint inside queryUrl
// M4.5+Earthquakes
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
console.log(earthquakeUrl);
var tectonicUrl = 'PB2002_boundaries.json';
console.log(tectonicUrl);

var volcanoUrl = 'harvard_glb_volc_geojson.json';
console.log(volcanoUrl);

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function(earthquakeData) {
  console.log(earthquakeData.features)
  
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + "<h3>" + "Earthquake: " + feature.properties.mag + " Magnitude" +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (geoJsonPoint, latlng) {
      return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag),
                                      fillColor: getColor(geoJsonPoint.properties.mag),
                                      fillOpacity: 1,
                                      opacity: 1,
                                      stroke: false, });
    },
    onEachFeature: onEachFeature
  });

  d3.json(tectonicUrl, function(tectonicData){
    console.log(tectonicData.features)
    var faultFeatures = tectonicData.features
    // fault line color
    var style = {
        "color": "orange",
        "fillOpacity":0 // diabled orange background color inside
    }
    var faultLine = L.geoJSON(faultFeatures, {
      style: function(feature){
        return style
        }
    })
    // createMap(earthquakes, faultLine)
  // });

    d3.json(volcanoUrl, function(volcanoData){
      console.log(volcanoData.features)
      // Run the onEachFeature function once for each piece of data in the array
      var volcanoes = L.geoJSON(volcanoData, {
        pointToLayer: function (geoJsonPoint, latlng) {
          return L.marker(latlng, {
                          icon: myIcon
           });
        },
        onEachFeature: onEachFeature
      })
      createMap(earthquakes, faultLine, volcanoes)
    
    })
  });
  
});


// Function to determine marker size based on population
function markerSize(mag) {
  return mag * 3;
}

// Create colors for magnitude values
function getColor(d) {
  return  d > 8 ? '#000000' :
          d > 7 ? '#330000' :
          d > 6 ? '#660000' :
          d > 5 ? '#990000' :
          d > 4 ? '#e60000' :
          d > 3 ? '#ff1a1a' :
          d > 2 ? '#ff4d4d' :
          d > 1 ? '#ff8080' :
                  '#ffb3b3' ;
}

// define myIcon
var myIcon = L.icon({
  iconUrl: 'Volcano-595b40b65ba036ed117d35f9.svg',
  iconSize: [19, 47.5],
  iconAnchor: [11, 47],
  popupAnchor: [-1.5, -38],
});

// Define satellite, streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

// Define Maps
var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

  
function createMap(earthquakes, faultLine, volcanoes) {

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite": satellite
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultLine,
    "Volcanoes": volcanoes
  };

  // Create map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquakes, faultLine,volcanoes]
  });

  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

//Add a Legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5,6,7,8],
        labels = [];
    //Add Legend Title
    var legendInfo = "<h3>Earthquake <br> Magnitude</h3>"
    div.innerHTML = legendInfo;


    //loop through magnitude intervals and generate a label with colored square for each interval
    for (var i = 0; i< grades.length; i++) {
      div.innerHTML +=
        '<li style="background:' + getColor(grades[i]+ 1) + '"></li> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
 

}


