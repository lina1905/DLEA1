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


// Funktion zum Rendern der Charts
function renderChart(canvas, labels, confidences) {
    console.log("Canvas zum Zeichnen:", canvas);
    console.log("Labels:", labels);
    console.log("Confidences:", confidences);

    if (!canvas) {
        console.warn("Kein Canvas übergeben!");
        return;
    }

    const ctx = canvas.getContext('2d'); // Hole den Context des Canvas

    // Chart zuerst zurücksetzen, falls schon einer da ist
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    // Erstelle das Chart
    canvas.chartInstance = new Chart(ctx, {
        type: 'bar', // oder 'pie', je nach Bedarf
        data: {
            labels: labels,
            datasets: [{
                label: 'Confidence (%)',
                data: confidences,
                backgroundColor: '#1e88e5',
                borderColor: '#1565c0',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Event-Listener für Datei-Upload
const imageUpload = document.getElementById('imageUpload');
const classifyButton = document.getElementById('classifyButton');
const userImagePreview = document.getElementById('user-image-preview');
const userChart = document.getElementById('user-chart');

// Bild hochladen und anzeigen
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src); // Speicher freigeben
        };
        img.id = 'uploaded-image';
        img.style.width = '200px';
        img.style.borderRadius = '4px'; // Optional: Styling
        userImagePreview.innerHTML = ''; // Vorherige Vorschau entfernen
        userImagePreview.appendChild(img); // Bild in die Vorschau einfügen
    } else {
        console.warn("Keine Datei ausgewählt.");
    }
});

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
    });
});