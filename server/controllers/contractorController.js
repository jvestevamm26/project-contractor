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

        res.status(500).json({
            message: "Error creating contractor profile"
        });

    }

};


module.exports = {
    createContractorProfile
};