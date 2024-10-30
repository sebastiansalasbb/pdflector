// URL del archivo PDF (puede ser un archivo local cargado en tu servidor)
const pdfUrl = './Sisgere_V2.docx (2).pdf'; // Cambia esto a la ubicación de tu archivo PDF

// Configuración de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
// Configurar el worker desde el CDN de PDF.js (cdnjs en este caso)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = parseInt(localStorage.getItem('pageNumber')) || 1, // Cargar la última página leída, por defecto 1
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.getElementById('pdf-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Renderizar la página
 */
function renderPage(num) {
    pageRendering = true;

    // Obtener la página
    pdfDoc.getPage(num).then(function (page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Renderizar la página en el canvas
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        const renderTask = page.render(renderContext);

        // Al completar el renderizado
        renderTask.promise.then(function () {
            pageRendering = false;

            // Actualizar el número de página
            document.getElementById('page-num').textContent = num;

            // Si hay una página pendiente de renderizado, hacerlo ahora
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Guardar la página actual en localStorage
    localStorage.setItem('pageNumber', num);
}

/**
 * Cambiar a una página específica
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Mostrar la página siguiente
 */
document.getElementById('next-page').addEventListener('click', function () {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
});

/**
 * Mostrar la página anterior
 */
document.getElementById('prev-page').addEventListener('click', function () {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
});

// Cargar el documento PDF
pdfjsLib.getDocument(pdfUrl).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page-count').textContent = pdfDoc.numPages;

    // Renderizar la primera página
    renderPage(pageNum);
});
