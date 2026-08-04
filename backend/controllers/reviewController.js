const Review = require("../models/reviewModel");
const Project = require("../models/projectModel");
const { isValidId } = require("../utils/validateId");


const createReview = async (req, res) => {

    try {

        const { project_id, rating, comment } = req.body;

        if (!project_id || !isValidId(project_id)) {
            return res.status(400).json({
                message: "A valid project_id is required"
            });
        }

        const ratingNumber = Number(rating);

        if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({
                message: "rating must be an integer between 1 and 5"
            });
        }

        const project = await Project.getProjectById(project_id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.client_id !== req.user.id) {
            return res.status(403).json({
                message: "You can only review your own projects"
            });
        }

        if (project.status !== "completed") {
            return res.status(400).json({
                message: "You can only review a completed project"
            });
        }

        const existingReview = await Review.getReviewByProjectId(project_id);

        if (existingReview) {
            return res.status(409).json({
                message: "This project already has a review"
            });
        }

        const review = await Review.createReview(
            project_id,
            project.client_id,
            project.contractor_id,
            ratingNumber,
            comment
        );

        res.status(201).json(review);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error creating review"
        });

    }

};


const getReviewsByContractor = async (req, res) => {

    try {

        if (!isValidId(req.params.contractorId)) {
            return res.status(400).json({
                message: "Invalid contractor id"
            });
        }

        const reviews = await Review.getReviewsByContractor(req.params.contractorId);

        res.json(reviews);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching reviews"
        });

    }

};


module.exports = {
    createReview,
    getReviewsByContractor
};
