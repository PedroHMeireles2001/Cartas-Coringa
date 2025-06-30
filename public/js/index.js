

function play() {
    const nick = document.getElementById('nick').value.trim();
    const gameId = document.getElementById('partidaId').value.trim();

    if (!nick || !gameId) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    window.location.href = `/game/${gameId}`;
}

function createGame() {
    const nick = document.getElementById('nick').value.trim();

    if (!nick) {
        alert('Por favor, preencha o campo Nick.');
        return;
    }

    axios.post('/game/create', { nick })
        .then(response => {
            const gameCode = response.data.code;
            window.location.href = `/game/${gameCode}`;
        })
        .catch(error => {
            console.error('Erro ao criar o jogo:', error);
            alert('Erro ao criar o jogo. Tente novamente.');
        });
}