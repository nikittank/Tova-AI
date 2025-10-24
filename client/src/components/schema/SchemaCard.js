import { useState } from 'react';
import { FiDatabase, FiKey, FiLink, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const SchemaCard = ({ table }) => {
  const [showColumns, setShowColumns] = useState(true);
  const [showRelationships, setShowRelationships] = useState(true);

  // Helper function to capitalize first letter of table names
  const capitalizeTableName = (tableName) => {
    if (!tableName) return '';
    return tableName.charAt(0).toUpperCase() + tableName.slice(1);
  };

  // Helper function to get relationship type label
  const getRelationshipTypeLabel = (type) => {
    switch (type) {
      case 'one-to-one': return '1:1';
      case 'one-to-many': return '1:N';
      case 'many-to-one': return 'N:1';
      case 'many-to-many': return 'M:N';
      default: return 'N:1';
    }
  };

  if (!table) return null;

  // Only show regular columns (no calculated fields)
  const regularColumns = table.columns?.filter(col => col.key !== 'CALCULATED') || [];

  // Get relationships from foreign key columns
  const relationships = regularColumns
    .filter(col => col.relationship)
    .map(col => ({
      name: col.relationship.constraintName || `${col.name}_fk`,
      from: `${table.tableName}.${col.name}`,
      to: `${col.relationship.referencedTable}.${col.relationship.referencedColumn}`,
      type: getRelationshipTypeLabel(col.relationship.relationshipType)
    }));

  return (
    <div className="bg-white border border-gray-200 rounded mb-3 shadow-sm">
      {/* Compact Header */}
      <div className="bg-blue-600 text-white px-3 py-2 rounded-t">
        <div className="flex items-center">
          <FiDatabase className="mr-2 text-blue-200" size={16} />
          <div>
            <div className="text-xs text-blue-200 uppercase tracking-wide">Database Table</div>
            <div className="font-semibold text-base">{capitalizeTableName(table.tableName)}</div>
          </div>
        </div>
      </div>

      {/* Columns Table */}
      <div className="bg-white">
        <div
          className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
          onClick={() => setShowColumns(!showColumns)}
        >
          <div className="flex items-center">
            {showColumns ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            <span className="ml-2 text-sm font-medium text-gray-700">Columns</span>
          </div>
          <span className="text-xs text-gray-500">{regularColumns.length}</span>
        </div>

        {showColumns && (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">Data Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Constraint</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {regularColumns.map((col) => (
                  <tr
                    key={col.name}
                    className={`hover:bg-gray-50 ${
                      col.key === 'PRI' ? 'bg-yellow-50' : 
                      col.key === 'MUL' ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="px-3 py-2 border-r border-gray-100">
                      <div className="flex items-center">
                        {col.key === 'PRI' && (
                          <FiKey className="text-yellow-600 mr-2 flex-shrink-0" size={12} />
                        )}
                        {col.key === 'MUL' && (
                          <FiLink className="text-green-600 mr-2 flex-shrink-0" size={12} />
                        )}
                        <span className="font-medium text-gray-900 truncate">{col.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-gray-100">
                      <span className="text-gray-600 font-mono text-xs">{col.type}</span>
                    </td>
                    <td className="px-3 py-2">
                      {col.key === 'PRI' && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">PK</span>
                      )}
                      {col.key === 'MUL' && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">FK</span>
                      )}
                      {!col.key && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Relationships Table */}
      {relationships.length > 0 && (
        <div className="bg-white border-t border-gray-200">
          <div
            className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            onClick={() => setShowRelationships(!showRelationships)}
          >
            <div className="flex items-center">
              {showRelationships ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
              <span className="ml-2 text-sm font-medium text-gray-700">Relationships</span>
            </div>
            <span className="text-xs text-gray-500">{relationships.length}</span>
          </div>

          {showRelationships && (
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">From</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200">To</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {relationships.map((rel, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border-r border-gray-100">
                        <span className="font-medium text-gray-900 truncate">{rel.name}</span>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-100">
                        <span className="text-gray-600 font-mono text-xs">{rel.from}</span>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-100">
                        <span className="text-gray-600 font-mono text-xs">{rel.to}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{rel.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemaCard;