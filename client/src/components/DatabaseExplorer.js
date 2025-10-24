import React, { useState } from 'react';
import { FiDatabase, FiTable, FiSearch } from 'react-icons/fi';
import { IoCubeOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import ConnectionCard from './ConnectionCard';

const DatabaseExplorer = ({ currentConnection, tables, tableDetails, isLoading, onRefresh, onTableClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState(new Set());

  const handleTableClick = (tableName) => {
    if (onTableClick) {
      onTableClick(tableName);
    }
  };

  const toggleTableExpansion = (tableName, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {currentConnection && (
        <div className="p-3 border-b border-gray-200">
          <ConnectionCard 
            connection={currentConnection}
            isLoading={isLoading}
            onRefresh={onRefresh}
          />
        </div>
      )}
      
      {currentConnection ? (
        <div className="flex flex-col h-full">
          {/* Search and Database Header */}
          <div className="px-3 py-2 border-b border-gray-200 space-y-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 pl-8 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={12} />
              </div>
            </div>

            {/* Database Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-gray-800 flex items-center">
                <FiDatabase className="mr-1 text-primary-500" size={12} />
                {currentConnection.config.database || 'Database'}
              </h3>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-xl font-medium">
                {filteredTables.length}
              </span>
            </div>
          </div>

          {/* Tables List */}
          <div className="flex-grow overflow-y-auto">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="loading-shimmer h-8 rounded"></div>
                ))}
              </div>
            ) : filteredTables.length > 0 ? (
              <div className="p-1">
                <AnimatePresence>
                  {filteredTables.map((table, index) => {
                    const tableDetail = tableDetails[table.name];
                    const isExpanded = expandedTables.has(table.name);
                    
                    return (
                      <motion.div
                        key={table.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="mb-1"
                      >
                        <div 
                          className="p-2 hover:bg-gray-50 rounded-xl cursor-pointer group border border-transparent hover:border-gray-200"
                          onClick={() => handleTableClick(table.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => toggleTableExpansion(table.name, e)}
                                className={`mr-2 p-0.5 transition-all ${
                                  isExpanded ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <div 
                                  className={`w-0 h-0 border-l-[6px] border-r-0 border-t-[4px] border-b-[4px] border-l-current border-t-transparent border-b-transparent transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </motion.button>
                              
                              <IoCubeOutline className="text-blue-500 mr-2 flex-shrink-0" size={14} />
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors truncate">
                                  {table.name}
                                </div>
                                {table.comment && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {table.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center ml-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-xl font-medium whitespace-nowrap">
                                {tableDetail?.columns?.length || table.columnCount || 0}
                              </span>
                            </div>
                          </div>
                          
                          {/* Expanded Table Details */}
                          <AnimatePresence>
                            {isExpanded && tableDetail?.columns && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 overflow-hidden"
                              >
                                <div className="bg-gray-50 rounded-xl p-2">
                                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Columns</h4>
                                  <div className="space-y-1">
                                    {tableDetail.columns.map((column, i) => (
                                      <div key={i} className="flex items-center justify-between py-1 px-2 bg-white rounded-xl text-xs">
                                        <div className="flex items-center min-w-0 flex-1">
                                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2 flex-shrink-0"></div>
                                          <span className="font-medium text-gray-800 truncate">{column.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 ml-2">
                                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-xl font-mono">
                                            {column.type}
                                          </span>
                                          {column.nullable === 'NO' && (
                                            <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded-xl">
                                              NN
                                            </span>
                                          )}
                                          {column.key === 'PRI' && (
                                            <span className="text-xs bg-yellow-100 text-yellow-600 px-1 py-0.5 rounded-xl">
                                              PK
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : searchTerm ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                  <FiSearch className="text-gray-400 text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-700 mb-2">No tables found</h4>
                <p className="text-sm text-gray-500">No tables match "{searchTerm}"</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                  <FiTable className="text-gray-400 text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-700 mb-2">No tables found</h4>
                <p className="text-sm text-gray-500">This database doesn't contain any tables</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center mb-6 shadow-soft"
          >
            <FiDatabase className="text-primary-600 text-3xl" />
          </motion.div>
          <h4 className="text-xl font-bold text-gray-800 mb-3">No Connection</h4>
          <p className="text-gray-600 max-w-sm text-balance">
            Connect to a database to start exploring your tables and data structure
          </p>
        </div>
      )}
    </div>
  );
};

export default DatabaseExplorer;