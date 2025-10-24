import React from 'react';
import { FiUser, FiMessageSquare, FiDatabase, FiPlay, FiCopy, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Message = ({ message, executeQuery, onSwitchToQueryPanel }) => {
  const [copied, setCopied] = React.useState(false);

  const getSenderIcon = () => {
    switch (message.sender) {
      case 'user': 
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <FiUser className="text-white text-sm" />
          </div>
        );
      case 'ai': 
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
            <FiMessageSquare className="text-white text-sm" />
          </div>
        );
      default: 
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
            <FiDatabase className="text-white text-sm" />
          </div>
        );
    }
  };

  const getSenderName = () => {
    switch (message.sender) {
      case 'user': return 'You';
      case 'ai': return 'Tova AI';
      default: return 'System';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex mb-4 last:mb-0 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            message.sender === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : message.sender === 'ai'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600'
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}>
            {message.sender === 'user' ? (
              <FiUser className="text-white" size={12} />
            ) : message.sender === 'ai' ? (
              <FiMessageSquare className="text-white" size={12} />
            ) : (
              <FiDatabase className="text-white" size={12} />
            )}
          </div>
        </div>
        
        {/* Message Content */}
        <div 
          className={`rounded-lg p-3 shadow-sm ${message.sender === 'user' 
            ? 'bg-white border-2 border-blue-500 text-gray-800' 
            : message.sender === 'ai'
            ? 'bg-white border-2 border-purple-500 text-gray-800'
            : 'bg-white border border-gray-200 text-gray-800'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className={`text-xs font-medium ${
              message.sender === 'user' ? 'text-blue-600' : 
              message.sender === 'ai' ? 'text-purple-600' : 'text-gray-600'
            }`}>
              {getSenderName()}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          {/* Message Text */}
          <div className="text-sm leading-relaxed text-gray-800">
            {message.sender === 'ai' && message.isStructuredResponse ? (
              <div className="space-y-4">
                {message.text.split('\n\n').map((section, index) => {
                  // Handle structured sections
                  if (section.startsWith('**SQL Query:**')) {
                    const sqlContent = section.replace('**SQL Query:**', '').trim();
                    
                    return (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-700 mb-2 font-semibold">SQL Query:</div>
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border">{sqlContent}</pre>
                      </div>
                    );
                  } else if (section.startsWith('**Result Table:**')) {
                    const resultContent = section.replace('**Result Table:**', '').trim();
                    
                    return (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-green-700 font-semibold">Result Table:</div>
                          {onSwitchToQueryPanel && (
                            <button
                              onClick={() => {
                                // Extract SQL query from the message
                                const sqlSection = message.text.split('\n\n').find(section => 
                                  section.startsWith('**SQL Query:**')
                                );
                                if (sqlSection) {
                                  const sqlQuery = sqlSection.replace('**SQL Query:**', '').trim();
                                  onSwitchToQueryPanel(sqlQuery);
                                }
                              }}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all flex items-center space-x-1"
                            >
                              <FiDatabase size={12} />
                              <span>View in Query Panel</span>
                            </button>
                          )}
                        </div>
                        <div className="text-sm font-mono text-gray-800 bg-white p-2 rounded border max-h-60 overflow-auto">
                          <pre className="whitespace-pre">{resultContent}</pre>
                        </div>
                      </div>
                    );
                  } else if (section.startsWith('**Explanation:**')) {
                    const explanationContent = section.replace('**Explanation:**', '').trim();
                    
                    return (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="text-xs text-purple-700 mb-2 font-semibold">Explanation:</div>
                        <p className="text-sm text-gray-800 leading-relaxed">{explanationContent}</p>
                      </div>
                    );
                  } else {
                    // Fallback for any other content
                    return (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-800 leading-relaxed">{section}</p>
                      </div>
                    );
                  }
                })}
              </div>
            ) : message.sender === 'ai' ? (
              <div className="space-y-3">
                {message.text.split('\n\n').map((paragraph, index) => {
                  // Check if paragraph contains SQL code (starts with SELECT, INSERT, UPDATE, DELETE, etc.)
                  const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'WITH'];
                  const isSQL = sqlKeywords.some(keyword => 
                    paragraph.trim().toUpperCase().startsWith(keyword) || 
                    paragraph.includes('```sql') ||
                    paragraph.includes('```')
                  );
                  
                  if (isSQL) {
                    // Remove ``` markers and format as SQL
                    const cleanSQL = paragraph
                      .replace(/```sql\n?/g, '')
                      .replace(/```\n?/g, '')
                      .trim();
                    
                    return (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-2 font-medium">SQL Query:</div>
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{cleanSQL}</pre>
                      </div>
                    );
                  } else {
                    // Regular text in a nice box
                    return (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-gray-800 leading-relaxed">{paragraph}</p>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              message.text
            )}
          </div>
          
          {/* Query Actions */}
          {message.isQuery && (
            <div className="mt-3 flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => executeQuery(message.query, true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-all bg-green-500 text-white hover:bg-green-600 shadow-sm"
              >
                <FiPlay className="mr-1.5" size={12} /> 
                Execute
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyToClipboard(message.query)}
                className="p-1.5 rounded-lg text-xs transition-all text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                title="Copy query"
              >
                {copied ? <FiCheck className="text-green-500" size={12} /> : <FiCopy size={12} />}
              </motion.button>
            </div>
          )}
        
          {/* Results Preview - Compact */}
          {message.results && message.results.length > 0 && (
            <div className="mt-3">
              <details className="group">
                <summary className="flex items-center cursor-pointer list-none p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FiDatabase className="text-blue-600" size={14} />
                    <span className="text-xs font-medium text-gray-700">
                      Results ({message.results.length} rows)
                    </span>
                  </div>
                  <svg 
                    className="ml-auto w-3 h-3 transition-transform group-open:rotate-90 text-gray-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(message.results[0]).map(key => (
                              <th 
                                key={key} 
                                className="text-left px-2 py-1.5 font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {message.results.slice(0, 3).map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              {Object.values(row).map((val, j) => (
                                <td 
                                  key={j} 
                                  className="px-2 py-1.5 text-gray-700 font-mono border-r border-gray-100 last:border-r-0 max-w-xs truncate"
                                >
                                  {val !== null ? (
                                    <span className="inline-block max-w-full truncate">
                                      {JSON.stringify(val)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">null</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {message.results.length > 3 && (
                            <tr className="bg-gray-50">
                              <td 
                                colSpan={Object.keys(message.results[0]).length} 
                                className="px-2 py-1.5 text-center text-gray-500 text-xs"
                              >
                                +{message.results.length - 3} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </details>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;