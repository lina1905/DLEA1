// Klassifikator initialisieren
let classifier;

window.onload = function () {
    classifier = ml5.imageClassifier('MobileNet', () => {
        console.log("Model bereit.");
        classifyAllExampleImages();
    });
};

// Funktion zum Klassifizieren und Diagramm erzeugen
function classifyImage(imgElement, canvasElement) {
    if (!classifier) {
        console.warn("Classifier noch nicht geladen.");
        return;
    }

    if (!imgElement || !canvasElement) {
        console.warn("Bild oder Canvas nicht gefunden.");
        return;
    }

    classifier.classify(imgElement, (err, results) => {
        if (err) {
            console.error("Fehler bei Klassifikation:", err);
            return;
        }

        if (!Array.isArray(results)) {
            console.warn("Erwartete Klassifikationsergebnisse, aber Format war falsch:", results);
            return;
        }

        console.log("Klassifikationsergebnisse:", results);

        const labels = results.map(r => r.label);
        const confidences = results.map(r => Math.round(r.confidence * 100));

        renderChart(canvasElement, labels, confidences);
    });

}

// Alle Beispielbilder klassifizieren
function classifyAllExampleImages() {
    const imagePairs = document.querySelectorAll('.image-chart-pair');

    imagePairs.forEach(pair => {
        const img = pair.querySelector('img');
        const canvas = pair.querySelector('canvas');

        if (img && canvas) {
            if (img.complete) {
                // Bild ist schon geladen
                classifyImage(img, canvas);
            } else {
                // Bild ist noch nicht geladen → warte auf 'load' Event
                img.addEventListener('load', () => {
                    classifyImage(img, canvas);
                });
            }
        }
    });
}


function renderChart(canvas, labels, confidences) {
    console.log("Canvas zum Zeichnen:", canvas);
    console.log("Labels:", labels);
    console.log("Confidences:", confidences);

    if (!canvas) {
        console.warn("Kein Canvas übergeben!");
        return;
    }

    const adjustedLabels = labels.map(label => {
        const parts = label.split(',');
        return parts.length > 2 ? parts.slice(0, 3).join(',') : label;
    });

    const wrappedLabels = adjustedLabels.map(label =>
        label.replace(/(.{1,24})(\s|$)/g, '$1<br>').trim()
    );
    // Erstelle das Plotly-Diagramm
    const trace = {
        x: labels,
        y: confidences,
        type: 'bar',
        text: confidences.map(String), // Direkte Labels
        textposition: 'auto',
        hoverinfo: 'none',
        marker: {
            color: '#FAB17C',
            opacity: 1,
            line: {
                color: 'rgb(8,48,107)',
                width: 1.5
            }
        }
    };

    const data = [trace];

    const layout = {
        barmode: 'stack',
        xaxis: {
            tickfont: { color: '#FFFFFF' },
            tickvals: labels,
            ticktext: wrappedLabels
        },
        yaxis: {
            title: 'Confidence (%)',
            tickfont: { color: '#FFFFFF' },
            range: [0, 100] // Achse immer von 0 bis 100
        },
        plot_bgcolor: '#2E3150',
        paper_bgcolor: '#2E3150',
        font: { color: '#FFFFFF' },
        margin: {
            t: 0,
        }
    };

    // Plotly benötigt eine ID, daher ersetze das Canvas durch ein Div
    const chartContainer = document.createElement('div');
    chartContainer.id = canvas.id; // Behalte die ID bei
    canvas.replaceWith(chartContainer);

    Plotly.newPlot(chartContainer.id, data, layout);
}

// Event-Listener für Datei-Upload
const imageUpload = document.getElementById('imageUpload');
const classifyButton = document.getElementById('classifyButton');
const userImagePreview = document.getElementById('user-image-preview');
const userChart = document.getElementById('user-chart');

function showImageChartPair() {
    const imageChartPair = document.querySelector('.user-upload .image-chart-pair');
    if (imageChartPair) {
        imageChartPair.style.display = 'flex'; // Zeige das Element an
    }
}

// Bild hochladen und anzeigen
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert("Bitte laden Sie eine gültige Bilddatei hoch.");
            return;
        }
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src); // Speicher freigeben
        };
        img.id = 'uploaded-image';
        img.style.width = 'auto';
        img.style.height = '200px';
        img.style.borderRadius = '4px'; // Optional: Styling
        userImagePreview.innerHTML = ''; // Vorherige Vorschau entfernen
        userImagePreview.appendChild(img); // Bild in die Vorschau einfügen

        showImageChartPair(); // Zeige das image-chart-pair-Element an

    } else {
        console.warn("Keine Datei ausgewählt.");
    }
});

// Hier die Drag-and-Drop-Logik einfügen
const dragAndDropArea = document.getElementById('drag-and-drop-area');

// Drag-and-Drop-Events
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
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert("Bitte ziehen Sie eine gültige Bilddatei.");
            return;
        }
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src); // Speicher freigeben
        };
        img.id = 'uploaded-image';
        img.style.width = 'auto';
        img.style.height = '200px';
        img.style.borderRadius = '4px'; // Optional: Styling
        userImagePreview.innerHTML = ''; // Vorherige Vorschau entfernen
        userImagePreview.appendChild(img); // Bild in die Vorschau einfügen

        showImageChartPair(); // Zeige das image-chart-pair-Element an

    } else {
        console.warn("Keine Datei gezogen.");
    }
});

const resetButton = document.getElementById('resetButton');

// Button standardmäßig ausblenden
resetButton.style.display = 'none';

// Klassifikation des hochgeladenen Bildes
classifyButton.addEventListener('click', () => {
    console.log("Classify-Button wurde geklickt."); // Debugging-Log

    if (!classifier) {
        console.error("Classifier ist noch nicht geladen.");
        return;
    }

    const img = document.getElementById('uploaded-image');
    if (!img) {
        console.warn("Kein Bild zum Klassifizieren gefunden.");
        return;
    }

    console.log("Starte Klassifikation für das Bild:", img);

    classifier.classify(img, (err, results) => {
        if (err) {
            console.error("Fehler bei der Klassifikation:", err);
            return;
        }

        console.log("Klassifikationsergebnisse:", results);

        const labels = results.map(r => r.label);
        const confidences = results.map(r => Math.round(r.confidence * 100));

        renderChart(userChart, labels, confidences);

        // Zeige den Reset-Button an
        resetButton.style.display = 'inline-block';
        classifyButton.style.display = 'none';
    });
});

// Event-Listener für Zurücksetzen
// Nachher
resetButton.addEventListener('click', () => {
    userImagePreview.innerHTML = ''; // Entferne das hochgeladene Bild

    // Entferne das Diagramm-Div und ersetze es durch ein neues Canvas
    const chartContainer = document.getElementById(userChart.id);
    if (chartContainer) {
        const newDiv = document.createElement('div');
        newDiv.id = userChart.id;
        chartContainer.replaceWith(newDiv);
    }

    // Setze das Upload-Element zurück
    imageUpload.value = ''; // Leere den Wert des Datei-Uploads

    const imageChartPair = document.querySelector('.user-upload .image-chart-pair');
    if (imageChartPair) {
        imageChartPair.style.display = 'none';
    }

    resetButton.style.display = 'none'; // Verstecke den Reset-Button
    classifyButton.style.display = 'inline-block'; // Zeige den Klassifizieren-Button wieder an
    console.log("Bild und Diagramm wurden zurückgesetzt.");
});