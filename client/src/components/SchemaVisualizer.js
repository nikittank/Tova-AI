import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { FiDatabase, FiX } from 'react-icons/fi';
import SchemaFlow from './schema/SchemaFlow';
import SchemaCard from './schema/SchemaCard';
import RightRecords from './schema/RightRecords';

const SchemaVisualizer = ({ 
  tables, 
  tableDetails, 
  isLoading, 
  onClose, 
  connectionId
}) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [tableSummary, setTableSummary] = useState(null);

  const handleTableSelect = async (tableData) => {
    setSelectedTable(tableData);
    setShowRightPanel(true);
    setTableSummary(null); // Reset summary
    
    if (!connectionId) {
      console.error('No connectionId available - please check parent component');
      setIsLoadingRecords(false);
      return;
    }

    setIsLoadingRecords(true);
    
    try {
      // Fetch records first
      const recordsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/table-records`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          connectionId,
          tableName: tableData.tableName,
          limit: 10
        })
      });

      if (!recordsResponse.ok) throw new Error('Failed to fetch records');
      const recordsData = await recordsResponse.json();
      setRecords(recordsData.results || []);

      // Fetch summary separately (don't block on it) - Only AI generated
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/table-summary/${connectionId}/${tableData.tableName}`)
        .then(summaryResponse => {
          if (summaryResponse.ok) {
            return summaryResponse.json();
          }
          throw new Error('Failed to fetch summary');
        })
        .then(summaryData => {
          if (summaryData.success) {
            setTableSummary(summaryData.summary);
          }
        })
        .catch(error => {
          console.error('Error fetching table summary:', error);
          // No fallback - only show AI generated summaries
        });

    } catch (error) {
      console.error('Error fetching table data:', error);
      setRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleCloseRecords = () => {
    setShowRightPanel(false);
    setSelectedTable(null);
    setRecords([]);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800">Loading Database Schema</h3>
        <p className="mt-1 text-gray-600">Analyzing table relationships...</p>
      </div>
    </div>
  );

  if (!tables.length) return (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <FiDatabase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-800">No Tables Found</h3>
        <p className="mt-1 text-gray-600">The database doesn't contain any tables</p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Full-width Schema Flow - always takes full space */}
      <div className="h-full w-full">
        <ReactFlowProvider>
          <SchemaFlow 
            tables={tables} 
            tableDetails={tableDetails} 
            onClose={onClose}
            onTableSelect={handleTableSelect}
          />
        </ReactFlowProvider>
      </div>

      {/* Overlay Right Panel - doesn't affect layout */}
      {showRightPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 z-40"
            onClick={handleCloseRecords}
          />
          
          {/* Sliding Panel - Curved edges with Full Scrollbar and Close Button */}
          <div className="absolute top-0 right-0 h-full w-[700px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col overflow-auto table-scrollbar rounded-l-3xl">
            {/* Inner container with 0.5cm padding */}
            <div className="p-[0.5cm] flex flex-col h-full">
              {/* Panel Header with Table Name */}
              <div className="flex items-center justify-between mb-4 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">{selectedTable?.tableName || 'Table'}</h2>
                <button
                  onClick={handleCloseRecords}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-xl transition-colors"
                  title="Close Panel"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Description Section */}
              {tableSummary && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {tableSummary.line1?.replace(/[`'"]/g, '')} {tableSummary.line2?.replace(/[`'"]/g, '')}
                  </p>
                </div>
              )}

              {/* Columns Section */}
              <div className="mb-4">
                <SchemaCard 
                  table={selectedTable} 
                />
              </div>

              {/* Data Preview Section */}
              <RightRecords 
                table={selectedTable} 
                records={records} 
                isLoading={isLoadingRecords}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SchemaVisualizer;