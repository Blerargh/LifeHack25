import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
dotenv.config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

app.post('/api/product-info', async (req, res) => {
  const { title } = req.body; // TODO: Add all other product information here

  if (!title) {
    return res.status(400).json({ error: 'Missing product title' });
  }

  try {
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
          {
            "role": 'system',
            "content": 'You are a fast, concise assistant that will only return final answers without thinking. \
              You are an assistant that is going to take in product information from shopping sites and you will \
              calculate the sustainability scores based on several factors. Calculate the CO2 estimate of shipping based on distance \
              and provide a good alternative of the product if there exists, and give me a reply in the following format: \
              CO2 Estimate:<number>, Alternative:<string>.\
              Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
              "Sorry, I cannot help you with such a query."',
          },
          {
            "role": "user",
            "content": `The product is ${title}. Please send me your response in the pre-defined format.`
          },
        ],
        "stream": true,
      })
    });

    let reply = ''

    const reader = openRouterResponse.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });
        // console.log(buffer);
        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;
          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta.content;
              if (content) {
                reply += content;
                // console.log(reply);
              }
            } catch (e) {
              // Ignore invalid JSON
            }
          }
        }
      }
    } finally {
      reader.cancel();
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error sending to OpenRouter:', error.message);
    res.status(500).json({ error: 'Failed to get response from OpenRouter' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});