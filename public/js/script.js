// Aquí puedes cargar gráficos interactivos o manejar los sliders

document.getElementById("learningRate").addEventListener("input", (e) => {
    const tasa = e.target.value;
    console.log("Tasa de aprendizaje ajustada a:", tasa);
    // Puedes usar este valor para actualizar tu simulación RL
});
