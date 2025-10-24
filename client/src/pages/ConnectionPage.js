import { useState, useEffect } from 'react';
import {
  FiDatabase, FiServer, FiUser, FiLock, FiArrowRight,
  FiCheckCircle, FiXCircle, FiShield, FiEye, FiEyeOff,
  FiWifi, FiSave, FiPlay, FiClock, FiBookmark, FiTrash2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import GridBackground from '../components/GridBackground';
import Button from '../components/Button';

const ConnectionPage = ({ onConnect }) => {
  const [formData, setFormData] = useState({
    host: '0.tcp.in.ngrok.io',
    user: 'root',
    password: '',
    database: 'CompanyDB',
    port: '19276',
    connectionName: 'My Database'
  });
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedConnections, setSavedConnections] = useState([]);
  const [showSavedConnections, setShowSavedConnections] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [errors, setErrors] = useState({});

  // Load saved connections
  useEffect(() => {
    const saved = localStorage.getItem('savedConnections');
    if (saved) {
      try {
        setSavedConnections(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved connections:', error);
      }
    }
  }, []);

  // Save connections to localStorage
  useEffect(() => {
    localStorage.setItem('savedConnections', JSON.stringify(savedConnections));
  }, [savedConnections]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.connectionName.trim()) newErrors.connectionName = 'Connection name required';
    if (!formData.host.trim()) newErrors.host = 'Host required';
    if (!formData.port.trim()) newErrors.port = 'Port required';
    else if (!/^\d+$/.test(formData.port)) newErrors.port = 'Port must be a number';
    if (!formData.database.trim()) newErrors.database = 'Database name required';
    if (!formData.user.trim()) newErrors.user = 'Username required';
    if (!formData.password.trim()) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const makeApiCall = async (endpoint, data) => {
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        // Handle 404 and other HTTP errors
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please ensure the backend server is running and properly configured.');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the backend server is running correctly.');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot reach the server. Please ensure the backend is running on port 5000.');
      }
      throw error;
    }
  };

  const testConnection = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setTestResults(null);
    setConnectionStatus(null);

    try {
      const data = await makeApiCall('test-connection', formData);
      setTestResults({
        type: data.success ? 'success' : 'error',
        message: data.success ? 'Connection test successful!' : 'Connection test failed',
        details: data.success ? `Connected to ${data.database} with ${data.tables} tables` : data.message,
        icon: data.success ? <FiCheckCircle className="text-green-500" /> : <FiXCircle className="text-red-500" />
      });
    } catch (error) {
      setTestResults({
        type: 'error',
        message: 'Connection test failed',
        details: error.message,
        icon: <FiXCircle className="text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setConnectionStatus(null);
    setTestResults(null);

    try {
      const data = await makeApiCall('connect', formData);
      if (data.success) {
        setConnectionStatus({
          type: 'success',
          message: `Successfully connected to ${data.connectionName}`,
          details: `Database: ${data.database} • Tables: ${data.tables || 'N/A'}`,
          icon: <FiCheckCircle className="text-green-500" />
        });

        // Auto-save successful connection
        const newConnection = {
          id: Date.now().toString(),
          name: formData.connectionName,
          ...formData,
          timestamp: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        };

        setSavedConnections(prev => {
          const existing = prev.find(conn =>
            conn.host === formData.host && conn.port === formData.port && conn.database === formData.database
          );
          return existing
            ? prev.map(conn => conn.id === existing.id ? { ...conn, lastUsed: new Date().toISOString() } : conn)
            : [...prev, newConnection];
        });

        onConnect({
          id: data.connectionId,
          name: data.connectionName,
          config: { ...formData },
          database: data.database,
          tables: data.tables
        });
      } else {
        setConnectionStatus({
          type: 'error',
          message: data.message || 'Failed to establish connection',
          details: data.error?.message,
          icon: <FiXCircle className="text-red-500" />
        });
      }
    } catch (error) {
      setConnectionStatus({
        type: 'error',
        message: 'Connection failed',
        details: error.message,
        icon: <FiXCircle className="text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveConnection = () => {
    if (!validateForm()) return;
    const newConnection = {
      id: Date.now().toString(),
      name: formData.connectionName,
      ...formData,
      timestamp: new Date().toISOString()
    };
    setSavedConnections(prev => [...prev, newConnection]);
    setConnectionStatus({
      type: 'success',
      message: 'Connection saved successfully!',
      icon: <FiCheckCircle className="text-green-500" />
    });
    setTimeout(() => setConnectionStatus(null), 3000);
  };

  const loadSavedConnection = (connection) => {
    setFormData({
      host: connection.host,
      user: connection.user,
      password: connection.password,
      database: connection.database,
      port: connection.port,
      connectionName: connection.name
    });
    setShowSavedConnections(false);
  };

  const deleteSavedConnection = (connectionId) => {
    setSavedConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const InputField = ({ label, name, type = "text", icon, placeholder, className = "" }) => (
    <div className={className}>
      <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-3 ${type === "password" ? "pr-12" : ""} border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 bg-white/80 backdrop-blur-sm transition-all shadow-sm ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-gray-200/60 hover:border-gray-300'
            }`}
          placeholder={placeholder}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <FiXCircle className="mr-1" size={12} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <GridBackground className="flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block text-center lg:text-left"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 shadow-2xl" style={{ backgroundColor: '#F69EAE' }}>
              <FiDatabase className="text-black text-3xl" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Connect to Your
              <br />
              <span style={{ color: '#E75957' }}>
                Database
              </span>
            </h1>

            <p className="text-xl text-black mb-8 leading-relaxed">
              Securely connect to MySQL, PostgreSQL, and other databases.
              Start exploring your data with AI-powered natural language queries.
            </p>

            <div className="space-y-4">
              {[
                { icon: <FiShield style={{ color: '#E75957' }} />, text: "Secure connections" },
                { icon: <FiWifi style={{ color: '#E75957' }} />, text: "Real-time testing" },
                { icon: <FiBookmark style={{ color: '#E75957' }} />, text: "Save connections" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#F69EAE' }}>
                    {feature.icon}
                  </div>
                  <span className="text-black font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Connection Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden">
              {/* Header */}
              <div className="p-6 text-center relative overflow-hidden" style={{ backgroundColor: '#F69EAE' }}>
                <div className="relative">
                  <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiDatabase className="text-black text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-black mb-2">Database Connection</h2>
                  <p className="text-black text-sm">Connect securely to your database</p>
                </div>
              </div>
              {/* Form */}
              <div className="p-8">
                <form onSubmit={handleConnect} className="space-y-6">
                  <InputField
                    label="Connection Name"
                    name="connectionName"
                    icon={<FiBookmark className="mr-2 text-blue-600" size={16} />}
                    placeholder="My Production Database"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Host"
                      name="host"
                      icon={<FiServer className="mr-2 text-green-600" size={16} />}
                      placeholder="localhost"
                    />
                    <InputField
                      label="Port"
                      name="port"
                      icon={<FiWifi className="mr-2 text-purple-600" size={16} />}
                      placeholder="3306"
                    />
                  </div>

                  <InputField
                    label="Database"
                    name="database"
                    icon={<FiDatabase className="mr-2 text-indigo-600" size={16} />}
                    placeholder="CompanyDB"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Username"
                      name="user"
                      icon={<FiUser className="mr-2 text-emerald-600" size={16} />}
                      placeholder="root"
                    />
                    <InputField
                      label="Password"
                      name="password"
                      type="password"
                      icon={<FiLock className="mr-2 text-red-600" size={16} />}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={testConnection}
                      disabled={isLoading}
                      variant="secondary"
                      size="small"
                      className="flex-1 flex items-center justify-center"
                    >
                      <FiPlay className="mr-2" size={16} />
                      Test
                    </Button>

                    <Button
                      onClick={handleSaveConnection}
                      variant="secondary"
                      size="small"
                      className="flex-1 flex items-center justify-center"
                    >
                      <FiSave className="mr-2" size={16} />
                      Save
                    </Button>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="primary"
                      size="small"
                      className="flex-2 flex items-center justify-center"
                      style={{ backgroundColor: '#F69EAE', color: 'black' }}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <FiArrowRight className="mr-2" size={16} />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              {/* Footer */}
              <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/40 px-6 py-4 border-t border-gray-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-600">
                    <FiShield className="mr-2 text-emerald-500" size={14} />
                    <span className="font-medium">Secure Connection • Tova AI v2.1.0</span>
                  </div>
                  <button
                    onClick={() => setShowSavedConnections(!showSavedConnections)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <FiClock className="mr-1" size={12} />
                    {savedConnections.length} Saved
                  </button>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {(connectionStatus || testResults) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mt-6 space-y-3"
                >
                  {testResults && (
                    <div className={`p-4 rounded-2xl border-2 ${testResults.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
                      }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">{testResults.icon}</div>
                        <div className="ml-3">
                          <p className="font-semibold">{testResults.message}</p>
                          {testResults.details && <p className="text-sm mt-1 opacity-80">{testResults.details}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  {connectionStatus && (
                    <div className={`p-4 rounded-2xl border-2 ${connectionStatus.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
                      }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">{connectionStatus.icon}</div>
                        <div className="ml-3">
                          <p className="font-semibold">{connectionStatus.message}</p>
                          {connectionStatus.details && <p className="text-sm mt-1 opacity-80">{connectionStatus.details}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Saved Connections */}
            <AnimatePresence>
              {showSavedConnections && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mt-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/40 px-6 py-4 border-b border-gray-200/60">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 flex items-center">
                        <FiBookmark className="mr-2 text-blue-600" size={18} />
                        Saved Connections
                      </h3>
                      <button
                        onClick={() => setShowSavedConnections(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FiXCircle size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {savedConnections.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <FiDatabase className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-500 font-medium">No saved connections yet</p>
                        <p className="text-gray-400 text-sm mt-1">Save a connection to quickly access it later</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedConnections.map((connection) => (
                          <motion.div
                            key={connection.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 border-2 border-gray-200/60 rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all group"
                            onClick={() => loadSavedConnection(connection)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <FiDatabase className="text-white" size={16} />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    {connection.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {connection.host}:{connection.port} • {connection.database}
                                  </div>
                                  {connection.lastUsed && (
                                    <div className="text-xs text-gray-400 flex items-center mt-1">
                                      <FiClock className="mr-1" size={10} />
                                      Last used: {new Date(connection.lastUsed).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSavedConnection(connection.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-2 rounded-xl hover:bg-red-50"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </GridBackground>
  );
};

export default ConnectionPage;