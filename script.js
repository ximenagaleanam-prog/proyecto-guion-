document.addEventListener('DOMContentLoaded', () => {
    const textoGuion = document.getElementById('texto-guion');
    const analizarBtn = document.getElementById('analizar-btn');
    const resultadosSection = document.getElementById('resultados');
    const listaPalabras = document.getElementById('lista-palabras');
    const listaPersonajes = document.getElementById('lista-personajes');
    const generarSugerenciasBtn = document.getElementById('generar-sugerencias-btn');
    const textoSugerencias = document.getElementById('texto-sugerencias');

    // Palabras comunes (stopwords) que se ignoran en el conteo de frecuencia
    const stopwords = new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'si', 'no', 'que', 'de', 'a', 'en', 'por', 'con', 'para', 'se', 'es', 'su', 'sus', 'mi', 'mis', 'tu', 'tus', 'al', 'del', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os', 'esto', 'eso', 'aquí', 'ahí', 'allí', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'es', 'está', 'ser', 'estar', 'haber'
    ]);

    // Manejar el envío del formulario para analizar el guion
    analizarBtn.addEventListener('click', (e) => {
        e.preventDefault(); 

        const guion = textoGuion.value.trim();
        
        if (guion.length === 0) {
            alert('Por favor, pega o sube un guion para analizar.');
            return;
        }

        const analisis = analizarTextoGuion(guion);
        
        mostrarResultados(analisis);
        
        resultadosSection.style.display = 'block';
        resultadosSection.scrollIntoView({ behavior: 'smooth' }); 
    });

    /**
     * Función principal para analizar el texto del guion.
     */
    function analizarTextoGuion(texto) {
        // --- Análisis de Palabras Repetidas ---
        const frecuenciaPalabras = {};
        const textoLimpio = texto.toLowerCase().replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()¡¿?"']/g, ' ');
        const palabras = textoLimpio.split(/\s+/).filter(word => word.length > 2 && !stopwords.has(word));

        palabras.forEach(palabra => {
            frecuenciaPalabras[palabra] = (frecuenciaPalabras[palabra] || 0) + 1;
        });

        const topPalabras = Object.entries(frecuenciaPalabras)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); 


        // --- Análisis de Personajes Recurrentes ---
        const frecuenciaPersonajes = {};
        const lineas = texto.split('\n');

        lineas.forEach(linea => {
            const lineaTrim = linea.trim();
            // Heurística: Líneas en MAYÚSCULAS que no parecen ser encabezados de escena o transiciones.
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

    /**
     * Muestra los resultados del análisis en la interfaz.
     */
    function mostrarResultados(analisis) {
        listaPalabras.innerHTML = '';
        listaPersonajes.innerHTML = '';

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
    }

    // --- Funcionalidad de Sugerencias (Simulada) ---
    generarSugerenciasBtn.addEventListener('click', () => {
        textoSugerencias.innerHTML = '<p>Analizando el texto con la IA... ⏳</p>';

        // SIMULACIÓN de respuesta de IA con feedback
        setTimeout(() => {
            const guion = textoGuion.value.trim();
            if (guion.length < 50) {
                textoSugerencias.innerHTML = '<p>El guion es demasiado corto. Sugerencia: Intenta pegar un texto más largo (más de 50 palabras) para un feedback significativo.</p>';
                return;
            }
            
            const sugerencias = `
                <p><strong>Feedback de la IA sobre tu texto:</strong></p>
                <p>1. <strong>Concentración de Diálogo:</strong> El personaje con más diálogos domina gran parte de la interacción. Considera si este desequilibrio sirve a tu historia o si necesitas repartir el peso narrativo.</p>
                <p>2. <strong>Frecuencia de Palabras:</strong> Revisa el uso excesivo de palabras emocionales o de acción. Un alto conteo de la misma palabra (ej. "Miedo", "Correr") puede indicar una dependencia excesiva de la palabra en lugar de la descripción sutil.</p>
                <p>3. <strong>Ritmo de Escena:</strong> Si observas muchas líneas de acción cortas seguidas, el ritmo puede ser frenético. Para variar, intercala descripciones sensoriales más largas.</p>
                <p><em>*Esta es una sugerencia simulada. Para un análisis real, se requeriría una integración con una API de IA.</em></p>
            `;
            textoSugerencias.innerHTML = sugerencias;
        }, 2500); // Espera de 2.5 segundos simulando una respuesta de servidor
    });
});
