import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiMicOff, FiPaperclip } from 'react-icons/fi';
import { GiDrill } from 'react-icons/gi';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios for development
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const ChatHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
`;

const ChatTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #475569;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  background: ${props => props.isUser ? '#3b82f6' : '#10b981'};
  color: white;
`;

const MessageBubble = styled.div`
  background: ${props => props.isUser ? '#3b82f6' : '#f1f5f9'};
  color: ${props => props.isUser ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 100%;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const VoiceButton = styled.button`
  width:280px;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 20px;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &.recording {
    background: #ef4444;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

const ChatInput = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 8px 16px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  padding: 8px 0;

  &::placeholder {
    color: #94a3b8;
  }
`;

const InputButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #475569;
  }

  &.send {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-style: italic;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const Chatbot = ({ selectedWell, uploadedData }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hi, I'm Drill AI. Ask me anything about ${selectedWell?.name || 'this well'}!`,
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [selectedWell, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/chat', {
        message: messageText,
        wellData: uploadedData.slice(0, 5) // Send first 5 records for context
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      // Check if it's a network error or API error
      let errorMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data.fallback || error.response.data.error || errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = "I'm having trouble connecting to the server. Please check your internet connection.";
      }

      const errorResponse = {
        id: Date.now() + 1,
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: Date.now(),
        text: `Hi, I'm Drill AI. Ask me anything about ${selectedWell?.name || 'this well'}!`,
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording functionality
    // For now, we'll just simulate it
    if (!isRecording) {
      toast.success('Voice recording started');
    } else {
      toast.success('Voice recording stopped');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>
          <GiDrill size={16} />
          Drill AI
        </ChatTitle>
        <ClearButton onClick={clearHistory}>
          Clear History
        </ClearButton>
      </ChatHeader>

      <VoiceButton
        onClick={toggleVoiceRecording}
        className={isRecording ? 'recording' : ''}
      >
        {isRecording ? <FiMicOff /> : <FiMic />}
        {isRecording ? 'Recording... Click to stop' : 'Click to start voice chat!'}
      </VoiceButton>

      <ChatMessages>
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              isUser={message.isUser}
            >
              <MessageAvatar isUser={message.isUser}>
                {message.isUser ? 'U' : 'AI'}
              </MessageAvatar>
              <div>
                <MessageBubble isUser={message.isUser}>
                  {message.text}
                </MessageBubble>
                <MessageTime isUser={message.isUser}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </Message>
          ))}
        </AnimatePresence>

        {isLoading && (
          <Message isUser={false}>
            <MessageAvatar isUser={false}>AI</MessageAvatar>
            <div>
              <LoadingMessage>
                <Spinner />
                Thinking...
              </LoadingMessage>
            </div>
          </Message>
        )}

        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInput>
        <InputContainer>
          <InputButton>
            <FiPaperclip size={16} />
          </InputButton>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type messages here"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <InputButton
            className="send"
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
          >
            <FiSend size={16} />
          </InputButton>
        </InputContainer>
      </ChatInput>
    </ChatContainer>
  );
};

export default Chatbot; 