# Piano Sviluppo: Componente PDF "Pagella" Session Results

## Obiettivo
Creare un componente che permetta di scaricare in formato PDF i risultati completi di una sessione, con design "stile pagella di fine anno", accessibile tramite un pulsante "Scarica risultati" nella pagina `src/app/session_results/page.tsx`.

## Analisi Dati Esistenti

### Dati da `src/app/session_results/page.tsx`:
- **Risultati complessivi sessione**: `val_overall`, `self_overall`, `level_standard`, `mentor_overall`
- **GAP risultati**: `val_gap` con logica di valutazione (promozione/standard/sotto standard)
- **Risultati per skill**: `val_strategy`, `val_soft`, `val_execution` con relativi pesi e valori self/mentor
- **Metadati sessione**: nome sessione, data fine, status

### Dati da `src/app/session_results/feedback/page.tsx`:
- **Domande per tipologia**: filtrate per STRATEGY/SOFT/EXECUTION
- **Dettagli per domanda**: `question.description`, `overall`, `count`, `mentorValue`
- **Commenti**: conteggio commenti per domanda
- **Iniziative**: generate per ogni feedback tramite `getInitiativesByQuestionId`

## Architettura Tecnica

### 1. Libreria PDF
**Scelta**: `jsPDF` + `html2canvas` (già compatibile con Next.js)
```bash
npm install jspdf html2canvas
npm install --save-dev @types/jspdf
```

### 2. Struttura File
```
src/
├── components/
│   └── pdf/
│       ├── pdf-generator.tsx          # Componente principale generazione PDF
│       ├── pdf-template.tsx           # Template HTML per il PDF
│       └── pdf-download-button.tsx    # Pulsante download
├── lib/
│   ├── pdf/
│   │   ├── pdf-utils.ts              # Utilities per PDF
│   │   └── pdf-data-aggregator.ts    # Aggregazione dati per PDF
│   └── types/
│       └── pdf-report.ts             # Tipi TypeScript per report PDF
```

### 3. Tipi TypeScript

#### `src/lib/types/pdf-report.ts`
```typescript
export interface SessionReportData {
  // Metadati sessione
  sessionInfo: {
    name: string;
    endDate: string;
    userName: string;
    status: string;
  };
  
  // Risultati complessivi
  overallResults: {
    overall: number;
    self: number;
    standard: number;
    mentor: number;
    gap: number;
    gapEvaluation: string;
  };
  
  // Risultati per skill
  skillResults: SkillResult[];
  
  // Dettagli domande
  questionDetails: QuestionDetail[];
}

export interface SkillResult {
  type: 'STRATEGY' | 'SOFT' | 'EXECUTION';
  displayName: string;
  weight: number;
  overall: number;
  self: number;
  mentor: number;
  feedbackCount: number;
  color: string;
}

export interface QuestionDetail {
  id: string;
  description: string;
  skillType: string;
  overall: number;
  mentorValue: number;
  commentCount: number;
  initiatives: string[];
}
```

### 4. Aggregatore Dati

#### `src/lib/pdf/pdf-data-aggregator.ts`
```typescript
import { getSessionFeedback, getInitiativesByQuestionId } from '@/lib/supabase/queries';
import { SessionReportData } from '@/lib/types/pdf-report';

export async function aggregateSessionReportData(
  sessionId: string, 
  userId: string,
  userName?: string
): Promise<SessionReportData> {
  // 1. Recupera dati sessione (user_sessions + sessions)
  // 2. Recupera feedback aggregati per domanda
  // 3. Recupera iniziative per ogni domanda
  // 4. Struttura dati secondo SessionReportData
}
```

### 5. Template PDF

#### `src/components/pdf/pdf-template.tsx`
```typescript
interface PDFTemplateProps {
  data: SessionReportData;
  isPreview?: boolean;
}

export function PDFTemplate({ data, isPreview = false }: PDFTemplateProps) {
  return (
    <div className="pdf-container" style={{ 
      width: '210mm', 
      minHeight: '297mm',
      padding: '20mm',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'white'
    }}>
      {/* Header con logo e titolo */}
      <PDFHeader sessionInfo={data.sessionInfo} />
      
      {/* Sezione risultati complessivi */}
      <PDFOverallResults results={data.overallResults} />
      
      {/* Sezione risultati per skill */}
      <PDFSkillResults skills={data.skillResults} />
      
      {/* Sezione dettagli domande */}
      <PDFQuestionDetails questions={data.questionDetails} />
      
      {/* Footer */}
      <PDFFooter />
    </div>
  );
}
```

### 6. Generatore PDF

#### `src/components/pdf/pdf-generator.tsx`
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  static async generateSessionReport(
    data: SessionReportData,
    fileName?: string
  ): Promise<void> {
    // 1. Crea elemento DOM temporaneo con PDFTemplate
    // 2. Usa html2canvas per convertire in immagine
    // 3. Crea PDF con jsPDF
    // 4. Gestisce paginazione automatica
    // 5. Scarica file
  }
}
```

### 7. Pulsante Download

#### `src/components/pdf/pdf-download-button.tsx`
```typescript
interface PDFDownloadButtonProps {
  sessionId: string;
  userId: string;
  userName?: string;
  disabled?: boolean;
}

