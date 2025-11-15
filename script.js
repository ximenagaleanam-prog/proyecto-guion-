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

    // --- LISTAS DE STOPWORDS ---
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
        's', 't', 'd', 'm', 'll', 've', 're', 'cut to', 'fade out', 'apertura', 'cierre', 'title',
        
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
        'own', 'same', 'too', 'very', 'into', 'back', 'through', 'toward', 
        'towards', 'onto', 'upon', 'within', 'without', 'while', 'when', 
        'since', 'until', 'before', 'after', 'just', 'don', 'shouldn', 
        'isn', 'wasn', 'weren', 'haven', 'hasn', 'hadn', 'won', 'shan', 
        'wouldn', 'couldn', 'mightn', 'mustn', 'ain', 'dont', 'cant', 
        'wouldnt', 'im', 'hes', 'shes',
        
        // Formato de guion y Contratos cortos
        'v.o.', 'vo', 'o.s.', 'os', 'cont\'d', 'ext.', 'int.', 'day', 'night', 'fade in', 'fade out', 'cont',
        's', 't', 'm', 'll', 've', 're', 'd', 'contd', 'its', 'thats', 'cut to', 'fade to',
        
        // MENCIONES GENÉRICAS A PERSONAJES Y TÍTULOS
        'man', 'woman', 'guy', 'girl', 'boy', 'kid', 'doctor', 'mr', 'mrs', 'ms', 
        'officer', 'agent', 'young', 'old', 'soldier', 'detective', 'cop'
    ]);

    function getStopwords(idioma) {
        return idioma === 'en' ? stopwords_en : stopwords_es;
    }


    // --- FUNCIÓN DE LIMPIEZA DE FORMATO ---
    function limpiarTextoGuion(texto) {
        let textoLimpio = texto;

        textoLimpio = textoLimpio.replace(/(\r\n|\n|\r){3,}/g, '\n\n'); 
        textoLimpio = textoLimpio.trim();
        textoLimpio = textoLimpio.replace(/\0/g, ''); 
        textoLimpio = textoLimpio.replace(/[ \t]{2,}/g, ' '); 

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
            // VERIFICACIÓN DE MAMMOTH
            if (typeof mammoth === 'undefined') {
                alert('ERROR: La librería Mammoth.js no está disponible. No se puede leer el archivo .docx. Asegúrate de que el script Mammoth.js esté cargado correctamente en index.html.');
                console.error('Mammoth.js no está definido. La carga de .docx fallará.');
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
                        console.error('Error de conversión DOCX (Mammoth):', err);
                        alert(`Error al procesar el archivo .docx: ${err.message}. Intenta convertirlo a .txt primero.`);
                    })
                    .finally(() => {
                        archivoGuion.value = '';
                    });
            };
            
            reader.onerror = () => {
                alert('Error al leer el array buffer del .docx.');
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

        const dialogosPorPersonaje = {};
        let textoTotalDialogos = ''; 
        
        // --- 1. Análisis de Personajes y Extracción de Diálogos ---
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
                if (part.length >= 3) { 
                    personajesParaFiltrar.add(part);
                }
            });
        });


        // --- 2. Análisis de Palabras Repetidas (USANDO SOLO DIÁLOGOS) ---
        const frecuenciaPalabras = {};
        
        let textoLimpioAnalisis = textoTotalDialogos.toLowerCase();
        
        textoLimpioAnalisis = textoLimpioAnalisis.replace(/['`‘’]/g, ' ');
        textoLimpioAnalisis = textoLimpioAnalisis.replace(/[\.,\/#!$%\^&\*;:{}=\-_~()¡¿?""]/g, ' ');
        
        const palabras = textoLimpioAnalisis.split(/\s+/)
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


        // --- 3. Análisis de Oraciones Clave (USANDO SOLO DIÁLOGOS) ---
        const oraciones = textoTotalDialogos.match(/[^\.!\?]+[\.!\?]/g) || [];
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


        // --- 4. Extracción de Diálogos Clave Ponderada ---
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
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    const matches = dialogoTexto.match(regex);
                    if (matches) {
                        scorePalabrasClave += matches.length;
                    }
                });

                const relevanciaScore = (scorePalabrasClave * 3) + (longitud / 50);

                if (relevanciaScore > 0) {
                    dialogosPonderados.push({ 
                        personaje: personaje, 
                        texto: d.texto, 
                        score: relevanciaScore 
                    });
                }
            });
            
            const dialogosOrdenados = dialogosPonderados
                .sort((a, b) => b.score - a.score)
                .slice(0, 2);
                
            dialogosOrdenados.forEach(item => {
                dialogosClave.push({ 
                    personaje: item.personaje, 
                    dialogo: item.texto.substring(0, 250) + (item.texto.length > 250 ? '...' : '') 
                });
            });
        });


        return { topPalabras, topPersonajes, oracionesClave: uniqueOracionesClave, dialogosClave: dialogosClave };
    }

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
            listaOracionesClave.innerHTML = '<li>No se identificaron oraciones clave.</li>';
        }

        // Mostrar Diálogos Clave
        if (analisis.dialogosClave.length > 0) {
            analisis.dialogosClave.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${item.personaje}:</strong> ${item.dialogo}`;
                listaDialogosClave.appendChild(li);
            });
        } else {
            listaDialogosClave.innerHTML = '<li>No se pudieron extraer diálogos clave de los personajes principales.</li>';
        }
    }

    // Funcionalidad de Sugerencias (Simulado)
    generarSugerenciasBtn.addEventListener('click', () => {
        textoSugerencias.innerHTML = '<p>Analizando el texto con la IA... ⏳</p>';

        setTimeout(() => {
            const guion = textoGuion.value.trim();
            if (guion.length < 50) {
                textoSugerencias.innerHTML = '<p>El guion es demasiado corto. Sugerencia: Intenta pegar un texto más largo (más de 50 palabras) para un feedback significativo.</p>';
                return;
            }
            
            const sugerencias = `
                <p><strong>Feedback Temático Rápido:</strong></p>
                <ul>
                    <li>**Análisis Temático Exclusivo:** Las palabras clave y oraciones se basaron únicamente en el **diálogo**, proporcionando una visión pura del conflicto hablado.</li>
                    <li>**Relevancia de Diálogos:** Los diálogos clave se destacaron por su alto contenido temático (densidad de palabras clave) en relación con su longitud, marcando los momentos dramáticos más importantes del guion.</li>
                    <li>**Personajes Ponderados:** Los personajes destacados son aquellos que tienen la mayor cantidad de diálogo y apariciones, siendo el eje de la narrativa.</li>
                </ul>
                <p><em>*Esta es una sugerencia simulada. Para un análisis real, se requeriría una integración con una API de IA.</em></p>
            `;
            textoSugerencias.innerHTML = sugerencias;
        }, 2500); 
    });
});
