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
        'otros', 'otras', 'tan', 'tal', 'tales', 'cada', 'cierto', 'cierta'
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
        'own', 'same', 'too', 'very', 's', 't', 'just', 'don', 'shouldn'
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
            // Leer como texto con UTF-8
            reader.readAsText(file, 'UTF-8');
        } 
        
        // 2. Manejar archivos .DOCX (Usando Mammoth.js)
        else if (fileName.endsWith('.docx')) {
            // Verificamos si Mammoth está disponible (por si falla la CDN)
            if (typeof mammoth === 'undefined') {
                alert('Error: La librería Mammoth.js no se ha cargado correctamente. No se puede leer el archivo .docx.');
                archivoGuion.value = '';
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                // Leer el archivo como ArrayBuffer (datos binarios)
                const arrayBuffer = e.target.result;
                
                // Usar Mammoth para convertir el ArrayBuffer a Texto
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

            // Leer como ArrayBuffer para Mammoth
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

        // Análisis de Palabras Repetidas
        const frecuenciaPalabras = {};
        const textoLimpio = texto.toLowerCase().replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()¡¿?"']/g, ' ');
        const palabras = textoLimpio.split(/\s+/).filter(word => word.length > 2 && !stopwords.has(word));

        palabras.forEach(palabra => {
            frecuenciaPalabras[palabra] = (frecuenciaPalabras[palabra] || 0) + 1;
        });

        const topPalabras = Object.entries(frecuenciaPalabras)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); 


        // Análisis de Personajes Recurrentes
        const frecuenciaPersonajes = {};
        const lineas = texto.split('\n');

        lineas.forEach(linea => {
            const lineaTrim = linea.trim();
            if (lineaTrim === lineaTrim.toUpperCase() && lineaTrim.length > 2 && !/\d/.test(lineaTrim)) {
                
                if (!['EXT.', 'INT.', 'FADE IN', 'CUT TO', 'DÍA', 'NOCHE', 'TRANSICIÓN', 'FADE OUT', 'APERTURA', 'CIERRE', 'TITLE'].some(c => lineaTrim.startsWith(c))) {
                    
                    const personaje = lineaTrim.split('(')[0].trim();
                    frecuenciaPersonajes[personaje] = (frecuenciaPersonajes[personaje] || 0) + 1;
                }
            }
        });
        
        const topPersonajes = Object.entries(frecuenciaPersonajes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); 


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
