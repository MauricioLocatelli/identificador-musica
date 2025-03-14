const recordBtn = document.getElementById('recordBtn');
const statusText = document.getElementById('status');
const resultDiv = document.getElementById('result');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext("2d");

let isRecording = false;
let mediaRecorder;
let audioChunks = [];

// Captura o áudio e inicia a visualização das ondas
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.fftSize = 2048;

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    isRecording = true;
    statusText.textContent = "🎤 Gravando... Identificando música...";
    recordBtn.textContent = "🔍 Identificando...";

    mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        audioChunks = [];
        statusText.textContent = "🎧 Enviando áudio para análise...";
        sendAudioToAPI(audioBlob);
    });

    // Função para desenhar as ondas sonoras
    function drawVisualizer() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        function draw() {
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = "#181818";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "#9121dc";

            canvasCtx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();

            if (isRecording) {
                requestAnimationFrame(draw);
            }
        }

        draw();
    }

    drawVisualizer();

    // Parar a gravação automaticamente após 10 segundos
    setTimeout(() => {
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            statusText.textContent = "🔍 Analisando...";
        }
    }, 10000);
}

// Envia o áudio para a API (Audd.io como exemplo)
async function sendAudioToAPI(audioBlob) {
    const formData = new FormData();
    formData.append("api_token", "174644c15d11e65e31898aedfee8cefe");
    formData.append("file", audioBlob);

    try {
        const response = await fetch("https://api.audd.io/", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log(data);

        if (data.status === "success" && data.result) {
            resultDiv.innerHTML = `🎶 Música: ${data.result.title} <br> 🎤 Artista: ${data.result.artist}`;
            statusText.textContent = "🎉 Música encontrada!";
        } else {
            resultDiv.textContent = "Música não reconhecida. 😢";
            statusText.textContent = "Tente novamente!";
        }

        // Atualiza o botão para permitir nova tentativa
        recordBtn.textContent = "🎧 Tentar novamente";
        isRecording = false;
    } catch (error) {
        console.error("Erro ao identificar a música:", error);
        resultDiv.textContent = "Erro ao conectar com a API!";
        statusText.textContent = "Falha na identificação!";
        recordBtn.textContent = "🎧 Tentar novamente";
        isRecording = false;
    }
}

// Botão de controle para iniciar a gravação
recordBtn.addEventListener("click", () => {
    if (!isRecording) {
        startRecording();
    }
});
