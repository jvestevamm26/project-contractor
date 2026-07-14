const db = require("../db");


const createProject = async (
    clientid,
    contractorid,
    title,
    description,
    price,
    location
) => {

    const result = await db.query(
       ` INSERT INTO projects
(
    client_id,
    contractor_id,
    title,
    description,
    price,
    location
)
VALUES ($1,$2,$3,$4,$5,$6)
RETURNING *;`,
        [
            clientid,
            contractorid,
            title,
            description,
            price,
            location
        ]
    );

    return result.rows[0];
};


const getProjectById = async (id) => {
    const result = await db.query(
        "SELECT * FROM projects WHERE id = $1",
        [id]
    );

    return result.rows[0];
};


module.exports = {
    createProject,
    getProjectById
};