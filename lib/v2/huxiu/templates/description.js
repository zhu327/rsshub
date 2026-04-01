const { art } = require('@/utils/render');
const path = require('path');

const renderDescription = (data) => art(path.join(__dirname, 'description.art'), data);

module.exports = { renderDescription };
