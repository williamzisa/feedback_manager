export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
export const OPENROUTER_MODEL_ID = "meta-llama/llama-4-maverick:free"; // Modello selezionato

export const SYSTEM_PROMPT = 
`Sei un esperto nell'analisi e riassunto di feedback. Il tuo compito è leggere attentamente 
tutti i commenti forniti, comprenderne il significato più profondo, identificare i temi ricorrenti 
e il sentiment generale. Sei abile a leggere tra le righe per comprendere realmente cosa le persone 
stanno cercando di comunicare, anche quando non lo esprimono direttamente.`;

export const USER_PROMPT_TEMPLATE = 
`Riassumi in tre o quattro righe i seguenti commenti:

{comments}`;