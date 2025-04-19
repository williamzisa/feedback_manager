--DA TOGLIERE DATO CHE LO FACCIAMO OGNI 6 MESI E DATO CHE DOBBIAMO METTERE UN'ELIMINAZIONE SE UGUALE TUTTO (SENDER, RECEVIER, QUESTION, SESSION)

-- Individua ed elimina i duplicati di feedback (stessa combinazione `sender_id - receiver_id - question_id - session_id`) derivanti dall'applicazione di tutte le regole precedenti.
-- Rimuove i feedback duplicati più recenti e tiene i più vecchi, con particolare attenzione ai feedback creati nella sessione input.
-- Garantisce che tra le sessioni non vi siano feedback identici che potrebbero essere stati generati da più regole.


-- Regola 3b: Eliminazione dei duplicati della Regola 3 rispetto alla Regola 1 e Regola 2
WITH DuplicateFeedbacks AS (
    SELECT 
        f3.id
    FROM feedbacks f3
    JOIN feedbacks f_other ON 
        f3.sender_id = f_other.sender_id 
        AND f3.receiver_id = f_other.receiver_id
        AND f3.question_id = f_other.question_id
        AND f3.session_id = f_other.session_id
        AND f_other.regola IN (1, 2)  -- Consideriamo i feedback delle Regole 1 e 2 come base
    WHERE f3.regola = 3
      AND f3.session_id = '6476c0a5-2a9f-4d34-a689-94342b4b104f'
)
DELETE FROM feedbacks
WHERE id IN (
    SELECT id FROM DuplicateFeedbacks
);


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
