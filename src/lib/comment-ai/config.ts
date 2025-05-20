export const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "";
export const OPENROUTER_MODEL_ID = "meta-llama/llama-4-maverick"; // Modello selezionato

export const SYSTEM_PROMPT = 
`Sei un esperto nell'analisi e riassunto di feedback. Il tuo compito è leggere attentamente 
tutti i commenti forniti, comprenderne il significato più profondo, identificare i temi ricorrenti 
e il sentiment generale. Sei abile a leggere tra le righe per comprendere realmente cosa le persone 
stanno cercando di comunicare, anche quando non lo esprimono direttamente.`;

export const SYSTEM_PROMPT_INITIATIVES = 
`Sei un coach esperto che aiuta professionisti a svilupparsi basandosi sui feedback ricevuti. 
Il tuo compito è suggerire iniziative concrete e attuabili che possano aiutare la persona a migliorare 
nelle aree evidenziate dai feedback ricevuti dai colleghi.`;

export const USER_PROMPT_TEMPLATE = 
`Data la domanda: {question_description}

Riassumi in tre o quattro righe i seguenti commenti:

{comments}`;

export const USER_PROMPT_INITIATIVES_TEMPLATE = 
`Data la domanda: {question_description} e dati i commenti dei colleghi riassunti in questo modo:

{summary_comments}

Consigliami al massimo due task che potrei completare nei prossimi 6 mesi per migliorare in base ai commenti ricevuti. 
Queste iniziative individuali devono essere di massimo 20 parole, concise, iniziare SEMPRE con un verbo all'infinito 
e in prima persona, descrivendo azioni che posso concludere nei prossimi sei mesi e potrebbero portarmi un beneficio concreto. 
Sii specifico e time-based.`;