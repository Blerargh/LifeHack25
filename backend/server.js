import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io'
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});
const PORT = 8080;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on('join', (id) => {
    socket.join(id);
    console.log(`User ${socket.id} joined lobby ${id}`);
  })

  socket.on('leave', (id) => {
    socket.leave(id);
    console.log(`User ${socket.id} left lobby ${id}`);
  });
});


app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

app.post('/api/product-info', async (req, res) => {
  const { brand, description, price, shipCost, shipFrom, shipTo, title } = req.body.product;

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
        // "model": "deepseek/deepseek-r1-0528:free",
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          {
            "role": 'system',
            "content": [
              {
                "type": "text",
                "text": "RESPOND WITHIN 5 SECONDS given context below:"
              },
              {
                "type": "text",
                "text": 'Reasoning should be linked to sustainability before pricing. You are an assistant that is going to take in product information from shopping sites and you will \
                      calculate the sustainability scores based on several factors. Calculate the CO2 estimate in kg to 2 decimal places of shipping based on distance estimated from shipping origin and destination, \
                      and provide a good alternative of the product around the same price point (SGD) if there exists (include the price in SGD in the reasoning), and give me a reply in the following format: \
                      CO2 Estimate: <number>kg. <reason>. \nAlternative: <string>. <reason>.\
                      Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
                      "Sorry, I cannot help you with such a query."',
                "cache_control": {
                  "type": "ephemeral"
                }
              }
            ],
          },
          {
            "role": "user",
            "content": `The product is ${title}. Brand: ${brand}, Price: ${price}, Shipping Fee: ${shipCost}, Shipping from ${shipFrom} to ${shipTo}, \
                         Product Description: ${description}. Please send me your response in the pre-defined format. Add on any other statistics behind.`
          },
        ],
        "stream": true,
        "reasoning": {
          "effort": "low",
          "exclude": true
        }
      })
    });

    console.log(openRouterResponse);

    let reply = '';
    const reader = openRouterResponse.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
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
                // DO NOT emit here!
              }
            } catch (e) { /* ignore */ }
          }
        }
      }
    } finally {
      reader.cancel();
    }
    // Emit only the final reply
    console.log('Final reply:', reply);
    if (openRouterResponse.status === 429) {
      res.status(429).json({ reply: 'Too many requests.' });
      io.to(123).emit('updateReply', { reply: 'Too many requests.' });
      return;
    }

    else res.status(200).json({ reply });
    io.to(123).emit('updateReply', { reply });
  } catch (error) {
    console.error('Error sending to OpenRouter:', error.message);
    res.status(500).json({ error: 'Failed to get response from OpenRouter' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { previousContext, input } = req.body;

  try {
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // "model": "deepseek/deepseek-r1-0528:free",
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          {
            "role": 'system',
            "content": [
              {
                "type": "text",
                "text": `This was the context given for a chat between you and a user\n\n\
                      Reasoning should be linked to sustainability before pricing. You are an assistant that is going to take in product information from shopping sites and you will \
                      calculate the sustainability scores based on several factors. Calculate the CO2 estimate in kg of shipping based on distance estimated from shipping origin and destination, \
                      and provide a good alternative of the product around the same price point (SGD) if there exists, and give me a reply in the following format: \
                      CO2 Estimate: <number> <reason>, Alternative: <string> <reason>.\
                      Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
                      "Sorry, I cannot help you with such a query."\n\n\
                      Below was the actual chat between you (llm) and the user (user)\n\n\
                      ${previousContext}\n\n\
                      The user is going to ask you another question. Reasoning should be linked to sustainability before replying. \
                      Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
                      "Sorry, I cannot help you with such a query.`
              }
            ],
          },
          {
            "role": "user",
            "content": `My query is: ${input}`
          },
        ],
        "stream": true,
        "reasoning": {
          "effort": "low",
          "exclude": true
        }
      })
    });

    console.log(openRouterResponse);

    let reply = '';
    const reader = openRouterResponse.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
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
                // DO NOT emit here!
              }
            } catch (e) { /* ignore */ }
          }
        }
      }
    } finally {
      reader.cancel();
    }

    console.log('Final reply:', reply);
    if (openRouterResponse.status === 429) {
      res.status(429).json({ reply: 'Too many requests.' });
      io.to(123).emit('updateReply', { reply: 'Too many requests.' });
      return;
    }

    else res.status(200).json({ reply });
    io.to(123).emit('updateReply', { reply });
  } catch (error) {
    console.error('Error sending to OpenRouter:', error.message);
    res.status(500).json({ error: 'Failed to get response from OpenRouter' });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});