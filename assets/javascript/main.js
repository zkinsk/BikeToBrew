const googleApiKey = 'AIzaSyAQm54poE1BtQ8oBFLMXbGHh-uz_NZaEH0';
const mtbProjApiKey = '200235024-32c4fc71813961608e163497918dd634';

import { mapStyles } from './mapObj.js';
import hpr from './helper.js';

let map;
let markers = [];
let infowindow;
let scroll;

// AJAX CALLS

// get lat and longitude based on current user location
function geoCall(dist) {
	navigator.geolocation.getCurrentPosition((position) => {
		const lat = position.coords.latitude;
		const lon = position.coords.longitude;
		const mapCtr = {
			lat: lat,
			lng: lon
		};
		$('#markerMap').empty();
		trailCall(dist, mapCtr);
		markerMap(mapCtr);
	});
}

// lat and lon based on zip code or other search parameters - provided by google api
function coordinateCall(sParameter, dist) {
	const queryURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${sParameter}&key=${googleApiKey}`;

	$.ajax({
		url: queryURL,
		method: 'GET'
	})
		.then(function(response) {
			let lat = response.results[0].geometry.location.lat;
			let lon = response.results[0].geometry.location.lng;
			let newLoc = {
				lat: lat,
				lng: lon
			};
			trailCall(dist, newLoc);
			map.panTo(newLoc);
		})
		.fail(function(err) {
			throw err;
		});
}

// calls mtb project for trails located within a defined radius
function trailCall(dist, mapCtr) {
	let queryURL = `https://www.mtbproject.com/data/get-trails?lat=${mapCtr.lat}&lon=${mapCtr.lng}&maxDistance=${dist}&key=${mtbProjApiKey}`;

	$.ajax({
		url: queryURL,
		method: 'GET'
	})
		.then(function(response) {
			const mtbObject = response.trails == '' ? [ { name: 'false' } ] : [ ...response.trails ];
			placesCall(dist, mapCtr, mtbObject);
		})
		.catch(function(err) {
			throw err;
		});
}

// calls google places to perform search for breweries within the specified search radius
function placesCall(dist, mapCtr, mtbObject) {
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
		const breweryObject = [];
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			breweryObject.push(...results);
			makeArrays(mtbObject, breweryObject);
		} else {
			breweryObject[0] = { name: 'false' };
			makeArrays(mtbObject, breweryObject);
		}
	}
}

// pushes desired info from AJAX objects then calls list functions and marker map
function makeArrays(mtbObject, breweryObject) {
	const mtbInfoArr = [];
	const breweryInfoArr = [];
	let i = 0;
	// pull info from Mountain Bike Object
	if (mtbObject[0].name === 'false') {
		$('.mtbList').empty();
		let item = $('<li>');
		let link = $("<a href='#!'></a>");
		link.text('No Trails in your Search Area');
		item.append(link);
		$('.mtbList').append(item);
	} else {
		for (i = 0; i < mtbObject.length; i++) {
			const trailName = mtbObject[i].name;
			const trailLat = mtbObject[i].latitude;
			const trailLon = mtbObject[i].longitude;
			const trailID = mtbObject[i].id;
			const trailUrl = mtbObject[i].url;

			const trailInfo = {
				name: trailName,
				ID: trailID,
				lat: trailLat,
				lon: trailLon,
				tUrl: trailUrl,
				type: 'trail',
				dataIndex: i
			};

			mtbInfoArr.push(trailInfo);
			trailList(mtbInfoArr);
		}
	}

	// pull info from brewery object
	if (breweryObject[0].name === 'false') {
		$('.breweryList').empty();
		const item = $('<li>');
		const link = $("<a href='#!'></a>");
		link.text('No Breweries in your Search Area');
		item.append(link);
		$('.breweryList').append(item);
	} else {
		for (let k = 0; k < breweryObject.length; k++) {
			const breweryName = breweryObject[k].name;
			const breweryLat = breweryObject[k].geometry.location.lat();
			const breweryLon = breweryObject[k].geometry.location.lng();
			const breweryID = breweryObject[k].place_id;

			const breweryInfo = {
				name: breweryName,
				ID: breweryID,
				lat: breweryLat,
				lon: breweryLon,
				type: 'brewery',
				dataIndex: k + i,
				address: breweryObject[k].vicinity
			};

			breweryInfoArr.push(breweryInfo);
			brewList(breweryInfoArr);
		}
	}
	// combine the two arrays for sending to marker map
	const mapInfoArr = [...mtbInfoArr, ...breweryInfoArr];
	addMarkers(mapInfoArr);
}

// Draw google map with our specific styling
function markerMap(mapCtr) {
	map = new google.maps.Map(document.getElementById('markerMap'), {
		zoom: 11,
		center: mapCtr,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		rotateControl: false,
		fullscreenControl: true,
		gestureHandling: 'greedy',
		styles: mapStyles //Imported from mapObj.js
	});

	mapPanSearch();
	google.maps.event.addListener(map, 'click', function(event) {
		infowindow.close();
	});

	mapPanSearch();
	google.maps.event.addListener(map, 'click', function(event) {
		infowindow.close();
	});
}

