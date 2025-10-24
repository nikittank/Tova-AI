import { useState } from 'react';
import { FiDatabase, FiRefreshCw, FiServer, FiUser, FiGlobe, FiWifi } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ConnectionCard = ({ connection, isLoading, onRefresh }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!connection) return null;

  return (
    <div className="relative">
      {/* Modern Connection Card */}
      <div
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative mr-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <FiDatabase className="text-white" size={16} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <FiWifi className="text-white" size={8} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {connection.name || 'Database Connection'}
              </h3>
              <div className="flex items-center mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                <span className="text-xs text-gray-500">Connected</span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0"
            title="Refresh tables"
          >
            <FiRefreshCw className={`text-gray-600 hover:text-blue-600 transition-colors ${isLoading ? 'animate-spin' : ''}`} size={14} />
          </motion.button>
        </div>
      </div>

      {/* Fixed Position Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-64 top-20 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            {/* Clean Header */}
            <div className="bg-blue-600 px-4 py-3">
              <div className="flex items-center">
                <FiDatabase className="text-white mr-3" size={18} />
                <div>
                  <h4 className="text-white font-semibold">{connection.name || 'Database Connection'}</h4>
                  <p className="text-blue-200 text-sm">Connection Details</p>
                </div>
              </div>
            </div>

            {/* Simple Information List */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <FiServer className="text-gray-500 mr-3" size={16} />
                  <span className="text-sm font-medium text-gray-700">Host</span>
                </div>
                <span className="text-sm text-gray-900 font-mono">{connection.config.host}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <FiGlobe className="text-gray-500 mr-3" size={16} />
                  <span className="text-sm font-medium text-gray-700">Port</span>
                </div>
                <span className="text-sm text-gray-900 font-mono">{connection.config.port || 3306}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <FiDatabase className="text-gray-500 mr-3" size={16} />
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <span className="text-sm text-gray-900 font-mono truncate max-w-32">{connection.config.database || 'Not specified'}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <FiUser className="text-gray-500 mr-3" size={16} />
                  <span className="text-sm font-medium text-gray-700">User</span>
                </div>
                <span className="text-sm text-gray-900 font-mono truncate max-w-32">{connection.config.user}</span>
              </div>
            </div>

            {/* Status Bar */}
            <div className="bg-green-50 px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionCard;