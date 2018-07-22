/*	PostGIS and Leaflet demo for Cart Lab Education Series, April 17, 2015	**
**	By Carl Sack, CC-BY-3.0													*/

//global variables
var map,
	fields = ["gid", "createdby", "featname", "feattype", "status", "acres"], 
	autocomplete = [];

$(document).ready(initialize);

function initialize(){
	$("#map").height($(window).height());

	map = L.map("map", {
		center: L.latLng(44.7, -90),
		zoom: 7
	});

	var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets').addTo(map);

	//next: add features to map
	getData();
};

function getData(){
	$.ajax("php/getData.php", {
		data: {
			table: "fracsandsites",
			fields: fields
		},
		success: function(data){
			mapData(data);
		}
	})
};

function mapData(data){
	//remove existing map layers
	map.eachLayer(function(layer){
		//if not the tile layer
		if (typeof layer._url === "undefined"){
			map.removeLayer(layer);
		}
	});

	//create geojson container object
	var geojson = {
		"type": "FeatureCollection",
		"features": []
	};

	//split data into features
	var dataArray = data.split(", ;");
	dataArray.pop();
    
    //console.log(dataArray);
	
	//build geojson features
	dataArray.forEach(function(d){
		d = d.split(", "); //split the data up into individual attribute values and the geometry

		//feature object container
		var feature = {
			"type": "Feature",
			"properties": {}, //properties object container
			"geometry": JSON.parse(d[fields.length]) //parse geometry
		};

		for (var i=0; i<fields.length; i++){
			feature.properties[fields[i]] = d[i];
		};

		//add feature names to autocomplete list
		if ($.inArray(feature.properties.featname, autocomplete) == -1){
			autocomplete.push(feature.properties.featname);
		};

		geojson.features.push(feature);
	});
	
    //console.log(geojson);
    
    //activate autocomplete on featname input
    $("input[name=featname]").autocomplete({
        source: autocomplete
    });

	var mapDataLayer = L.geoJson(geojson, {
		pointToLayer: function (feature, latlng) {
			var markerStyle = { 
				fillColor: "#CC9900",
				color: "#FFF",
				fillOpacity: 0.5,
				opacity: 0.8,
				weight: 1,
				radius: 8
			};

			return L.circleMarker(latlng, markerStyle);
		},
		onEachFeature: function (feature, layer) {
			var html = "";
			for (prop in feature.properties){
				html += prop+": "+feature.properties[prop]+"<br>";
			};
	        layer.bindPopup(html);
	    }
	}).addTo(map);
};

function submitQuery(){
	//get the form data
	var formdata = $("form").serializeArray();

	//add to data request object
	var data = {
		table: "fracsandsites",
		fields: fields
	};
	formdata.forEach(function(dataobj){
		data[dataobj.name] = dataobj.value;
	});

	//call the php script
	$.ajax("php/getData.php", {
		data: data,
		success: function(data){
			mapData(data);
		}
	})
};