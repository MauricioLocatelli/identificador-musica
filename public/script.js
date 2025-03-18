const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");
const resultDiv = document.getElementById("result");

recordBtn.addEventListener("click", async () => {
  statusText.innerText = "🎧 Gravando...";

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];

  mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 5000);

  mediaRecorder.onstop = async () => {
    statusText.innerText = "Processando...";
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("/identify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      resultDiv.innerText = data.title
        ? `🎶 Música encontrada: ${data.artist} - ${data.title}`
        : "❌ Não foi possível identificar a música.";
    } catch (error) {
      resultDiv.innerText = "❌ Erro ao identificar a música.";
    }

    statusText.innerText = "✅ Pronto para outra música!";
  };
});
