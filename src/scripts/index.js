const API_URL = "http://localhost:3000";
let map, directionsService, directionsRenderer;

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("buscarBtn").addEventListener("click", buscarOnibus);
  carregarGoogleMaps();
});

function carregarGoogleMaps() {
  const script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCaAj4Ikdtf6B-OS6zkPYRlCa4DxUl0N9k&callback=initMap";
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

async function buscarOnibus() {
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

    resultado.innerHTML = `
              🚏 <strong>Parada mais próxima:</strong> ${data.parada} <br>
              🕐 <strong>Tempo estimado:</strong> ${data.tempo_estimado_min} min <br>
              📍 <strong>Ônibus está em:</strong> ${data.localizacao_onibus}
          `;

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
