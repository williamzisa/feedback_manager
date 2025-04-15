--DA CAMBIARE SESSION_ID

--- Crea un feedback di autovalutazione per ciascun utente che ha un Mentor.
-- Viene generato un feedback di autovalutazione per tutte le domande di tipo`execution` ad eccezione di tutti i processi che contengono PRJ nel proprio nome.
-- Gli utenti che partecipano solo a team di progetto (`(PRJ)`) non devono fare autovalutazioni sulle domande `soft` e `strategy` (DEPRECATO??)

-- Regola 8: Generazione autovalutazioni EXECUTION per ogni user che ha un Mentor
insert into
  feedbacks (
    sender_id,
    receiver_id,
    question_id,
    question_descr,
    session_id,
    create_date,
    question_type,
    regola
  )
select distinct
  um.user_id as sender_id,
  um.user_id as receiver_id,
  q.id as question_id,
  q.description as question_descr,
  cs.session_id,
  now() as create_date,
  'execution' as question_type,
  6 as regola
from
  user_mentor um
  join users_processes up on up.user_id = um.user_id
  join questions q on q.type = 'execution'
  and q.process_id = up.process_id
  and q.description not like '%(PRJ)%' -- Esclude le domande con processi di tipo (PRJ)
  join clusters_sessions cs on cs.session_id = '1e167f13-35fe-4655-b77c-c3c167ca81c3';

