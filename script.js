// Initialisierung
let classifier;

window.onload = () => {
    classifier = ml5.imageClassifier('MobileNet', () => {
        console.log("Model bereit.");
        classifyAllExampleImages();
    });
};

// Hilfsfunktionen
function toggleElementDisplay(selector, displayStyle) {
    const element = document.querySelector(selector);
    if (element) element.style.display = displayStyle;
}

function resetElementContent(selector) {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = '';
}

function createImageElement(file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    img.id = 'uploaded-image';
    img.style.width = 'auto';
    img.style.height = '200px';
    img.style.borderRadius = '4px';
    return img;
}

function renderChart(canvas, labels, confidences) {
    const wrappedLabels = labels.map(label =>
        label.replace(/(.{1,24})(\s|$)/g, '$1<br>').trim()
    );

    const trace = {
        x: labels,
        y: confidences,
        type: 'bar',
        text: confidences.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        marker: {
            color: '#FAB17C',
            opacity: 1,
            line: { color: 'rgb(8,48,107)', width: 1.5 }
        }
    };

    const layout = {
        barmode: 'stack',
        xaxis: { tickfont: { color: '#FFFFFF' }, tickvals: labels, ticktext: wrappedLabels },
        yaxis: { title: 'Confidence (%)', tickfont: { color: '#FFFFFF' }, range: [0, 100] },
        plot_bgcolor: '#2E3150',
        paper_bgcolor: '#2E3150',
        font: { color: '#FFFFFF' },
        margin: { t: 40, b: 50 }
    };

    const chartContainer = document.createElement('div');
    chartContainer.id = canvas.id;
    canvas.replaceWith(chartContainer);

    Plotly.newPlot(chartContainer.id, [trace], layout);
}

// Klassifikationslogik
function classifyImage(imgElement, canvasElement) {
    if (!classifier || !imgElement || !canvasElement) return;

    classifier.classify(imgElement, (err, results) => {
        if (err) return console.error("Fehler bei Klassifikation:", err);

        const labels = results.map(r => r.label);
        const confidences = results.map(r => Math.round(r.confidence * 100));
        renderChart(canvasElement, labels, confidences);
    });
}

function classifyAllExampleImages() {
    document.querySelectorAll('.image-chart-pair').forEach(pair => {
        const img = pair.querySelector('img');
        const canvas = pair.querySelector('canvas');
        if (img && canvas) {
            img.complete
                ? classifyImage(img, canvas)
                : img.addEventListener('load', () => classifyImage(img, canvas));
        }
    });
}

// Event-Listener
const imageUpload = document.getElementById('imageUpload');
const classifyButton = document.getElementById('classifyButton');
const resetButton = document.getElementById('resetButton');
const userImagePreview = document.getElementById('user-image-preview');
const userChart = document.getElementById('user-chart');
const dragAndDropArea = document.getElementById('drag-and-drop-area');

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        resetElementContent('#user-image-preview');
        userImagePreview.appendChild(createImageElement(file));
        toggleElementDisplay('.user-upload .image-chart-pair', 'flex');
    } else {
        alert("Bitte laden Sie eine gültige Bilddatei hoch.");
    }
});

dragAndDropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dragAndDropArea.classList.add('dragover');
});

dragAndDropArea.addEventListener('dragleave', () => {
    dragAndDropArea.classList.remove('dragover');
});

dragAndDropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dragAndDropArea.classList.remove('dragover');

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        resetElementContent('#user-image-preview');
        userImagePreview.appendChild(createImageElement(file));
        toggleElementDisplay('.user-upload .image-chart-pair', 'flex');
    } else {
        alert("Bitte ziehen Sie eine gültige Bilddatei.");
    }
});

classifyButton.addEventListener('click', () => {
    const img = document.getElementById('uploaded-image');
    if (img) {
        classifyImage(img, userChart);
        toggleElementDisplay('#resetButton', 'inline-block');
        toggleElementDisplay('#classifyButton', 'none');
    } else {
        console.warn("Kein Bild zum Klassifizieren gefunden.");
    }
});

resetButton.addEventListener('click', () => {
    resetElementContent('#user-image-preview');
    resetElementContent(`#${userChart.id}`);
    toggleElementDisplay('.user-upload .image-chart-pair', 'none');
    toggleElementDisplay('#resetButton', 'none');
    toggleElementDisplay('#classifyButton', 'inline-block');
    imageUpload.value = '';
    console.log("Bild und Diagramm wurden zurückgesetzt.");
});