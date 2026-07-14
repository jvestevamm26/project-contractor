const Project = require("../models/projectModel");


const createProject = async (req, res) => {

    try {

           const {
    client_id,
    contractor_id,
    title,
    description,
    price,
    location
} = req.body;


          const project = await Project.createProject(
    client_id,
    contractor_id,
    title,
    description,
    price,
    location
);

        res.status(201).json(project);


    } catch(error) {

        console.log(error);

        res.status(500).json({
            message: "Error creating project"
        });

    }

};


const getProjectById = async (req, res) => {

    try {

        const project = await Project.getProjectById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(project);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching project"
        });

    }

};


module.exports = {
    createProject,
    getProjectById
};