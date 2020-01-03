export default {
	distance: function() {
		let d = $('#dist').val();
		if (d > 50) {
			d = 50;
			$('#dist').val('50');
		} else if (d < 0) {
			d = 1;
			$('#dist').val('1');
		} else if (d == '') {
			d = 5;
			$('#dist').val('5');
		}
		return d;
	},

	buildBreweryArray: function(breweryObject, indexAdder) {
		let breweryInfoArr = [];
		if (breweryObject[0].name === 'false') {
			$('.breweryList').empty();
			const item = $('<li>');
			const link = $("<a href='#!'></a>");
			link.text('No Breweries in your Search Area');
			item.append(link);
			$('.breweryList').append(item);
		} else {
			breweryInfoArr = breweryObject.map((brewery, index) => {
				const { name, place_id, vicinity } = brewery;
				const breweryLat = brewery.geometry.location.lat();
				const breweryLon = brewery.geometry.location.lng();
				return {
					name: name,
					ID: place_id,
					lat: breweryLat,
					lon: breweryLon,
					type: 'brewery',
					dataIndex: index + indexAdder,
					address: vicinity
				};
			});
		}
		return breweryInfoArr;
	},

	buildMTBArray: function(mtbObject) {
		let mtbInfoArr = [];
		if (mtbObject[0].name === 'false') {
			$('.mtbList').empty();
			let item = $('<li>');
			let link = $("<a href='#!'></a>");
			link.text('No Trails in your Search Area');
			item.append(link);
			$('.mtbList').append(item);
		} else {
			mtbInfoArr = mtbObject.map((trail, index) => {
				const { name, url, id, latitude, longitude } = trail;
				return {
					name: name,
					ID: id,
					lat: latitude,
					lon: longitude,
					tUrl: url,
					type: 'trail',
					dataIndex: index
				};
			});
		}
		return mtbInfoArr;
	}
};
