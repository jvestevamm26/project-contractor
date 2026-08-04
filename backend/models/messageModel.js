const db = require("../db");


const createMessage = async (sender_id, receiver_id, project_id, message) => {
    const result = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, project_id, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [sender_id, receiver_id, project_id, message]
    );

    return result.rows[0];
};


const getMessagesByProject = async (projectId) => {
    const result = await db.query(
        "SELECT * FROM messages WHERE project_id = $1 ORDER BY created_at ASC",
        [projectId]
    );

    return result.rows;
};


module.exports = {
    createMessage,
    getMessagesByProject
};
