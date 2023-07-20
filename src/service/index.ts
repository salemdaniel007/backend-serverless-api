import dynamoDBClient from "src/model";
import AuthService from "./authService";


const authService = new AuthService(dynamoDBClient())

export { authService }