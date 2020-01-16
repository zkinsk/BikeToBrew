// pans map to map marker when selecting from one of the lists
import { mapStyles, mapSettings } from './mapObj.js';

let map;
let infowindow;

export default {
	markerMap: function(mapCtr) {
		this.map = new google.maps.Map(document.getElementById('markerMap'), {
			...mapSettings,
			styles: mapStyles //Imported from mapObj.js
		});

		this.mapPanSearch();
		google.maps.event.addListener(this.map, 'click', function(event) {
			this.infowindow.close();
		});
	},
	panZoom: function(lat, lon) {
		lat = parseFloat(lat);
		lon = parseFloat(lon);
		const markerLoc = {
			lat: lat,
			lng: lon
		};
		this.map.panTo(markerLoc);
		this.map.setZoom(14);
	},

	mapPanSearch: function() {
		const searchControlDiv = document.createElement('div');
		const searchControl = new SearchControl(searchControlDiv, this.map);

		searchControlDiv.index = 1;
		this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(searchControlDiv);
	}
};
