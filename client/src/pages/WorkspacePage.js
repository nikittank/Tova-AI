import React, { useState, useEffect, useCallback } from 'react';
import { FiAlertCircle, FiGrid, FiMessageSquare, FiCode, FiUser, FiX, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DatabaseExplorer from '../components/DatabaseExplorer';
import QueryPanel from '../components/QueryPanel';
import AIChat from '../components/AIChat';
import SchemaVisualizer from '../components/SchemaVisualizer';

import logo from '../images/logo1.png';

const WorkspacePage = ({ currentConnection, onDisconnect }) => { // onDisconnect kept for compatibility but not used in UI
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState({ results: [], fields: [] });
  const [tables, setTables] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tableDetails, setTableDetails] = useState({});
  const [error, setError] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [mainTab, setMainTab] = useState('assistant'); // 'assistant' or 'visualizer'
  const [assistantTab, setAssistantTab] = useState('chat'); // 'chat' or 'query'
  const [navbarPosition, setNavbarPosition] = useState({ x: 'center', y: 16 }); // Initial position - centered
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fetchTables = useCallback(async (connectionId) => {
    if (!currentConnection) return;

    const controller = new AbortController();
    setAbortController(controller);

    try {
      setIsLoading(true);
      setError(null);

      const tablesResponse = await fetch(
        `http://localhost:5000/api/tables/${connectionId}?password=${encodeURIComponent(currentConnection.config.password)}`,
        { signal: controller.signal }
      );

      if (!tablesResponse.ok) {
        throw new Error(`Failed to fetch tables: ${tablesResponse.statusText}`);
      }

      const tablesData = await tablesResponse.json();

      if (!tablesData.success || !Array.isArray(tablesData.tables)) {
        throw new Error(tablesData.message || 'Invalid tables data received');
      }

      setTables(tablesData.tables);

      // Fetch table details in parallel
      const detailsPromises = tablesData.tables.map(async (table) => {
        try {
          const detailResponse = await fetch(
            `http://localhost:5000/api/table-details/${connectionId}/${table.name}?password=${encodeURIComponent(currentConnection.config.password)}`,
            { signal: controller.signal }
          );

          if (!detailResponse.ok) {
            return { name: table.name, columns: [] };
          }

          const detailData = await detailResponse.json();
          return detailData.success ? detailData.table : { name: table.name, columns: [] };
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error(`Error fetching details for ${table.name}:`, err);
          }
          return { name: table.name, columns: [] };
        }
      });

      const detailsResults = await Promise.all(detailsPromises);
      const details = detailsResults.reduce((acc, table) => {
        acc[table.name] = table;
        return acc;
      }, {});

      setTableDetails(details);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch tables:', error);
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [currentConnection]);

  useEffect(() => {
    if (currentConnection) {
      // Store the current connection ID in localStorage for table summaries
      localStorage.setItem('currentConnectionId', currentConnection.id);
      console.log('WorkspacePage - Stored connection ID:', currentConnection.id);

      fetchTables(currentConnection.id);
    }
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [currentConnection, fetchTables]);

  const executeQuery = async (queryToExecute = query, fromChat = false) => {
    if (!currentConnection || !queryToExecute.trim()) return;

    setIsLoading(true);
    setQueryResults({ results: [], fields: [] });

    try {
      const response = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: currentConnection.id,
          query: queryToExecute.trim(),
          password: currentConnection.config.password
        })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Query execution failed');
      }

      const results = Array.isArray(data.results) ? data.results : [data.results];
      setQueryResults({ results, fields: data.fields || [] });

      // Only add message if not executed from chat (to prevent duplicates)
      if (!fromChat) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Query executed successfully. Returned ${results.length} rows.`,
          sender: 'system',
          isQuery: false,
          results,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Query execution error:', error);
      // Always show error messages
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Query failed: ${error.message}`,
        sender: 'system',
        isQuery: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !currentConnection) return;

    const userMessage = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      isQuery: false,
      timestamp: new Date().toISOString()
    };

    const originalPrompt = userInput;
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsGenerating(true);

    try {
      // Step 1: Generate SQL query
      const response = await fetch('http://localhost:5000/api/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: currentConnection.id,
          prompt: originalPrompt,
          password: currentConnection.config.password
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate query: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate query');
      }

      // Don't show the initial query message - we'll show it in the structured response
      setQuery(data.query);

      // Step 2: Execute the query automatically
      const queryResponse = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: currentConnection.id,
          query: data.query.trim(),
          password: currentConnection.config.password
        })
      });

      if (queryResponse.ok) {
        const queryData = await queryResponse.json();
        if (queryData.success) {
          const results = Array.isArray(queryData.results) ? queryData.results : [queryData.results];
          setQueryResults({ results, fields: queryData.fields || [] });

          // Step 3: Always send results back to AI for explanation and insights
          try {
            const explanationResponse = await fetch('http://localhost:5000/api/explain-results', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originalPrompt: originalPrompt,
                query: data.query,
                results: results.slice(0, 20), // Send first 20 rows for better analysis
                fields: queryData.fields || []
              })
            });

            if (explanationResponse.ok) {
              const explanationData = await explanationResponse.json();
              if (explanationData.success) {
                // Helper function to convert results to ASCII table format (matching server)
                const convertToTable = (results, fields) => {
                  if (!results || results.length === 0) {
                    return "No results found.";
                  }

                  // Get column names
                  const columns = fields && fields.length > 0
                    ? fields.map(f => f.name)
                    : Object.keys(results[0]);

                  // Calculate column widths
                  const columnWidths = columns.map(col => {
                    const headerWidth = col.length;
                    const maxDataWidth = Math.max(...results.slice(0, 5).map(row => {
                      const value = row[col];
                      if (value === null || value === undefined) return 4; // 'NULL'
                      return String(value).length;
                    }));
                    return Math.max(headerWidth, maxDataWidth, 8); // minimum width of 8
                  });

                  // Create table with proper ASCII borders
                  const createRow = (values, widths) => {
                    const paddedValues = values.map((val, i) => {
                      const str = String(val).padEnd(widths[i]);
                      return str;
                    });
                    return `| ${paddedValues.join(' | ')} |`;
                  };

                  const createSeparator = (widths) => {
                    const separators = widths.map(width => '-'.repeat(width + 2)); // +2 for padding
                    return `+${separators.join('+')}+`;
                  };

                  // Build the table
                  const separator = createSeparator(columnWidths);
                  const header = createRow(columns, columnWidths);

                  const rows = results.slice(0, 5).map(row => {
                    const values = columns.map(col => {
                      const value = row[col];
                      if (value === null || value === undefined) return 'NULL';
                      // Format dates to remove time portion for cleaner display
                      if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
                        return value.split('T')[0]; // Just the date part
                      }
                      return String(value);
                    });
                    return createRow(values, columnWidths);
                  });

                  let table = [separator, header, separator, ...rows, separator].join('\n');

                  if (results.length > 5) {
                    table += `\n(Showing 5 of ${results.length} total rows)`;
                  }

                  return table;
                };

                // Create structured response with ASCII table format
                const structuredText = `**SQL Query:**
${explanationData.query}

**Result Table:**
${convertToTable(explanationData.results, queryData.fields)}

**Explanation:**
${explanationData.explanation}`;

                const explanationMessage = {
                  id: Date.now() + 2,
                  text: structuredText,
                  sender: 'ai',
                  isQuery: false,
                  timestamp: new Date().toISOString(),
                  isStructuredResponse: true
                };
                setMessages(prev => [...prev, explanationMessage]);
              } else {
                // Fallback explanation if AI analysis fails
                const fallbackMessage = {
                  id: Date.now() + 2,
                  text: `Query executed successfully and returned ${results.length} ${results.length === 1 ? 'record' : 'records'}.`,
                  sender: 'ai',
                  isQuery: false,
                  timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, fallbackMessage]);
              }
            } else {
              // Fallback if explanation endpoint fails
              const fallbackMessage = {
                id: Date.now() + 2,
                text: `Found ${results.length} ${results.length === 1 ? 'result' : 'results'} for your query.`,
                sender: 'ai',
                isQuery: false,
                timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, fallbackMessage]);
            }
          } catch (explanationError) {
            console.error('Error getting explanation:', explanationError);
            // Always provide some feedback even if explanation fails
            const fallbackMessage = {
              id: Date.now() + 2,
              text: `Query completed successfully with ${results.length} ${results.length === 1 ? 'result' : 'results'}.`,
              sender: 'ai',
              isQuery: false,
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, fallbackMessage]);
          }
        } else {
          // Handle query execution failure - provide helpful error message
          const errorMessage = queryData.message || 'Query execution failed';
          const errorDetails = queryData.error || '';

          let userFriendlyError = errorMessage;
          if (errorDetails.includes('Table') && errorDetails.includes("doesn't exist")) {
            userFriendlyError = "The query tried to access tables that don't exist in your database. Please check your database structure.";
          } else if (errorDetails.includes('Unknown column')) {
            userFriendlyError = "The query referenced columns that don't exist in your tables.";
          }

          const errorMsg = {
            id: Date.now() + 2,
            text: `Query Error: ${userFriendlyError}`,
            sender: 'ai',
            isQuery: false,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, errorMsg]);
          return; // Don't throw, just show the error message
        }
      } else {
        // Handle HTTP error
        const errorData = await queryResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to execute query';

        const errorMsg = {
          id: Date.now() + 2,
          text: `Connection Error: ${errorMessage}`,
          sender: 'ai',
          isQuery: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
        return; // Don't throw, just show the error message
      }
    } catch (error) {
      console.error('Error in AI workflow:', error);

      let errorMessage = `Sorry, I encountered an error: ${error.message}`;

      // Provide helpful suggestions based on error type
      if (error.message.includes('Table') && error.message.includes("doesn't exist")) {
        errorMessage = `I tried to query tables that don't exist in your database. Let me know what specific data you're looking for, and I'll use the available tables in your database.`;
      } else if (error.message.includes('generate query')) {
        errorMessage = `I had trouble generating a query for your request. Could you try rephrasing your question or be more specific about what data you need?`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'ai',
        isQuery: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTableSelect = (table) => {
    // Handle table selection logic
    console.log('Table selected:', table);
  };

  const handleRefresh = () => {
    if (currentConnection) {
      fetchTables(currentConnection.id);
    }
  };

  // Drag functionality for navbar
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = React.useCallback((e) => {
    if (isDragging) {
      // Get the right panel element directly
      const rightPanel = document.querySelector('.flex-1.min-w-\\[400px\\]');
      if (rightPanel) {
        const panelRect = rightPanel.getBoundingClientRect();
        setNavbarPosition({
          x: Math.max(0, Math.min(e.clientX - panelRect.left - dragOffset.x, panelRect.width - 200)),
          y: Math.max(0, Math.min(e.clientY - panelRect.top - dragOffset.y, panelRect.height - 50))
        });
      }
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex h-screen compact-workspace workspace-compact" style={{ backgroundColor: '#F6F6F6' }}>
      {/* Grid Pattern */}
      <div
        className="fixed inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.2) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 80px 80px, 40px 40px, 40px 40px'
        }}
      />

      {/* Left Panel: Logo, Action Buttons and Database Explorer */}
      <div className="w-80 flex-shrink-0 border-r border-gray-300 rounded-r-lg" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="h-full flex flex-col">
          {/* Logo Header */}
          <div className="px-4 py-4 bg-gray-100 border-b border-gray-300 rounded-tr-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="Tova AI" className="w-9 h-7" />
              </div>

              {/* Action Button */}
              <button
                onClick={onDisconnect}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Disconnect Database"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>

          {/* Database Explorer */}
          <div className="flex-1 overflow-hidden">
            <DatabaseExplorer
              currentConnection={currentConnection}
              tables={tables}
              tableDetails={tableDetails}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              onTableSelect={handleTableSelect}
            />
          </div>
        </div>
      </div>

      {/* Right Side: Main Content Area */}
      <div className="flex-1 min-w-[400px] relative" style={{ backgroundColor: '#F6F6F6' }}>
        {/* Draggable Navigation Bar */}
        <div
          className={`absolute z-40 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            left: navbarPosition.x === 'center' ? '50%' : `${navbarPosition.x}px`,
            top: `${navbarPosition.y}px`,
            transform: navbarPosition.x === 'center' ? 'translateX(-50%)' : 'none'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-300 overflow-hidden hover:shadow-xl transition-shadow">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMainTab('assistant');
              }}
              className={`px-4 py-2 text-xs font-medium transition-all flex items-center space-x-1 ${mainTab === 'assistant'
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <FiUser size={12} />
              <span>Assistant</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMainTab('visualizer');
              }}
              className={`px-4 py-2 text-xs font-medium transition-all flex items-center space-x-1 ${mainTab === 'visualizer'
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <FiGrid size={12} />
              <span>Schema</span>
            </button>
          </div>
        </div>

        {/* Main Tab Content */}
        <div className="h-full flex flex-col">
          {mainTab === 'assistant' ? (
            /* AI Assistant Tab - Default to AI Chat with floating Query Panel button */
            <div className="h-full relative" style={{ backgroundColor: '#F6F6F6' }}>
              {/* Floating Query Panel Button - SLIGHTLY DOWN FROM TOP RIGHT (only when in chat mode) */}
              {assistantTab === 'chat' && (
                <div className="absolute top-16 right-4 z-30">
                  <button
                    onClick={() => setAssistantTab('query')}
                    className="px-3 py-2 bg-gray-900 text-white rounded-xl shadow-sm hover:bg-black transition-all flex items-center space-x-1 text-xs font-medium"
                  >
                    <FiCode size={12} />
                    <span>Query</span>
                  </button>
                </div>
              )}

              {/* Back to AI Chat button when in Query Panel */}
              {assistantTab === 'query' && (
                <div className="absolute top-16 right-4 z-30">
                  <button
                    onClick={() => setAssistantTab('chat')}
                    className="px-3 py-2 bg-gray-600 text-white rounded-xl shadow-sm hover:bg-gray-700 transition-all flex items-center space-x-1 text-xs font-medium"
                  >
                    <FiMessageSquare size={12} />
                    <span>Chat</span>
                  </button>
                </div>
              )}

              {/* AI Assistant Content */}
              <div className="h-full" style={{ backgroundColor: '#F6F6F6' }}>
                {assistantTab === 'chat' ? (
                  <AIChat
                    messages={messages}
                    userInput={userInput}
                    setUserInput={setUserInput}
                    handleSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    currentConnection={currentConnection}
                    executeQuery={executeQuery}
                    onSwitchToQueryPanel={(sqlQuery) => {
                      setAssistantTab('query');
                      if (sqlQuery) {
                        setQuery(sqlQuery);
                        setTimeout(() => {
                          executeQuery(sqlQuery, true);
                        }, 100);
                      }
                    }}
                  />
                ) : (
                  <QueryPanel
                    query={query}
                    setQuery={setQuery}
                    executeQuery={executeQuery}
                    isLoading={isLoading}
                    queryResults={queryResults}
                    currentConnection={currentConnection}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Schema Visualizer Tab */
            <div className="h-full" style={{ backgroundColor: '#F6F6F6' }}>
              <SchemaVisualizer
                tables={tables}
                tableDetails={tableDetails}
                isLoading={isLoading}
                connectionId={currentConnection?.id}
              />
            </div>
          )}
        </div>
      </div>

      {/* Professional Error Notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start max-w-md backdrop-blur-sm"
        >
          <div className="flex-shrink-0 mt-0.5 text-red-500">
            <FiAlertCircle className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-100"
          >
            <FiX size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default WorkspacePage;