export function PDFDownloadButton({ 
  sessionId, 
  userId, 
  userName,
  disabled = false 
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const data = await aggregateSessionReportData(sessionId, userId, userName);
      await PDFGenerator.generateSessionReport(data, `risultati-${data.sessionInfo.name}.pdf`);
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      // Gestione errore
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-full text-lg mt-4"
    >
      {isGenerating ? 'Generazione PDF...' : 'Scarica risultati'}
    </Button>
  );
}
```

## Design "Stile Pagella"

### Layout Compatto
- **Header**: Logo aziendale, nome utente, periodo valutazione
- **Sezione Voti**: Griglia compatta con Overall, Self, Standard, Mentor
- **Tabella Skills**: Righe per Strategy/Soft/Execution con voti e pesi
- **Dettaglio Domande**: Lista compatta con descrizione, voto, iniziative
- **Footer**: Data generazione, firma digitale

### Palette Colori
- **Strategy Skills**: `#00BFA5` (teal)
- **Soft Skills**: `#F5A623` (arancione)  
- **Execution Skills**: `#4285F4` (blu)
- **Voti positivi**: `#10B981` (verde)
- **Voti negativi**: `#EF4444` (rosso)
- **Neutri**: `#6B7280` (grigio)

### Tipografia
- **Titoli**: 18px, bold
- **Sottotitoli**: 14px, semibold
- **Corpo**: 12px, regular
- **Voti**: 16px, bold

## Integrazione UI

### Modifica `src/app/session_results/page.tsx`
```typescript
// Aggiungere dopo il pulsante "Vedi Dettaglio"
<PDFDownloadButton
  sessionId={selectedSession}
  userId={userId || ''}
  userName={userName || undefined}
  disabled={!currentSession}
/>
```

### Posizionamento
- Sotto il pulsante "Vedi Dettaglio" esistente
- Stesso stile ma colore rosso per distinguerlo
- Margine top di 4 (mt-4)

## Query Ottimizzate

### Nuova query in `src/lib/supabase/queries.ts`
```typescript
export async function getSessionReportData(sessionId: string, userId: string) {
  // Single query con tutti i join necessari per minimizzare chiamate DB
  // Include: user_sessions, sessions, feedbacks, questions, initiatives
}
```

## Gestione Errori

### Scenari da Gestire
1. **Sessione non trovata**: Messaggio "Sessione non disponibile"
2. **Dati incompleti**: Genera PDF con dati disponibili + nota
3. **Errore generazione**: Toast di errore + retry
4. **Timeout**: Fallback a download dati JSON

### Loading States
- Pulsante disabilitato durante generazione
- Testo "Generazione PDF..." 
- Spinner opzionale

## Performance

### Ottimizzazioni
1. **Lazy loading**: Carica jsPDF solo quando necessario
2. **Caching**: Cache dati sessione per evitare re-fetch
3. **Compressione**: Ottimizza dimensione immagini nel PDF
4. **Chunking**: Gestisce sessioni con molte domande

### Limiti
- Max 200 domande per PDF
- Timeout 30 secondi per generazione
- Dimensione max PDF: 10MB

## Sicurezza

### Validazioni
- Verifica ownership sessione (userId match)
- Sanitizzazione dati input
- Rate limiting su generazione PDF

### Privacy
- Non include dati sensibili nel PDF
- Watermark con data/ora generazione
- Log accessi per audit

## Deployment

### Dipendenze Produzione
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Variabili Ambiente
```env
# Opzionale: servizio esterno per PDF
NEXT_PUBLIC_PDF_SERVICE_URL=
PDF_GENERATION_TIMEOUT=30000
```

## Timeline Implementazione

### Fase 1 (2-3 giorni)
- Setup dipendenze e tipi TypeScript
- Implementazione aggregatore dati
- Template PDF base

### Fase 2 (2-3 giorni)  
- Generatore PDF con jsPDF
- Integrazione pulsante download
- Styling "pagella" completo

### Fase 3 (1-2 giorni)
- Testing e ottimizzazioni
- Gestione errori
- Documentazione

## Note Implementative

### Rispetto .cursorrules
- ✅ Tutti i tipi in TypeScript con interfacce
- ✅ Componenti in `src/components/`
- ✅ Utilities in `src/lib/`
- ✅ Query ottimizzate con join
- ✅ Gestione errori completa
- ✅ Commenti in inglese
- ✅ Type-safety garantita

### Best Practices Progetto
- Riutilizzo componenti UI esistenti (Button, Card)
- Consistenza con design system Tailwind
- Pattern di loading/error già utilizzati
- Integrazione seamless con architettura esistente
