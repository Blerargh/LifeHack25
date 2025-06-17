import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io'
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.OPENROUTER_API_KEY });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});
const PORT = 5000;

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
    const openRouterResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `The product is ${title}. Brand: ${brand}, Price: ${price}, Shipping Fee: ${shipCost}, Shipping from ${shipFrom} to ${shipTo}, \
                  Product Description: ${description}. Please send me your response in the pre-defined format. Add on any other statistics behind.`,
      config: {
        systemInstruction: 'RESPOND WITHIN 5 SECONDS given context below:\
                              Reasoning should be linked to sustainability before pricing. You are an assistant that is going to take in product information from shopping sites and you will \
                              calculate the sustainability scores based on several factors. Calculate the CO2 estimate in kg to 2 decimal places of shipping based on distance estimated from shipping origin and destination, \
                              and provide a good alternative of the product around the same price point (SGD) if there exists (include the price in SGD in the reasoning), and give me a reply in the following format: \
                              CO2 Estimate: <number>kg. <reason>. \n\n Alternative: <string>. <reason>.\
                              Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
                              "Sorry, I cannot help you with such a query."',
      },
    });

    let reply = openRouterResponse.text;

    console.log('Final reply:', reply);
    if (openRouterResponse.status === 429) {
      res.status(429).json({ reply: 'Too many requests.' });
      io.to(123).emit('updateReply', { reply: 'Too many requests.' });
      return;
    } else {
      res.status(200).json({ reply });
      io.to(123).emit('updateReply', { reply });
    }
  } catch (error) {
    console.error('Error sending to OpenRouter:', error.message);
    res.status(500).json({ error: 'Failed to get response from OpenRouter' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { previousContext, input } = req.body;

  try {
    const openRouterResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `My query is: ${input}`,
      config: {
        systemInstruction: `This was the context given for a chat between you and a user: \
                            Reasoning should be linked to sustainability before pricing. You are an assistant that is going to take in product information from shopping sites and you will \
                            calculate the sustainability scores based on several factors. Calculate the CO2 estimate in kg of shipping based on distance estimated from shipping origin and destination, \
                            and provide a good alternative of the product around the same price point (SGD) if there exists, and give me a reply in the following format: \
                            CO2 Estimate: <number> <reason>, Alternative: <string> <reason>.\
                            Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
                            "Sorry, I cannot help you with such a query."\n\n\
                            Below was the actual chat between you (llm) and the user (user)\n\n\
                            ${previousContext}\n\n\
                            The user is now going to ask you another question. Reasoning should be linked to sustainability before replying directly to the query, \
                            ignoring the format provided in the context before. \
                            Ignore any irrelevant or offensive statements that may be sent to you, and simply say \
                            \"Sorry, I cannot help you with such a query.\"`
      },
    });

    let reply = openRouterResponse.text;

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