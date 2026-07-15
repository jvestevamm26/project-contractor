const Contractor = require("../models/contractorModel");


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

        if (!user_id || !business_name) {
            return res.status(400).json({
                message: "user_id and business_name are required"
            });
        }

        const profile = await Contractor.createProfile(
            user_id,
            business_name,
            phone,
            availability,
            description,
            skills,
            experience_years,
            hourly_rate
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


module.exports = {
    createContractorProfile,
    getProfileByUserId
};