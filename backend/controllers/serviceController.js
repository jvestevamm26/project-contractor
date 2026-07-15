const Service = require("../models/serviceModel");


const createService = async (req, res) => {

    try {

        const {
            contractor_id,
            title,
            category,
            description,
            price,
            location
        } = req.body;

        if (!contractor_id || !title || !category) {
            return res.status(400).json({
                message: "contractor_id, title, and category are required"
            });
        }

        const service = await Service.createService(
            contractor_id,
            title,
            category,
            description,
            price,
            location
        );


        res.status(201).json(service);


    } catch(error) {

        console.log(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "contractor_id does not match an existing contractor profile"
            });
        }

        res.status(500).json({
            message: "Error creating service"
        });

    }

};


const getAllServices = async (req, res) => {

    try {

        const services = await Service.getAllServices();

        res.json(services);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching services"
        });

    }

};


const getServiceById = async (req, res) => {

    try {

        const service = await Service.getServiceById(req.params.id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json(service);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching service"
        });

    }

};


const getServicesByContractor = async (req, res) => {

    try {

        const services = await Service.getServicesByContractor(req.params.contractorId);

        res.json(services);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching contractor's services"
        });

    }

};


module.exports = {
    createService,
    getAllServices,
    getServiceById,
    getServicesByContractor
};