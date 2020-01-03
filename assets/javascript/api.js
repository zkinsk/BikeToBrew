const googleApiKey = 'AIzaSyAQm54poE1BtQ8oBFLMXbGHh-uz_NZaEH0';
const mtbProjApiKey = '200235024-32c4fc71813961608e163497918dd634';

export default {
	userLoc: function() {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
	},

	trailCall: function(dist, mapCtr) {
		const queryURL = `https://www.mtbproject.com/data/get-trails?lat=${mapCtr.lat}&lon=${mapCtr.lng}&maxDistance=${dist}&key=${mtbProjApiKey}`;

		$.ajax({
			url: queryURL,
			method: 'GET'
		})
			.then(response => {
				const mtbObject = response.trails.length === 0 ? [ { name: 'false' } ] : [ ...response.trails ];
				this.placesCall(dist, mapCtr, mtbObject);
			})
			.catch(err => {
				throw err;
			});
	},

	placesCall: function(dist, mapCtr, mtbObject) {
		let distMeters = dist * 1609.3;

		const request = {
			location: mapCtr,
			radius: distMeters,
			keyword: 'brewery',
			rankBy: google.maps.places.RankBy.PROMINENCE
		};

		const service = new google.maps.places.PlacesService(map);

		service.nearbySearch(request, callback);

		function callback(results, status) {
			const breweryObject = status === 'OK' ? [ ...results ] : [ { name: 'false' } ];
			makeArrays(mtbObject, breweryObject);
		}
	}
};
