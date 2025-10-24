import React, { useRef, useEffect } from 'react';
import { FiSend, FiDatabase, FiMessageSquare } from 'react-icons/fi';
import Message from './Message';

const AIChat = ({
  messages,
  userInput,
  setUserInput,
  handleSendMessage,
  isGenerating,
  currentConnection,
  executeQuery,
  onSwitchToQueryPanel
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="px-4 py-2 border-b border-gray-300 flex-shrink-0" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FiMessageSquare className="mr-2 text-gray-600" size={14} />
            <div>
              <h2 className="text-sm font-medium text-gray-700">Assistant</h2>
              <p className="text-xs text-gray-500">
                {currentConnection ? 'Ready to help' : 'Connect to database'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-500">Ready</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F6F6F6' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
              <FiDatabase className="text-gray-600" size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {currentConnection ? "Ready to explore your data" : "Connect to get started"}
            </h3>
            <p className="text-gray-600 text-sm mb-6 max-w-md">
              {currentConnection
                ? "Ask questions about your data using natural language"
                : "Connect to a database to start"}
            </p>

            {currentConnection && (
              <div className="space-y-2 w-full max-w-lg">
                <div className="text-xs font-medium text-gray-700 mb-3">Examples:</div>
                {[
                  "Show me the 10 most active users",
                  "Find all orders from last month", 
                  "What are the top selling products?",
                  "Show recent client projects"
                ].map((example, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition-all"
                    onClick={() => setUserInput && setUserInput(example)}
                  >
                    <p className="text-sm text-gray-700">
                      {example}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map(message => (
              <Message
                key={message.id}
                message={message}
                executeQuery={executeQuery}
                onSwitchToQueryPanel={onSwitchToQueryPanel}
              />
            ))}
            {isGenerating && (
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                </div>
                <span className="text-gray-600 text-sm">Analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 flex-shrink-0" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={currentConnection ? "Ask about your data..." : "Connect to database..."}
              disabled={!currentConnection || isGenerating}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 text-sm text-gray-800 placeholder-gray-500 transition-all"
              style={{ backgroundColor: '#F6F6F6' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentConnection || !userInput.trim() || isGenerating}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-all ${!currentConnection || !userInput.trim() || isGenerating
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
            >
              <FiSend size={12} />
            </button>
          </div>
          {currentConnection && (
            <div className="mt-1">
              <p className="text-xs text-gray-500">
                Press Enter to send
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;