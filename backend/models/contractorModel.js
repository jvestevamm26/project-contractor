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


const getAllProfiles = async () => {
    const result = await db.query(
        "SELECT * FROM contractor_profiles ORDER BY created_at DESC"
    );

    return result.rows;
};


const getProfileById = async (id) => {
    const result = await db.query(
        "SELECT * FROM contractor_profiles WHERE id = $1",
        [id]
    );

    return result.rows[0];
};


const updateProfile = async (
    id,
    business_name,
    phone,
    availability,
    description,
    skills,
    experience_years,
    hourly_rate
) => {

    const result = await db.query(
        `UPDATE contractor_profiles
        SET business_name = $1,
            phone = $2,
            availability = $3,
            description = $4,
            skills = $5,
            experience_years = $6,
            hourly_rate = $7
        WHERE id = $8
        RETURNING *`,
        [
            business_name,
            phone,
            availability,
            description,
            skills,
            experience_years,
            hourly_rate,
            id
        ]
    );

    return result.rows[0];
};


const deleteProfile = async (id) => {
    const result = await db.query(
        "DELETE FROM contractor_profiles WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};


module.exports = {
    createProfile,
    getProfileByUserId,
    getAllProfiles,
    getProfileById,
    updateProfile,
    deleteProfile
};