const db = require("../db");


const createImage = async (project_id, image_url, description) => {
    const result = await db.query(
        `INSERT INTO project_images (project_id, image_url, description)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [project_id, image_url, description]
    );

    return result.rows[0];
};


const getImagesByProject = async (projectId) => {
    const result = await db.query(
        "SELECT * FROM project_images WHERE project_id = $1 ORDER BY created_at DESC",
        [projectId]
    );

    return result.rows;
};


module.exports = {
    createImage,
    getImagesByProject
};
