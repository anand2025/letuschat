-- check_users.sql
SELECT 'USERS' as label;
SELECT id, email, display_name FROM "user" WHERE email IN ('shreya2@gmail.com', 'shruti@gmail.com');

SELECT 'CONVERSATIONS' as label;
SELECT c.id as conv_id, u.email 
FROM conversation c 
JOIN userconversation uc ON c.id = uc.conversation_id 
JOIN "user" u ON uc.user_id = u.id 
WHERE c.id IN (
    SELECT conversation_id 
    FROM userconversation 
    WHERE user_id IN (SELECT id FROM "user" WHERE email IN ('shreya2@gmail.com', 'shruti@gmail.com'))
);

SELECT 'MESSAGES' as label;
SELECT m.id, m.conversation_id, u.email as sender, m.text, m.created_at
FROM message m
JOIN "user" u ON m.sender_id = u.id
WHERE m.conversation_id IN (
    SELECT conversation_id 
    FROM userconversation 
    WHERE user_id IN (SELECT id FROM "user" WHERE email IN ('shreya2@gmail.com', 'shruti@gmail.com'))
)
ORDER BY m.created_at ASC;
