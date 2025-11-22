// api/server.js
// Este código es para ser usado con Serverless Functions de Vercel.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

// CONFIGURACIÓN DE GROQ
const ai = new OpenAI({
    // Vercel leerá esta clave de las Environment Variables
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1" 
});

const model = 'llama3-8b-8192';

// Middleware
app.use(cors()); 
app.use(express.json()); 

// RUTA PRINCIPAL (Vercel la expone a través de /api/server)
app.post('/api/analisis-ia', async (req, res) => {
    const { guion, analisisCuantitativo } = req.body;

    if (!guion || guion.length < 50) {
        return res.status(400).json({ error: "Guion demasiado corto." });
    }

    const prompt = `
        Eres un analista de guiones. Usa el modelo Llama 3 para el análisis.
        1. Conflicto Central. 2. Tono y Atmósfera. 3. Sugerencias de Desarrollo.
        Formatea tu respuesta estrictamente en HTML, usando solo etiquetas <ul>, <li> y <p>.
        Guion: ${guion.substring(0, 5000)}
    `;

    try {
        const completion = await ai.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });
        
        const resultText = completion.choices[0].message.content;
        res.json({ analysis: resultText });

    } catch (error) {
        console.error("Error al llamar a la API de Groq:", error);
        res.status(500).json({ error: `Fallo de la IA: ${error.message}` });
    }
});

// ¡IMPORTANTE PARA VERCEL! Exportar la aplicación
module.exports = app;
