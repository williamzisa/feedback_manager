
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH duplicates AS (
        SELECT f.id,
               ROW_NUMBER() OVER (
                   PARTITION BY f.session_id, f.sender, f.receiver, f.question_id
                   ORDER BY f.rule_number ASC
               ) as row_num
        FROM feedbacks f
        WHERE f.session_id = $1
    )
    DELETE FROM feedbacks f
    USING duplicates d
    WHERE f.id = d.id 
    AND d.row_num > 1;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
