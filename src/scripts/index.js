const API_URL = "https://backend-buspoint.onrender.com";
const API_OLHO_VIVO_URL = "http://api.olhovivo.sptrans.com.br/v2.1";
let map, directionsService, directionsRenderer;
let isAuthenticated = false; // Flag para verificar se a autenticação foi bem-sucedida
const token = "b0ad167fe2fefcb3ba3f0676fc1d00fb5719bd38b72fcb0e6822780cfb838828"; // Substitua com o seu token de acesso

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("buscarBtn").addEventListener("click", buscarOnibus);
  carregarGoogleMaps();
});

function carregarGoogleMaps() {
  const script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyCaAj4Ikdtf6B-OS6zkPYRlCa4DxUl0N9k&callback=initMap";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 }, // Posição padrão (São Paulo)
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

// Função para autenticação
async function autenticar() {
  const url = `${API_OLHO_VIVO_URL}/Login/Autenticar?token=${token}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (data === true) {
      console.log("✅ Autenticação bem-sucedida!");
      isAuthenticated = true; // Define como autenticado
    } else {
      console.error("❌ Erro de autenticação.");
      isAuthenticated = false;
    }
  } catch (error) {
    console.error("❌ Erro ao autenticar:", error);
    isAuthenticated = false;
  }
}

// Função para buscar ônibus
async function buscarOnibus() {
  if (!isAuthenticated) {
    console.log("🔒 Realizando autenticação...");
    await autenticar(); // Autentica antes de fazer a busca
    if (!isAuthenticated) {
      return; // Se falhar a autenticação, não faz a busca
    }
  }

  const linha = document.getElementById("linha").value;
  const endereco = document.getElementById("endereco").value;
  const sentido = document.getElementById("sentido").value;
  const resultado = document.getElementById("resultado");

  if (!linha || !endereco || !sentido) {
    resultado.innerHTML = "⚠️ Preencha todos os campos!";
    return;
  }

  resultado.innerHTML = "🔄 Carregando...";
  console.log("🟢 Enviando requisição para API...");

  const url = `${API_URL}/busca?linha=${linha}&endereco=${encodeURIComponent(
    endereco
  )}&sentido=${sentido}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("🔵 Resposta recebida:", data);

    if (data.erro) {
      resultado.innerHTML = `❌ Erro: ${data.erro}`;
      return;
    }

    resultado.innerHTML = `🚏 <strong>Parada mais próxima:</strong> ${data.parada} <br>
                          🕐 <strong>Tempo estimado:</strong> ${data.tempo_estimado_min} min <br>
                          📍 <strong>Ônibus está em:</strong> ${data.localizacao_onibus}`;

    atualizarMapa(data);

    document.getElementById("linha").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("sentido").value = "";
  } catch (error) {
    resultado.innerHTML = "❌ Erro ao buscar informações.";
    console.error("🔴 Erro na requisição:", error);
  }
}

function atualizarMapa(data) {
  const onibusEndereco = data.localizacao_onibus;
  const paradaEndereco = data.parada;

  Promise.all([
    buscarCoordenadasPorEndereco(onibusEndereco),
    buscarCoordenadasPorEndereco(paradaEndereco),
  ]).then(([onibusPos, paradaPos]) => {
    if (!onibusPos || !paradaPos) {
      console.error("❌ Não foi possível obter as coordenadas.");
      return;
    }

    map.setCenter(onibusPos);
    map.setZoom(14);

    new google.maps.Marker({
      position: onibusPos,
      map,
      title: "Ônibus",
      icon: "https://maps.google.com/mapfiles/ms/icons/bus.png",
    });

    new google.maps.Marker({
      position: paradaPos,
      map,
      title: "Parada",
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });

    directionsService.route(
      {
        origin: onibusPos,
        destination: paradaPos,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error("❌ Erro ao calcular a rota:", status);
        }
      }
    );
  });
}

async function buscarCoordenadasPorEndereco(endereco) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        endereco
      )}&key=AIzaSyCaAj4Ikdtf6B-OS6zkPYRlCa4DxUl0N9k`
    );
    const data = await response.json();

    if (data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch (error) {
    console.error("❌ Erro ao buscar coordenadas:", error);
    return null;
  }
}
