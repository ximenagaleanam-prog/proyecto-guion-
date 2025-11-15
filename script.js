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
    // CONFIGURACIÓN DE LA API DE IA
    // ADVERTENCIA: Esta clave NO debe ser expuesta en un entorno de producción real (web pública). 
    // Para producción, la llamada DEBE hacerse a través de un servidor (backend).
    // =========================================================
    const YOUR_GEMINI_API_KEY = "TU_CLAVE_API_DE_GEMINI"; 
    const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    // --- FUNCIÓN PARA ESCAPAR CARACTERES ESPECIALES EN REGEXP ---
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // --- LISTAS DE STOPWORDS (Omitidas por brevedad, asume que están aquí) ---
    // NOTA: El código completo incluye las listas de stopwords que ya tenías.
    const stopwords_es = new Set(['el', 'la', 'los', 'y', 'de', 'a', 'en', 'por', 'con', 'que', 'se', 'es', 'un', 'una', 'sus', 'mi', 'tu', 'v.o.', 'vo', 'o.s.', 'os', 'cont.', 's', 't', 'd', 'm', 'll', 've', 're', 'cut to', 'fade out', 'hombre', 'mujer', 'chico', 'chica']);
    const stopwords_en = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'with', 'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'v.o.', 'vo', 'o.s.', 'os', 'cont\'d', 's', 't', 'm', 'll', 've', 're', 'd', 'contd', 'its', 'thats', 'cut to', 'fade to', 'man', 'woman', 'guy', 'girl', 'boy', 'kid', 'doctor', 'mr', 'mrs', 'ms']);

    function getStopwords(idioma) {
        return idioma === 'en' ? stopwords_en : stopwords_es;
    }


    // --- FUNCIÓN DE LIMPIEZA DE FORMATO (ULTRA-ROBUSTA) ---
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
    // LÓGICA DE GENERACIÓN DE ANÁLISIS CUALITATIVO (VÍA API SIMULADA)
    // =========================================================
    async function generarAnalisisCualitativo(guion, analisisCuantitativo) {
        // Bloque de advertencia si la clave no está configurada
        if (YOUR_GEMINI_API_KEY === "TU_CLAVE_API_DE_GEMINI") {
            return `
                <p class="nota">⚠️ **Integración No Activa:** Para obtener un análisis real, debes obtener una clave API de Gemini y reemplazar <code>"TU_CLAVE_API_DE_GEMINI"</code> en <code>script.js</code>. </p>
                
                <h3>Análisis Cualitativo Solicitado (Simulación):</h3>
                <p>El *prompt* enviado a la IA incluyó el guion y los siguientes datos cuantitativos para enriquecer el feedback:</p>
                <ul>
                    <li><strong>Personajes Principales:</strong> ${analisisCuantitativo.topPersonajes.map(p => p[0]).join(', ')}</li>
                    <li><strong>Temas Clave:</strong> ${analisisCuantitativo.topPalabras.map(p => p[0]).join(', ')}</li>
                </ul>
                <p>La IA habría generado un informe de tres puntos sobre **Conflicto Central, Tono Dramático y Sugerencias de Desarrollo**.</p>
                <p class="nota">Si estás usando un backend para ocultar la clave, asegúrate de que tu URL de *fetch* apunte a tu servidor.</p>
            `;
        }

        // --- PROMPT DE INGENIERÍA PARA EL ANÁLISIS CUALITATIVO ---
        const prompt = `
            Eres un analista de guiones profesional. Tu tarea es analizar el siguiente guion.
            Genera un informe cualitativo conciso y perspicaz.

            1. **Conflicto Central:** Identifica el principal conflicto dramático y las fuerzas opuestas.
            2. **Tono y Atmósfera:** Describe el tono dramático dominante (e.g., oscuro, ligero, irónico) y la atmósfera.
            3. **Sugerencias de Desarrollo:** Basándote en la frecuencia de las palabras clave, sugiere un área que podría ser desarrollada para fortalecer la voz de los personajes principales.
            
            Formatea tu respuesta estrictamente en HTML, usando solo etiquetas <ul>, <li> y <p>.

            ---
            
            **Guion (Primeros 5000 caracteres):**
            ${guion.substring(0, 5000)}
            
            **Análisis Cuantitativo (para referencia):**
            - Top Personajes: ${analisisCuantitativo.topPersonajes.map(p => `${p[0]} (${p[1]} diálogos)`).join('; ')}
            - Palabras Clave: ${analisisCuantitativo.topPalabras.map(p => `${p[0]} (${p[1]} veces)`).join('; ')}
        `;

        // -----------------------------------------------------------
        // ESTE BLOQUE SIMULA LA LLAMADA AL SERVIDOR/API REAL
        // -----------------------------------------------------------
        try {
            const response = await fetch(GEMINI_API_ENDPOINT + YOUR_GEMINI_API_KEY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { temperature: 0.7 }
                })
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error("Respuesta de Gemini inesperada:", data);
                return "<p>Error: No se pudo generar el análisis cualitativo. La respuesta de la API fue inválida o incompleta.</p>";
            }

        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            return `<p>Error de conexión: Falló la llamada a la API. Asegúrate de que tu clave es correcta, tienes habilitado el acceso a la API y no hay problemas de CORS.</p>`;
        }
    }


    // Listener del botón para generar el feedback
    generarSugerenciasBtn.addEventListener('click', async () => {
        const guion = textoGuion.value.trim();
        if (guion.length < 50) {
            textoSugerencias.innerHTML = '<p>El guion es demasiado corto. Se requiere más de 50 palabras para el análisis.</p>';
            return;
        }

        // 1. Ejecutar Análisis Cuantitativo
        const idiomaSeleccionado = idiomaSelector.value;
        const analisisCuantitativo = analizarTextoGuion(guion, idiomaSeleccionado);
        
        // 2. Mostrar resultados cuantitativos antes de la llamada a la IA
        mostrarResultados(analisisCuantitativo);
        resultadosSection.style.display = 'block';
        
        textoSugerencias.innerHTML = '<p>Analizando el guion con la IA... ⏳</p>';
        
        // 3. Generar Sugerencias Cualitativas usando la IA
        const sugerenciasHTML = await generarAnalisisCualitativo(guion, analisisCuantitativo);

        textoSugerencias.innerHTML = `<div class="feedback-box">${sugerenciasHTML}</div>`;

        textoSugerencias.scrollIntoView({ behavior: 'smooth' });
    });


    // =========================================================
    // LÓGICA DE ANÁLISIS CUANTITATIVO (Analizar, Mostrar, Listeners)
    // Se mantiene intacta.
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

        const topPersonajes = Object.entries(frecuenciaPersonajes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        
        const personajesParaFiltrar = new Set();
        Object.keys(frecuenciaPersonajes).forEach(name => {
            const lowerName = name.toLowerCase();
            personajesParaFiltrar.add(lowerName);
            lowerName.split(/\s+/).forEach(part => {
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
                    const safeKeyword = escapeRegExp(keyword);
                    const regex = new RegExp(`\\b${safeKeyword}\\b`, 'g');
                    const matches = dialogoTexto.match(regex);
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
        listaPalabras.innerHTML = '';
        listaPersonajes.innerHTML = '';
        listaOracionesClave.innerHTML = '';
        listaDialogosClave.innerHTML = ''; 

        analisis.topPalabras.forEach(([palabra, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${palabra}</strong>: ${count} veces`;
            listaPalabras.appendChild(li);
        });

        analisis.topPersonajes.forEach(([personaje, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${personaje}</strong>: ${count} apariciones/diálogos`;
            listaPersonajes.appendChild(li);
        });
        
        analisis.oracionesClave.forEach(oracion => {
            const li = document.createElement('li');
            li.textContent = oracion;
            listaOracionesClave.appendChild(li);
        });

        analisis.dialogosClave.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.personaje}:</strong> ${item.dialogo}`;
            listaDialogosClave.appendChild(li);
        });
        // Manejo de errores de lista vacía omitido por brevedad, el código anterior lo maneja.
    }
});