// add button to map to re-do search based on location of center of map
function mapPanSearch() {
	const searchControlDiv = document.createElement('div');
	const searchControl = new SearchControl(searchControlDiv, map);

	searchControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(searchControlDiv);
}

// settings for search button that will be pushed into the google map
function SearchControl(controlDiv, map) {
	// Set CSS for the control border.
	const controlUI = document.createElement('div');
	controlUI.classList.add('map-redo-search-border');
	controlUI.title = 'Click to redo search at center of map';
	controlDiv.appendChild(controlUI);

	// Set CSS for the control interior.
	const controlText = document.createElement('div');
	controlUI.classList.add('map-redo-search-interior');
	controlText.innerHTML = 'Redo Search';
	controlUI.appendChild(controlText);

	// Setup the click event listeners: simply set the map to Chicago.
	controlUI.addEventListener('click', function() {
		const newCtr = map.getCenter();
		let lat = newCtr.lat();
		let lon = newCtr.lng();
		lat = parseFloat(lat.toFixed(5));
		lon = parseFloat(lon.toFixed(5));
		$('#coordinateInput').val(`${lat}, ${lon}`);
		let newLoc = {
			lat: lat,
			lng: lon
		};
		let dist = hpr.distance();
		trailCall(dist, newLoc);
	});
}

// draws the markers on the map, adds click event for info box pop up
function addMarkers(mapInfoArr) {
	// this for loop clears all the markers from the map before drawing new ones
	markers.forEach((marker) => marker.setMap(null));
	markers = []; // clears the marker array

	const iconBase = 'assets/images/';
	const icons = {
		brewery: {
			icon: iconBase + 'bar.png'
		},
		trail: {
			icon: iconBase + 'cycling.png'
		}
	};

	infowindow = new google.maps.InfoWindow();

	// for (let i = 0; i < mapInfoArr.length; i++) {
	mapInfoArr.forEach((item) => {
		const position = { lat: item.lat, lng: item.lon };
		const { type, name, tUrl, ID, address } = item;
		const marker = new google.maps.Marker({
			position: position,
			id: ID,
			url: tUrl,
			title: name,
			type: type,
			map: map,
			icon: icons[type].icon,
			address: address
		});
		markers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			infoWindowPopup(this);
		});
	});
	zoomExtents();
}

// zoom the map to the extents of the group of markers, and if only 1 marker is place just to set zoom at a specific height
function zoomExtents() {
	const bounds = new google.maps.LatLngBounds();
	if (markers.length > 1) {
		for (let i = 0; i < markers.length; i++) {
			bounds.extend(markers[i].getPosition());
			map.fitBounds(bounds);
		}
	} else if (markers.length === 1) {
		map.panTo(markers[0].position);
		map.setZoom(14);
	}
}

// receives info from mtb api, populates mtb array and updates DOM list of trails
function trailList(mtbInfoArr) {
	$('.mtbList').empty();
	for (let i = 0; i < mtbInfoArr.length; i++) {
		const trailName = mtbInfoArr[i].name;
		const trailID = mtbInfoArr[i].ID;
		const trailIndex = mtbInfoArr[i].dataIndex;

		const trailItem = $('<li>');
		const trailLink = $(
			`<a href='#!' class='listData' data-ID='${trailID}', data-index='${trailIndex}'>${trailName}</a>`
		);

		trailItem.append(trailLink);
		$('.mtbList').append(trailItem);
	}
}

// open modal when trail details button is clicked
function trailDetails(trailId) {
	const trailWidget = $('<div>');
	trailWidget.html(
		/*html*/
		`<iframe style="width:100%; 
      max-width:1200px; 
      height:410px;" 
      frameborder="0" 
      scrolling="no" 
      src="https://www.mtbproject.com/widget?v=3&map=1&type=trail&id=${trailId}&z=6">
      </iframe>`
	);
	$('.trailModal').empty();
	$('.trailModal').append(trailWidget);
	$('#modal1').modal('open');
}

// function to call back google for specific details on a brewery using the place ID

