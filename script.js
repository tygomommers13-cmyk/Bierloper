
let participants = [];
let round = 1;
window.drinkOptions = JSON.parse(localStorage.getItem("drinkOptions")) || ["Bier", "Wijn", "Fris", "Water", "Anders"];


function addParticipant() {
  participants.push({ name: "", drink: window.drinkOptions[0], frequency: "elke", drinks: [], paid: true });
  saveData();
  renderParticipants();
}

function renderParticipants() {
  const div = document.getElementById("participants");
  div.innerHTML = "";

  const drinkOptions = window.drinkOptions;
  participants.forEach((p, index) => {
    const isOther = p.drink === "Anders" || (drinkOptions.indexOf(p.drink) === -1 && p.drink !== "");
    div.innerHTML += `
      <div style="display: flex; align-items: left; gap: 0.5em; flex-wrap: wrap;">
        <input type="text" placeholder="Naam" value="${p.name}" 
          onchange="updateParticipant(${index}, 'name', this.value)">
        <select onchange="handleDrinkChange(this, ${index})">
          ${drinkOptions.map(opt => `<option value='${opt}' ${p.drink === opt ? 'selected' : ''}>${opt}</option>`).join("")}
        </select>
        <span id="other-drink-${index}">
          ${isOther ? `<input type='text' placeholder='Eigen drankje' value='${(p.drink !== "Anders" && drinkOptions.indexOf(p.drink) === -1) ? p.drink : ""}' onchange='updateParticipant(${index}, \"drink\", this.value)'>` : ""}
        </span>
        <select onchange="updateParticipant(${index}, 'frequency', this.value)">
          <option value="elke" ${p.frequency === "elke" ? "selected" : ""}>Elke ronde</option>
          <option value="om de" ${p.frequency === "om de" ? "selected" : ""}>Om de ronde</option>
        </select>
        <label style="display: flex; align-items: center; gap: 0.2em; font-size: 0.95em;">
          <input type="checkbox" ${p.paid ? "checked" : ""} onchange="togglePaid(${index}, this.checked)"> Betaald
        </label>
        <button class="verwijder" onclick="removeParticipant(${index})">Verwijder</button>
      </div>
    `;
  });

  // Drankje toevoegen veld en knop + drankjes verwijderen (tweestaps)
  if (!document.getElementById("add-drink-section")) {
    const addDrinkDiv = document.createElement("div");
    addDrinkDiv.id = "add-drink-section";
    addDrinkDiv.innerHTML = `
      <input type="text" id="new-drink-input" placeholder="Nieuw drankje toevoegen" style="width:100%;margin-top:1em;">
      <button onclick="addDrinkOption()">Drankje toevoegen</button>
      <div style="margin-top:1em;">
        <button id="show-remove-drink-btn" onclick="showRemoveDrinkList()" style="background:#e74c3c;color:white;">Drankje verwijderen</button>
        <span id="remove-drink-list" style="display:none;"></span>
      </div>
    `;
    div.parentNode.insertBefore(addDrinkDiv, div.nextSibling);
  }
// Toon de lijst met drankjes om te verwijderen
window.showRemoveDrinkList = function() {
  const listSpan = document.getElementById("remove-drink-list");
  const options = window.drinkOptions.filter(opt => opt !== 'Anders');
  if (options.length === 0) {
    listSpan.innerHTML = '<em>Geen drankjes om te verwijderen.</em>';
    listSpan.style.display = 'block';
    return;
  }
  listSpan.innerHTML = `
    <select id="remove-drink-select" style="width:70%;margin-top:0.5em;">
      ${options.map(opt => `<option value='${opt}'>${opt}</option>`).join("")}
    </select>
    <button onclick="removeDrinkOption()" style="background:#dc3545;hover:#a71d2a;color:white;">Bevestig verwijderen</button>
    <button onclick="hideRemoveDrinkList()" style=>Annuleer</button>
  `;
  listSpan.style.display = 'inline-block';
}

window.hideRemoveDrinkList = function() {
  const listSpan = document.getElementById("remove-drink-list");
  listSpan.style.display = 'none';
}

window.removeDrinkOption = function() {
  const select = document.getElementById("remove-drink-select");
  const val = select.value;
  if (val && window.drinkOptions.includes(val)) {
    window.drinkOptions = window.drinkOptions.filter(opt => opt !== val);
    localStorage.setItem("drinkOptions", JSON.stringify(window.drinkOptions));
    // Zet bij deelnemers die dit drankje hadden het eerste drankje als fallback
    participants.forEach(p => {
      if (p.drink === val) p.drink = window.drinkOptions[0];
    });
    renderParticipants();
    hideRemoveDrinkList();
  }
}

  // Toon lijst van niet-betalers
  const unpaid = participants.filter(p => !p.paid && p.name.trim() !== "");
  let unpaidDiv = document.getElementById("unpaid-list");
  if (!unpaidDiv) {
    unpaidDiv = document.createElement("div");
    unpaidDiv.id = "unpaid-list";
    div.parentNode.appendChild(unpaidDiv);
  }
  if (unpaid.length > 0) {
    unpaidDiv.innerHTML = `<div style='margin-top:1em; color:#e74c3c;'><strong>Nog niet betaald:</strong> ${unpaid.map(p => p.name).join(", ")}</div>`;
  } else {
    unpaidDiv.innerHTML = "";
  }
// Voeg een nieuw drankje toe aan de lijst
window.addDrinkOption = function() {
  const input = document.getElementById("new-drink-input");
  const val = input.value.trim();
  if (val && !window.drinkOptions.includes(val)) {
    window.drinkOptions.splice(window.drinkOptions.length - 1, 0, val); // Voeg vóór 'Anders' toe
    localStorage.setItem("drinkOptions", JSON.stringify(window.drinkOptions));
    input.value = "";
    showDrinkAddedMessage(val);
    renderParticipants();
  }
// Tijdelijke melding bij toevoegen drankje
function showDrinkAddedMessage(drink) {
  let msg = document.getElementById('drink-added-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'drink-added-msg';
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.background = '#27ae60';
    msg.style.color = 'white';
    msg.style.padding = '0.7em 1.5em';
    msg.style.borderRadius = '6px';
    msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    msg.style.zIndex = '1000';
    document.body.appendChild(msg);
  }
  msg.textContent = `Drankje toegevoegd: ${drink}`;
  msg.style.display = 'block';
  clearTimeout(window._drinkMsgTimeout);
  window._drinkMsgTimeout = setTimeout(() => {
    msg.style.display = 'none';
  }, 2500);
}
}

// Zorg dat het inputveld voor 'Anders' verdwijnt als je een andere optie kiest
window.handleDrinkChange = function(selectElem, index) {
  const value = selectElem.value;
  if (value === "Anders") {
    updateParticipant(index, "drink", "Anders");
    document.getElementById(`other-drink-${index}`).innerHTML = `<input type='text' placeholder='Eigen drankje' onchange='updateParticipant(${index}, \"drink\", this.value)'>`;
  } else {
    updateParticipant(index, "drink", value);
    document.getElementById(`other-drink-${index}`).innerHTML = "";
  }
}
// Toggle betaalstatus
window.togglePaid = function(index, checked) {
  participants[index].paid = checked;
  saveData();
  renderParticipants();
}
}


