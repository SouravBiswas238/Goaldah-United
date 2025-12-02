const User = require('./User');
const Contribution = require('./Contribution');
const Expense = require('./Expense');
const Event = require('./Event');

const initDB = async () => {
    await User.createTable();
    await Contribution.createTable();
    await Expense.createTable();
    await Event.createTable();
};

module.exports = { initDB };
