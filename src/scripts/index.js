const API_URL = "https://backend-buspoint.onrender.com"; // 🔹 Backend na Render

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("buscarBtn").addEventListener("click", buscarOnibus);
});

async function buscarOnibus() {
    const linha = document.getElementById("linha").value;
    const endereco = document.getElementById("endereco").value;
    const sentido = document.getElementById("sentido").value;
    const resultado = document.getElementById("resultado");

    if (!linha || !endereco || !sentido) {
        resultado.innerHTML = "⚠️ Preencha todos os campos!";
        return;
    }

    resultado.innerHTML = "🔄 Carregando..."; // Mensagem de carregamento
    console.log("🟢 Enviando requisição para API...");

    const url = `${API_URL}/busca?linha=${linha}&endereco=${encodeURIComponent(endereco)}&sentido=${sentido}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("🔵 Resposta recebida:", data);

        if (data.erro) {
            resultado.innerHTML = `❌ Erro: ${data.erro}`;
        } else {
            resultado.innerHTML = `
         🚏 <strong>Parada mais próxima:</strong> ${data.parada} <br>
                🕐 <strong>Tempo estimado:</strong> ${data.tempo_estimado_min} min <br>
                📍 <strong>Ônibus está em:</strong> ${data.localizacao_onibus}
            `;
        }

        // 🔹 Resetando os inputs após a busca
        document.getElementById("linha").value = "";
        document.getElementById("endereco").value = "";
        document.getElementById("sentido").value = "";
        
    } catch (error) {
        resultado.innerHTML = "❌ Erro ao buscar informações.";
        console.error("🔴 Erro na requisição:", error);
    }
}