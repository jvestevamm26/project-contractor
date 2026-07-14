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


module.exports = {
    createService,
    getAllServices,
    getServiceById
};