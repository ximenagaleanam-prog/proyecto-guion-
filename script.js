<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎬 Analizador de Guiones Inteligente</title>
    <link rel="stylesheet" href="style.css">
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js"></script> 
    
</head>
<body>
    <header>
        <h1>🎬 Analizador de Guiones Inteligente</h1>
        <p>Sube o pega tu guion (en formato de texto simple) para analizar palabras clave y diálogos.</p>
    </header>

    <main>
        <section id="entrada">
            <div class="controles">
                <input type="file" id="archivo-guion" accept=".txt, .docx">
                <select id="idioma-analisis">
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                </select>
                <button id="analizar-btn">Analizar Guion</button>
            </div>
            
            <textarea id="texto-guion" rows="20" placeholder="Pega aquí el texto completo de tu guion. Asegúrate de que los nombres de los personajes estén en MAYÚSCULAS para una detección correcta."></textarea>
        </section>

        <hr>

        <section id="resultados" style="display: none;">
            <h2>📊 Resultados del Análisis de Diálogos</h2>
            
            <div class="contenedor-resultados">
                <div class="columna">
                    <h3>👥 Top 5 Personajes (Por Diálogo)</h3>
                    <ul id="lista-personajes"></ul>
                </div>

                <div class="columna">
                    <h3>🔑 Top 10 Palabras Clave (Temas)</h3>
                    <p class="nota">Basado *solo* en la frecuencia del diálogo.</p>
                    <ul id="lista-palabras"></ul>
                </div>
            </div>
            
            <hr>
            
            <h3>💬 Diálogos Clave Ponderados</h3>
            <p class="nota">Diálogos seleccionados por su longitud y densidad de palabras clave, que representan puntos focales del tema.</p>
            <ul id="lista-dialogos-clave" class="lista-dialogos"></ul>
            
            <h3>📝 Oraciones Centrales del Guion</h3>
            <p class="nota">Frases temáticas que contienen puntuación fuerte o alta densidad de palabras clave.</p>
            <ul id="lista-oraciones-clave" class="lista-oraciones"></ul>

        </section>

        <hr>

        <section id="sugerencias">
            <h2>💡 Sugerencias de la IA (Simulado)</h2>
            <button id="generar-sugerencias-btn">Generar Feedback Temático</button>
            <div id="texto-sugerencias" class="feedback-box">
                <p>Haz clic en "Generar Feedback Temático" después de analizar el guion para recibir un informe simulado sobre los hallazgos.</p>
            </div>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>
