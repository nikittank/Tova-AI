require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Add these lines to polyfill fetch and Headers
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
globalThis.fetch = fetch;
globalThis.Headers = Headers;

const app = express();
const port = process.env.PORT || 5000;

// Initialize Gemini AI with error handling
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Gemini AI initialized successfully');
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error);
  process.exit(1);
}

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://tova-ai.vercel.app',
  'https://tova-ai-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  credentials: true
}));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware to track users
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] || uuidv4();
  req.sessionId = sessionId;
  res.setHeader('X-Session-ID', sessionId);
  next();
});

// Store active connections and their schemas
const activeConnections = new Map();
const tableSummaryCache = new Map(); // Cache for AI-generated table summaries

// Connection pool for each active connection
const connectionPools = new Map();

// Cleanup old connections every hour
setInterval(() => {
  const now = new Date();
  for (const [id, conn] of activeConnections) {
    if (now - conn.lastUsed > 3600000) { // 1 hour
      activeConnections.delete(id);
      if (connectionPools.has(id)) {
        connectionPools.get(id).end();
        connectionPools.delete(id);
      }
      console.log(`Cleaned up stale connection: ${id}`);
    }
  }
}, 3600000);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size
  });
});

/**
 * Custom retry function for connection attempts
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.retries - Number of retries (default: 3)
 * @param {number} options.delay - Initial delay between retries in ms (default: 1000)
 */
async function withRetry(fn, { retries = 3, delay = 1000 } = {}) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  throw lastError;
}

async function createConnectionWithRetry(config) {
  return withRetry(
    async () => {
      const connection = await mysql.createConnection({
        ...config,
        connectTimeout: 20000, // Increased to 20s
        multipleStatements: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 15000,
        queueLimit: 10,
        waitForConnections: true
      });

      await connection.ping();
      return connection;
    },
    {
      retries: 3,
      delay: 1000
    }
  );
}

// Enhanced database connection with schema loading
app.post('/api/connect', async (req, res) => {
  const { host, user, password, database, port, connectionName } = req.body;

  if (!host || !user) {
    return res.status(400).json({
      success: false,
      message: 'Host and user are required fields'
    });
  }

  try {
    console.log('Attempting to connect to:', {
      host,
      user,
      database: database || '<no database>',
      port: port || 3306
    });

    // Create connection with retry logic
    const connection = await createConnectionWithRetry({
      host,
      user,
      password,
      database,
      port: port || 3306
    });

    // Get list of tables first
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [database || connection.config.database]);

    // Get detailed schema information for all tables
    const schemaInfo = {};
    const tableFetchPromises = tables.map(async (table) => {
      try {
        const [columns] = await connection.query(`
          SELECT 
            column_name,
            data_type,
            column_key,
            is_nullable,
            column_comment,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            column_type,
            extra
          FROM information_schema.columns 
          WHERE table_schema = ? AND table_name = ?
          ORDER BY ordinal_position
        `, [database || connection.config.database, table.table_name]);

        schemaInfo[table.table_name] = columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          fullType: col.column_type,
          key: col.column_key,
          nullable: col.is_nullable === 'YES',
          comment: col.column_comment,
          maxLength: col.character_maximum_length,
          precision: col.numeric_precision,
          scale: col.numeric_scale,
          extra: col.extra
        }));
      } catch (error) {
        console.error(`Error fetching schema for table ${table.table_name}:`, error);
        schemaInfo[table.table_name] = [];
      }
    });

    await Promise.all(tableFetchPromises);

    const connectionId = Date.now().toString();
    activeConnections.set(connectionId, {
      config: { host, user, database, port: port || 3306, password },
      schema: schemaInfo,
      lastUsed: new Date()
    });

    // Create a connection pool for this connection
    const pool = mysql.createPool({
      ...activeConnections.get(connectionId).config,
      connectionLimit: 10,
      connectTimeout: 20000,
      waitForConnections: true,
      queueLimit: 20
    });
    connectionPools.set(connectionId, pool);

    console.log('Connection successful, ID:', connectionId);
    console.log('Loaded schema with', Object.keys(schemaInfo).length, 'tables');

    // Close the initial connection
    await connection.end();

    res.json({
      success: true,
      message: 'Connection successful!',
      connectionId,
      connectionName: connectionName || `${user}@${host}/${database || 'no-database'}`,
      schema: schemaInfo
    });
  } catch (error) {
    console.error('Connection error:', error);

    let errorMessage = 'Failed to connect to database';
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Access denied - check username/password';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database does not exist';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - check host/port or if MySQL is running';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out - check network/firewall settings';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        message: error.message
      }
    });
  }
});

