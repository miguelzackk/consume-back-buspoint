async function buscarOnibus() {
  const linha = document.getElementById("linha").value;
  const endereco = document.getElementById("endereco").value;
  const sentido = document.getElementById("sentido").value;
  const resultado = document.getElementById("resultado");

  if (!linha || !endereco || !sentido) {
<<<<<<< HEAD
    resultado.innerHTML = "⚠️ Preencha todos os campos!";
    return;
=======
      resultado.innerHTML = "⚠️ Preencha todos os campos!";
      return;
>>>>>>> a0884bf72e691fe56bb8ecf3cb3850f85910186b
  }

  resultado.innerHTML = "🔄 Carregando...";
  console.log("🟢 Enviando requisição para API...");

  const url = `${API_URL}/busca?linha=${linha}&endereco=${encodeURIComponent(endereco)}&sentido=${sentido}`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("🔵 Resposta recebida:", data);

      if (data.erro) {
          resultado.innerHTML = `❌ Erro: ${data.erro}`;
          return;
      }

      resultado.innerHTML = `
          ✅ <strong>Linha:</strong> ${data.linha} <br>
          🚏 <strong>Paradas encontradas:</strong> ${data.paradas.length} <br>
      `;

      desenharRotaNoMapa(data.paradas);

  } catch (error) {
      resultado.innerHTML = "❌ Erro ao buscar informações.";
      console.error("🔴 Erro na requisição:", error);
  }
}

function desenharRotaNoMapa(paradas) {
  if (!map) return;

  const waypoints = paradas.map(parada => ({
      location: new google.maps.LatLng(parada.lat, parada.lng),
      stopover: true
  }));

  if (waypoints.length < 2) {
      console.error("Não há paradas suficientes para criar uma rota.");
      return;
  }

  const origem = waypoints.shift().location;
  const destino = waypoints.pop().location;

  directionsService.route({
      origin: origem,
      destination: destino,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING
  }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
      } else {
          console.error("❌ Erro ao calcular a rota:", status);
      }
  });
}
<<<<<<< HEAD

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
=======
>>>>>>> a0884bf72e691fe56bb8ecf3cb3850f85910186b
