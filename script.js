let participants = [];
let round = 1;

function addParticipant() {
  participants.push({ name: "", drink: "Bier", frequency: "elke", drinks: [], paid: false });
  saveData();
  renderParticipants();
}

function renderParticipants() {
  const div = document.getElementById("participants");
  div.innerHTML = "";

  const drinkOptions = ["Bier", "Wijn", "Fris", "Water", "Anders"];
  participants.forEach((p, index) => {
    const isOther = p.drink === "Anders" || (drinkOptions.indexOf(p.drink) === -1 && p.drink !== "");
    div.innerHTML += `
      <div style="display: flex; align-items: center; gap: 0.5em; flex-wrap: wrap;">
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
}

if (localStorage.getItem("participants")) {
  participants = JSON.parse(localStorage.getItem("participants"));
  round = parseInt(localStorage.getItem("round")) || 1;
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
    localStorage.clear(); // alles verwijderen
    document.getElementById("setup").style.display = "block";
    document.getElementById("rounds").style.display = "none";
    renderParticipants();
  }
}
