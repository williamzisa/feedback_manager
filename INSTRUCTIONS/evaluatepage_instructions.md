# Istruzioni per la Pagina di Valutazione

## Stato Implementazione

### ✅ Fase 1: Struttura Base
- [x] Sistema di temi per i tipi di skill implementato
- [x] Layout principale con sfondo dinamico
- [x] Navigazione fissa su mobile
- [x] Controlli di navigazione intelligenti
- [x] Struttura base dei componenti
- [x] Pulsante "PROSSIMO" compatto con icona utente

### ✅ Fase 2: Miglioramenti UI
- [x] Sistema di stelle standardizzato (colore #F4B400 fisso)
- [x] Differenziazione visiva domande:
  - [x] Font più leggero per il testo della domanda
  - [x] Colore testo nero standard per migliore leggibilità
  - [x] Distinzione visiva tra domande risposte e da rispondere
- [x] Transizioni e animazioni
- [x] Feedback visivi per le azioni

### ⏳ Fase 3: Ottimizzazioni (In Corso)
- [ ] Miglioramenti performance
  - [ ] Ottimizzazione delle query al database
  - [ ] Riduzione delle ri-renderizzazioni
  - [ ] Caching dei dati
- [ ] Gestione stati di caricamento
  - [ ] Skeleton loading per i feedback
  - [ ] Indicatori di progresso
- [ ] Gestione errori
  - [ ] Messaggi di errore contestuali
  - [ ] Retry automatico per le operazioni fallite
- [ ] Feedback utente migliorato
  - [ ] Toast notifications per le azioni
  - [ ] Conferme per azioni importanti

### ⏳ Fase 4: Mobile e Testing
- [ ] Ottimizzazioni layout mobile
  - [ ] Gesture navigation
  - [ ] Touch feedback
  - [ ] Keyboard handling
- [ ] Testing cross-browser
- [ ] Testing accessibilità
- [ ] Testing performance

## Componenti Principali

### Header
- Titolo "Feedback"
- Pulsante indietro
- Navigazione contestuale

### Selezione Persona
- Dropdown con lista persone
- Indicatore feedback rimanenti
- Pulsante "PROSSIMO" compatto con icona utente

### Selezione Skill
- Dropdown con tipi di skill
- Indicatore feedback rimanenti per tipo
- Colori contestuali per tipo

### Sezione Feedback
- Domanda con stile standardizzato
- Sistema di stelle (colore #F4B400)
- Pulsante "NON HO ELEMENTI"
- Area commenti
- Navigazione tra feedback

### Navigazione
- Pulsanti Avanti/Indietro
- Indicatore progresso
- Versione mobile fixed-bottom
- Pulsante "PROSSIMO" nell'ultimo feedback

## Temi e Colori

### Skill Types
```typescript
const skillThemes = {
  SOFT: {
    main: '#F5A623',
    bg: '#FFF8F0',
    text: '#D48519',
    border: 'border-[#F5A623]',
    bgClass: 'bg-[#FFF8F0]',
    textClass: 'text-[#F5A623]',
    buttonClass: 'bg-[#F5A623] hover:bg-[#D48519]'
  },
  STRATEGY: {
    main: '#00BFA5',
    bg: '#E0F7FA',
    text: '#00A693',
    border: 'border-[#00BFA5]',
    bgClass: 'bg-[#E0F7FA]',
    textClass: 'text-[#00BFA5]',
    buttonClass: 'bg-[#00BFA5] hover:bg-[#00A693]'
  },
  EXECUTION: {
    main: '#4285F4',
    bg: '#E8F0FE',
    text: '#3B77DB',
    border: 'border-[#4285F4]',
    bgClass: 'bg-[#E8F0FE]',
    textClass: 'text-[#4285F4]',
    buttonClass: 'bg-[#4285F4] hover:bg-[#3B77DB]'
  }
}
```

## Note Implementative
- Utilizzare Tailwind per gli stili
- Mantenere consistenza nei colori e nel design
- Assicurare accessibilità e contrasto
- Implementare feedback visivi chiari
- Ottimizzare per mobile-first