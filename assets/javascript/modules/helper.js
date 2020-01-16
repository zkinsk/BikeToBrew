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

	buildArrays: function(obj, indexAdder = 0, type) {
		let objArr = [];
		if (obj[0].name === 'false') {
			const linkItem = /*html */ `
			<li>
				<a href='#!'>
					${type === 'trail' ? 'No Trails in Your Search Area' : 'No Breweries in Your Search Area'}
				</a>
			</li>
			`;
			$(type === 'trail' ? '.mtbList' : '.breweryList').empty().append(linkItem);
		} else {
			objArr = obj.map((item, index) => {
				if (type === 'trail') {
					var { name, url, id, latitude, longitude } = item;
				} else {
					var { name, place_id: id, vicinity } = item;
					var latitude = item.geometry.location.lat();
					var longitude = item.geometry.location.lng();
				}
				return {
					name: name,
					ID: id,
					lat: latitude,
					lon: longitude,
					type: type,
					tUrl: (url = null),
					dataIndex: index + indexAdder,
					address: (vicinity = null)
				};
			});
		}
		return objArr;
	},

	buildAndDisplayList: function(objArr, type) {
		const itemsArr = objArr.map(item => {
			const { name, ID, dataIndex } = item;
			return /*html*/ `
				<li>
					<a href='#!' class='listData' data-ID='${ID}', data-index='${dataIndex}'>${name}</a>
				</li>
			`;
		});
		type === 'trail' ? $('.mtbList').empty().append(itemsArr) : $('.breweryList').empty().append(itemsArr);
	}
};
