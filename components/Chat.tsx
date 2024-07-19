"use client"
import 'regenerator-runtime/runtime'
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';


import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaMicrophone } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface ChatResponse {
  response: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

const Chat = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      setError(null);
      const response = await axios.post<ChatResponse>('/api/chat', { message });

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: response.data.response,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      setMessage('');
      resetTranscript();
    } catch (err) {
      console.error(err);
      setError('Failed to get a response from the server.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  return (
    <div className="flex flex-col h-[45rem]">
    <div className="flex-grow p-4 overflow-hidden">
      <div className="overflow-y-auto h-full" ref={messageContainerRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`bg-${msg.type === 'user' ? 'blue-100' : 'gray-100'} p-2 rounded mb-2 inline-block`}>
              <p className="font-bold">{msg.type === 'user' ? 'You:' : 'AI:'}</p>
              {msg.type === 'ai' && <ReactMarkdown>{msg.content}</ReactMarkdown>}
              {msg.type === 'user' && <p>{msg.content}</p>}
            </div>
          </div>
        ))}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
    <div className="flex items-center">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress} // Handle Enter key press
        placeholder="Type your message..."
        className="flex-grow p-2 border rounded-l"
      />
        <Button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-r"
        >
          Send
        </Button>
        <button
          onClick={handleMicClick}
          className={`p-2 ${listening ? 'bg-red-500' : 'bg-gray-200'} text-white rounded-r`}
        >
          <FaMicrophone />
        </button>
      </div>
    </div>
  );
};

export default Chat;
