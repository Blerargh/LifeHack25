import React, { useEffect, useState } from 'react'
import '../../styles/content.css'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8080');

const Content: React.FC = () => {
  const [ reply, setReply ] = useState<string>('');
  
  useEffect(() => {
    socket.emit('join', 123);

    socket.on('updateReply', (data) => {
      setReply(data.reply);
    })

    return () => {
      socket.emit('leave', 123);
    }
  }, []);

  return (
    <div className='content-container'>{reply}</div>
  )
}

export default Content