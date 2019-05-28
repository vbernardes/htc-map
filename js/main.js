(function(global) {
  'use strict';

  /* Utils */
  function fetchJSON(url) {
    return fetch(url)
      .then(function(response) {
        return response.json();
      });
  }

  function getQueries() {
    if(!location.search) return {};

    return location.search
      .replace('?', '')
      .split('&')
      .reduce(function(queries, current) {
        var splitted = current.split('=');
        queries[splitted[0]] = splitted[1];
        return queries;
      }, {});
  }


  var EXCLUDED_LAYERS = [];

  /* Variables (state) */
  var map;
  var layerControls;
  var cluster = L.markerClusterGroup({
    disableClusteringAtZoom: 4,
    spiderfyOnMaxZoom: false
  });
  var overlaysData = {
    chapters: {
      title: "Meetup Chapters",
      overlay: L.featureGroup.subGroup(cluster),
    }
  }
  var activeLayers = Object.keys(overlaysData).filter(function(key){
    return !EXCLUDED_LAYERS.includes(key);
  });
  var embedTextareaContent;

  /* Functions */
  function getAllOverlays(overlaysData) {
    return Object.keys(overlaysData)
      .reduce(function(overlays, currentOverlay){
        overlays[overlaysData[currentOverlay].title] = overlaysData[currentOverlay].overlay;
        return overlays;
      }, {});
  }

  function titleToKey(title) {
    return Object.keys(overlaysData)
      .filter(function(key){
        return (overlaysData[key].title == title)
      })
      .toString();
  }

  function isEmbedded() {
    if (window.self !== window.top) return true;

    return false;
  }

  function isValidOverlayQueries(overlaysData,defaultOverlays){
    return defaultOverlays.reduce(function(validQuery,currentQuery){
      return validQuery || Object.keys(overlaysData).includes(currentQuery);
    }, false);
  }

  function getInitialLayers(overlaysData, defaultOverlays, permanentLayers) {
    return Object.keys(overlaysData)
      .filter(function(currentOverlay) {
        if ((!defaultOverlays || !isValidOverlayQueries(overlaysData,defaultOverlays)) && EXCLUDED_LAYERS.includes(currentOverlay)) return false;
        if (!defaultOverlays || !isValidOverlayQueries(overlaysData,defaultOverlays)) return true;

        return defaultOverlays.indexOf(currentOverlay) !== -1;
      })
      .reduce(function(layers, currentOverlay) {
          layers.push(overlaysData[currentOverlay].overlay);
        return layers;
      }, permanentLayers || []);
  }

  function initMap(defaultOverlays) {
    var baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a> | &copy; <a href="https://github.com/humanetech-community" target="_blank">Humane Tech Community</a> (<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GPLv3</a>)',
      maxZoom: 18,
    });

    map = L.map('mapid', {
      center: [49.8158683, 6.1296751],
      zoom: 2,
      minZoom: 2,
      layers: getInitialLayers(overlaysData, defaultOverlays, [baseLayer, cluster]),
      worldCopyJump: true,
    });

    if (isEmbedded()) {
      map.scrollWheelZoom.disable();
      map.attributionControl.setPrefix('<a href="https://vbernardes.github.io/htc-map/" target="_blank">See bigger map</a> | Leaflet');
    } else {
      map.addControl(new L.Control.Fullscreen());
    }
  }

  function addPopupWithEmbedCode() {
    updateEmbedTextareaContent();
    var embedPopupContent = 'Embed code:<br>' +
      '<textarea autofocus cols="35" id="embed-textarea" readonly rows="3" wrap="off">' + embedTextareaContent + '</textarea>';
    L.popup({className: 'embed-popup'})
    .setLatLng(map.getCenter())
    .setContent(embedPopupContent)
    .openOn(map);
  }

  function updateEmbedTextareaContent() {
    embedTextareaContent = '<iframe src="https://vbernardes.github.io/htc-map/?show=' + activeLayers.toString() + '" width="100%" height="400" allowfullscreen="true" frameborder="0">\n' +
    '<p><a href="https://vbernardes.github.io/htc-map/?show=' + activeLayers.toString() + '" target="_blank">See the Humane Tech Community Map!</a></p>\n' +
    '</iframe>';
    try{
      document.getElementById('embed-textarea').value = embedTextareaContent;
    } catch(e) {
    };
  }

  function initControls() {
    layerControls = L.control.layers(null, getAllOverlays(overlaysData), {
      collapsed: false,
    });
    layerControls.addTo(map);

    // Add embed Control
    L.easyButton('<img src="resources/embed-icon.png">', function(btn,map){
      addPopupWithEmbedCode();
    },'Embed the map!').addTo(map);
  }

  function getDefaultOverlays() {
    var overlays = getQueries().show; //all queries after "show="
    if (!overlays) return null;

    return overlays.split(',');
  }

  function onMovestart(e) {
    if(!layerControls.collapsed) {
      layerControls.collapse();
    }
  }

  function onMousedown(e) {
    if(!map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.enable();
    }
  }

  function onMouseout(e) {
    if(map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.disable();
    }
  }

  function onOverlayadd(e) {
    activeLayers.push(titleToKey(e.name));
    updateEmbedTextareaContent();
  }

  function onOverlayremove(e) {
    activeLayers = activeLayers.filter(function(layer){
      return layer != titleToKey(e.name);
    });
    updateEmbedTextareaContent();
  }

  /* Main */
  var defaultOverlays = getDefaultOverlays();
  initMap(defaultOverlays);
  initControls();

  // Add listeners
  map.on('movestart', onMovestart);
  if (isEmbedded()) {
    map.on('mousedown', onMousedown);
    map.on('mouseout', onMouseout);
  }
  map.on('overlayadd', onOverlayadd);
  map.on('overlayremove', onOverlayremove);

  // Populate Meetup Chapters overlay
  fetchJSON('data/chapters.json')
    .then(function(json) {
      // Add a marker per Meetup city
      json.chaptersList.forEach(function(city) {

        // arg: username containing '@'
        function getHTCUserURL(username) {
          return 'https://community.humanetech.com/u/'+username.replace('@','')+'/summary';
        }

        var popupContent = '<p><strong>City:</strong> '+city.city+'</p> ';
        city.chapters.forEach(function(chapter) {
          var organizerList = [];
          chapter.organizers.forEach(function(organizer) {
            organizerList.push('<a href='+getHTCUserURL(organizer)+' target="_blank" rel="noopener">'+organizer+'</a>');
          });
          popupContent += '<p><strong>Organizer(s):</strong> '+organizerList.join(', ')+'<br>'+
                          '<strong><a href='+chapter.meetup_url+' target="_blank" rel="noopener">Meetup Link</a></strong>' +
                          '</p>';
        });

        var circle = L.circle(city.lat_lng, { radius: 30000, color: '#2ca7df', stroke:false, fillOpacity: 0.5 })
          .bindPopup(popupContent);
        circle.addTo(overlaysData.chapters.overlay);
      });
    });
}(this));
