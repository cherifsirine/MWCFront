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
