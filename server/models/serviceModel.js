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


module.exports = {
    createService,
    getAllServices,
    getServiceById
};