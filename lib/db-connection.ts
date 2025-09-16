// Simple database connection using system PostgreSQL
// This approach uses the child_process to execute psql commands directly
// since the pg package has dependency conflicts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Execute SQL queries using psql command line tool
export async function queryDb(query: string, params: any[] = []) {
  try {
    // Replace parameter placeholders with actual values
    let processedQuery = query;
    for (let i = 0; i < params.length; i++) {
      const placeholder = `$${i + 1}`;
      const value = typeof params[i] === 'string' ? `'${params[i].replace(/'/g, "''")}'` : params[i];
      processedQuery = processedQuery.replace(placeholder, value);
    }
    
    // Use a delimiter that won't appear in the data
    const delimiter = '|||';
    const psqlCommand = `echo "${processedQuery.replace(/"/g, '\\"')}" | psql "${process.env.DATABASE_URL}" -t -A -F"${delimiter}"`;
    
    const { stdout, stderr } = await execAsync(psqlCommand);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error("Database query error:", stderr);
      return { data: null, error: { message: stderr } };
    }
    
    // Parse delimited output
    const lines = stdout.trim().split('\n').filter(line => line.length > 0);
    if (lines.length === 0) {
      return { data: [], error: null };
    }
    
    // For queries that return columns, parse them
    if (query.toUpperCase().includes('SELECT') || query.toUpperCase().includes('RETURNING')) {
      try {
        const data = lines.map(line => {
          const values = line.split(delimiter);
          return parseRowBasedOnQuery(values, query);
        });
        
        return { data, error: null };
      } catch (parseError) {
        console.error("Row parsing error:", parseError, "Output:", stdout);
        return { data: null, error: { message: `Row parsing failed: ${parseError}` } };
      }
    }
    
    return { data: lines, error: null };
  } catch (error: any) {
    console.error("Database query error:", error);
    return { data: null, error: { message: error.message } };
  }
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
  
  // Handle stack_sessions table
  if (query.includes('FROM stack_sessions') && !query.includes('JOIN')) {
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
  
  // Handle stack_answers table
  if (query.includes('FROM stack_answers')) {
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
  const query = `
    SELECT * FROM stack_answers 
    WHERE session_id = $1 
    ORDER BY question_index
  `;
  
  const { data, error } = await queryDb(query, [sessionId]);
  return { data: data || [], error };
}

export async function upsertAnswer(sessionId: string, questionIndex: number, questionKey: string, questionText: string, answerText: string) {
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