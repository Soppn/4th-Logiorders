// --- CONFIG ---
var SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL';
var SHARED_TOKEN = 'CHANGE_ME_LONG_RANDOM';
var POLL_MS = 8000;

// --- State ---
var knownIds = new Set(JSON.parse(localStorage.getItem('knownOrderIds') || '[]'));
var lastSeenTime = Number(localStorage.getItem('facLastSeen') || 0);

function $(s){ return document.querySelector(s); }

function itemsText(arr){
  var out = [];
  for (var i=0;i<(arr||[]).length;i++){
    out.push(arr[i].name + ' x' + arr[i].qty);
  }
  return out.join('; ');
}

function toast(msg){
  var el = $('#toast');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function(){ el.style.display = 'none'; }, 3000);
}

function renderTable(orders) {
  var tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = '';
  for (var i=0;i<orders.length;i++){
    var o = orders[i];
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + (new Date(o.timestamp).toLocaleString ? new Date(o.timestamp).toLocaleString() : o.timestamp) + '</td>' +
      '<td>' + (o.unit||'') + '</td>' +
      '<td>' + (o.priority||'') + '</td>' +
      '<td>' + (o.grid||'') + '</td>' +
      '<td>' + itemsText(o.items) + '</td>' +
      '<td>' + (o.notes||'') + '</td>' +
      '<td>' + (o.status||'') + '</td>' +
      '<td>' + (o.id||'') + '</td>';
    if (!knownIds.has(o.id)) {
      tr.style.animation = 'flash 1.5s ease-in-out 1';
    }
    tbody.appendChild(tr);
  }
}

function loadAndAlert(){
  var status = $('#status') ? $('#status').value : '';
  var qs = 'token=' + encodeURIComponent(SHARED_TOKEN) +
           (status ? '&status=' + encodeURIComponent(status) : '') +
           (lastSeenTime ? '&since=' + encodeURIComponent(String(lastSeenTime)) : '') +
           '&origin=' + encodeURIComponent(location.origin);

  fetch(SCRIPT_URL + '?' + qs, {cache:'no-store'})
    .then(function(res){ return res.json(); })
    .then(function(data){
      var orders = data.orders || [];
      renderTable(orders);

      // detect new by ID
      var currentIds = new Set(orders.map(function(o){ return o.id; }));
      var newOnes = [];
      currentIds.forEach(function(id){ if (!knownIds.has(id)) newOnes.push(id); });

      if (newOnes.length) {
        toast(newOnes.length === 1 ? 'New logistics order received' : (newOnes.length + ' new logistics orders'));
        var ping = $('#ping'); if (ping && ping.play) ping.play().catch(function(){});
      }
      knownIds = currentIds;
      localStorage.setItem('knownOrderIds', JSON.stringify(Array.from(knownIds)));

      lastSeenTime = data.now || Date.now();
      localStorage.setItem('facLastSeen', String(lastSeenTime));
    })
    .catch(function(err){
      console.error('Load error:', err);
    });
}

function startPolling(){
  loadAndAlert();
  setInterval(loadAndAlert, POLL_MS);
}

document.addEventListener('DOMContentLoaded', function(){
  // styles for highlight
  var style = document.createElement('style');
  style.textContent = '@keyframes flash {0%{background:#153e2b} 100%{background:transparent}} table tr {transition: background-color .6s;}';
  document.head.appendChild(style);

  var reload = $('#reload');
  if (reload) reload.addEventListener('click', loadAndAlert);
  var statusSel = $('#status');
  if (statusSel) statusSel.addEventListener('change', function(){
    knownIds = new Set();
    localStorage.removeItem('knownOrderIds');
    loadAndAlert();
  });

  // request desktop notifications (optional)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  startPolling();
});