// Get complete database schema
app.get('/api/schema/:connectionId', async (req, res) => {
  const { connectionId } = req.params;

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    res.json({
      success: true,
      schema: connectionInfo.schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schema',
      error: error.message
    });
  }
});

// Updated /api/tables endpoint using connection pool
app.get('/api/tables/:connectionId', async (req, res) => {
  const { connectionId } = req.params;

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    // Get connection from pool
    const connection = await pool.getConnection();

    try {
      // Get list of tables with their column counts
      const [tables] = await connection.query(`
        SELECT 
          table_name AS name,
          (SELECT COUNT(*) 
           FROM information_schema.columns 
           WHERE table_schema = ? 
           AND table_name = tables.table_name) AS columnCount
        FROM information_schema.tables AS tables
        WHERE table_schema = ?
      `, [connectionInfo.config.database, connectionInfo.config.database]);

      res.json({
        success: true,
        tables
      });
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables',
      error: error.message
    });
  }
});

// Enhanced /api/table-details endpoint
app.get('/api/table-details/:connectionId/:tableName', async (req, res) => {
  const { connectionId, tableName } = req.params;

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get basic column information
      const [columns] = await connection.query(`
        SELECT 
          column_name AS 'name',
          data_type AS 'type',
          column_key AS 'key',
          is_nullable AS 'nullable',
          column_comment AS 'comment',
          character_maximum_length AS 'maxLength',
          column_type AS 'fullType',
          extra
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = ?
        ORDER BY ordinal_position
      `, [connectionInfo.config.database, tableName]);

      // Get foreign key relationships for this table
      const [foreignKeys] = await connection.query(`
        SELECT 
          COLUMN_NAME AS 'column',
          REFERENCED_TABLE_NAME AS 'referencedTable',
          REFERENCED_COLUMN_NAME AS 'referencedColumn',
          CONSTRAINT_NAME AS 'constraintName'
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE 
          TABLE_SCHEMA = ? AND
          TABLE_NAME = ? AND
          REFERENCED_TABLE_NAME IS NOT NULL
      `, [connectionInfo.config.database, tableName]);

      // Get unique constraints to identify one-to-one relationships
      const [uniqueConstraints] = await connection.query(`
        SELECT 
          COLUMN_NAME AS 'column'
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE 
          TABLE_SCHEMA = ? AND
          TABLE_NAME = ? AND
          NON_UNIQUE = 0 AND
          INDEX_NAME != 'PRIMARY'
      `, [connectionInfo.config.database, tableName]);

      // Enhanced relationship type detection
      const enhancedColumns = await Promise.all(columns.map(async col => {
        const fk = foreignKeys.find(fk => fk.column === col.name);
        const isUnique = uniqueConstraints.some(uc => uc.column === col.name);

        let relationship = null;
        if (fk) {
          let relationshipType = 'many-to-one'; // Default

          // 1. One-to-One: Foreign key column is unique or primary
          if (col.key === 'PRI' || isUnique) {
            relationshipType = 'one-to-one';
            console.log(`Detected 1:1 - ${tableName}.${col.name} is unique/primary`);
          } else {
            // 2. Check for junction table (many-to-many)
            const [tableStats] = await connection.query(`
              SELECT 
                COUNT(*) as totalCols,
                SUM(CASE WHEN COLUMN_KEY = 'MUL' THEN 1 ELSE 0 END) as foreignKeyCols
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            `, [connectionInfo.config.database, tableName]);

            const stats = tableStats[0];

            // Junction table: 2+ foreign keys, small table
            if (stats.foreignKeyCols >= 2 && stats.totalCols <= 4) {
              relationshipType = 'many-to-many';
              console.log(`Detected M:N - ${tableName} is junction table`);
            } else {
              // 3. Standard many-to-one
              relationshipType = 'many-to-one';
              console.log(`Detected N:1 - ${tableName}.${col.name} -> ${fk.referencedTable}.${fk.referencedColumn}`);
            }
          }

          relationship = {
            referencedTable: fk.referencedTable,
            referencedColumn: fk.referencedColumn,
            constraintName: fk.constraintName,
            relationshipType
          };
        }

        return {
          ...col,
          relationship
        };
      }));

      res.json({
        success: true,
        table: {
          name: tableName,
          columns: enhancedColumns,
          foreignKeys
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching table details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch table details',
      error: error.message
    });
  }
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working' });
});

