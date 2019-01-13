// AIzaSyAkRgKvL87NTW0sZv9yDSOpQRPXaVV61h8  google API Key
// 200235024-32c4fc71813961608e163497918dd634 mtb project API key
var googleApiKey = "AIzaSyAQm54poE1BtQ8oBFLMXbGHh-uz_NZaEH0";
var mtbProjApiKey = "200235024-32c4fc71813961608e163497918dd634";

var map;
var markers = [];
var infowindow;
var service;
var mtbObject;
var breweryObject;
var scroll;



// AJAX CALLS

// get lat and longitude based on current user location
function geoCall(dist) {
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    let mapCtr = {
      lat: lat,
      lng: lon
    };
    $("#markerMap").empty();
    trailCall(dist, mapCtr);
    markerMap(mapCtr);
  })
}

// lat and lon based on zip code or other search parameters - provided by google api
function coordinateCall(sParameter, dist) {
  var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + sParameter + "&key=" + googleApiKey;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    let lat = response.results[0].geometry.location.lat
    let lon = response.results[0].geometry.location.lng
    let newLoc = {
      lat: lat,
      lng: lon
    };
    trailCall(dist, newLoc);
    map.panTo(newLoc);
  });
}

// calls mtb project for trails located within a defined radius
function trailCall(dist, mapCtr) {
  var queryURL = "https://www.mtbproject.com/data/get-trails?lat=" + mapCtr.lat + "&lon=" + mapCtr.lng + "&maxDistance=" + dist + "&key=" + mtbProjApiKey;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    mtbObject = response.trails;
    if (mtbObject == ``) {
      mtbObject = [{ name: "false" }];
    }
    placesCall(dist, mapCtr);
  }).fail(function (err) {
    throw err;
  });
}

// calls google places to perform search for breweries within the specified search radius
function placesCall(dist, mapCtr) {
  let distMeters = dist * 1609.3;
  var request = {
    location: mapCtr,
    radius: distMeters,
    keyword: 'brewery',
    rankBy: google.maps.places.RankBy.PROMINENCE,
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      breweryObject = results;
      makeArrays()
    } else {
      breweryObject = [{ name: "false" }];
      makeArrays();
    }
  }
}


// pushes desired info from AJAX objects then calls list functions and marker map
function makeArrays() {
  // console.log(breweryObject);
  // console.log(mtbObject);
  var mtbInfoArr = []
  var breweryInfoArr = []
  let i = 0
  // pull info from Mountain Bike Object
  if (mtbObject[0].name === "false"){
    $(".mtbList").empty();
    $(".mtbList").text(`No Trails in your Search Area`);
  }else{
    for (i = 0; i < mtbObject.length; i++) {
      var trailName = mtbObject[i].name;
      var trailLat = mtbObject[i].latitude;
      var trailLon = mtbObject[i].longitude;
      var trailID = mtbObject[i].id;
      var trailUrl = mtbObject[i].url
      var trailInfo = {
        name: trailName,
        ID: trailID,
        lat: trailLat,
        lon: trailLon,
        tUrl: trailUrl,
        type: 'trail',
        dataIndex: i,
      }
      mtbInfoArr.push(trailInfo);
      trailList(mtbInfoArr);
    };
  }

 
  // pull info from brewery object
  if (breweryObject[0].name === "false"){
    $(".breweryList").empty();
    $(".breweryList").text(`No Breweries in your Search Area`);
  }else{
    for (var k = 0; k < breweryObject.length; k++) {
      var breweryName = breweryObject[k].name;
      var breweryLat = breweryObject[k].geometry.location.lat();
      var breweryLon = breweryObject[k].geometry.location.lng();
      var breweryID = breweryObject[k].place_id;
      var breweryInfo = {
        name: breweryName,
        ID: breweryID,
        lat: breweryLat,
        lon: breweryLon,
        type: 'brewery',
        dataIndex: k + i,
        address: breweryObject[k].vicinity,
      }
      breweryInfoArr.push(breweryInfo);
      brewList(breweryInfoArr)
    }
  }
  // combine the two arrays for sending to marker map
  mapInfoArr = mtbInfoArr.concat(breweryInfoArr);
  addMarkers(mapInfoArr);

}

