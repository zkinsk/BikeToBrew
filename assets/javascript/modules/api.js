const googleApiKey = 'AIzaSyDa6UN8aA8o_MA3LcPKoU74P0AZAQE3ybE';
const mtbProjApiKey = '200235024-32c4fc71813961608e163497918dd634';

export default {
	userLoc: function() {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
	},

	trailCall: async function(dist, mapCtr) {
		const queryURL = `https://www.mtbproject.com/data/get-trails?lat=${mapCtr.lat}&lon=${mapCtr.lng}&maxDistance=${dist}&key=${mtbProjApiKey}`;
		let response = await $.ajax({
			url: queryURL,
			method: 'GET'
		});
		return response.trails.length === 0 ? [ { name: 'false' } ] : [ ...response.trails ];
	},

	placesCall: function(dist, mapCtr, map) {
		let distMeters = dist * 1609.3;

		const request = {
			location: mapCtr,
			radius: distMeters,
			keyword: 'brewery',
			rankBy: google.maps.places.RankBy.PROMINENCE
		};

		const service = new google.maps.places.PlacesService(map);

		return new Promise((resolve, reject) => {
			service.nearbySearch(request, (results, status) => {
				const breweryObject = status === 'OK' ? [ ...results ] : [ { name: 'false' } ];
				resolve(breweryObject);
			});
		});
	},

	coordinateCall: async function(searchParameter) {
		const queryURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchParameter}&key=${googleApiKey}`;
		const response = await $.ajax({
			url: queryURL,
			method: 'GET'
		});
		const { lat, lng } = response.results[0].geometry.location;
		return {
			lat: lat,
			lng: lng
		};
	}
};
