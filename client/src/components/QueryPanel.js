import React, { useState } from 'react';
import { FiPlay, FiTrash2, FiMaximize2, FiMinimize2, FiCopy, FiDownload } from 'react-icons/fi';

const QueryPanel = ({ 
  query, 
  setQuery, 
  executeQuery, 
  isLoading, 
  queryResults, 
  currentConnection 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResults = () => {
    if (!queryResults?.results) return;
    
const csvContent = [
  queryResults.fields.map(f => f.name).join(','), // first row with column names
  ...queryResults.results.map(row => 
    queryResults.fields.map(field => 
      JSON.stringify(row[field.name] ?? 'NULL')
    ).join(',') // each subsequent row
  )
].join('\n'); // closing the array before calling .join

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'query_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderResults = () => {
    if (!queryResults || !queryResults.results) return null;
    
    const results = Array.isArray(queryResults.results) 
      ? queryResults.results 
      : [queryResults.results];
    
    const fields = Array.isArray(queryResults.fields) 
      ? queryResults.fields 
      : (results[0] ? Object.keys(results[0]).map(name => ({ name })) : []);

    return (
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-800">Results</h3>
            <div className="flex items-center space-x-1">
              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-lg font-medium">
                {results.length} rows
              </span>
              {fields.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-lg font-medium">
                  {fields.length} cols
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={downloadResults}
            disabled={results.length === 0}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <FiDownload className="mr-1" size={12} /> 
            Export
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {fields.map(field => (
                    <th 
                      key={field.name} 
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
                    >
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {results.slice(0, 100).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {fields.map(field => (
                      <td 
                        key={field.name} 
                        className="px-3 py-2 text-xs text-gray-700 font-mono max-w-xs truncate border-r border-gray-100 last:border-r-0"
                        title={row[field.name] !== null ? String(row[field.name]) : 'NULL'}
                      >
                        {row[field.name] !== null && row[field.name] !== undefined 
                          ? (
                            <span className="inline-block max-w-full truncate">
                              {String(row[field.name])}
                            </span>
                          )
                          : <span className="text-gray-400 italic">NULL</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                {results.length > 100 && (
                  <tr className="bg-gray-50">
                    <td colSpan={fields.length} className="px-3 py-2 text-center text-xs text-gray-600 font-medium">
                      Showing first 100 of {results.length} rows • 
                      <button className="ml-1 text-primary-600 hover:text-primary-700 underline">
                        Export all
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="px-4 py-2 border-b border-gray-300 flex-shrink-0" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FiPlay className="mr-2 text-gray-600" size={14} />
            <div>
              <h2 className="text-sm font-medium text-gray-700">Query Editor</h2>
              <p className="text-xs text-gray-500">
                {currentConnection 
                  ? `${currentConnection.name}`
                  : 'Connect to database'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 flex-shrink-0">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 font-mono text-sm text-gray-800 hover:border-gray-400 transition-all resize-none ${
                isExpanded ? 'h-64' : 'h-32'
              }`}
              style={{ backgroundColor: '#F6F6F6' }}
              placeholder={currentConnection 
                ? "-- Write your SQL query here\nSELECT * FROM users LIMIT 10;" 
                : "-- Connect to a database to run queries"}
              disabled={!currentConnection}
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={copyToClipboard}
                disabled={!query.trim()}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <FiCopy size={12} />
                {copied && (
                  <div className="absolute -top-6 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg shadow-lg">
                    Copied!
                  </div>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => executeQuery()}
                disabled={!currentConnection || !query.trim() || isLoading}
                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all text-sm ${
                  isLoading || !currentConnection || !query.trim()
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gray-800 hover:bg-black text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing...
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-1.5" size={14} />
                    Execute
                  </>
                )}
              </button>
              
              <button
                onClick={() => setQuery('')}
                disabled={!query.trim()}
                className="px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FiTrash2 className="mr-1.5" size={14} />
                Clear
              </button>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="font-mono">{query.length} chars</span>
              {query.split('\n').length > 1 && (
                <span className="font-mono">{query.split('\n').length} lines</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {renderResults()}
        </div>
      </div>
    </div>
  );
};

export default QueryPanel;