function updateParticipant(index, field, value) {
  participants[index][field] = value;
  saveData();
}

function removeParticipant(index) {
  participants.splice(index, 1);
  saveData();
  renderParticipants();
}

function startRounds() {
  document.getElementById("setup").style.display = "none";
  document.getElementById("rounds").style.display = "block";
  showRound();
}

function showRound() {
  document.getElementById("round-title").innerText = `Ronde ${round}`;
  const list = document.getElementById("round-list");
  list.innerHTML = "";
  let totals = {};

  participants.forEach((p, index) => {
    const doDrink = p.frequency === "elke" || (p.frequency === "om de" && round % 2 === 1);

    if (doDrink) {
      list.innerHTML += `
        <div>
          <span><strong>${p.name}</strong>: ${p.drink}</span>
        </div>
      `;

      totals[p.drink] = (totals[p.drink] || 0) + 1;
      p.drinks.push({ round, drink: p.drink });
    }
  });

  let totalText = Object.entries(totals).map(([d, n]) => `${n} ${d}`).join(", ");
  document.getElementById("totals").innerText = totalText ? `Totaal: ${totalText}` : "Niemand dit rondje";
  saveData();
}


function updateDrink(index, drink) {
  participants[index].drink = drink;
  saveData();
  showRound(); // update het totaal
}

function nextRound() {
  round++;
  showRound();
}

function saveData() {
  localStorage.setItem("participants", JSON.stringify(participants));
  localStorage.setItem("round", round);
  localStorage.setItem("drinkOptions", JSON.stringify(window.drinkOptions));
}

if (localStorage.getItem("participants")) {
  participants = JSON.parse(localStorage.getItem("participants"));
  round = parseInt(localStorage.getItem("round")) || 1;
  window.drinkOptions = JSON.parse(localStorage.getItem("drinkOptions")) || window.drinkOptions;
  renderParticipants();
}

function resetRoundsOnly() {
  if (confirm("Wil je alleen de rondes resetten? De deelnemers blijven behouden.")) {
    round = 1;
    participants.forEach(p => p.drinks = []);
    localStorage.setItem("round", round);
    localStorage.setItem("participants", JSON.stringify(participants));
    document.getElementById("setup").style.display = "block";
    document.getElementById("rounds").style.display = "none";
    renderParticipants();
  }
}

function resetAll() {
  if (confirm("Weet je zeker dat je alles wilt resetten?")) {
    participants = [];
    round = 1;
    localStorage.clear();
    window.drinkOptions = ["Bier", "Wijn", "Fris", "Water", "Anders"];
    localStorage.setItem("drinkOptions", JSON.stringify(window.drinkOptions));
    document.getElementById("setup").style.display = "block";
    document.getElementById("rounds").style.display = "none";
    renderParticipants();
  }
}
