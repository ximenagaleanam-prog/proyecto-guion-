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

    // --- LISTAS DE STOPWORDS (SIN CAMBIOS) ---
    const stopwords_es = new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 
        'y', 'e', 'o', 'u', 'ni', 'pero', 'mas', 'sino', 'porque', 
        'si', 'no', 'que', 'de', 'a', 'en', 'por', 'con', 'para', 
        'se', 'es', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'al', 
        'del', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os', 'esto', 
        'eso', 'aquel', 'aquella', 'aquellos', 'aquellas', 'aquí', 
        'ahí', 'allí', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 
        'ellos', 'ellas', 'ser', 'estar', 'haber', 'hay', 'es', 'está', 
        'soy', 'eres', 'somos', 'sois', 'son', 'fui', 'era', 'fue', 'como', 
        'cuando', 'donde', 'mientras', 'aunque', 'cuyo', 'cuyos', 'cuyas', 
        'vez', 'todo', 'toda', 'todos', 'todas', 'poco', 'poca', 'pocos', 
        'pocas', 'mucho', 'mucha', 'muchos', 'muchas', 'otro', 'otra', 
        'otros', 'otras', 'tan', 'tal', 'tales', 'cada', 'cierto', 'cierta',
        
        // Formato de guion y contracciones cortas
        'v.o.', 'vo', 'o.s.', 'os', 'cont.', 'contd', 'ext.', 'int.', 'dia', 'noche', 'apertura', 'cierre', 'cont',
        's', 't', 'd', 'm', 'll', 've', 're',
        
        // MENCIONES GENÉRICAS A PERSONAJES Y TÍTULOS
        'hombre', 'mujer', 'chico', 'chica', 'niño', 'niña', 'doctor', 'doctora', 
        'señor', 'señora', 'policía', 'agente', 'joven', 'viejo', 'guardia', 'detective'
    ]);

    const stopwords_en = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'yet', 'so', 
        'for', 'of', 'to', 'in', 'on', 'at', 'with', 'from', 'by', 
        'about', 'as', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'doing', 
        'it', 'its', 'i', 'me', 'my', 'myself', 'you', 'your', 'yours', 
        'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
        'herself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 
        'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 
        'this', 'that', 'these', 'those', 'can', 'will', 'would', 'should', 
        'could', 'may', 'might', 'must', 'up', 'down', 'out', 'off', 'over', 
        'under', 'again', 'further', 'then', 'once', 'here', 'there', 
        'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 
        'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 
        'own', 'same', 'too', 'very', 
        
        // Preposiciones, Adverbios y Conectores de Movimiento
        'into', 'back', 'through', 'toward', 'towards', 'onto', 'upon', 'within', 
        'without', 'while', 'when', 'since', 'until', 'before', 'after', 
        
        // Contracciónes completas y negaciones
        'just', 'don', 'shouldn', 'isn', 'wasn', 'weren', 'haven', 
        'hasn', 'hadn', 'won', 'shan', 'wouldn', 'couldn', 'mightn', 
        'mustn', 'ain', 'dont', 'cant', 'wouldnt', 'im', 'hes', 'shes',
        
        // Formato de guion y Contratos cortos
        'v.o.', 'vo', 'o.s.', 'os', 'cont\'d', 'ext.', 'int.', 'day', 'night', 'fade in', 'fade out', 'cont',
        's', 't', 'm', 'll', 've', 're', 'd', 'contd', 'its', 'thats',
        
        // MENCIONES GENÉRICAS A PERSONAJES Y TÍTULOS
        'man', 'woman', 'guy', 'girl', 'boy', 'kid', 'doctor', 'mr', 'mrs', 'ms', 
        'officer', 'agent', 'young', 'old', 'soldier', 'detective', 'cop'
    ]);

    function getStopwords(idioma) {
        return idioma === 'en' ? stopwords_en : stopwords_es;
    }


    // --- FUNCIÓN DE LIMPIEZA DE FORMATO (SIN CAMBIOS) ---
    function limpiarTextoGuion(texto) {
        let textoLimpio = texto;

        // 1. Reemplazar saltos de línea extraños (comunes en conversión DOCX a TXT)
        textoLimpio = textoLimpio.replace(/(\r\n|\n|\r){3,}/g, '\n\n'); 

        // 2. Eliminar márgenes blancos y caracteres nulos
        textoLimpio = textoLimpio.trim();
        textoLimpio = textoLimpio.replace(/\0/g, ''); 

        // 3. Normalizar espacios
        textoLimpio = textoLimpio.replace(/[ \t]{2,}/g, ' '); 

        // 4. Intentar separar nombres de personajes (en MAYÚSCULAS) que podrían haberse pegado al texto de acción/diálogo
        textoLimpio = textoLimpio.replace(/([A-Z.]{3,})([^A-Z.\n\r])/g, (match, p1, p2) => {
            if (p1.length > 5 && !p1.endsWith('.')) {
                 return p1 + '\n' + p2;
            }
            return match; 
        });


        return textoLimpio;
    }


    // --- LÓGICA DE LECTURA DE ARCHIVOS (MAMMOTH) ---
    archivoGuion.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textoGuion.value = limpiarTextoGuion(e.target.result); 
                alert(`Archivo "${file.name}" (.txt) cargado y limpiado con éxito.`);
                archivoGuion.value = '';
            };
            reader.onerror = () => {
                alert('Error al leer el archivo .txt.');
            };
            reader.readAsText(file, 'UTF-8');
        } 
        
        else if (fileName.endsWith('.docx')) {
            if (typeof mammoth === 'undefined') {
                alert('Error: La librería Mammoth.js no se ha cargado correctamente. No se puede leer el archivo .docx.');
                archivoGuion.value = '';
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        textoGuion.value = limpiarTextoGuion(result.value); 
                        alert(`Archivo "${file.name}" (.docx) cargado y limpiado con éxito.`);
                    })
                    .catch(err => {
                        console.error('Error de Mammoth:', err);
                        alert('Error al procesar el archivo .docx. Asegúrate de que no esté corrupto o cifrado.');
                    })
                    .finally(() => {
                        archivoGuion.value = '';
                    });
            };
            
            reader.onerror = () => {
                alert('Error al leer el archivo .docx.');
            };

            reader.readAsArrayBuffer(file); 
        } 
        
        else {
            alert('Tipo de archivo no soportado. Por favor, usa .txt o .docx.');
            archivoGuion.value = '';
        }
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

        // Almacenar el texto completo de cada diálogo para el análisis posterior
        const dialogosPorPersonaje = {};

        // --- 1. Análisis de Personajes Recurrentes y Diálogos ---
        const frecuenciaPersonajes = {};
        let personajeActual = null;
        
        lineas.forEach((linea, index) => {
            const lineaTrim = linea.trim();
            
            // 1.1 Identificación de Personaje (MAYÚSCULAS)
            const esPersonaje = lineaTrim === lineaTrim.toUpperCase() && lineaTrim.length > 2 && !/\d/.test(lineaTrim) && 
                                !['EXT.', 'INT.', 'FADE IN', 'CUT TO', 'DÍA', 'NOCHE', 'TRANSICIÓN', 'FADE OUT', 'APERTURA', 'CIERRE', 'TITLE', 'CONT.'].some(c => lineaTrim.startsWith(c));

            if (esPersonaje) {
                personajeActual = lineaTrim.split('(')[0].trim();
                frecuenciaPersonajes[personajeActual] = (frecuenciaPersonajes[personajeActual] || 0) + 1;
                if (!dialogosPorPersonaje[personajeActual]) {
                    dialogosPorPersonaje[personajeActual] = [];
                }
            } 
            // 1.2 Extracción de Diálogo
            else if (personajeActual && lineaTrim.length > 0) {
                
                const dialogoActual = dialogosPorPersonaje[personajeActual].length > 0 ? dialogosPorPersonaje[personajeActual][dialogosPorPersonaje[personajeActual].length - 1] : null;
                
                if (dialogoActual && dialogoActual.end === index - 1) {
                     dialogoActual.texto += (dialogoActual.texto.length > 0 ? '\n' : '') + linea.trim();
                     dialogoActual.end = index;
                } else if (!dialogoActual || (dialogoActual && dialogoActual.end < index - 1)) {
                    dialogosPorPersonaje[personajeActual].push({ texto: linea.trim(), start: index, end: index });
                }
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
                if (part.length >= 3) {
                    personajesParaFiltrar.add(part);
                }
            });
        });


        // --- 2. Análisis de Palabras Repetidas ---
        const frecuenciaPalabras = {};
        
        let textoLimpio = texto.toLowerCase();
        
        textoLimpio = textoLimpio.replace(/['`‘’]/g, ' ');
        textoLimpio = textoLimpio.replace(/[\.,\/#!$%\^&\*;:{}=\-_~()¡¿?""]/g, ' ');
        
        const palabras = textoLimpio.split(/\s+/)
            .filter(word => 
                word.length > 2 && 
                !stopwords.has(word) &&         
                !personajesParaFiltrar.has(word) 
            );

        palabras.forEach(palabra => {
            frecuenciaPalabras[palabra] = (frecuenciaPalabras[palabra] || 0) + 1;
        });

        const topPalabras = Object.entries(frecuenciaPalabras)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);
        
        const top5Palabras = topPalabras.map(([word]) => word);


        // --- 3. Análisis de Oraciones Clave (Sin Cambios) ---
        const oraciones = texto.match(/[^\.!\?]+[\.!\?]/g) || [];
        const oracionesClavePonderadas = [];

        oraciones.forEach(oracion => {
            let oracionLimpia = oracion.toLowerCase();
            oracionLimpia = oracionLimpia.replace(/['`‘’]/g, ' '); 
            oracionLimpia = oracionLimpia.replace(/[\.,\/#!$%\^&\*;:{}=\-_~()¡¿?""]/g, ' ');
            
            const longitud = oracionLimpia.split(/\s+/).length;
            
            let score = 0;
            score += top5Palabras.filter(word => oracionLimpia.includes(word)).length;
            if (oracion.includes('!') || oracion.includes('?')) score += 2;
            if (longitud > 15) score += 1; 

            if (score >= 3) {
                oracionesClavePonderadas.push({ oracion: oracion.trim(), score: score });
            }
        });
        
        oracionesClavePonderadas.sort((a, b) => b.score - a.score);
        const uniqueOracionesClave = [...new Set(oracionesClavePonderadas.map(item => item.oracion))]
            .slice(0, 5);


        // --- 4. Extracción de Diálogos Clave Ponderada (MEJORA CLAVE) ---
        const dialogosClave = [];
        const topPersonajesNombres = topPersonajes.map(([nombre]) => nombre);
        
        // Analizar solo los 2 personajes principales
        topPersonajesNombres.slice(0, 2).forEach(personaje => {
            const dialogos = dialogosPorPersonaje[personaje] || [];
            const dialogosPonderados = [];

            dialogos.forEach(d => {
                const dialogoTexto = d.texto.toLowerCase();
                const longitud = dialogoTexto.length;
                
                // 1. Contar la aparición de palabras clave temáticas (Top 5)
                let scorePalabrasClave = 0;
                top5Palabras.forEach(keyword => {
                    // Se usa una expresión regular para contar ocurrencias de la palabra completa
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    const matches = dialogoTexto.match(regex);
                    if (matches) {
                        scorePalabrasClave += matches.length;
                    }
                });

                // 2. Cálculo del Score de Relevancia: (Score de Palabras Clave * 3) + (Longitud / 50)
                // Se pondera más la aparición de palabras clave que la longitud.
                const relevanciaScore = (scorePalabrasClave * 3) + (longitud / 50);

                if (relevanciaScore > 0) {
                    dialogosPonderados.push({ 
                        personaje: personaje, 
                        texto: d.texto, 
                        score: relevanciaScore 
                    });
                }
            });
            
            // Ordenar por score y seleccionar los 2 más relevantes
            const dialogosOrdenados = dialogosPonderados
                .sort((a, b) => b.score - a.score)
                .slice(0, 2);
                
            dialogosOrdenados.forEach(item => {
                // Limitar el texto a 250 caracteres para la visualización
                dialogosClave.push({ 
                    personaje: item.personaje, 
                    dialogo: item.texto.substring(0, 250) + (item.texto.length > 250 ? '...' : '') 
                });
            });
        });


        return { topPalabras, topPersonajes, oracionesClave: uniqueOracionesClave, dialogosClave: dialogosClave };
    }

    // --- FUNCIONES DE MOSTRAR RESULTADOS Y SUGERENCIAS (SIN CAMBIOS) ---

    function mostrarResultados(analisis) {
        listaPalabras.innerHTML = '';
        listaPersonajes.innerHTML = '';
        listaOracionesClave.innerHTML = '';
        listaDialogosClave.innerHTML = ''; 

        // Mostrar Palabras
        if (analisis.topPalabras.length > 0) {
            analisis.topPalabras.forEach(([palabra, count]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${palabra}</strong>: ${count} veces`;
                listaPalabras.appendChild(li);
            });
        } else {
             listaPalabras.innerHTML = '<li>No se encontraron palabras relevantes.</li>';
        }

        // Mostrar Personajes
        if (analisis.topPersonajes.length > 0) {
            analisis.topPersonajes.forEach(([personaje, count]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${personaje}</strong>: ${count} apariciones/diálogos`;
                listaPersonajes.appendChild(li);
            });
        } else {
            listaPersonajes.innerHTML = '<li>No se identificaron personajes (asegúrate de que los nombres estén en MAYÚSCULAS).</li>';
        }
        
        // Mostrar Oraciones Clave
        if (analisis.oracionesClave.length > 0) {
            analisis.oracionesClave.forEach(oracion => {
                const li = document.createElement('li');
                li.textContent = oracion;
                listaOracionesClave.appendChild(li);
            });
        } else {
            listaOracionesClave.innerHTML = '<li>No se identificaron oraciones clave (basadas en longitud, puntuación y palabras frecuentes).</li>';
        }

        // Mostrar Diálogos Clave
        if (analisis.dialogosClave.length > 0) {
            analisis.dialogosClave.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${item.personaje}:</strong> ${item.dialogo}`;
                listaDialogosClave.appendChild(li);
            });
        } else {
            listaDialogosClave.innerHTML = '<li>No se pudieron extraer diálogos clave de los personajes principales. (Asegúrate de que el formato de personaje-diálogo sea claro).</li>';
        }
    }

    // Funcionalidad de Sugerencias (Simulada)
    generarSugerenciasBtn.addEventListener('click', () => {
        textoSugerencias.innerHTML = '<p>Analizando el texto con la IA... ⏳</p>';

        setTimeout(() => {
            const guion = textoGuion.value.trim();
            if (guion.length < 50) {
                textoSugerencias.innerHTML = '<p>El guion es demasiado corto. Sugerencia: Intenta pegar un texto más largo (más de 50 palabras) para un feedback significativo.</p>';
                return;
            }
            
            const sugerencias = `
                <p><strong>Feedback de la IA sobre tu texto:</strong></p>
                <p>1. <strong>Diálogo Clave Mejorado:</strong> Ahora, los diálogos se seleccionan por su **relevancia temática**, es decir, por la cantidad de **palabras clave** (las palabras más frecuentes en todo el guion) que contienen, además de su longitud. Esto asegura que los diálogos que definen el tema central sean resaltados.</p>
                <p>2. <strong>Oraciones Clave:</strong> La heurística priorizó frases largas con palabras frecuentes y puntuación fuerte. Estas frases marcan el tono y el tema. ¿Reflejan la intención de tu escena?</p>
                <p>3. <strong>Formato y Limpieza:</strong> La limpieza de formato automática ha ayudado a aislar mejor los nombres de personajes y separar líneas que pudieran haberse juntado, mejorando la precisión del análisis de frecuencia y diálogos.</p>
                <p><em>*Esta es una sugerencia simulada. Para un análisis real, se requeriría una integración con una API de IA.</em></p>
            `;
            textoSugerencias.innerHTML = sugerencias;
        }, 2500); 
    });
});
