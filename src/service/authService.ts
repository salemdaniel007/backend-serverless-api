import { DocumentClient } from "aws-sdk/clients/dynamodb";
import User from "src/model/user";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";

export default class AuthService {
  private TableName: string = "UsersTable";
  constructor(private docClient: DocumentClient) {}

  private signToken(id: string, secret: string): string {
    const token = jwt.sign(
      {
        userId: id,
      },
      secret,
      {
        expiresIn: "15m",
      }
    );

    return token;
  }

  private async getUserByEmail(email: string): Promise<User> {
    const user = await this.docClient
      .get({
        TableName: this.TableName,
        Key: {
          email: email,
        },
      })
      .promise();
      if (!user.Item) {
        throw new Error("email does not exit");
    }

    return user.Item as User;
  }

  private async hashPassword(password: string): Promise<{ hashedPassword: string; salt: string }> {
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return { hashedPassword, salt };
  }

  private async verifyPassword(
    password: string,
    hashedPasswordWithSalt: string
  ): Promise<boolean> {
    const [hashedPassword, salt] = hashedPasswordWithSalt.split(".");
    const hashedInputPassword = crypto
      .pbkdf2Sync(password, Buffer.from(salt, "hex"), 1000, 64, "sha512")
      .toString("hex");
    return hashedInputPassword === hashedPassword;
  }

  async signup(user: User, secret: string): Promise<{ token: string; userDetails: User }> {
    const { hashedPassword, salt } = await this.hashPassword(user.password);
  
    const newUser = {
      ...user,
      password: `${hashedPassword}.${salt}`, // Store hashed password and salt together
    };
    await this.docClient
      .put({
        TableName: this.TableName,
        Item: newUser,
      })
      .promise();
  
    const token = this.signToken(newUser.userId, secret);
  
    return { token, userDetails: newUser };
  }

  async signin(
    email: string,
    password: string,
    secret: string
  ): Promise<string> {
    console.log(typeof email)
    console.log(!email || !password)
    // Check if login credentials were supplied
    if (!email || !password) {
      throw new Error("Please provide login credentials");
    }

    const user = await this.getUserByEmail(email);
    console.log(user)
    // Check if login credentials are correct
    if (!user || !(await this.verifyPassword(password, user.password))) {
      throw new Error("Incorrect email or password");
    }

    return this.signToken(user.userId, secret);
  }
}
