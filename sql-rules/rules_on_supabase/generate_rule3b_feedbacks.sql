
BEGIN
    DELETE FROM feedbacks
    WHERE id IN (
        SELECT f3.id
        FROM feedbacks f3
        JOIN feedbacks f_other 
            ON f3.sender = f_other.sender 
            AND f3.receiver = f_other.receiver
            AND f3.question_id = f_other.question_id
            AND f3.session_id = f_other.session_id
            AND f_other.rule_number IN (1, 2)  -- Consideriamo i feedback delle Regole 1 e 2 come base
        WHERE f3.rule_number = 3
          AND f3.session_id = $1
    );
END;
