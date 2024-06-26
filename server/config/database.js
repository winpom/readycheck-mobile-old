const AWS = require('./aws-config'); // Assuming aws-config.js is in the same directory
const { DynamoDB } = AWS;

// Initialize DynamoDB Document Client
const dynamoDBClient = new DynamoDB.DocumentClient();

module.exports = dynamoDBClient;
