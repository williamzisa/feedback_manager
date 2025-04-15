--DA TOGLIERE DATO CHE LO FACCIAMO OGNI 6 MESI?

-- Individua ed elimina i duplicati di feedback (stessa combinazione `sender_id - receiver_id - question_id - session_id`) derivanti dall'applicazione di tutte le regole precedenti.
-- Rimuove i feedback duplicati più recenti e tiene i più vecchi, con particolare attenzione ai feedback creati nella sessione input.
-- Garantisce che tra le sessioni non vi siano feedback identici che potrebbero essere stati generati da più regole.

-- Regola 9A: Identificazione e conta dei duplicati di feedback, mantenendo quello meno recente, da confrontare per test

WITH
  Duplicates AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY
          sender_id,
          receiver_id,
          question_id,
          session_id
        ORDER BY
          create_date ASC
      ) AS rn
    FROM
      feedbacks
    WHERE
      session_id = '1e167f13-35fe-4655-b77c-c3c167ca81c3'
  )
SELECT
  COUNT(*)
FROM
  Duplicates
WHERE
  rn > 1;

  -- Regola 9B: Cancellazione dei duplicati di feedback, mantenendo quello meno recente
WITH Duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY sender_id, receiver_id, question_id, session_id
            ORDER BY create_date ASC
        ) AS rn
    FROM feedbacks
    WHERE session_id = '1e167f13-35fe-4655-b77c-c3c167ca81c3'
)
DELETE FROM feedbacks
WHERE id IN (
    SELECT id
    FROM Duplicates
    WHERE rn > 1
);
