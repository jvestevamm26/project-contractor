const db = require("../db");


const createReview = async (project_id, client_id, contractor_id, rating, comment) => {
    const result = await db.query(
        `INSERT INTO reviews
        (project_id, client_id, contractor_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [project_id, client_id, contractor_id, rating, comment]
    );

    return result.rows[0];
};


const getReviewByProjectId = async (projectId) => {
    const result = await db.query(
        "SELECT * FROM reviews WHERE project_id = $1",
        [projectId]
    );

    return result.rows[0];
};


const getReviewsByContractor = async (contractorId) => {
    const result = await db.query(
        "SELECT * FROM reviews WHERE contractor_id = $1 ORDER BY created_at DESC",
        [contractorId]
    );

    return result.rows;
};


module.exports = {
    createReview,
    getReviewByProjectId,
    getReviewsByContractor
};
