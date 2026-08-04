const Contractor = require("../models/contractorModel");
const { isValidId } = require("../utils/validateId");
const { normalizeNumeric, isNonNegativeOrNull } = require("../utils/numericField");


const createContractorProfile = async (req, res) => {

    try {

        const {
            user_id,
            business_name,
            phone,
            availability,
            description,
            skills,
            experience_years,
            hourly_rate
        } = req.body;

        const trimmedBusinessName = typeof business_name === "string" ? business_name.trim() : "";

        if (!user_id || !trimmedBusinessName) {
            return res.status(400).json({
                message: "user_id and business_name are required"
            });
        }

        if (Number(user_id) !== req.user.id) {
            return res.status(403).json({
                message: "You can only create a contractor profile for your own account"
            });
        }

        const normalizedExperience = normalizeNumeric(experience_years);
        const normalizedRate = normalizeNumeric(hourly_rate);

        if (!isNonNegativeOrNull(normalizedExperience) || !isNonNegativeOrNull(normalizedRate)) {
            return res.status(400).json({
                message: "experience_years and hourly_rate must be non-negative numbers"
            });
        }

        const profile = await Contractor.createProfile(
            user_id,
            trimmedBusinessName,
            phone,
            availability,
            description,
            skills,
            normalizedExperience,
            normalizedRate
        );


        res.status(201).json(profile);


    } catch (error) {

        console.log(error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This user already has a contractor profile"
            });
        }

        if (error.code === "23503") {
            return res.status(400).json({
                message: "user_id does not match an existing user"
            });
        }

        res.status(500).json({
            message: "Error creating contractor profile"
        });

    }

};


const getProfileByUserId = async (req, res) => {

    try {

        if (!isValidId(req.params.userId)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        const profile = await Contractor.getProfileByUserId(req.params.userId);

        if (!profile) {
            return res.status(404).json({
                message: "Contractor profile not found"
            });
        }

        res.json(profile);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching contractor profile"
        });

    }

};


const getAllContractors = async (req, res) => {

    try {

        const profiles = await Contractor.getAllProfiles();

        res.json(profiles);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching contractors"
        });

    }

};


const getContractorById = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid contractor id"
            });
        }

        const profile = await Contractor.getProfileById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                message: "Contractor profile not found"
            });
        }

        res.json(profile);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching contractor profile"
        });

    }

};


const updateContractorProfile = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid contractor id"
            });
        }

        const existing = await Contractor.getProfileById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Contractor profile not found"
            });
        }

        if (existing.user_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this contractor profile"
            });
        }

        const {
            business_name,
            phone,
            availability,
            description,
            skills,
            experience_years,
            hourly_rate
        } = req.body;

        const trimmedBusinessName = typeof business_name === "string" ? business_name.trim() : "";

        if (!trimmedBusinessName) {
            return res.status(400).json({
                message: "business_name is required"
            });
        }

        const normalizedExperience = normalizeNumeric(experience_years);
        const normalizedRate = normalizeNumeric(hourly_rate);

        if (!isNonNegativeOrNull(normalizedExperience) || !isNonNegativeOrNull(normalizedRate)) {
            return res.status(400).json({
                message: "experience_years and hourly_rate must be non-negative numbers"
            });
        }

        const profile = await Contractor.updateProfile(
            req.params.id,
            trimmedBusinessName,
            phone,
            availability,
            description,
            skills,
            normalizedExperience,
            normalizedRate
        );

        res.json(profile);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating contractor profile"
        });

    }

};


const deleteContractorProfile = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid contractor id"
            });
        }

        const existing = await Contractor.getProfileById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Contractor profile not found"
            });
        }

        if (existing.user_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this contractor profile"
            });
        }

        await Contractor.deleteProfile(req.params.id);

        res.json({ message: "Contractor profile deleted" });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error deleting contractor profile"
        });

    }

};


module.exports = {
    createContractorProfile,
    getProfileByUserId,
    getAllContractors,
    getContractorById,
    updateContractorProfile,
    deleteContractorProfile
};
