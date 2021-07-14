/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiYmVuZGl1bXBvcGUiLCJhIjoiY2ttcDF0c3luMjl3ODJvcWtjMTExcDB3bSJ9.CYQXZrYqUphm_yI67yy6xA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
