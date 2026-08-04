const Contractor = require("../models/contractorModel");


const isProjectParticipant = async (project, userId) => {
    if (project.client_id === userId) {
        return true;
    }

    const profile = await Contractor.getProfileById(project.contractor_id);
    return Boolean(profile && profile.user_id === userId);
};


module.exports = { isProjectParticipant };
