// TableNode.js
import { useState, useEffect } from 'react';
import { FiDatabase, FiKey, FiLink, FiChevronDown, FiChevronRight, FiMoreHorizontal, FiInfo } from 'react-icons/fi';
import { Handle } from 'reactflow';

const TableNode = ({ data, selected }) => {
  const [showColumns, setShowColumns] = useState(true);
  const [showCalculatedFields, setShowCalculatedFields] = useState(false);
  const [showRelationships, setShowRelationships] = useState(true); // Always show relationships expanded
  const [showSummary, setShowSummary] = useState(false);
  const [tableSummary, setTableSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Helper function to capitalize first letter of table names
  const capitalizeTableName = (tableName) => {
    if (!tableName) return '';
    return tableName.charAt(0).toUpperCase() + tableName.slice(1);
  };

  // Helper function to get relationship type label
  const getRelationshipTypeLabel = (type) => {
    console.log('TableNode - Converting relationship type:', type);

    switch (type) {
      case 'one-to-one': return '1:1';
      case 'one-to-many': return '1:N';
      case 'many-to-one': return 'N:1';
      case 'many-to-many': return 'M:N';
      default:
        console.log('TableNode - Unknown relationship type, defaulting to N:1');
        return 'N:1';
    }
  };

  // Separate columns by type
  const regularColumns = data.columns?.filter(col => col.key !== 'CALCULATED') || [];
  const calculatedFields = data.columns?.filter(col => col.key === 'CALCULATED') || [];

  // Enhanced relationships with proper type detection - includes ALL relationship types
  const relationships = regularColumns
    .filter(col => {
      // Include columns with explicit relationships OR foreign key columns (MUL) OR primary keys that might be foreign keys
      return col.relationship || 
             col.key === 'MUL' || 
             (col.key === 'PRI' && (col.name.endsWith('_id') || col.name.endsWith('Id') || col.name.toLowerCase().includes('id')));
    })
    .map(col => {
      if (col.relationship) {
        // Explicit relationship data available
        console.log('TableNode - Processing explicit relationship:', col.relationship);
        const relationshipType = getRelationshipTypeLabel(col.relationship.relationshipType);
        console.log('TableNode - Converted type:', col.relationship.relationshipType, '->', relationshipType);

        // Skip self-referencing relationships
        if (col.relationship.referencedTable === data.tableName) {
          return null;
        }

        return {
          table: capitalizeTableName(col.relationship.referencedTable),
          column: col.name,
          referencedColumn: col.relationship.referencedColumn,
          type: relationshipType,
          constraintName: col.relationship.constraintName
        };
      } else if (col.key === 'MUL' || (col.key === 'PRI' && (col.name.endsWith('_id') || col.name.endsWith('Id') || col.name.toLowerCase().includes('id')))) {
        // Handle foreign key relationships or primary keys that are also foreign keys
        console.log('TableNode - Processing foreign/primary key column:', col);
        
        // Try to extract referenced table from column name
        let referencedTable = '';
        if (col.name.endsWith('_id')) {
          referencedTable = col.name.replace('_id', '');
        } else if (col.name.endsWith('Id')) {
          referencedTable = col.name.replace('Id', '');
        } else if (col.name.toLowerCase().includes('id')) {
          referencedTable = col.name.replace(/id/gi, '').replace(/_/g, '');
        }
        
        // If we can't determine the table name, use a generic name
        if (!referencedTable) {
          referencedTable = 'Related Table';
        }

        // Skip self-referencing relationships - check both singular and plural forms
        const currentTableLower = data.tableName.toLowerCase();
        const referencedTableLower = referencedTable.toLowerCase();
        
        // Check if it's the same table (accounting for singular/plural variations)
        if (referencedTableLower === currentTableLower || 
            referencedTableLower === currentTableLower.replace(/s$/, '') ||
            currentTableLower === referencedTableLower.replace(/s$/, '') ||
            referencedTableLower + 's' === currentTableLower ||
            currentTableLower + 's' === referencedTableLower) {
          return null;
        }
        
        return {
          table: capitalizeTableName(referencedTable),
          column: col.name,
          referencedColumn: 'id', // Default assumption
          type: col.key === 'PRI' ? '1:1' : 'N:1', // Primary keys are usually 1:1, foreign keys are N:1
          constraintName: null
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null entries

  // Also check for reverse relationships where this table's columns are referenced by others
  // This ensures we show all connections, including when primary keys are referenced
  console.log('TableNode - All relationships found:', relationships);

  // Fetch AI-generated table summary from server
  const fetchTableSummary = async () => {
    if (tableSummary || loadingSummary) return;

    setLoadingSummary(true);
    try {
      let connectionId = localStorage.getItem('currentConnectionId');

      if (!connectionId) {
        console.error('No connection ID found in localStorage');
        setTableSummary({
          line1: 'No active connection found.',
          line2: 'Please reconnect to the database to load summaries.'
        });
        return;
      }

      const url = `http://localhost:5000/api/table-summary/${connectionId}/${data.tableName}`;
      console.log('Fetching table summary from:', url);
      console.log('Using connection ID:', connectionId);

      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Summary result:', result);

      if (result.success) {
        setTableSummary(result.summary);
      } else {
        console.error('Summary fetch failed:', result.message);
        if (result.message && result.message.includes('Connection not found')) {
          // Clear stale connection ID and ask user to reconnect
          localStorage.removeItem('currentConnectionId');
          setTableSummary({
            line1: 'Connection expired.',
            line2: 'Please reconnect to the database to load summaries.'
          });
        } else {
          setTableSummary({
            line1: 'Unable to generate summary.',
            line2: result.message || 'Please check connection and try again.'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching table summary:', error);
      setTableSummary({
        line1: 'Error loading summary.',
        line2: `Network issue: ${error.message}`
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (showSummary && !tableSummary) {
      fetchTableSummary();
    }
  }, [showSummary, tableSummary]);

  return (
    <div className={`rounded-lg shadow-lg border-2 ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} bg-white overflow-hidden w-80 transition-all duration-200`}>
      {/* Table Header - Blue Theme */}
      <div className="bg-blue-600 text-white px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiDatabase className="mr-2 text-blue-200" size={16} />
            <span className="font-semibold text-sm">{data.tableName}</span>
          </div>
          <button className="text-blue-200 hover:text-white">
            <FiMoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Columns Section */}
      <div className="bg-white">
        <div
          className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
          onClick={() => setShowColumns(!showColumns)}
        >
          <div className="flex items-center">
            {showColumns ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            <span className="ml-1 text-xs font-semibold text-gray-700">Columns</span>
          </div>
          <span className="text-xs text-gray-500">{regularColumns.length}</span>
        </div>

        {showColumns && (
          <div className="max-h-64 overflow-y-auto">
            {regularColumns.map((col) => (
              <div
                key={col.name}
                className={`relative flex items-center px-3 py-1.5 text-xs border-b border-gray-100 last:border-b-0 ${col.key === 'PRI' ? 'bg-yellow-50' : col.key === 'MUL' ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  {col.key === 'PRI' && (
                    <FiKey className="text-yellow-600 mr-1.5 flex-shrink-0" size={12} />
                  )}
                  {col.key === 'MUL' && (
                    <FiLink className="text-green-600 mr-1.5 flex-shrink-0" size={12} />
                  )}
                  <span className="font-medium text-gray-900 truncate">{col.name}</span>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <span className="text-gray-500 font-mono text-xs">{col.type}</span>
                  {col.key === 'PRI' && (
                    <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs font-medium">PK</span>
                  )}
                  {col.key === 'MUL' && (
                    <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-medium">FK</span>
                  )}
                </div>
                
                {/* Target handle for columns that can be referenced (especially primary keys) */}
                {col.key === 'PRI' && (
                  <Handle
                    type="target"
                    position="left"
                    id={`${data.tableName}-${col.name}-target`}
                    style={{
                      position: 'absolute',
                      left: -6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#fbbf24',
                      border: '2px solid white',
                      opacity: 0.8
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculated Fields Section */}
      {calculatedFields.length > 0 && (
        <div className="bg-white border-t border-gray-200">
          <div
            className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            onClick={() => setShowCalculatedFields(!showCalculatedFields)}
          >
            <div className="flex items-center">
              {showCalculatedFields ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
              <span className="ml-1 text-xs font-semibold text-gray-700">Calculated Fields</span>
            </div>
            <span className="text-xs text-gray-500">{calculatedFields.length}</span>
          </div>

          {showCalculatedFields && (
            <div className="max-h-32 overflow-y-auto">
              {calculatedFields.map((field) => (
                <div key={field.name} className="flex items-center px-3 py-1.5 text-xs border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <span className="font-medium text-gray-900 truncate flex-1">{field.name}</span>
                  <span className="text-gray-500 font-mono text-xs ml-2">{field.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Relationships Section */}
      {relationships.length > 0 && (
        <div className="bg-white border-t border-gray-200">
          <div
            className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => setShowRelationships(!showRelationships)}
          >
            <div className="flex items-center">
              {showRelationships ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
              <span className="ml-1 text-xs font-semibold text-gray-700">Relationships</span>
            </div>
            <span className="text-xs text-gray-500">{relationships.length}</span>
          </div>

          {showRelationships && (
            <div>
              {relationships.map((rel, index) => (
                <div 
                  key={`${rel.table}-${rel.column}-${index}`} 
                  className="relative px-3 py-2 text-xs border-b border-gray-100 last:border-b-0 hover:bg-blue-50 cursor-pointer"
                  data-relationship={JSON.stringify(rel)}
                  title={`${data.tableName}.${rel.column} → ${rel.table}.${rel.referencedColumn} (${rel.type})`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-blue-700 truncate text-xs">{rel.table}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {rel.column} → {rel.referencedColumn}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                        {rel.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Connection handle for this specific relationship */}
                  <Handle
                    type="source"
                    position="right"
                    id={`${data.tableName}-${rel.column}-source`}
                    style={{
                      position: 'absolute',
                      right: -6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: '2px solid white',
                      opacity: 0.8
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table Summary Section */}
      <div className="bg-white border-t border-gray-200">
        <div
          className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
          onClick={() => setShowSummary(!showSummary)}
        >
          <div className="flex items-center">
            {showSummary ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            <span className="ml-1 text-xs font-semibold text-gray-700">Summary</span>
          </div>
          <FiInfo className="text-gray-400" size={12} />
        </div>

        {showSummary && (
          <div className="px-3 py-2 text-xs">
            {loadingSummary ? (
              <div className="text-gray-500 italic">Loading AI summary...</div>
            ) : tableSummary ? (
              <div className="space-y-1 text-gray-700 leading-relaxed">
                <p>{tableSummary.line1}</p>
                <p>{tableSummary.line2}</p>
              </div>
            ) : (
              <div className="text-gray-500 italic">Click to load summary</div>
            )}
          </div>
        )}
      </div>

      {/* Connection Handles - Hidden */}
      <Handle
        type="source"
        position="right"
        id={`${data.tableName}-right`}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          border: 'none',
          background: 'transparent'
        }}
      />
      <Handle
        type="target"
        position="left"
        id={`${data.tableName}-left`}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          border: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default TableNode;