function breweryDetails(breweryId) {
	const request = {
		placeId: breweryId,
		fields: [ 'url', 'website', 'name', 'formatted_address', 'formatted_phone_number', 'photos', 'rating' ]
	};

	const service = new google.maps.places.PlacesService(map);
	service.getDetails(request, placeDetails);

	// this function was originally nested because it needed access to variables that were sent to the function breweryDetails - that is no longer the case, but I have left it nested
	function placeDetails(place, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			// console.log(place);
			const name = place.name;
			const rating = place.rating;
			const starTotal = 5;
			const starPercentage = rating / starTotal * 100;
			const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;

			$('.stars-inner').css('width', starPercentageRounded);

			const address = place.formatted_address;
			const phoneNum = place.formatted_phone_number;
			const webSite = place.website;
			const webLink = $('<a>');
			webLink.attr({ href: webSite, target: '_blank' });
			webLink.text(name);

			$('#brewNameModal').text(name);
			$('#brewPhoneModal').text(phoneNum);
			$('#brewAdressModal').html(address + '<br>');
			$('#brewAdressModal').append(webLink);

			$('.carousel').empty();
			if (place.photos == null) {
				for (let i = 0; i < 1; i++) {
					const cAnchor = $('<a>').addClass('carousel-item').attr('href', '#one!');

					const defaultImg = $('<img>').attr({
						src: 'assets/images/Copper-Moonshine-Still-3.jpg',
						width: '300px'
					});
					cAnchor.append(defaultImg);
					$('.carousel').append(cAnchor);
				}
			} else {
				for (let i = 0; i < place.photos.length; i++) {
					const height = place.photos[i].height;
					const width = place.photos[i].width;
					const ratio = height / width;
					if (ratio < 1.4) {
						//checks for image size ratio so as to not put too tall images in carosel
						const cAnchor = $('<a>').addClass('carousel-item').attr({ href: webSite, target: '_blank' });

						const pURL = place.photos[i].getUrl();
						const cImg = $('<img>').attr('src', pURL);
						cAnchor.append(cImg);
						$('.carousel').append(cAnchor);
					}
				}
				scroll = setInterval(timer, 4000);
			}
			$('#modalBrewery').modal('open');
			setTimeout(function() {
				initCarouselModal();
			}, 100);
		}
	}
}

// function to initialize the carousel - it needs to be initialized after the modal is opened becuase when the model is hidden its height is 0 and this causes problems with the carousel
function initCarouselModal() {
	const elems = document.querySelectorAll('.carousel');
	const breweryCarousel = M.Carousel.init(elems, {
		numVisible: 1,
		fullWidth: true,
		indicators: true
	});
	// console.log(breweryCarousel);
}

// this is the function to automatically advance the carousel to the next image
function timer() {
	$('.carousel').carousel('next');
}

// receives brewery info from google places, populates brewery array and updates DOM list of breweries
function brewList(breweryInfoArr) {
	$('.breweryList').empty();
	breweryInfoArr.forEach((item) => {
		const { name, dataIndex } = item;
		const brewItem = $('<li>');
		const brewLink = $('<a href="#!">' + name + '</a>');
		brewLink.attr('data-index', dataIndex);
		brewLink.addClass('listData');
		brewItem.append(brewLink);
		$('.breweryList').append(brewItem);
	});
}

// activates various button click functionalities
function buttonClick() {
	$('#coordinateSubmit').click(function(event) {
		event.preventDefault();
		let x = $('#coordinateInput').val();
		if (x == '' || x == 'Current Location') {
			geoCall(hpr.distance());
		} else {
			coordinateCall(x, hpr.distance());
		}
	});

	$('.clearSearch').click(function() {
		//clears the search bar
		$('#coordinateInput').val('');
	});

	$(document).on('click', '.listData', function() {
		const markerIndex = $(this).attr('data-index');
		const marker = markers[markerIndex];
		const latln = marker.getPosition();
		const lat = latln.lat();
		const lon = latln.lng();
		panZoom(lat, lon);
		infoWindowPopup(marker);
	});

	$('#googleMapsMarkers').on('click', '.popUpDetails', function() {
		const itemInfo = $(this).data('marker');
		itemInfo.type === 'trail' ? trailDetails(itemInfo.id) : breweryDetails(itemInfo.id);
	});
}

// add info to the map marker info window
function infoWindowPopup(marker) {
	const markerData = marker.type === 'trail' ? { type: 'trail' } : { type: 'brewery' };
	markerData.id = marker.id;
	infowindow.setContent(
		/*html*/
		`<div class = "popUp">
					<strong>
					${marker.title}
					</strong><br>
				</div>
				<button 
					class="btn waves-effect waves-light btn-small popUpDetails" 
					type="button" 
					name="action" 
					data-marker='${JSON.stringify(markerData)}'
					>
					More Info
				</button>`
	);

	$('.gm-style-iw').parent().css({ 'background-color': 'red' });
	infowindow.open(map, marker);
}

// pans map to map marker when selecting from one of the lists
function panZoom(lat, lon) {
	lat = parseFloat(lat);
	lon = parseFloat(lon);
	const markerLoc = {
		lat: lat,
		lng: lon
	};
	map.panTo(markerLoc);
	map.setZoom(14);
}

// hides the splash screen after a set amount of time then shows the app
function splashScreen() {
	setTimeout(function() {
		$('#splashScreen').slideUp(500);
		$('#appContent').fadeIn(1000);
		$('footer').fadeIn(1000);
		buttonClick();
		geoCall(hpr.distance());
	}, 1000);
}

// This stops the scroll fucntion of carousel once the modal is closed
function stopScroll() {
	clearInterval(scroll);
}

// document on ready
$(document).ready(function() {
	splashScreen();
	$('.dropdown-trigger').dropdown();
	$('.collapsible').collapsible();
	$('.modal').modal({ onCloseEnd: stopScroll });

	// end of doc ready
});
