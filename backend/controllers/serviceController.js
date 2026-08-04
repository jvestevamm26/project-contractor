const Service = require("../models/serviceModel");
const Contractor = require("../models/contractorModel");
const { isValidId } = require("../utils/validateId");
const { normalizeNumeric, isNonNegativeOrNull } = require("../utils/numericField");


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

        const trimmedTitle = typeof title === "string" ? title.trim() : "";
        const trimmedCategory = typeof category === "string" ? category.trim() : "";

        if (!contractor_id || !isValidId(contractor_id) || !trimmedTitle || !trimmedCategory) {
            return res.status(400).json({
                message: "A valid contractor_id, title, and category are required"
            });
        }

        const normalizedPrice = normalizeNumeric(price);

        if (!isNonNegativeOrNull(normalizedPrice)) {
            return res.status(400).json({
                message: "price must be a non-negative number"
            });
        }

        const profile = await Contractor.getProfileById(contractor_id);

        if (!profile || profile.user_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this contractor profile"
            });
        }

        const service = await Service.createService(
            contractor_id,
            trimmedTitle,
            trimmedCategory,
            description,
            normalizedPrice,
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

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid service id"
            });
        }

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

        if (!isValidId(req.params.contractorId)) {
            return res.status(400).json({
                message: "Invalid contractor id"
            });
        }

        const services = await Service.getServicesByContractor(req.params.contractorId);

        res.json(services);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching contractor's services"
        });

    }

};


const updateService = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid service id"
            });
        }

        const existing = await Service.getServiceById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        const profile = await Contractor.getProfileById(existing.contractor_id);

        if (!profile || profile.user_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this service"
            });
        }

        const { title, category, description, price, location } = req.body;

        const trimmedTitle = typeof title === "string" ? title.trim() : "";
        const trimmedCategory = typeof category === "string" ? category.trim() : "";

        if (!trimmedTitle || !trimmedCategory) {
            return res.status(400).json({
                message: "title and category are required"
            });
        }

        const normalizedPrice = normalizeNumeric(price);

        if (!isNonNegativeOrNull(normalizedPrice)) {
            return res.status(400).json({
                message: "price must be a non-negative number"
            });
        }

        const service = await Service.updateService(
            req.params.id,
            trimmedTitle,
            trimmedCategory,
            description,
            normalizedPrice,
            location
        );

        res.json(service);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating service"
        });

    }

};


const deleteService = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid service id"
            });
        }

        const existing = await Service.getServiceById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        const profile = await Contractor.getProfileById(existing.contractor_id);

        if (!profile || profile.user_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this service"
            });
        }

        await Service.deleteService(req.params.id);

        res.json({ message: "Service deleted" });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error deleting service"
        });

    }

};


module.exports = {
    createService,
    getAllServices,
    getServiceById,
    getServicesByContractor,
    updateService,
    deleteService
};
