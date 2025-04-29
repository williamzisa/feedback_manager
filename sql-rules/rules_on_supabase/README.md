# Descrizione delle Funzioni SQL per la Generazione dei Feedback

Questo file descrive le funzioni SQL utilizzate per generare o manipolare i record nella tabella `feedbacks` in base a regole specifiche all'interno di una determinata sessione. Ciascuna funzione accetta l'ID della sessione (`session_id` o `session_uuid` o `p_session_id`) come argomento.

## `generate_rule1_feedbacks.sql`

*   **Funzione:** Genera feedback unidirezionali dal Leader di Cluster (CLU) al Leader di Team (TL).
*   **Descrizione:** Inserisce record nella tabella `feedbacks` dove il mittente (`sender`) è il `leader` di un cluster (`clusters`) e il destinatario (`receiver`) è il `leader` di un team (`teams`) appartenente a quel cluster. Vengono generate righe per ogni combinazione CLU-TL valida all'interno della sessione specificata e per ogni domanda (`questions`) associata alla company del cluster che sia di tipo 'soft' o 'strategy'.

## `generate_rule2_feedbacks.sql`

*   **Funzione:** Genera feedback tra Leader di Team (TL) e Leader di Cluster (CLU) e tra Leader di Team dello stesso cluster.
*   **Descrizione:**
    *   **Parte A (TL -> CLU):** Inserisce record dove il mittente è il `leader` di un team (`teams`) e il destinatario è il `leader` del cluster (`clusters`) a cui il team appartiene. Questo avviene per tutte le domande (`questions`) di tipo 'soft' associate alla company del cluster, per la sessione specificata.
    *   **Parte B (TL <-> TL):** Inserisce record *bidirezionali* tra i `leader` di team (`teams`) diversi che appartengono allo *stesso* cluster. Il mittente è il leader di un team e il destinatario è il leader di un altro team nello stesso cluster (e viceversa). Questo avviene per tutte le domande (`questions`) di tipo 'soft' associate alla company del cluster, per la sessione specificata.

## `generate_rule3a_feedbacks.sql`

*   **Funzione:** Genera feedback bidirezionali tra membri dello stesso team (TM <-> TM).
*   **Descrizione:** Inserisce record *bidirezionali* nella tabella `feedbacks` tra utenti (`users`) che sono membri dello *stesso* team (`teams`). Ogni membro del team invia e riceve feedback da ogni altro membro dello stesso team. Questo avviene per tutte le domande (`questions`) di tipo 'soft' associate alla company della sessione specificata.

## `generate_rule4_feedbacks.sql`

*   **Funzione:** Genera feedback bidirezionali tra partecipanti allo stesso processo (User <-> User).
*   **Descrizione:** Inserisce record *bidirezionali* nella tabella `feedbacks` tra utenti (`users`) che sono assegnati allo *stesso processo* (`processes`) e partecipano entrambi alla sessione specificata. Il feedback viene generato solo per la domanda (`questions`) di tipo 'execution' che è direttamente collegata a quel processo (`linked_question_id`). Ogni membro coinvolto nel processo dà e riceve feedback da ogni altro utente nello stesso processo per quella specifica domanda.

## `generate_rule5_feedbacks.sql`

*   **Funzione:** Genera feedback unidirezionali dal Mentor al Mentee (Mentor -> TM).
*   **Descrizione:** Inserisce record nella tabella `feedbacks` dove il mittente (`sender`) è il `mentor` di un utente (Mentee) e il destinatario (`receiver`) è l'utente stesso (Team Member - TM). Il feedback viene generato per le domande (`questions`) di tipo 'execution' collegate ai processi (`processes`) a cui il Mentee è assegnato. Questo avviene solo se sia il Mentor che il Mentee partecipano alla sessione specificata. 
# --*da verificare correttezza ultima frase*

## `generate_rule6_feedbacks.sql`

*   **Funzione:** Genera feedback di autovalutazione (User -> User).
*   **Descrizione:** Inserisce record nella tabella `feedbacks` dove mittente (`sender`) e destinatario (`receiver`) sono lo stesso utente (`users`). Questo avviene per ogni utente che partecipa alla sessione specificata.
    *   Viene generato un record di autovalutazione per ogni domanda (`questions`) di tipo 'soft' e 'strategy' associata alla company della sessione.
    *   Viene generato un record di autovalutazione per ogni domanda (`questions`) di tipo 'execution' collegata ai processi (`processes`) a cui l'utente è assegnato.

## `generate_rule7_feedbacks.sql`

*   **Funzione:** Genera feedback bidirezionali tra Leader di Team (TL <-> TL) di team collegati esplicitamente.
*   **Descrizione:** Inserisce record *bidirezionali* nella tabella `feedbacks` tra i `leader` di team (`teams`) che hanno una relazione definita nella tabella `team_teams`. Il feedback viene generato solo se entrambi i team (e quindi i loro leader) partecipano alla sessione specificata. Questo avviene per tutte le domande (`questions`) di tipo 'soft' associate alla company della sessione.
