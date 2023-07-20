import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const dynamoDBClient = (): DocumentClient => {
  if (process.env.LOCALSTACK_HOSTNAME) {
    return new AWS.DynamoDB.DocumentClient({
        endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`,
      });
  }

  return new AWS.DynamoDB.DocumentClient();
};

export default dynamoDBClient