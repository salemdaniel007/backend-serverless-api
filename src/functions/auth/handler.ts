import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";

import { authService } from "src/service";

import { v4 } from "uuid";
import { middyfy } from "@libs/lambda";

export const signup = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = v4();
    try {
      if (!event.body) {
        return formatJSONResponse({
          status: 400,
          error: "request body is missing",
        });
      }
      let requestBody;
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        return formatJSONResponse({
          status: 400,
          error: requestBody,
        });
      }
      
      const user = await authService.signup(
        {
          userId,
          name: requestBody.name,
          phone: requestBody.phone,
          email: requestBody.email,
          address: requestBody.address,
          password: requestBody.password,
        },
        "secret"
      );
      return formatJSONResponse({
        status: 200,
        data: {
          token: user.token,
          userDetails: user,
        },
      });
    } catch (e) {
      return formatJSONResponse({
        status: 500,
        message: e,
      });
    }
  }
);

export const signin = middyfy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { email, password } = JSON.parse(event.body);
      console.log(email, password)
      const login = await authService.signin(
        email,
        password,
        "secret"
      );

      return formatJSONResponse({
        status: 200,
        data: login,
      });
    } catch (e) {
      return formatJSONResponse({
        status: 500,
        message: e,
      });
    }
  }
);
