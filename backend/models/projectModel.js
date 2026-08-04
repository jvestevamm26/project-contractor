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


const getProjectsByClient = async (clientId) => {
    const result = await db.query(
        "SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC",
        [clientId]
    );

    return result.rows;
};


const getProjectsByContractor = async (contractorId) => {
    const result = await db.query(
        "SELECT * FROM projects WHERE contractor_id = $1 ORDER BY created_at DESC",
        [contractorId]
    );

    return result.rows;
};


const updateProjectStatus = async (id, status) => {
    const result = await db.query(
        "UPDATE projects SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
    );

    return result.rows[0];
};


const getAllProjects = async () => {
    const result = await db.query(
        "SELECT * FROM projects ORDER BY created_at DESC"
    );

    return result.rows;
};


const updateProject = async (id, title, description, price, location) => {
    const result = await db.query(
        `UPDATE projects
        SET title = $1,
            description = $2,
            price = $3,
            location = $4
        WHERE id = $5
        RETURNING *`,
        [title, description, price, location, id]
    );

    return result.rows[0];
};


const deleteProject = async (id) => {
    const result = await db.query(
        "DELETE FROM projects WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};


module.exports = {
    createProject,
    getProjectById,
    getProjectsByClient,
    getProjectsByContractor,
    updateProjectStatus,
    getAllProjects,
    updateProject,
    deleteProject
};