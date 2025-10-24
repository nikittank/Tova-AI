import { FiLoader, FiDatabase, FiKey, FiLink } from 'react-icons/fi';

const RightRecords = ({ table, records, isLoading }) => {

  if (!table) return null;

  return (
    <div className="flex-1 flex flex-col pr-[0.5cm] pb-[0.5cm]">
      {/* Light Rounded Card */}
      <div className="flex-1 flex flex-col bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        {/* Data Preview Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-800">
            Data Preview
          </h3>
          {records.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {Math.min(records.length, 10)}/{records.length}
            </span>
          )}
        </div>

        {/* Records Content - Clean and Professional */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <FiLoader className="animate-spin text-gray-400 mb-3" size={20} />
              <p className="text-sm text-gray-500">Loading records...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="flex-1 flex flex-col">
              {/* Compact Table Container */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      {Object.keys(records[0]).map((key) => {
                        const columnInfo = table.columns?.find(col => col.name === key);
                        return (
                          <th
                            key={key}
                            className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[80px]"
                            title={`${key} (${columnInfo?.type || 'unknown'})`}
                          >
                            <div className="flex items-center">
                              <span className="truncate text-xs">
                                {key}
                              </span>
                              {columnInfo?.key === 'PRI' && (
                                <FiKey className="ml-1 text-yellow-600 flex-shrink-0" size={10} title="Primary Key" />
                              )}
                              {columnInfo?.key === 'MUL' && (
                                <FiLink className="ml-1 text-green-600 flex-shrink-0" size={10} title="Foreign Key" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {records.slice(0, 10).map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        {Object.entries(record).map(([key, value], i) => {
                          const columnInfo = table.columns?.find(col => col.name === key);
                          return (
                            <td
                              key={i}
                              className={`px-3 py-2 border-r border-gray-100 last:border-r-0 ${columnInfo?.key === 'PRI' ? 'bg-yellow-50' :
                                columnInfo?.key === 'MUL' ? 'bg-green-50' :
                                  'text-gray-600'
                                }`}
                              title={value?.toString()?.replace(/[`'"]/g, '')}
                            >
                              {value === null ? (
                                <span className="text-gray-400 italic text-xs">NULL</span>
                              ) : typeof value === 'object' ? (
                                <span className="font-mono text-xs break-all">
                                  {JSON.stringify(value).replace(/[`'"]/g, '')}
                                </span>
                              ) : (
                                <span className="text-xs break-all">
                                  {value.toString().replace(/[`'"]/g, '')}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Compact Footer */}
              {records.length > 10 && (
                <div className="px-3 py-1 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
                  Showing first 10 of {records.length} records
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-gray-100 p-3 rounded mb-3">
                <FiDatabase className="text-gray-400" size={20} />
              </div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">No records found</h4>
              <p className="text-xs text-gray-500">This table is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightRecords;