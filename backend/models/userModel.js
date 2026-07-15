const db = require("../db");

const createUser = async (name, email, password, role, location) => {
    const result = await db.query(
        `INSERT INTO users 
        (name, email, password, role, location)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, location`,
        [name, email, password, role, location]
    );

    return result.rows[0];
};


const findUserByEmail = async (email) => {
    const result = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
};


module.exports = {
    createUser,
    findUserByEmail
};