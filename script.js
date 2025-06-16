function goToLogin() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

async function submitLogin() {
    console.log("🟢 submitLogin() wurde aufgerufen");
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('loginError');
    errorMsg.style.display = 'none';

    try {
        const response = await fetch('https://mwcback-production.up.railway.app/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('Groupes à stocker dans localStorage:', data.gruppen);
            localStorage.setItem('username', username);
            localStorage.setItem('gruppen', JSON.stringify(data.gruppen));
            window.location.href = 'menu.html';
        } else {
            errorMsg.textContent = 'Falscher Benutzername oder falsches Passwort';
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMsg.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        errorMsg.style.display = 'block';
    }
}

// -------------------- 🔽 Noten Page Logic 🔽 --------------------

const markFieldNames = {
    "Testergebnis_A1_x002e_1": "Testergebnis A1.1",
    "Testergebnis_A1_x002e_2": "Testergebnis A1.2",
    "Testergebnis_A2_x002e_1": "Testergebnis A2.1",
    "Testergebnis_A2_x002e_2": "Testergebnis A2.2",
    "Bemerkung_Testergebnis_A1_x002e_": "Bemerkung A1.1",
    "Bemerkung_Testergebnis_A1_x002e_0": "Bemerkung A1.2",
    "Bemerkung_Testergebnis_A2_x002e_": "Bemerkung A2.1",
    "Bemerkung_Testergebnis_A2_x002e_0": "Bemerkung A2.2",
    "zweiter_Testergebnis_A1_x002e_1": "Zweiter A1.1",
    "zweiter_Testergebnis_A1_x002e_2": "Zweiter A1.2",
    "zweiter_Testergebnis_A2_x002e_1": "Zweiter A2.1",
    "zweiter_Testergebnis_A2_x002e_2": "Zweiter A2.2",
    "Bemerkung_zweiter_Testergebnis_A": "Bemerkung Zweiter A1.1",
    "Bemerkung_zweiter_Testergebnis_A0": "Bemerkung Zweiter A1.2",
    "Bemerkung_zweiter_Testergebnis_A1": "Bemerkung Zweiter A2.1",
    "Bemerkung_zweiter_Testergebnis_A2": "Bemerkung Zweiter A2.2",
    "Testergebnis_B1": "Testergebnis B1",
    "Bemerkung_Testergebnis_B1": "Bemerkung B1"
};

let candidatesList = [];
let currentCandidateIndex = -1;
let currentCandidateId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const group = localStorage.getItem('selectedGroup');
    if (!group) return;

    const res = await fetch('https://mwcback-production.up.railway.app/get-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group })
    });

    const username = localStorage.getItem('username');

    if (username) {
        fetch('https://mwcback-production.up.railway.app/get-teacher-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('profName').textContent = data.name || username;
        })
        .catch(err => {
            console.error("❌ Fehler beim Laden des Lehrernamens:", err);
            document.getElementById('profName').textContent = username;
        });
    }

    document.getElementById('groupName').textContent = localStorage.getItem('selectedGroup') || '';
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('de-DE');

    const data = await res.json();
    candidatesList = data.candidates.map(c => `${c.vorname} ${c.nachname}`);

    const select = document.getElementById('candidateSelect');
    const defaultOption = document.createElement('option');
    defaultOption.text = '--- Bitte auswählen ---';
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    candidatesList.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });

    select.addEventListener('change', loadCandidateData);
});

async function loadCandidateData() {
    const fullName = document.getElementById('candidateSelect').value;
    const group = localStorage.getItem('selectedGroup');
    if (!fullName || !group) return;

    const res = await fetch('https://mwcback-production.up.railway.app/get-candidate-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, group })
    });

    const data = await res.json();
    currentCandidateId = data.id;
    const fields = data.fields;

    const form = document.getElementById('marksForm');
    const fieldContainer = document.getElementById('markFields');
    fieldContainer.innerHTML = '';
    form.classList.remove('hidden');

    Object.entries(markFieldNames).forEach(([fieldKey, label]) => {
        const value = fields.hasOwnProperty(fieldKey) ? fields[fieldKey] : '';
        const input = document.createElement('input');
        input.type = 'text';
        input.name = fieldKey;
        input.value = value ?? '';
        input.placeholder = label;

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.appendChild(input);
        labelEl.classList.add('form-field');

        fieldContainer.appendChild(labelEl);
    });

    currentCandidateIndex = candidatesList.indexOf(fullName);
}

async function saveCurrentCandidate() {
    const formElements = document.getElementById('marksForm').elements;
    const updatedFields = {};

    for (let el of formElements) {
        if (el.name && el.value !== undefined && el.value !== '') {
            updatedFields[el.name] = el.value;
        }
    }

    console.log("🔄 Updating fields for candidate ID", currentCandidateId, updatedFields);

    const res = await fetch('https://mwcback-production.up.railway.app/update-candidate-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: currentCandidateId,
            updatedFields
        })
    });

    if (res.ok) {
        console.log("✅ Noten gespeichert");
    } else {
        alert("❌ Fehler beim Speichern.");
    }

    return res.ok;
}

async function saveAndNext() {
    const success = await saveCurrentCandidate();
    if (!success) return;

    if (currentCandidateIndex + 1 < candidatesList.length) {
        const nextName = candidatesList[currentCandidateIndex + 1];
        document.getElementById('candidateSelect').value = nextName;
        loadCandidateData();
    } else {
        alert("✅ Alle Kandidaten bearbeitet.");
    }
}

async function saveAndExit() {
    const success = await saveCurrentCandidate();
    if (success) {
        window.location.href = 'success.html';
    }
}
