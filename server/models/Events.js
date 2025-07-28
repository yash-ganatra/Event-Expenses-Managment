
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    team: { type: String, required: true },
    budget: { type: Number, required: true },
});

module.exports = mongoose.model('Event', eventSchema);