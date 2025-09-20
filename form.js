// --- CONFIG ---
var SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL';  // from Apps Script deploy
var SHARED_TOKEN = 'CHANGE_ME_LONG_RANDOM';              // must match Code.gs

// --- Helpers ---
function $(sel){ return document.querySelector(sel); }
var msg = $('#msg');

$('#addItem').addEventListener('click', addRow);
document.addEventListener('click', function(e){
  if (e.target && e.target.matches('.rmItem')) {
    e.target.closest('.itemRow').remove();
  }
});

function addRow(){
  var row = document.createElement('div');
  row.className = 'itemRow';
  row.innerHTML =
    '<input class="itemName" placeholder="Item name" required />' +
    '<input class="itemQty" type="number" min="1" value="1" required />' +
    '<button type="button" class="rmItem">×</button>';
  $('#items').appendChild(row);
}

$('#orderForm').addEventListener('submit', function(e){
  e.preventDefault();
  msg.textContent = 'Sending…';

  var itemRows = document.querySelectorAll('.itemRow');
  var items = [];
  for (var i=0;i<itemRows.length;i++){
    var r = itemRows[i];
    var name = r.querySelector('.itemName').value.trim();
    var qty = Number(r.querySelector('.itemQty').value || 0);
    if (name && qty > 0) items.push({name:name, qty:qty});
  }
  if (!items.length) { msg.textContent = 'Add at least one item.'; return; }

  var payload = {
    token: SHARED_TOKEN,
    unit: $('#unit').value.trim(),
    requester: $('#requester').value.trim(),
    priority: $('#priority').value,
    grid: $('#grid').value.trim(),
    items: items,
    notes: $('#notes').value.trim(),
    origin: location.origin
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  })
  .then(function(res){ return res.json().then(function(data){ return {ok:res.ok, data:data, statusText:res.statusText}; }); })
  .then(function(r){
    if (r.ok && r.data.ok) {
      msg.textContent = 'Order submitted ✔ (ID: ' + r.data.id + ')';
      $('#orderForm').reset();
      var rows = document.querySelectorAll('.itemRow');
      for (var i=1;i<rows.length;i++) rows[i].remove(); // leave first row
    } else {
      msg.textContent = 'Error: ' + (r.data && r.data.error || r.statusText);
    }
  })
  .catch(function(err){
    msg.textContent = 'Network error: ' + err.message;
  });
});