// Debug endpoint to check active connections
app.get('/api/debug/connections', (req, res) => {
  const connections = Array.from(activeConnections.keys());
  res.json({
    success: true,
    activeConnections: connections,
    count: connections.length
  });
});

// Simple table summary endpoint
app.get('/api/table-summary/:connectionId/:tableName', async (req, res) => {
  console.log('Table summary endpoint called:', req.params);
  const { connectionId, tableName } = req.params;

  // Create cache key
  const cacheKey = `${connectionId}-${tableName}`;

  try {
    // Check cache first - return immediately if found
    if (tableSummaryCache.has(cacheKey)) {
      console.log(`✅ Returning cached summary for ${tableName}`);
      return res.json({
        success: true,
        summary: tableSummaryCache.get(cacheKey),
        cached: true
      });
    }

    console.log(`🔄 Generating new summary for ${tableName}...`);

    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      console.log(`❌ Connection ID ${connectionId} not found. Active connections:`, Array.from(activeConnections.keys()));
      return res.status(404).json({
        success: false,
        message: `Connection not found. Requested: ${connectionId}, Available: ${Array.from(activeConnections.keys()).join(', ')}`
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get comprehensive table info for AI analysis
      const [columns] = await connection.query(`
        SELECT 
          COLUMN_NAME as name,
          DATA_TYPE as type,
          IS_NULLABLE as nullable,
          COLUMN_KEY as \`key\`,
          COLUMN_DEFAULT as defaultValue,
          EXTRA as extra,
          COLUMN_COMMENT as comment
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [connectionInfo.config.database, tableName]);

      // Get foreign key relationships
      const [foreignKeys] = await connection.query(`
        SELECT 
          COLUMN_NAME as \`column\`,
          REFERENCED_TABLE_NAME as referencedTable,
          REFERENCED_COLUMN_NAME as referencedColumn
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE 
          TABLE_SCHEMA = ? AND 
          TABLE_NAME = ? AND
          REFERENCED_TABLE_NAME IS NOT NULL
      `, [connectionInfo.config.database, tableName]);

      // Get row count
      const [countResult] = await connection.query(`SELECT COUNT(*) as rowCount FROM \`${tableName}\``);
      const rowCount = countResult[0].rowCount;

      // Get sample data (first 2 rows for context)
      const [sampleData] = await connection.query(`SELECT * FROM \`${tableName}\` LIMIT 2`);

      let aiSummary;

      // Try to use Gemini AI if API key is available
      if (process.env.GEMINI_API_KEY) {
        try {
          console.log(`🤖 Using Gemini AI for ${tableName}...`);
          const { GoogleGenerativeAI } = require('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

          const prompt = `Analyze this database table and provide a professional 2-line summary:

Table: ${tableName}
Rows: ${rowCount}
Columns: ${columns.map(col => `${col.name} (${col.type}${col.key === 'PRI' ? ', PRIMARY KEY' : ''}${col.key === 'MUL' ? ', FOREIGN KEY' : ''})`).join(', ')}
Foreign Keys: ${foreignKeys.map(fk => `${fk.column} -> ${fk.referencedTable}.${fk.referencedColumn}`).join(', ') || 'None'}
Sample Data: ${JSON.stringify(sampleData.slice(0, 2))}

Provide exactly 2 lines:
Line 1: Business purpose and what this table stores (1 sentence)
Line 2: Technical structure including column count, keys, and relationships (1 sentence)

Return as JSON: {"line1": "...", "line2": "..."}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          try {
            // Parse AI response
            aiSummary = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
            console.log(`✅ AI summary generated for ${tableName}`);
          } catch (parseError) {
            console.log('⚠️ AI response parsing failed, using fallback');
            throw parseError;
          }
        } catch (aiError) {
          console.log('⚠️ AI generation failed:', aiError.message);
          throw aiError; // Don't use fallback, only AI generated
        }
      } else {
        console.log('⚠️ No Gemini API key available');
        throw new Error('AI service not available');
      }

      // Cache the generated summary permanently
      tableSummaryCache.set(cacheKey, aiSummary);
      console.log(`💾 Summary cached for ${tableName} (cache size: ${tableSummaryCache.size})`);

      res.json({
        success: true,
        summary: aiSummary,
        cached: false
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error generating table summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate table summary',
      error: error.message
    });
  }
});

// Removed fallback summary function - only AI generated summaries allowed

// Helper function to determine relationship type
function determineRelationshipType(column, foreignKey) {
  if (column.key === 'PRI' && column.extra.includes('auto_increment')) {
    return 'one-to-many';
  }

  if (column.key === 'UNI') {
    return 'one-to-one';
  }

  return 'many-to-one';
}

// Foreign keys endpoint
app.get('/api/foreign-keys/:connectionId', async (req, res) => {
  const { connectionId } = req.params;

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Query to get foreign key relationships
      const [relationships] = await connection.query(`
        SELECT 
          TABLE_NAME AS sourceTable,
          COLUMN_NAME AS sourceColumn,
          REFERENCED_TABLE_NAME AS targetTable,
          REFERENCED_COLUMN_NAME AS targetColumn,
          CONSTRAINT_NAME AS constraintName
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE 
          TABLE_SCHEMA = ? AND
          REFERENCED_TABLE_NAME IS NOT NULL
      `, [connectionInfo.config.database]);

      res.json({
        success: true,
        relationships
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching foreign keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch foreign keys',
      error: error.message
    });
  }
});

// Execute query
app.post('/api/query', async (req, res) => {
  const { connectionId, query } = req.body;

  if (!connectionId || !query) {
    return res.status(400).json({
      success: false,
      message: 'Missing connectionId or query'
    });
  }

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const connection = await pool.getConnection();

    try {
      const cleanQuery = query.replace(/```sql/g, '').replace(/```/g, '').trim();
      const [results, fields] = await connection.query(cleanQuery);

      // Update last used time
      activeConnections.set(connectionId, {
        ...connectionInfo,
        lastUsed: new Date()
      });

      res.json({
        success: true,
        results,
        fields: fields ? fields.map(f => ({
          name: f.name,
          type: f.type,
          length: f.length,
          flags: f.flags
        })) : []
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      message: 'Query execution failed',
      error: error.message,
      sqlState: error.sqlState,
      code: error.code
    });
  }
});

app.post('/api/ai-query', async (req, res) => {
  const { connectionId, prompt, conversationHistory = [] } = req.body;

  if (!connectionId || !prompt) {
    return res.status(400).json({
      success: false,
      message: 'Missing connectionId or prompt'
    });
  }

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Step 1: Generate the SQL query with context from conversation history
    const generatePrompt = `Generate a MySQL query based on this schema, prompt, and conversation history:
    
Database Schema:
${JSON.stringify(connectionInfo.schema, null, 2)}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current Prompt: "${prompt}"

Requirements:
1. Return ONLY the SQL query in markdown format (between \`\`\`sql and \`\`\`)
2. Valid MySQL syntax
3. Include proper table joins when needed
4. Add WHERE clauses when filtering data
5. For counting queries, use COUNT(*) and proper column aliases
6. For name/list queries, select specific columns

SQL Query:`;

    const generateResult = await model.generateContent(generatePrompt);
    const generateResponse = await generateResult.response;
    let generatedQuery = generateResponse.text().trim();

    // Clean up the query (remove markdown formatting if present)
    generatedQuery = generatedQuery.replace(/```sql/g, '').replace(/```/g, '').trim();

    // Step 2: Execute the query
    const connection = await pool.getConnection();
    let queryResults;
    let queryFields;

    try {
      [queryResults, queryFields] = await connection.query(generatedQuery);

      // Update last used time
      activeConnections.set(connectionId, {
        ...connectionInfo,
        lastUsed: new Date()
      });
    } finally {
      connection.release();
    }

    // Step 3: Generate a clean natural language response
    let aiResponse = '';
    const responsePrompt = `You are a database assistant. Based on this query and results, generate a concise response:
    
Query: ${generatedQuery}

Results: ${JSON.stringify(queryResults.slice(0, 10), null, 2)} ${queryResults.length > 10 ? `\n(Showing 10 of ${queryResults.length} rows)` : ''}

Respond naturally as if answering the user's question directly. Follow these rules:
1. Remove all markdown formatting (**, \`, etc.)
2. Don't mention "the query" or "the results" - just answer
3. For empty results, suggest possible reasons
4. For large datasets, summarize key findings
5. Format numbers and dates clearly
6. Keep response under 200 words

The user asked: "${prompt}"`;

    const responseResult = await model.generateContent(responsePrompt);
    const responseResponse = await responseResult.response;

    // Clean up the AI response
    aiResponse = responseResponse.text()
      .trim()
      // Remove markdown formatting
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      // Remove redundant phrases
      .replace(/here (are|is) the (results|data)/i, '')
      .replace(/based on (the|your) query/i, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // If we got an empty response, provide a default
    if (!aiResponse) {
      aiResponse = queryResults.length > 0
        ? `Found ${queryResults.length} matching records.`
        : 'No matching records found.';
    }

    res.json({
      success: true,
      query: generatedQuery,
      results: queryResults,
      fields: queryFields ? queryFields.map(f => ({
        name: f.name,
        type: f.type,
        length: f.length,
        flags: f.flags
      })) : [],
      aiResponse: {
        text: aiResponse,
        hasResults: queryResults.length > 0,
        resultCount: queryResults.length
      },
      conversationId: req.sessionId
    });
  } catch (error) {
    console.error('AI query error:', error);

    let errorMessage = 'AI query processing failed';
    if (error.code === 'ER_PARSE_ERROR') {
      errorMessage = 'Generated SQL query was invalid';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Generated SQL referenced non-existent tables';
    } else if (error.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
      errorMessage = 'Database operation timed out - please try a more specific query';
    }

    // Generate a user-friendly error explanation
    const errorPrompt = `Explain this database error in simple terms for a non-technical user:
    
Error: ${error.message}
Code: ${error.code || 'N/A'}

Provide a 1-2 sentence explanation and suggestion for what to do next:`;

    let errorExplanation = '';
    try {
      const errorResult = await model.generateContent(errorPrompt);
      const errorResponse = await errorResult.response;
      errorExplanation = errorResponse.text()
        .trim()
        .replace(/\*\*/g, '')
        .replace(/`/g, '');
    } catch (e) {
      errorExplanation = 'An error occurred while processing your request.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      errorExplanation,
      sqlState: error.sqlState,
      code: error.code
    });
  }
});

// Generate query using AI (improved with better schema awareness)
app.post('/api/generate-query', async (req, res) => {
  const { connectionId, prompt } = req.body;

  if (!connectionId || !prompt) {
    return res.status(400).json({
      success: false,
      message: 'Missing connectionId or prompt'
    });
  }

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a more detailed schema description
    const schemaDescription = Object.entries(connectionInfo.schema).map(([tableName, columns]) => {
      const columnDescriptions = columns.map(col =>
        `${col.name} (${col.type}${col.key === 'PRI' ? ', PRIMARY KEY' : ''}${col.key === 'MUL' ? ', FOREIGN KEY' : ''}${col.nullable ? '' : ', NOT NULL'})`
      ).join(', ');
      return `Table: ${tableName}\nColumns: ${columnDescriptions}`;
    }).join('\n\n');

    const aiPrompt = `You are a MySQL query generator. Generate a query based on the available database schema.

IMPORTANT: Only use tables and columns that exist in the schema below. Do not assume or invent table names.

Available Database Schema:
${schemaDescription}

Available Tables: ${Object.keys(connectionInfo.schema).join(', ')}

User Request: "${prompt}"

Rules:
1. ONLY use tables that exist in the schema above
2. ONLY use columns that exist in those tables
3. If the request asks for data that doesn't exist in the schema, return a simple SELECT statement from an existing table
4. Use proper MySQL syntax
5. Return ONLY the SQL query without any markdown formatting
6. If you need to join tables, make sure the foreign key relationships exist
7. For date comparisons, use proper MySQL date functions like CURDATE(), DATE_SUB(), etc.
8. If the request is unclear or data doesn't exist, create a query that shows available data

Generate the SQL query:`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    let generatedQuery = response.text().trim();

    // Clean up the query
    generatedQuery = generatedQuery
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .replace(/^SQL Query:\s*/i, '')
      .trim();

    res.json({
      success: true,
      query: generatedQuery,
      schema: connectionInfo.schema,
      availableTables: Object.keys(connectionInfo.schema)
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate query',
      error: error.message
    });
  }
});

// Add this endpoint to your backend server
app.post('/api/table-records', async (req, res) => {
  const { connectionId, tableName, limit } = req.body;

  console.log('Received request:', { connectionId, tableName, limit }); // Debug logging

  if (!connectionId || !tableName) {
    return res.status(400).json({
      success: false,
      message: 'Missing connectionId or tableName',
      receivedData: req.body // Include what was actually received
    });
  }

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const connection = await pool.getConnection();

    try {
      // First get column information to properly format the results
      const [columns] = await connection.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = ?
        ORDER BY ordinal_position
      `, [connectionInfo.config.database, tableName]);

      // Then fetch the records with a safe limit
      const safeLimit = Math.min(parseInt(limit) || 100, 1000);
      const [results] = await connection.query(
        `SELECT * FROM ?? LIMIT ?`,
        [tableName, safeLimit]
      );

      res.json({
        success: true,
        results,
        columns: columns.map(c => c.column_name)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching table records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch table records',
      error: error.message,
      sqlState: error.qlState,
      code: error.code
    });
  }
});

// New endpoint for explaining query results with structured format
app.post('/api/explain-results', async (req, res) => {
  const { originalPrompt, query, results, fields } = req.body;

  if (!originalPrompt || !query || !results) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters'
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Helper function to convert results to ASCII table format
    const convertToTable = (results, fields) => {
      if (!results || results.length === 0) {
        return "No results found.";
      }

      // Get column names from first result or fields
      const columns = fields && fields.length > 0
        ? fields.map(f => f.name)
        : Object.keys(results[0]);

      // Calculate column widths
      const columnWidths = columns.map(col => {
        const headerWidth = col.length;
        const maxDataWidth = Math.max(...results.slice(0, 10).map(row => {
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

      const rows = results.slice(0, 10).map(row => {
        const values = columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return 'NULL';
          // Format dates to remove time portion for cleaner display
          if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
            return value.split('T')[0]; // Just the date part (YYYY-MM-DD)
          }
          return String(value);
        });
        return createRow(values, columnWidths);
      });

      let table = [separator, header, separator, ...rows, separator].join('\n');

      if (results.length > 10) {
        table += `\n(Showing 10 of ${results.length} total rows)`;
      }

      return table;
    };

    // Get today's date for comparison
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Create the new Tova AI format
    const analysisPrompt = `You are Tova AI — an intelligent SQL reasoning assistant.

You will be given a SQL query and its result (from the database). Your task:

1. Show the SQL query under the heading **SQL Query:**
2. Show the result in a clean, plain-text formatted table (no markdown syntax).
   - Use proper borders and spacing.
   - Example format:
   
   SQL Query:
   SELECT * FROM employees;
   
   Result Table:
   +--------------+---------------+------------+
   | client_name  | project_name  | deadline   |
   +--------------+---------------+------------+
   | Acme Corp    | Recruitment   | 2025-03-31 |
   | Globex Inc   | Website Revamp| 2025-05-31 |
   +--------------+---------------+------------+

3. Write a short, human-style **Explanation** (3–4 sentences max):
   - Summarize key insights.
   - Compare with today's date (${today}).
   - Use natural English (avoid listing all rows).
   - Focus on what matters — e.g., which deadlines are upcoming or overdue.

Avoid showing raw JSON or repeating the full data again in the explanation.

User Question: "${originalPrompt}"

SQL Query Used:
${query}

Result Table:
${convertToTable(results, fields)}

Total Results: ${results.length} rows
Today's Date: ${today}

Please provide ONLY the explanation part in simple, clear language (3-4 sentences max):
- Summarize key insights from the data
- Compare dates with today (${today}) to identify upcoming or overdue items
- Use natural English, avoid listing all rows
- Focus on what matters most to the business

Explanation:`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    let explanation = response.text().trim();

    // Clean up the explanation
    explanation = explanation
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/`/g, '') // Remove code backticks
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/^(Reasoning\/Explanation:|Analysis:|Explanation:)/i, '') // Remove prefixes
      .trim();

    // Create structured response
    const structuredResponse = {
      query: query.trim(),
      results: results,
      resultCount: results.length,
      explanation: explanation,
      hasResults: results.length > 0
    };

    res.json({
      success: true,
      ...structuredResponse
    });
  } catch (error) {
    console.error('Explanation generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate explanation',
      error: error.message
    });
  }
});

// New endpoint for comprehensive schema analysis
app.post('/api/analyze-schema', async (req, res) => {
  const { connectionId } = req.body;

  if (!connectionId) {
    return res.status(400).json({
      success: false,
      message: 'Missing connectionId'
    });
  }

  try {
    const connectionInfo = activeConnections.get(connectionId);
    if (!connectionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const pool = connectionPools.get(connectionId);
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Connection pool not found'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Get comprehensive schema information
    const connection = await pool.getConnection();

    try {
      // Execute enhanced schema analysis queries
      const [schemaResults] = await connection.query(`
        SELECT 
          c.TABLE_NAME AS table_name,
          c.COLUMN_NAME AS column_name,
          c.COLUMN_TYPE AS data_type,
          c.COLUMN_KEY AS key_type,
          kcu.REFERENCED_TABLE_NAME AS foreign_table,
          kcu.REFERENCED_COLUMN_NAME AS foreign_column,
          kcu.CONSTRAINT_NAME AS constraint_name
        FROM INFORMATION_SCHEMA.COLUMNS AS c
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
          ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
          AND c.TABLE_NAME = kcu.TABLE_NAME
          AND c.COLUMN_NAME = kcu.COLUMN_NAME
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        WHERE c.TABLE_SCHEMA = DATABASE()
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
      `);

      // Get additional constraint information for relationship type detection
      const [constraintInfo] = await connection.query(`
        SELECT 
          tc.TABLE_NAME,
          tc.CONSTRAINT_NAME,
          tc.CONSTRAINT_TYPE,
          kcu.COLUMN_NAME,
          kcu.REFERENCED_TABLE_NAME,
          kcu.REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
          AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
        WHERE tc.TABLE_SCHEMA = DATABASE()
          AND tc.CONSTRAINT_TYPE IN ('FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY')
        ORDER BY tc.TABLE_NAME, kcu.ORDINAL_POSITION
      `);

      // Get index information to help determine uniqueness
      const [indexInfo] = await connection.query(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          NON_UNIQUE,
          INDEX_NAME
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME, COLUMN_NAME
      `);

      // Create the enhanced Tova AI analysis prompt
      const analysisPrompt = `You are Tova AI, a smart database reasoning assistant.

You are given the structure of a MySQL database with detailed constraint information. Your tasks:

1. Identify all tables, columns, data types, primary keys, and foreign keys.
2. Determine all relationships between tables based on foreign keys and constraints.
   
   IMPORTANT: Analyze relationship types carefully:
   - One-to-One: Foreign key column has UNIQUE constraint or is a PRIMARY KEY
   - One-to-Many: Referenced table's column is PRIMARY KEY, foreign key column is NOT unique
   - Many-to-One: Foreign key column references a PRIMARY KEY (most common)
   - Many-to-Many: Requires junction/bridge table with foreign keys to both tables

3. Present the database structure in a clean, plain-text table format (no markdown):

+------------------+------------------+------------+----------+------------------+------------------+
| table_name       | column_name      | data_type  | key_type | foreign_table    | foreign_column   |
+------------------+------------------+------------+----------+------------------+------------------+
| ...              | ...              | ...        | ...      | ...              | ...              |

4. After the table, list all relationships in readable format:

RELATIONSHIP TYPE RULES:
- If foreign key column is UNIQUE or PRIMARY KEY → One-to-One
- If foreign key references PRIMARY KEY and foreign key is NOT unique → Many-to-One
- If referenced column is PRIMARY KEY and there can be multiple foreign key values → One-to-Many
- If there's a junction table with two foreign keys → Many-to-Many

Example:
Relationship:
From: orders.customer_id
To: customers.customer_id
Type: Many-to-One
Description: Multiple orders can belong to one customer

Database Schema Data:
${JSON.stringify(schemaResults, null, 2)}

Constraint Information:
${JSON.stringify(constraintInfo, null, 2)}

Index Information:
${JSON.stringify(indexInfo, null, 2)}

ANALYZE EACH RELATIONSHIP CAREFULLY:
- Look at the constraint types (PRIMARY KEY, FOREIGN KEY, UNIQUE)
- Check if foreign key columns have unique constraints
- Identify junction tables (tables with multiple foreign keys)
- Determine the actual cardinality based on constraints

Please analyze this schema and provide the complete analysis in the format specified above.`;

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      let analysis = response.text().trim();

      // Clean up the analysis
      analysis = analysis
        .replace(/```/g, '') // Remove any markdown code blocks
        .replace(/\*\*/g, '') // Remove markdown bold
        .trim();

      res.json({
        success: true,
        analysis: analysis,
        rawSchema: schemaResults
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Schema analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze schema',
      error: error.message
    });
  }
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET /api/test - Test endpoint');
  console.log('  GET /api/table-summary/:connectionId/:tableName - Table summary');
  console.log('  POST /api/connect - Database connection');
  console.log('  GET /api/tables/:connectionId - List tables');
  console.log('  GET /api/table-details/:connectionId/:tableName - Table details');
}).on('error', (error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});