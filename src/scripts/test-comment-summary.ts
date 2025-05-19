import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Proviamo a caricare .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('File .env trovato, lo carico');
  config({ path: envPath });
}

// Proviamo anche a caricare .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('File .env.local trovato, lo carico');
  config({ path: envLocalPath, override: true });
}

// Stampiamo tutte le variabili d'ambiente per debug
console.log('Variabili d\'ambiente dopo il caricamento:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Presente' : 'Non presente');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Presente' : 'Non presente');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Presente' : 'Non presente');

// Ora importa il resto delle dipendenze
import { summarizeComments } from '../lib/comment-ai';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.log('Usage: npm run test-summary <session_id> <question_id> <receiver_id>');
    process.exit(1);
  }
  
  const [sessionId, questionId, receiverId] = args;
  
  try {
    console.log('Generating summary...');
    const summary = await summarizeComments(sessionId, questionId, receiverId);
    console.log('\nSummary:');
    console.log(summary);
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 