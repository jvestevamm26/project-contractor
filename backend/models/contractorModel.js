const db = require("../db");


const createProfile = async (
    user_id,
    business_name,
    phone,
    availability,
    description,
    skills,
    experience_years,
    hourly_rate
) => {

    const result = await db.query(
        `INSERT INTO contractor_profiles
        (
        user_id,
        business_name,
        phone,
        availability,
        description,
        skills,
        experience_years,
        hourly_rate
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
        [
            user_id,
            business_name,
            phone,
            availability,
            description,
            skills,
            experience_years,
            hourly_rate
        ]
    );

    return result.rows[0];
};


const getProfileByUserId = async (userId) => {
    const result = await db.query(
        "SELECT * FROM contractor_profiles WHERE user_id = $1",
        [userId]
    );

    return result.rows[0];
};


module.exports = {
    createProfile,
    getProfileByUserId
};