// Draw google map with our specific styling
function markerMap(mapCtr) {
    map = new google.maps.Map(
        document.getElementById("markerMap"), {
            zoom: 11, 
            center: mapCtr, 
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true,
            styles: [
                {
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#19480d"
                    }
                  ]
                },
                {
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#ffffff"
                    }
                  ]
                },
                {
                  elementType: "labels.text.stroke",
                  stylers: [
                    {
                      color: "#60371f"
                    },
                    {
                      lightness: -25
                    }
                  ]
                },
                {
                  featureType: "administrative",
                  elementType: "geometry.stroke",
                  stylers: [
                    {
                      color: "#c9b2a6"
                    }
                  ]
                },
                {
                  featureType: "administrative.land_parcel",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "administrative.land_parcel",
                  elementType: "geometry.stroke",
                  stylers: [
                    {
                      color: "#dcd2be"
                    }
                  ]
                },
                {
                  featureType: "administrative.land_parcel",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#ae9e90"
                    }
                  ]
                },
                {
                  featureType: "administrative.neighborhood",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "landscape.natural",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#19480d"
                    }
                  ]
                },
                {
                  featureType: "poi",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#19480d"
                    }
                  ]
                },
                {
                  featureType: "poi",
                  elementType: "labels.text",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#93817c"
                    }
                  ]
                },
                {
                  featureType: "poi.business",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry.fill",
                  stylers: [
                    {
                      color: "#60371f"
                    },
                    {
                      lightness: -45
                    }
                  ]
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#447530"
                    }
                  ]
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#f5f1e6"
                    }
                  ]
                },
                {
                  featureType: "road",
                  elementType: "labels",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "road",
                  elementType: "labels.icon",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "road.arterial",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#fee3a7"
                    },
                    {
                      lightness: -75
                    }
                  ]
                },
                {
                  featureType: "road.arterial",
                  elementType: "labels",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#a36301"
                    }
                  ]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [
                    {
                      color: "#a36301"
                    }
                  ]
                },
                {
                  featureType: "road.highway",
                  elementType: "labels",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "road.highway.controlled_access",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#e9a502"
                    }
                  ]
                },
                {
                  featureType: "road.highway.controlled_access",
                  elementType: "geometry.stroke",
                  stylers: [
                    {
                      color: "#bd8502"
                    }
                  ]
                },
                {
                  featureType: "road.local",
                  stylers: [
                    {
                      color: "#fee3a7"
                    },
                    {
                      lightness: -70
                    },
                    {
                      weight: 0.5
                    }
                  ]
                },
                {
                  featureType: "road.local",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#806b63"
                    }
                  ]
                },
                {
                  featureType: "transit",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "transit.line",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#dfd2ae"
                    }
                  ]
                },
                {
                  featureType: "transit.line",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#8f7d77"
                    }
                  ]
                },
                {
                  featureType: "transit.line",
                  elementType: "labels.text.stroke",
                  stylers: [
                    {
                      color: "#ebe3cd"
                    }
                  ]
                },
                {
                  featureType: "transit.station",
                  elementType: "geometry",
                  stylers: [
                    {
                      color: "#dfd2ae"
                    }
                  ]
                },
                {
                  featureType: "water",
                  elementType: "geometry.fill",
                  stylers: [
                    {
                      color: "#24bfe2"
                    }
                  ]
                },
                {
                  featureType: "water",
                  elementType: "labels.text",
                  stylers: [
                    {
                      visibility: "off"
                    }
                  ]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [
                    {
                      color: "#92998d"
                    }
                  ]
                }
              ] 
    
    }); 
    mapPanSearch();
    google.maps.event.addListener(map, "click", function(event) {
        infowindow.close();
    });
  mapPanSearch();
  google.maps.event.addListener(map, "click", function (event) {
    infowindow.close();
  });
}

// add button to map to re-do search based on loction of center of map
function mapPanSearch() {
  var searchControlDiv = document.createElement('div');
  var searchControl = new SearchControl(searchControlDiv, map);

  searchControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(searchControlDiv);
}

// settings for search button that will be pushed into the google map
function SearchControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '2px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginTop = '-50px';
  controlUI.style.marginRight = '60px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to redo search at center of map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '8px';
  controlText.style.paddingRight = '8px';
  controlText.innerHTML = 'Redo Search';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function () {
    let newCtr = map.getCenter();
    let lat = newCtr.lat();
    let lon = newCtr.lng();
    lat = parseFloat(lat.toFixed(5));
    lon = parseFloat(lon.toFixed(5));
    $("#coordinateInput").val(lat + ', ' + lon)
    let newLoc = {
      lat: lat,
      lng: lon
    };
    let dist = distance();
    trailCall(dist, newLoc);
  });
}

