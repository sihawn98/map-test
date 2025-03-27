mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhd252YW5kZXJiaWx0IiwiYSI6ImNtOGtoa2txNjB6MmkycW9uNTQwZHJsd2EifQ.4zB2BZofOU9UUT6cQOKgsQ';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [127.061, 37.511],
  zoom: 16
});

let start = null, end = null, waypoints = [];

map.on('click', (e) => {
  const coords = [e.lngLat.lng, e.lngLat.lat];
  const popup = new mapboxgl.Popup().setLngLat(coords);
  const container = document.createElement('div');
  const setStart = document.createElement('button');
  setStart.innerText = '출발지로 설정';
  setStart.onclick = () => {
    start = coords;
    drawRoute();
    popup.remove();
  };
  const setEnd = document.createElement('button');
  setEnd.innerText = '도착지로 설정';
  setEnd.onclick = () => {
    end = coords;
    drawRoute();
    popup.remove();
  };
  container.appendChild(setStart);
  container.appendChild(document.createElement('br'));
  container.appendChild(setEnd);
  popup.setDOMContent(container).addTo(map);
});

async function drawRoute() {
  if (!start || !end) return;
  const coords = [start, ...waypoints, end].map(c => c.join(',')).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  const route = data.routes[0].geometry;
  const duration = data.routes[0].duration;

  if (map.getSource('route')) {
    map.getSource('route').setData({ type: 'Feature', geometry: route });
  } else {
    map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: route } });
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#33c9ff',
        'line-width': 5
      }
    });
  }

  document.getElementById('startName').innerText = '선택됨';
  document.getElementById('endName').innerText = '선택됨';
  document.getElementById('duration').innerText = formatDuration(duration);
  document.getElementById('waypoints').innerText = waypoints.length > 0 ? waypoints.length + '개' : '없음';
  document.getElementById('sidebar').classList.remove('hidden');
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}시간 ${min}분` : `${min}분`;
}

function closeSidebar() {
  document.getElementById('sidebar').classList.add('hidden');
}
