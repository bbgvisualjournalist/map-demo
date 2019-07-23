// =============================================
// |  Define the global variables at the top. |
// =============================================

// Variables defined here are "global", which means you'll have access to them throughout your code.
var myData;

var map;
var marker;
var layerGroup;
var iconDefault;
var tiles = [];


// Define the spreadsheet ID
var public_spreadsheet_url = '14G3g_Jpyih4AudKKJu4i_YWSYBBJxKBlzjVATdzgDic';

// This is the string of characters in the URL of a Google Spreadsheet.
// You have to "publish" the spreadsheet first in order for it to be public and accessible to your code.
// To publish: >File>Publish to the web> and select "Entire document"
// (Obviously don't do this with sensitive data.)








// ==============================================
// |  Wait for the page to load, then do stuff  |
// ==============================================

// This is a basic jQuery function that waits until the page (but not the images) has loaded.
// After the page is loaded, it'll execute whatever code you have inside of it.

$(document).ready(function(){
	console.log("Everything is loaded and we're ready to do stuff\n\n");

	// Let's start by calling the function to try to load the spreadsheet data.
	// If you scroll down you can see where we define that function.
	loadSpreadsheet();
});







// ============================
// |  Basic tabletopJS setup  |
// ============================
function loadSpreadsheet() {
	console.log("Trying to load spreadsheet.\n(cross your fingers)\n\n")

	// Here's where we try to initialize Tabletop.js
	// We defined that public spreadsheet up at the top 
	// (but we could just paste that string where it says "public_spreadsheet_url")

	// If tabletop succesfully connects with the spreadsheet, it'll execute the "callback" function and pass the data to it.
	Tabletop.init( { key: public_spreadsheet_url,
		callback: showInfo,
		simpleSheet: true } )
}



// Here's where you'll decide what you want to do with the loaded data.
function showInfo(data) {
	console.log("Data loaded!!! Huzzah!!!\n\n")

	// The data is returned as a JSON object (technically, it's an array of JSON objects).
	console.log("Here's what the data looks like:")
	console.log(data);
	console.log("\n\n");




	// Each row in the spreadsheet is a separate JSON object in the array.
	// You can look at specific rows in the data by referencing it by number: data[3]
	// Or you can point to a specific value by calling 
	console.log(data[3]);
	console.log("\n\n");



	// Let's loop through the data and see what we can do.
	for (var i = 0; i < data.length; i++){
		console.log(data[i].name + " — " + data[i].state );


		// Using jQuery we can add a paragraph with each politician to the HTML. Here's how:

		// 1. Define the HTML of the element you want to add.
		var temp = "<p>" + data[i].name + " (" + data[i].state + ") – " + data[i].affiliation + "</p>";

		// 2. Select the div where you want to append your HTML element.
		$("#politicians").append(temp);

		// jQuery will look for the HTML element with an id="politicians" and then add a new paragraph for each politician as it loops through the data.
	}


	// I'm going to copy the data to the "myData" variable I defined above, so that I can access it later
	// alternately I could pass it directly to the createMap() function as a parameter.
	myData = data;


	// Ok, the main thing is that after you load the data, you want to create the map.
	// I've put the map creation into a separate function.
	createMap();
}








// =========================
// |  Basic Leaflet setup  |
// =========================

function createMap(){

	// =====================================
	// |  Define the map tiles (optional)  |
	// =====================================

	// With Leaflet you can select the source(s) for the tiles in your map.
	// these tiles can be stacked, so that you can have a base layer that looks watercolored
	// and a separate layer that has all of the labels and lines.

	// You can find a bunch of tile options here:
	// https://leaflet-extras.github.io/leaflet-providers/preview/




	// Define the possible tile layers you'd like to add.

	var Esri_WorldTerrain = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
		maxZoom: 13
	});

	var Stamen_TonerHybrid = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	});

	// Add the tile layers to your "tiles" array.
	tiles = [Esri_WorldTerrain, Stamen_TonerHybrid];


	// If you forget (or choose not) to add any tile layers, you're still creating a map
	// ... but it'll look pretty empty unless you manually draw some geographic shapes on it.




	// ====================
	// |  Define the map  |
	// ====================
	// ... and set any options like zoom restrictions, scroll boundaries, attributions and controls, and add your tiles.

	map = L.map('map', {
		minZoom: 2,
		maxZoom: 7,
		//maxBounds: [ [22.854, 115.735], [0, 91.117] ], // If you want to restrict where people can go on the map
		attributionControl: true,
		scrollWheelZoom: false,
		layers: tiles
	});




	// =========================================
	// |  Define the initial focus of the map  |
	// =========================================

	// You can either set a coordinate point (like a city) to focus on (and specify a zoom level e.g. 4)
	//map.setView([51.505, -0.09], 4);

	// ... or you specify a coordinate box (e.g. the coordinates that bound the United States)
	// A coordinate box is an array with two coordinate arrays inside of it.

	var defaultBounds = [
		[49, -65],
		[16, -135]
	];

	map.fitBounds(defaultBounds);





	// ==============================
	// |  Define the custom icons.  |
	// ==============================

	// https://leafletjs.com/examples/custom-icons/

	iconBlue = L.icon({
		iconUrl: './img/dot--blue.png',
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		popupAnchor: [0, -4]
	})

	iconRed = L.icon({
		iconUrl: './img/dot--red.png',
		iconSize: [16, 16],
		iconAnchor: [8, 8],
		popupAnchor: [0, -4]
	})

	var currentIcon = iconRed;




	// ======================
	// |  Add the markers   |
	// ======================

	// Define the layer where we'll store all of the markers
	layerGroup = L.featureGroup().addTo(map);


	// Begin looping over the data to create markers
	for (var i = 0; i < myData.length; i++){

		// Leaflet expects coordinates to be stored as an array in the format of [lat, lng].
		// The coordinates from  the spreadsheet come over as a string.
		// We'll use the JavaScript method `.split()` to split the the string into an array.

		var coordinatesString = myData[i].coordinates; // We created a variable to temporarily store the string.
		var currentCoordinatesArray = coordinatesString.split(", "); // We're splitting the string into an array. (Anywhere there's a ", ", it'll add a new value to the array.)


		// Reset the default icon.
		currentIcon = iconRed;

		// Check the party affiliation, if the current politician is a Democrat we'll switch the icon. 
		if (myData[i].affiliation == "Democrat"){
			currentIcon = iconBlue;
		}



		// Define the popup window for the marker.
		popupWindowMarkup = "<img src='https://placehold.it/120x120'/><div class='voa__popup-text'><h3 class='voa__label small'>" + myData[i].state + "</h3><p>" + myData[i].name + "</p></div>";



		// Define the marker
		marker = new L.marker([currentCoordinatesArray[0],currentCoordinatesArray[1]], {
				icon: currentIcon,
				name: myData[i].name, // this is custom parameter. You can add more as you need.
				currentNumber: i,
			}).bindPopup(popupWindowMarkup);


		// Add the custom onClick() function for the marker.
		marker.on('click', onClick);


		// Add the current marker to the layer group.
		layerGroup.addLayer(marker);

	}

	function onClick(e){
		console.log("clicked marker. Name: " + e.target.options.name);

		// When the user clicks on the marker zoom
		map.setView(e.target.getLatLng(), 5);
	}

}

