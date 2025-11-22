// api/server.js
// CÓDIGO OPTIMIZADO PARA VERCEL SERVERLESS FUNCTIONS

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Usamos la librería de OpenAI para Groq

const app = express();

// =========================================================
// CONFIGURACIÓN DE GROQ
// Vercel inyecta GROQ_API_KEY desde sus Environment Variables
// =========================================================
const ai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1" 
});

const model = 'llama3-8b-8192'; // Modelo rápido de Groq

// Middleware
app.use(cors()); 
app.use(express.json()); 

// ENDPOINT DEL SERVIDOR: /api/server/api/analisis-ia
app.post('/api/analisis-ia', async (req, res) => {
    const { guion, analisisCuantitativo } = req.body;

    if (!guion || guion.length < 50) {
        return res.status(400).json({ error: "Guion demasiado corto para el análisis." });
    }

    const prompt = `
        Eres un analista de guiones profesional. Tu tarea es analizar el siguiente guion.
        Genera un informe cualitativo conciso y perspicaz, utilizando el modelo Llama 3 (Groq).

        1. **Conflicto Central:** Identifica el principal conflicto dramático y las fuerzas opuestas.
        2. **Tono y Atmósfera:** Describe el tono dramático dominante (e.g., oscuro, ligero, irónico) y la atmósfera.
        3. **Sugerencias de Desarrollo:** Basándote en la frecuencia de las palabras clave (${analisisCuantitativo.topPalabras.map(p => p[0]).join(', ')}), sugiere un área que podría ser desarrollada para fortalecer la voz de los personajes principales.
        
        Formatea tu respuesta estrictamente en HTML, usando solo etiquetas <ul>, <li> y <p>.
        
        ---
        
        Guion: ${guion.substring(0, 5000)}
    `;

    try {
        const completion = await ai.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });
        
        const resultText = completion.choices[0].message.content;
        
        // Devolver la respuesta de la IA (ya formateada en HTML) al frontend
        res.json({ analysis: resultText });

    } catch (error) {
        console.error("Error al llamar a la API de Groq:", error);
        res.status(500).json({ error: `Fallo al generar el análisis de la IA: ${error.message}` });
    }
});

// ¡IMPORTANTE PARA VERCEL! Exportar la aplicación
module.exports = app;
