import AuthService from "../service/authService";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as crypto from "crypto";

// Mock the DynamoDB DocumentClient
const mockDocumentClient: Partial<DocumentClient> = {
  get: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Item: {
        userId: "testuserid",
        email: "test@example.com",
        password: "hashedpassword.salt", // Use the actual hashed password here
      },
    }),
  }),
  put: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  }),
};

jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from("mockedSalt")),
  pbkdf2Sync: jest.fn().mockReturnValue(Buffer.from("mockedHashedPassword")),
}));

// Mock the jwt sign function
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mockedtoken"),
}));

describe("Authentication Service", () => {
  const authService = new AuthService(mockDocumentClient as DocumentClient);
  const secret = "testsecret";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should signup a new user", async () => {
    const user = {
      userId: "testuserid",
      email: "test@example.com",
      password: "testpassword",
      name: "testname",
      phone: 12345,
      address: "testaddress",
    };

    const result = await authService.signup(user, secret);

    expect(mockDocumentClient.put).toBeCalledTimes(1);
    expect(mockDocumentClient.put).toBeCalledWith({
      TableName: "UsersTable",
      Item: {
        ...user,
        password: "hashedpassword", // Use the actual hashed password here
      },
    });
    expect(result.token).toBe("mockedtoken");
    expect(result.userDetails).toEqual(user);
  });

  it("should signin an existing user", async () => {
    const email = "test@example.com";
    const password = "testpassword";

    // Hash the password using the crypto module
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const result = await authService.signin(email, hashedPassword, secret);

    expect(mockDocumentClient.get).toBeCalledTimes(1);
    expect(mockDocumentClient.get).toBeCalledWith({
      TableName: "UsersTable",
      Key: { email },
    });
    expect(result).toBe("mockedtoken");
  });

  it("should throw an error for incorrect login credentials", async () => {
    const email = "test@example.com";
    const password = "wrongpassword";

    // Hash the password using the crypto module
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    await expect(
      authService.signin(email, hashedPassword, secret)
    ).rejects.toThrow("Incorrect email or password");

    expect(mockDocumentClient.get).toBeCalledTimes(1);
    expect(mockDocumentClient.get).toBeCalledWith({
      TableName: "UsersTable",
      Key: { email },
    });
  });

  it("should throw an error when login credentials are not provided", async () => {
    const email = "";
    const password = "";

    await expect(
      authService.signin(email, password, secret)
    ).rejects.toThrow("Please provide login credentials");

    expect(mockDocumentClient.get).not.toBeCalled();
  });
});