// draws the markers on the map, adds click event for info box pop up
function addMarkers(mapInfoArr) {
  // this for loop clears all the markers from the map before drawing new ones
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  var iconBase = "assets/images/";
  var icons = {
    brewery: {
      icon: iconBase + "bar.png"
    },
    trail: {
      icon: iconBase + "cycling.png"
    }
  };
  infowindow = new google.maps.InfoWindow();
  for (let i = 0; i < mapInfoArr.length; i++) {
    let position = { lat: mapInfoArr[i].lat, lng: mapInfoArr[i].lon }
    let type = mapInfoArr[i].type;
    let name = mapInfoArr[i].name;
    let url = mapInfoArr[i].tUrl
    let id = mapInfoArr[i].ID;
    let address = mapInfoArr[i].address;
    let marker = new google.maps.Marker({
      position: position,
      id: id,
      url: url,
      title: name,
      type: type,
      map: map,
      icon: icons[type].icon,
      address: address,
    });
    markers.push(marker);
    google.maps.event.addListener(marker, 'click', function () {
      infoWindowPopup(this);
    });
  }
  zoomExtents();
}

// zoom the map to the extents of the group of markers, and if only 1 marker is place just to set zoom at a specific height
function zoomExtents() {
  var bounds = new google.maps.LatLngBounds();
  if (markers.length > 1) {
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
      map.fitBounds(bounds);
    }
  }else if (markers.length === 1 ){
    map.panTo(markers[0].position);
    map.setZoom(14)
  }
}

// receives info from mtb api, populates mtb array and updates DOM list of trails
function trailList(mtbInfoArr) {
  $(".mtbList").empty();
  for (var i = 0; i < mtbInfoArr.length; i++) {
    var trailName = mtbInfoArr[i].name;
    var trailID = mtbInfoArr[i].ID;
    var trailIndex = mtbInfoArr[i].dataIndex;
    var trailItem = $("<li>");
    var trailLink = $("<a href='#!'></a>");
    trailLink.attr("data-ID", trailID);
    trailLink.attr("data-index", trailIndex);
    trailLink.addClass('listData');
    trailLink.text(trailName);
    trailItem.append(trailLink);
    $(".mtbList").append(trailItem);
  }
}

// open modal when trail details button is clicked
function trailDetails(trailId) {
  let trailWidget = $("<div>");
  trailWidget.html('<iframe style="width:100%; max-width:1200px; height:410px;" frameborder="0" scrolling="no" src="https://www.mtbproject.com/widget?v=3&map=1&type=trail&id=' + trailId + '&z=6"></iframe>')
  $(".trailModal").empty();
  $(".trailModal").append(trailWidget);
  $('#modal1').modal('open');
}

// function to call back google for specific details on a brewery using the place ID
function breweryDetails(breweryId) {
  var request = {
    placeId: breweryId,
    fields: ['url', 'website', 'name', 'formatted_address', 'formatted_phone_number', 'photos', 'rating']
  };

  var service = new google.maps.places.PlacesService(map);
  service.getDetails(request, placeDetails)

  // this function was originally nested becuase it needed access to variables that were sent to the function breweryDetails - that is no longer the case, but I have left it nested
  function placeDetails(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log(place);
      let name = place.name
      let rating = place.rating;
      const starTotal = 5;
      const starPercentage = (rating / starTotal) * 100;
      const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
      $(".stars-inner").css("width", starPercentageRounded);
      let address = place.formatted_address;
      let phoneNum = place.formatted_phone_number;
      let webSite = place.website;
      let webLink = $("<a>");
      webLink.attr({"href": webSite, "target": "_blank"});
      webLink.text(name)
      
      $("#brewNameModal").text(name);
      $("#brewPhoneModal").text(phoneNum);
      $("#brewAdressModal").html(address + '<br>');
      $("#brewAdressModal").append(webLink);

      $(".carousel").empty();
      if (place.photos == null){
        for (let i = 0; i < 1; i++){
          let cAnchor = $("<a>");
          cAnchor.addClass("carousel-item")
          cAnchor.attr("href", "#one!")
          let defaultImg = $("<img>").attr({"src": "assets/images/Copper-Moonshine-Still-3.jpg", "width": "300px"});
          cAnchor.append(defaultImg);
          $(".carousel").append(cAnchor);
        }
      }else{
        for ( let i = 0; i < place.photos.length; i++){
          let height = place.photos[i].height;
          let width = place.photos[i].width;
          let ratio = height / width;
          if (ratio < 1.4){
            let pURL = place.photos[i].getUrl();
            let cAnchor = $("<a>");
            cAnchor.addClass("carousel-item")
            cAnchor.attr({"href": webSite, "target": "_blank"});
            let cImg = $("<img>");
            cImg.attr("src", pURL);
            cAnchor.append(cImg);
            $(".carousel").append(cAnchor)
          }        
        }
        scroll = setInterval(timer, 4000)
      }
      $('#modalBrewery').modal('open');
      initCarouselModal();
    }
  };
}

