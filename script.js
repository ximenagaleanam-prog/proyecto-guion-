document.addEventListener('DOMContentLoaded', () => {
    const textoGuion = document.getElementById('texto-guion');
    const archivoGuion = document.getElementById('archivo-guion');
    const idiomaSelector = document.getElementById('idioma-analisis');
    const analizarBtn = document.getElementById('analizar-btn');
    const resultadosSection = document.getElementById('resultados');
    const listaPalabras = document.getElementById('lista-palabras');
    const listaPersonajes = document.getElementById('lista-personajes');
    const generarSugerenciasBtn = document.getElementById('generar-sugerencias-btn');
    const textoSugerencias = document.getElementById('texto-sugerencias');
    const listaOracionesClave = document.getElementById('lista-oraciones-clave');
    const listaDialogosClave = document.getElementById('lista-dialogos-clave'); 

    // =========================================================
    // CONFIGURACIÓN DEL ENDPOINT DE VERCEL/GROQ
    // Esta es la ruta relativa a la función Serverless (api/server.js)
    // =========================================================
    const BACKEND_ENDPOINT = "/api/server/api/analisis-ia"; 

    // --- LISTAS DE STOPWORDS (Palabras a ignorar) ---
    const stopwords_es = new Set(['el', 'la', 'los', 'y', 'de', 'a', 'en', 'por', 'con', 'que', 'se', 'es', 'un', 'una', 'sus', 'mi', 'tu', 'v.o.', 'vo', 'o.s.', 'os', 'cont.', 's', 't', 'd', 'm', 'll', 've', 're', 'cut to', 'fade out', 'hombre', 'mujer', 'chico', 'chica', 'si', 'no', 'le', 'lo', 'su', 'es', 'son', 'al', 'del']);
    const stopwords_en = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'with', 'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'v.o.', 'vo', 'o.s.', 'os', 'cont\'d', 's', 't', 'm', 'll', 've', 're', 'd', 'contd', 'its', 'thats', 'cut to', 'fade to', 'man', 'woman', 'guy', 'girl', 'boy', 'kid', 'doctor', 'mr', 'mrs', 'ms', 'if', 'not', 'we', 'us', 'they', 'them', 'is', 'are', 'was', 'were']);

    function getStopwords(idioma) {
        return idioma === 'en' ? stopwords_en : stopwords_es;
    }

    // --- FUNCIÓN DE LIMPIEZA DE FORMATO (ROBUSTA) ---
    function limpiarTextoGuion(texto) {
        let textoLimpio = texto;
        textoLimpio = textoLimpio.replace(/[\0\uFEFF\u200B-\u200D\u2060\u202F\u3000]/g, ''); 
        textoLimpio = textoLimpio.replace(/\r\n|\r/g, '\n'); 
        textoLimpio = textoLimpio.replace(/\t/g, '    '); 
        textoLimpio = textoLimpio.replace(/[ ]{2,}/g, ' '); 
        textoLimpio = textoLimpio.replace(/(\n[ \t]*){3,}/g, '\n\n'); 
        textoLimpio = textoLimpio.trim(); 
        
        textoLimpio = textoLimpio.replace(/([A-Z.]{3,})([^A-Z.\n])/g, (match, p1, p2) => {
            if (p1.length > 5 && !p1.endsWith('.')) {
                 return p1 + '\n' + p2;
            }
            return match; 
        });
        return textoLimpio;
    }
    
    // =========================================================
    // LÓGICA DE GENERACIÓN DE ANÁLISIS CUALITATIVO (VÍA SERVERLESS FUNCTION)
    // =========================================================
    async function generarAnalisisCualitativo(guion, analisisCuantitativo) {
        textoSugerencias.innerHTML = '<p>Analizando el guion con Groq... ⏳</p>';
        
        try {
            const response = await fetch(BACKEND_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guion: guion,
                    analisisCuantitativo: analisisCuantitativo 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // El servidor devuelve el HTML generado por Groq
                return data.analysis; 
            } else {
                // Manejar errores del servidor
                console.error("Error del backend:", data.error);
                return `<p class="error-ia">🚨 Error del servidor: ${data.error || 'Fallo desconocido.'} Asegúrate de que tu clave GROQ_API_KEY esté correctamente configurada en las Variables de Entorno de Vercel.</p>`;
            }

        } catch (error) {
            console.error("Error de red o conexión:", error);
            return `<p class="error-ia">🔌 Error de conexión: Falló la llamada al endpoint ${BACKEND_ENDPOINT}. Verifica la URL y el estado de tu función Serverless en Vercel.</p>`;
        }
    }


    // Listener del botón para generar el feedback
    generarSugerenciasBtn.addEventListener('click', async () => {
        const guion = textoGuion.value.trim();
        if (guion.length < 50) {
            textoSugerencias.innerHTML = '<p>El guion es demasiado corto. Se requiere más de 50 palabras para el análisis.</p>';
            return;
        }

        const idiomaSeleccionado = idiomaSelector.value;
        const analisisCuantitativo = analizarTextoGuion(guion, idiomaSeleccionado);
        
        mostrarResultados(analisisCuantitativo);
        resultadosSection.style.display = 'block';
        
        const sugerenciasHTML = await generarAnalisisCualitativo(guion, analisisCuantitativo);

        textoSugerencias.innerHTML = `<div class="feedback-box">${sugerenciasHTML}</div>`;

        textoSugerencias.scrollIntoView({ behavior: 'smooth' });
    });


    // =========================================================
    // LÓGICA DE ANÁLISIS CUANTITATIVO
    // =========================================================

    // IMPLEMENTACIÓN DE AUTO-LIMPIEZA AL PEGAR O ESCRIBIR
    textoGuion.addEventListener('input', () => {
        const textoActual = textoGuion.value;
        const textoLimpio = limpiarTextoGuion(textoActual);
        if (textoActual !== textoLimpio) {
            textoGuion.value = textoLimpio;
        }
    });


    // --- LÓGICA DE LECTURA DE ARCHIVOS (MAMMOTH) ---
    archivoGuion.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) { return; }
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textoGuion.value = limpiarTextoGuion(e.target.result); 
                alert(`Archivo "${file.name}" (.txt) cargado y limpiado con éxito.`);
                archivoGuion.value = '';
            };
            reader.readAsText(file, 'UTF-8');
        } 
        else if (fileName.endsWith('.docx')) {
            if (typeof mammoth === 'undefined') {
                alert('ERROR: La librería Mammoth.js no está disponible.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        if (result.value.trim().length === 0) {
                            alert(`ADVERTENCIA: Archivo "${file.name}" cargado, pero Mammoth no pudo extraer texto legible. Por favor, COPIA Y PEGA el texto.`);
                            textoGuion.value = ''; 
                        } else {
                            textoGuion.value = limpiarTextoGuion(result.value); 
                            alert(`Archivo "${file.name}" (.docx) cargado y limpiado con éxito.`);
                        }
                    })
                    .catch(err => {
                        console.error('Error de conversión DOCX (Mammoth):', err);
                        alert(`Error grave al procesar el archivo .docx: ${err.message}.`);
                    });
            };
            reader.readAsArrayBuffer(file); 
        } 
        else {
            alert('Tipo de archivo no soportado. Por favor, usa .txt o .docx.');
        }
        archivoGuion.value = '';
    });
    
    // --- LÓGICA DE ANÁLISIS PRINCIPAL ---
    analizarBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        let guion = textoGuion.value.trim();
        const idiomaSeleccionado = idiomaSelector.value;
        
        if (guion.length === 0) {
            alert('Por favor, pega o sube un guion para analizar.');
            return;
        }

        guion = limpiarTextoGuion(guion);
        textoGuion.value = guion; 

        const analisis = analizarTextoGuion(guion, idiomaSeleccionado);
        
        mostrarResultados(analisis);
        
        resultadosSection.style.display = 'block';
        resultadosSection.scrollIntoView({ behavior: 'smooth' }); 
    });

    // --- Función Principal de Análisis Cuantitativo ---
    function analizarTextoGuion(texto, idioma) {
        const stopwords = getStopwords(idioma);
        const lineas = texto.split('\n');
        const dialogosPorPersonaje = {};
        let textoTotalDialogos = ''; 
        const frecuenciaPersonajes = {};
        let personajeActual = null;
        
        lineas.forEach((linea, index) => {
            const lineaTrim = linea.trim();
            const esPersonaje = lineaTrim === lineaTrim.toUpperCase() && lineaTrim.length > 2 && !/\d/.test(lineaTrim) && 
                                !['EXT.', 'INT.', 'FADE IN', 'CUT TO', 'DÍA', 'NOCHE', 'TRANSICIÓN', 'FADE OUT', 'APERTURA', 'CIERRE', 'TITLE', 'CONT.'].some(c => lineaTrim.startsWith(c));

            if (esPersonaje) {
                personajeActual = lineaTrim.split('(')[0].trim();
                frecuenciaPersonajes[personajeActual] = (frecuenciaPersonajes[personajeActual] || 0) + 1;
                if (!dialogosPorPersonaje[personajeActual]) {
                    dialogosPorPersonaje[personajeActual] = [];
                }
            } 
            else if (personajeActual && lineaTrim.length > 0) {
                const dialogoActual = dialogosPorPersonaje[personajeActual].length > 0 ? dialogosPorPersonaje[personajeActual][dialogosPorPersonaje[personajeActual].length - 1] : null;
                let dialogoLimpio = lineaTrim.replace(/\([^)]*\)/g, '').trim(); 

                if (dialogoActual && dialogoActual.end === index - 1) {
                     dialogoActual.texto += (dialogoActual.texto.length > 0 ? ' ' : '') + dialogoLimpio;
                     dialogoActual.end = index;
                } else if (!dialogoActual || (dialogoActual && dialogoActual.end < index - 1)) {
                    dialogosPorPersonaje[personajeActual].push({ texto: dialogoLimpio, start: index, end: index });
                }
                textoTotalDialogos += ' ' + dialogoLimpio;
            } else if (lineaTrim === '' || (!esPersonaje && lineaTrim.length > 0)) {
                personajeActual = null;
            }
        });

        // ANÁLISIS DE FRECUENCIA DE PALABRAS Y PERSONAJES
        const topPersonajes = Object.entries(frecuenciaPersonajes)
            .filter(([name]) => name.length > 2 && name.indexOf(' ') === -1)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        
        const personajesParaFiltrar = new Set();
        Object.keys(frecuenciaPersonajes).forEach(name => {
            personajesParaFiltrar.add(name.toLowerCase());
            name.toLowerCase().split(/\s+/).forEach(part => {
                if (part.length >= 3) { personajesParaFiltrar.add(part); }
            });
        });

        const frecuenciaPalabras = {};
        let textoLimpioAnalisis = textoTotalDialogos.toLowerCase();
        textoLimpioAnalisis = textoLimpioAnalisis.replace(/['`‘’]/g, ' ');
        textoLimpioAnalisis = textoLimpioAnalisis.replace(/[\.,\/#!$%\^&\*;:{}=\-_~()¡¿?""]/g, ' ');
        
        const palabras = textoLimpioAnalisis.split(/\s+/)
            .filter(word => word.length > 2 && !stopwords.has(word) && !personajesParaFiltrar.has(word));

        palabras.forEach(palabra => {
            frecuenciaPalabras[palabra] = (frecuenciaPalabras[palabra] || 0) + 1;
        });

        const topPalabras = Object.entries(frecuenciaPalabras)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);
        
        const top5Palabras = topPalabras.map(([word]) => word);

        // ANÁLISIS DE ORACIONES Y DIÁLOGOS CLAVE
        const oraciones = textoTotalDialogos.match(/[^\.!\?]+[\.!\?]/g) || [];
        const oracionesClavePonderadas = [];

        oraciones.forEach(oracion => {
            let oracionLimpia = oracion.toLowerCase().replace(/['`‘’]|[\.,\/#!$%\^&\*;:{}=\-_~()¡¿?""]/g, ' ');
            const longitud = oracionLimpia.split(/\s+/).length;
            let score = 0;
            score += top5Palabras.filter(word => oracionLimpia.includes(word)).length;
            if (oracion.includes('!') || oracion.includes('?')) score += 2; 
            if (longitud > 15) score += 1; 
            if (score >= 3) { oracionesClavePonderadas.push({ oracion: oracion.trim(), score: score }); }
        });
        
        oracionesClavePonderadas.sort((a, b) => b.score - a.score);
        const uniqueOracionesClave = [...new Set(oracionesClavePonderadas.map(item => item.oracion))].slice(0, 5);

        const dialogosClave = [];
        const topPersonajesNombres = topPersonajes.map(([nombre]) => nombre);
        
        topPersonajesNombres.slice(0, 2).forEach(personaje => {
            const dialogos = dialogosPorPersonaje[personaje] || [];
            const dialogosPonderados = [];

            dialogos.forEach(d => {
                const dialogoTexto = d.texto.toLowerCase();
                const longitud = dialogoTexto.length;
                let scorePalabrasClave = 0;
                top5Palabras.forEach(keyword => {
                    const safeKeyword = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    const matches = dialogoTexto.match(safeKeyword);
                    if (matches) { scorePalabrasClave += matches.length; }
                });

                const relevanciaScore = (scorePalabrasClave * 3) + (longitud / 50);

                if (relevanciaScore > 0) {
                    dialogosPonderados.push({ personaje: personaje, texto: d.texto, score: relevanciaScore });
                }
            });
            
            const dialogosOrdenados = dialogosPonderados
                .sort((a, b) => b.score - a.score)
                .slice(0, 2); 
                
            dialogosOrdenados.forEach(item => {
                dialogosClave.push({ personaje: item.personaje, dialogo: item.texto.substring(0, 250) + (item.texto.length > 250 ? '...' : '') });
            });
        });

        return { topPalabras, topPersonajes, oracionesClave: uniqueOracionesClave, dialogosClave: dialogosClave };
    }

    function mostrarResultados(analisis) {
        // Limpiar resultados anteriores
        listaPalabras.innerHTML = '';
        listaPersonajes.innerHTML = '';
        listaOracionesClave.innerHTML = '';
        listaDialogosClave.innerHTML = ''; 

        // Mostrar Palabras Clave
        analisis.topPalabras.forEach(([palabra, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${palabra}</strong>: ${count} veces`;
            listaPalabras.appendChild(li);
        });

        // Mostrar Personajes Principales
        analisis.topPersonajes.forEach(([personaje, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${personaje}</strong>: ${count} apariciones/diálogos`;
            listaPersonajes.appendChild(li);
        });
        
        // Mostrar Oraciones Clave
        analisis.oracionesClave.forEach(oracion => {
            const li = document.createElement('li');
            li.textContent = oracion;
            listaOracionesClave.appendChild(li);
        });

        // Mostrar Diálogos Clave
        analisis.dialogosClave.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.personaje}:</strong> ${item.dialogo}`;
            listaDialogosClave.appendChild(li);
        });
        
        // Manejo de listas vacías
        if (analisis.topPalabras.length === 0) listaPalabras.innerHTML = '<li>No se encontraron palabras clave significativas.</li>';
        if (analisis.topPersonajes.length === 0) listaPersonajes.innerHTML = '<li>No se encontraron personajes claros. Asegúrate de usar MAYÚSCULAS para los nombres.</li>';
        if (analisis.oracionesClave.length === 0) listaOracionesClave.innerHTML = '<li>No se encontraron oraciones con suficiente peso temático.</li>';
        if (analisis.dialogosClave.length === 0) listaDialogosClave.innerHTML = '<li>No se encontraron diálogos clave relevantes en los personajes principales.</li>';
    }
});
