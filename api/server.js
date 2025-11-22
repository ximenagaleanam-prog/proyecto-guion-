// api/server.js
// CÓDIGO OPTIMIZADO PARA VERCEL SERVERLESS FUNCTIONS (Análisis Emocional)

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
        return res.status(400).json({ error: "Guion demasiado corto para el análisis emocional." });
    }

    const personajesPrincipales = analisisCuantitativo.topPersonajes.map(p => p[0]).join(', ');
    
    // Si no se detectaron personajes, usa una lista genérica
    const listaPersonajes = personajesPrincipales.length > 0 ? personajesPrincipales : "el protagonista principal y el antagonista.";

    const prompt = `
        Eres un crítico y analista emocional de guiones de cine. Tu tarea es analizar el tono y las emociones dominantes en los diálogos del guion provisto.

        Enfócate exclusivamente en los personajes principales detectados: **${listaPersonajes}**.

        Genera un informe que contenga la siguiente información:
        
        1. **Emoción Dominante (por Personaje):** Para los dos personajes principales, indica la emoción predominante que transmiten sus diálogos (e.g., Ira, Miedo, Ansiedad, Alegría contenida, Culpa, etc.).
        2. **Arco Emocional:** Describe brevemente si el estado emocional de los personajes cambia significativamente a lo largo de las escenas analizadas.
        3. **Sugerencias de Intensidad:** Sugiere un pequeño cambio que podría aumentar la tensión o el impacto emocional en un diálogo clave.
        
        Formatea tu respuesta estrictamente en HTML, usando encabezados de tercer nivel (<h3>), listas <ul>, <li> y párrafos <p>.
        
        ---
        
        Guion: ${guion.substring(0, 5000)}
    `;

    try {
        const completion = await ai.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8, // Temperatura más alta para respuestas más creativas/subjetivas (emocionales)
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
