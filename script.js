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
        'otros', 'otras', 'tan', 'tal', 'tales', 'cada', 'cierto', 'cierta'
    ]);

    // LISTA DE STOPWORDS EN INGLÉS: Incluye contracciones completas como palabras a filtrar.
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
        
        // Contracciónes completas para filtrar como palabras enteras
        'just', 'don', 'shouldn', 'isn', 'wasn', 'weren', 'haven', 
        'hasn', 'hadn', 'won', 'shan', 'wouldn', 'couldn', 'mightn', 
        'mustn', 'ain', 
        
        // Contratos específicos que suelen aparecer:
        'its', 'it\'s', 'he\'s', 'she\'s', 'we\'re', 'they\'re', 'i\'m', 'you\'re', 
        'i\'ve', 'you\'ve', 'we\'ve', 'they\'ve', 'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 
        'we\'ll', 'they\'ll', 'can\'t', 'won\'t', 'don\'t', 'doesn\'t', 'didn\'t', 
        'couldn\'t', 'wouldn\'t', 'shouldn\'t', 'cont\'d' // Abrev. de Continuado
    ]);

    function getStopwords(idioma) {
        return idioma === 'en' ? stopwords_en : stopwords_es;
    }


    // --- LÓGICA DE LECTURA DE ARCHIVOS (SOPORTE DOCX Y TXT) ---
    archivoGuion.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const fileName = file.name.toLowerCase();

        // 1. Manejar archivos .TXT
        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();

            reader.onload = (e) => {
                textoGuion.value = e.target.result;
                alert(`Archivo "${file.name}" (.txt) cargado con éxito.`);
                archivoGuion.value = '';
            };
            reader.onerror = () => {
                alert('Error al leer el archivo .txt.');
            };
            reader.readAsText(file, 'UTF-8');
        } 
        
        // 2. Manejar archivos .DOCX (Usando Mammoth.js)
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
                        textoGuion.value = result.value; 
                        alert(`Archivo "${file.name}" (.docx) cargado con éxito.`);
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
        
        // 3. Manejar otros tipos de archivos
        else {
            alert('Tipo de archivo no soportado. Por favor, usa .txt o .docx.');
            archivoGuion.value = '';
        }
    });


    // --- LÓGICA DE ANÁLISIS ---
    analizarBtn.addEventListener('click', (e) => {
        e.preventDefault(); 

        const guion = textoGuion.value.trim();
        const idiomaSeleccionado = idiomaSelector.value;
        
        if (guion.length === 0) {
            alert('Por favor, pega o sube un guion para analizar.');
            return;
        }

        const analisis = analizarTextoGuion(guion, idiomaSeleccionado);
        
        mostrarResultados(analisis);
        
        resultadosSection.style.display = 'block';
        resultadosSection.scrollIntoView({ behavior: 'smooth' }); 
    });

    function analizarTextoGuion(texto, idioma) {
        const stopwords = getStopwords(idioma);

        // --- 1. Análisis de Personajes Recurrentes (Primero) ---
        const frecuenciaPersonajes = {};
        const lineas = texto.split('\n');
        
        lineas.forEach(linea => {
            const lineaTrim = linea.trim();
            // Identifica líneas en mayúsculas que NO son cabeceras de escena o transiciones
            if (lineaTrim === lineaTrim.toUpperCase() && lineaTrim.length > 2 && !/\d/.test(lineaTrim)) {
                
                if (!['EXT.', 'INT.', 'FADE IN', 'CUT TO', 'DÍA', 'NOCHE', 'TRANSICIÓN', 'FADE OUT', 'APERTURA', 'CIERRE', 'TITLE', 'CONT.'].some(c => lineaTrim.startsWith(c))) {
                    
                    const personaje = lineaTrim.split('(')[0].trim();
                    frecuenciaPersonajes[personaje] = (frecuenciaPersonajes[personaje] || 0) + 1;
                }
            }
        });
        
        const topPersonajes = Object.entries(frecuenciaPersonajes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        
        // Convierte los nombres de personajes identificados a un Set de stopwords adicionales
        // para filtrar las palabras repetidas.
        const personajesParaFiltrar = new Set(Object.keys(frecuenciaPersonajes).map(name => name.toLowerCase()));


        // --- 2. Análisis de Palabras Repetidas (Segundo) ---
        const frecuenciaPalabras = {};
        
        // MODIFICACIÓN CRÍTICA: La expresión regular ahora elimina TODOS los apóstrofos (tanto ' como `) y los sustituye por NADA,
        // fusionando la palabra (ej: it's -> its; cont'd -> contd), lo que permite que sea filtrada si es un stopword.
        // Después, se reemplazan los caracteres de puntuación por espacios.
        let textoLimpio = texto.toLowerCase();
        
        // Paso 1: Eliminar apóstrofos y fusionar la palabra (para evitar que se cuenten 's' o 'd' como palabras separadas)
        textoLimpio = textoLimpio.replace(/['`]/g, '');

        // Paso 2: Reemplazar el resto de puntuación por espacios
        textoLimpio = textoLimpio.replace(/[\.,\/#!$%\^&\*;:{}=\-_~()¡¿?""]/g, ' ');
        
        // Tokenización y filtrado
        const palabras = textoLimpio.split(/\s+/)
            .filter(word => 
                word.length > 2 && 
                !stopwords.has(word) &&         // Filtra stopwords estándar y contracciones completas
                !personajesParaFiltrar.has(word) // FILTRO NUEVO: Elimina nombres de personajes
            );

        palabras.forEach(palabra => {
            frecuenciaPalabras[palabra] = (frecuenciaPalabras[palabra] || 0) + 1;
        });

        const topPalabras = Object.entries(frecuenciaPalabras)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); 


        return { topPalabras, topPersonajes };
    }

    function mostrarResultados(analisis) {
        listaPalabras.innerHTML = '';
        listaPersonajes.innerHTML = '';

        if (analisis.topPalabras.length > 0) {
            analisis.topPalabras.forEach(([palabra, count]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${palabra}</strong>: ${count} veces`;
                listaPalabras.appendChild(li);
            });
        } else {
             listaPalabras.innerHTML = '<li>No se encontraron palabras relevantes.</li>';
        }

        if (analisis.topPersonajes.length > 0) {
            analisis.topPersonajes.forEach(([personaje, count]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${personaje}</strong>: ${count} apariciones/diálogos`;
                listaPersonajes.appendChild(li);
            });
        } else {
            listaPersonajes.innerHTML = '<li>No se identificaron personajes (asegúrate de que los nombres estén en MAYÚSCULAS).</li>';
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
                <p>1. <strong>Concentración de Diálogo:</strong> El personaje con más diálogos domina gran parte de la interacción. Considera si este desequilibrio sirve a tu historia o si necesitas repartir el peso narrativo.</p>
                <p>2. <strong>Frecuencia de Palabras:</strong> El análisis excluyó conjunciones y artículos. Las palabras restantes con alta frecuencia (como "Oscuridad", "Desesperación", o un objeto clave) son esenciales para el tema de tu guion.</p>
                <p>3. <strong>Ritmo de Escena:</strong> Si observas muchas líneas de acción cortas seguidas, el ritmo puede ser frenético. Para variar, intercala descripciones sensoriales más largas.</p>
                <p><em>*Esta es una sugerencia simulada. Para un análisis real, se requeriría una integración con una API de IA.</em></p>
            `;
            textoSugerencias.innerHTML = sugerencias;
        }, 2500); 
    });
});
