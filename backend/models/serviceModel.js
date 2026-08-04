const db = require("../db");


const createService = async (
    contractor_id,
    title,
    category,
    description,
    price,
    location
) => {

    const result = await db.query(
        `INSERT INTO services
        (
        contractor_id,
        title,
        category,
        description,
        price,
        location
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
            contractor_id,
            title,
            category,
            description,
            price,
            location
        ]
    );

    return result.rows[0];
};


const getAllServices = async () => {
    const result = await db.query(
        "SELECT * FROM services ORDER BY created_at DESC"
    );

    return result.rows;
};


const getServiceById = async (id) => {
    const result = await db.query(
        "SELECT * FROM services WHERE id = $1",
        [id]
    );

    return result.rows[0];
};


const getServicesByContractor = async (contractorId) => {
    const result = await db.query(
        "SELECT * FROM services WHERE contractor_id = $1 ORDER BY created_at DESC",
        [contractorId]
    );

    return result.rows;
};


const searchServicesByKeyword = async (keyword) => {
    const result = await db.query(
        `SELECT * FROM services
        WHERE category ILIKE $1 OR title ILIKE $1 OR description ILIKE $1
        ORDER BY created_at DESC
        LIMIT 5`,
        [`%${keyword}%`]
    );

    return result.rows;
};


const updateService = async (id, title, category, description, price, location) => {
    const result = await db.query(
        `UPDATE services
        SET title = $1,
            category = $2,
            description = $3,
            price = $4,
            location = $5
        WHERE id = $6
        RETURNING *`,
        [title, category, description, price, location, id]
    );

    return result.rows[0];
};


const deleteService = async (id) => {
    const result = await db.query(
        "DELETE FROM services WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};


module.exports = {
    createService,
    getAllServices,
    getServiceById,
    getServicesByContractor,
    searchServicesByKeyword,
    updateService,
    deleteService
};