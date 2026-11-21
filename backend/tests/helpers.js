const jwt = require("jsonwebtoken");

const tokenFor = (user, options = { expiresIn: "1h" }) =>
    jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, options);

const bearer = (user) => `Bearer ${tokenFor(user)}`;

const CLIENT = { id: 1, role: "client" };
const CONTRACTOR = { id: 2, role: "contractor" };
const OTHER_CLIENT = { id: 3, role: "client" };

module.exports = { tokenFor, bearer, CLIENT, CONTRACTOR, OTHER_CLIENT };
