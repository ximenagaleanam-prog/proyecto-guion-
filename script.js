document.addEventListener('DOMContentLoaded', () => {
    const textoGuion = document.getElementById('texto-guion');
    const analizarBtn = document.getElementById('analizar-btn');
    const resultadosSection = document.getElementById('resultados');
    const listaPalabras = document.getElementById('lista-palabras');
    const listaPersonajes = document.getElementById('lista-personajes');
    const generarSugerenciasBtn = document.getElementById('generar-sugerencias-btn');
    const textoSugerencias = document.getElementById('texto-sugerencias');

    // --- LISTAS DE STOPWORDS AMPLIADAS ---

    // Stopwords en español (incluye artículos, preposiciones, pronombres y conjunciones)
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

    // Stopwords en inglés (incluye artículos, preposiciones, pronombres y conjunciones)
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

    // Usaremos la lista en español por defecto, pero se puede añadir un selector de idioma en el HTML
    // Para cambiar a inglés, simplemente se reemplazaría `stopwords_es` por `stopwords_en` aquí:
    const stopwords = stopwords_es; 
    
    // Si quieres permitir al usuario elegir el idioma, deberías añadir un menú
    // y cambiar la variable 'stopwords' al cargar el guion.

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
        // Limpiar texto: quitar puntuación, convertir a minúsculas
        const textoLimpio = texto.toLowerCase().replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()¡¿?"']/g, ' ');
        // Filtrar por longitud y excluir las stopwords
        const palabras = textoLimpio.split(/\s+/).filter(word => word.length > 2 && !stopwords.has(word));

        palabras.forEach(palabra => {
            frecuenciaPalabras[palabra] = (frecuenciaPalabras[palabra] || 0) + 1;
        });

        const topPalabras = Object.entries(frecuenciaPalabras)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); 


        // --- Análisis de Personajes Recurrentes (Sin cambios) ---
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