// function to initialize the carousel - it needs to be initialized after the modal is opened becuase when the model is hidden its height is 0 and this causes problems with the carousel
function initCarouselModal() {
  var elems = document.querySelectorAll('.carousel');
  var instances = M.Carousel.init(elems, {
    numVisible: 1,
    fullWidth: true,
    indicators: true,
  });
  instances[0].set(2);
}

// this is the function to automatically advance the carousel to the next image
function timer(){
  $('.carousel').carousel('next');
}

// receives brewery info from google places, populates brewery array and updates DOM list of breweries
function brewList(breweryInfoArr) {
  $(".breweryList").empty();
  for (var i = 0; i < breweryInfoArr.length; i++) {
    var breweryName = breweryInfoArr[i].name;
    var breweryIndex = breweryInfoArr[i].dataIndex;
    var brewItem = $("<li>");
    var brewLink = $('<a href="#!">' + breweryName + '</a>');
    brewLink.attr("data-index", breweryIndex);
    brewLink.addClass('listData');
    brewItem.append(brewLink);
    $(".breweryList").append(brewItem);
  }
}

// activates various button click functionalities
function buttonClick() {
  $("#coordinateSubmit").click(function (event) {
    event.preventDefault();
    let x = $("#coordinateInput").val();
    if (x == "") {
      geoCall(distance());
    } else {
      coordinateCall(x, distance());
    }
  })

  $('.clearSearch').click(function () {
    $('#coordinateInput').val("");
  })

  $(document).on("click", ".listData", function () {
    let markerIndex = $(this).attr("data-index")
    let marker = markers[markerIndex];
    let latln = marker.getPosition();
    let lat = latln.lat();
    let lon = latln.lng();
    panZoom(lat, lon)
    infoWindowPopup(marker);
  })
}

// add info to the map marker info window
function infoWindowPopup(marker) {
  if (marker.type == "trail") {
    infowindow.setContent('<div class = "popUp">' +
      '<strong>' + marker.title + '</strong><br>' +
      '</div>' +
      '<button class="btn waves-effect waves-light btn-small" type="button" name="action" class="trailDetails" onclick="trailDetails(' + marker.id + ')">More Info</button>'
    )
    // infowindow.open(map, marker);
  } else {
    let mID = marker.id
    infowindow.setContent('<div class = "popUp">' +
      '<strong>' + marker.title + '</strong><br>' +
      marker.address + '<br>' +
      '<button class="btn waves-effect waves-light btn-small" type="button" name="action" class="trailDetails" onclick="breweryDetails(`' + mID + '`)">More Info</button>' +
      '</div>')
  }
  $(".gm-style-iw").parent().css({"background-color": "red"});
  infowindow.open(map, marker);
}

// pans map to map marker when selecting from one of the lists
function panZoom(lat, lon) {
  lat = parseFloat(lat);
  lon = parseFloat(lon);
  let markerLoc = {
    lat: lat,
    lng: lon
  };
  map.panTo(markerLoc);
  map.setZoom(14);
}

// distance input validation
var distance = function(){
    let d = $("#dist").val();
    if (d > 50){
        d = 50;
        $("#dist").val("50");
    }
    else if (d < 0){
        d = 1;
        $("#dist").val("1");
    }
    else if (d == ""){
    d = 10;
    };
    return d;
}

// hides the splash screen after a set amount of time then shows the app
function splashScreen() {
  setTimeout(function () {
    $("#splashScreen").slideUp(500);
    $("#appContent").fadeIn(1000);
    $("footer").fadeIn(1000);
    buttonClick();
    geoCall(distance());
  }, 1000);
}

// This stops the scroll fucntion of carousel once the modal is closed
function stopScroll(){
  clearInterval(scroll);
}



// document on ready
$(document).ready(function () {
  splashScreen();
  $('.dropdown-trigger').dropdown();
  $('.collapsible').collapsible();
  $('.modal').modal({'onCloseEnd': stopScroll})

  // end of doc ready
});