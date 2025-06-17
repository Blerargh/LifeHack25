import React, { useEffect, useRef, useState } from 'react';
import '../../styles/content.css';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown'

const socket = io('http://localhost:5000');

type Message = {
  sender: 'user' | 'llm';
  text: string;
};

interface Product {
  brand: string;
  description: string;
  price: number;
  shipCost: number;
  shipFrom: string;
  shipTo: string;
  title: string;
}

interface ContentProps {
  resetCounter: number;
  productInfo: Product | null;
}

const Content: React.FC<ContentProps> = ({ resetCounter, productInfo }) => {
  const brand = productInfo?.brand ?? '';
  const description = productInfo?.description ?? '';
  const price = productInfo?.price ?? 0;
  const shipCost = productInfo?.shipCost ?? 0;
  const shipFrom = productInfo?.shipFrom ?? '';
  const shipTo = productInfo?.shipTo ?? '';
  const title = productInfo?.title ?? '';
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'llm', text: 'Give me a moment to provide a sustainability analysis of the product...' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { sender: 'llm', text: 'Give me a moment to provide a sustainability analysis of the product...' }
    ]);
    setInput('');
  }, [resetCounter]);

  // Only send initial product info if you have it
  useEffect(() => {
    socket.emit('join', 123);

    // Replace with actual product info if available
    // fetch('http://localhost:5000/api/product-info', ...);

    socket.on('updateReply', (data) => {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { sender: 'llm', text: data.reply }
      ]);
    });

    return () => {
      socket.emit('leave', 123);
      socket.off('updateReply');
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const previousMessages = [...messages]
    const previousContext = `The product is ${title}. Brand: ${brand}, Price: ${price}, Shipping Fee: ${shipCost}, Shipping from ${shipFrom} to ${shipTo}, \
                         Product Description: ${description}. \
                ` + previousMessages.map((chat) => chat.sender + ': ' + chat.text);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: input },
      { sender: 'llm', text: 'Give me a moment to reply...' }
    ]);

    const msg = input;
    setInput('');

    const response = await fetch('http://localhost:5050/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previousContext, input: msg })
    });

    const data = await response.json();
    setMessages([...previousMessages,
    { sender: 'user', text: msg },
    { sender: 'llm', text: data.reply }
    ]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="content-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-history" style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.sender === 'user' ? 'chat-message user' : 'chat-message llm'}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '8px 0',
              color: msg.sender === 'user' ? '#1976d2' : '#222',
              background: msg.sender === 'user' ? '#e3f2fd' : '#f1f1f1',
              borderRadius: 8,
              padding: '8px 12px',
              maxWidth: '80%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type your prompt..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button onClick={handleSend} style={{ padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Content;