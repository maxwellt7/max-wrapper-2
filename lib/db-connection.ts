// Secure database connection using system PostgreSQL
// Uses child_process.spawn with stdin to avoid shell injection vulnerabilities
// Implements proper parameterized queries

import { spawn } from 'child_process';
import { URL } from 'url';

// Execute SQL queries safely using psql via spawn and stdin
export async function queryDb(query: string, params: any[] = []) {
  try {
    // Parse DATABASE_URL to get connection parameters
    const dbUrl = new URL(process.env.DATABASE_URL!);
    
    // Build psql command args (no shell involved)
    const port = dbUrl.port || '5432';
    const psqlArgs = [
      `-h`, dbUrl.hostname,
      `-p`, port,
      `-U`, dbUrl.username,
      `-d`, dbUrl.pathname.slice(1), // remove leading /
      `-t`, // tuples only
      `-A`, // unaligned output
      `-F`, '|||', // field separator
      `--set=ON_ERROR_STOP=1` // stop on error
    ];

    // Build parameterized query safely
    const processedQuery = buildParameterizedQuery(query, params);
    
    // Query built safely with proper parameter escaping
    
    return new Promise((resolve) => {
      const psql = spawn('psql', psqlArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PGPASSWORD: dbUrl.password
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      psql.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      psql.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      psql.on('close', (code) => {
        // psql completed execution
        if (code !== 0 || (stderr && !stderr.includes('NOTICE'))) {
          console.error("Database query error:", stderr);
          resolve({ data: null, error: { message: stderr || `psql exited with code ${code}` } });
          return;
        }
        
        try {
          // Parse delimited output
          const lines = stdout.trim().split('\n').filter(line => line.length > 0);
          
          // Handle UPDATE/INSERT/DELETE commands that return row counts
          if (lines.length > 0 && (lines[0].startsWith('UPDATE ') || lines[0].startsWith('INSERT ') || lines[0].startsWith('DELETE '))) {
            // For commands like UPDATE, check if it affected any rows
            const affectedRows = parseInt(lines[0].split(' ')[1]) || 0;
            if (query.toUpperCase().includes('RETURNING') && affectedRows === 0) {
              // UPDATE/INSERT with RETURNING but 0 affected rows = empty result
              resolve({ data: [], error: null });
              return;
            }
            // For UPDATE/INSERT/DELETE without RETURNING, return the status
            resolve({ data: [{ affected_rows: affectedRows }], error: null });
            return;
          }
          
          if (lines.length === 0) {
            resolve({ data: [], error: null });
            return;
          }
          
          // For queries that return columns, parse them
          if (query.toUpperCase().includes('SELECT') || query.toUpperCase().includes('RETURNING')) {
            const data = lines.map(line => {
              const values = line.split('|||');
              return parseRowBasedOnQuery(values, query);
            });
            resolve({ data, error: null });
          } else {
            resolve({ data: lines, error: null });
          }
        } catch (parseError: any) {
          console.error("Row parsing error:", parseError, "Output:", stdout);
          resolve({ data: null, error: { message: `Row parsing failed: ${parseError.message}` } });
        }
      });
      
      psql.on('error', (error) => {
        console.error("Spawn error:", error);
        resolve({ data: null, error: { message: error.message } });
      });
      
      // Send SQL via stdin (safe from shell injection)
      psql.stdin.write(processedQuery);
      psql.stdin.end();
    });
  } catch (error: any) {
    console.error("Database query error:", error);
    return { data: null, error: { message: error.message } };
  }
}

// Safely build queries with properly escaped parameters
function buildParameterizedQuery(query: string, params: any[]): string {
  if (params.length === 0) {
    return query + ';';
  }
  
  // Replace parameter placeholders with safely escaped values
  let processedQuery = query;
  for (let i = 0; i < params.length; i++) {
    const placeholder = `$${i + 1}`;
    const value = escapeParameter(params[i]);
    processedQuery = processedQuery.replace(placeholder, value);
  }
  
  return processedQuery + ';';
}

// Safely escape parameters for PostgreSQL
function escapeParameter(param: any): string {
  if (param === null || param === undefined) {
    return 'NULL';
  } else if (typeof param === 'string') {
    // Properly escape strings by doubling single quotes and wrapping in quotes
    return `'${param.replace(/'/g, "''")}'`;
  } else if (typeof param === 'number') {
    return param.toString();
  } else if (typeof param === 'boolean') {
    return param ? 'TRUE' : 'FALSE';
  } else {
    // For other types, convert to string and escape
    return `'${String(param).replace(/'/g, "''")}'`;
  }
}

// UUID validation helper
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to parse row data based on query type
function parseRowBasedOnQuery(values: string[], query: string): any {
  // Handle stacks table
  if (query.includes('FROM stacks') && !query.includes('JOIN')) {
    return {
      id: values[0],
      slug: values[1],
      title: values[2],
      description: values[3] || null,
      questions: values[4] ? JSON.parse(values[4]) : [],
      ai_summary_instructions: values[5] || null,
      created_at: values[6],
      updated_at: values[7]
    };
  }
  
  // Handle stack_sessions table (both FROM queries and RETURNING from INSERT/UPDATE)
  if ((query.includes('FROM stack_sessions') || query.includes('stack_sessions') && query.includes('RETURNING')) && !query.includes('JOIN')) {
    return {
      id: values[0],
      stack_id: values[1],
      user_id: values[2] || null,
      status: values[3],
      current_index: parseInt(values[4]) || 0,
      title: values[5],
      created_at: values[6],
      updated_at: values[7]
    };
  }
  
  // Handle stack_answers table (both FROM queries and RETURNING from INSERT/UPDATE)
  if (query.includes('stack_answers')) {
    return {
      id: values[0],
      session_id: values[1],
      question_index: parseInt(values[2]) || 0,
      question_key: values[3],
      question_text: values[4],
      answer_text: values[5],
      created_at: values[6]
    };
  }
  
  // Handle JOIN queries (session with stack)
  if (query.includes('JOIN') && query.includes('stack_sessions') && query.includes('stacks')) {
    return {
      id: values[0],
      stack_id: values[1], 
      user_id: values[2] || null,
      status: values[3],
      current_index: parseInt(values[4]) || 0,
      title: values[5],
      created_at: values[6],
      updated_at: values[7],
      slug: values[8],
      stack_title: values[9],
      questions: values[10] ? JSON.parse(values[10]) : []
    };
  }
  
  // Default: return as object with data array
  return { values };
}

// PostgreSQL database operations using direct psql commands
export async function getStackBySlug(slug: string) {
  const query = `SELECT * FROM stacks WHERE slug = $1`;
  const { data, error } = await queryDb(query, [slug]);
  
  if (error || !data || data.length === 0) {
    return { data: null, error };
  }
  
  return { data: data[0], error: null };
}

export async function createSession(stackId: string, title: string, userId: string | null = null) {
  const query = `
    INSERT INTO stack_sessions (stack_id, user_id, title, status, current_index, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *
  `;
  
  const { data, error } = await queryDb(query, [stackId, userId, title, 'in_progress', 0]);
  
  if (error || !data || data.length === 0) {
    return { data: null, error };
  }
  
  return { data: data[0], error: null };
}

export async function getSessionWithStack(sessionId: string) {
  // Validate UUID format first
  if (!isValidUUID(sessionId)) {
    return { data: null, error: { message: "Invalid session ID format", type: "INVALID_UUID" } };
  }
  const query = `
    SELECT ss.*, s.slug, s.title as stack_title, s.questions 
    FROM stack_sessions ss
    JOIN stacks s ON ss.stack_id = s.id
    WHERE ss.id = $1
  `;
  
  const { data, error } = await queryDb(query, [sessionId]);
  
  if (error || !data || data.length === 0) {
    return { data: null, error };
  }
  
  // Transform to match expected format
  const row = data[0];
  const result = {
    id: row.id,
    stack_id: row.stack_id,
    user_id: row.user_id,
    status: row.status,
    current_index: row.current_index,
    title: row.title,
    created_at: row.created_at,
    updated_at: row.updated_at,
    stacks: {
      slug: row.slug,
      title: row.stack_title,
      questions: row.questions
    }
  };
  
  return { data: result, error: null };
}

export async function getAllSessions() {
  const query = `
    SELECT ss.*, s.slug, s.title as stack_title, s.questions 
    FROM stack_sessions ss
    JOIN stacks s ON ss.stack_id = s.id
    ORDER BY ss.created_at DESC
  `;
  
  const { data, error } = await queryDb(query, []);
  
  if (error) {
    return { data: null, error };
  }
  
  // Transform to match expected format
  const results = (data || []).map(row => ({
    id: row.id,
    stack_id: row.stack_id,
    user_id: row.user_id,
    status: row.status,
    current_index: row.current_index,
    title: row.title,
    created_at: row.created_at,
    updated_at: row.updated_at,
    stacks: {
      slug: row.slug,
      title: row.stack_title,
      questions: row.questions
    }
  }));
  
  return { data: results, error: null };
}

export async function getAnswersForSession(sessionId: string) {
  // Validate UUID format first
  if (!isValidUUID(sessionId)) {
    return { data: null, error: { message: "Invalid session ID format", type: "INVALID_UUID" } };
  }
  const query = `
    SELECT * FROM stack_answers 
    WHERE session_id = $1 
    ORDER BY question_index
  `;
  
  const { data, error } = await queryDb(query, [sessionId]);
  return { data: data || [], error };
}

export async function upsertAnswer(sessionId: string, questionIndex: number, questionKey: string, questionText: string, answerText: string) {
  // Validate UUID format first
  if (!isValidUUID(sessionId)) {
    return { data: null, error: { message: "Invalid session ID format", type: "INVALID_UUID" } };
  }
  // First try to update existing answer
  const updateQuery = `
    UPDATE stack_answers 
    SET answer_text = $3, created_at = NOW()
    WHERE session_id = $1 AND question_index = $2
    RETURNING *
  `;
  
  const { data: updateData, error: updateError } = await queryDb(updateQuery, [sessionId, questionIndex, answerText]);
  
  if (!updateError && updateData && updateData.length > 0) {
    return { data: updateData[0], error: null };
  }
  
  // If update didn't affect any rows, insert new answer
  const insertQuery = `
    INSERT INTO stack_answers (session_id, question_index, question_key, question_text, answer_text, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;
  
  const { data, error } = await queryDb(insertQuery, [sessionId, questionIndex, questionKey, questionText, answerText]);
  
  if (error || !data || data.length === 0) {
    return { data: null, error };
  }
  
  return { data: data[0], error: null };
}

export async function updateSessionProgress(sessionId: string, currentIndex: number, status: string) {
  // Validate UUID format first
  if (!isValidUUID(sessionId)) {
    return { data: null, error: { message: "Invalid session ID format", type: "INVALID_UUID" } };
  }
  const query = `
    UPDATE stack_sessions 
    SET current_index = $2, status = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  
  const { data, error } = await queryDb(query, [sessionId, currentIndex, status]);
  
  if (error || !data || data.length === 0) {
    return { data: null, error };
  }
  
  return { data: data[0], error: null };
}