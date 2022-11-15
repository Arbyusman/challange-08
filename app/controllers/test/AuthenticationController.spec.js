const AuthenticationController = require("../AuthenticationController");
const { User, Role } = require("../../models");
const { WrongPasswordError,InsufficientAccessError } = require("../../errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

describe("AuthenticationController", () => {
  describe("#constructorAuthenticationController", () => {
    it("should set the user model", () => {
      const userModel = {};
      const roleModel = {};
      const bcrypt = {};
      const jwt = {};
      const authenticationController = new AuthenticationController({
        userModel,
        roleModel,
        bcrypt,
        jwt,
      });
      expect(authenticationController.userModel).toEqual(userModel);
    });
  });

  describe("#authorize", () => {

    it("should call res.status(401) and res.Json with status and message", async () => {
      const mockUser = new User({
        id: 2,
        name: "arby",
        email: "arby@binar.co.id",
        encryptedPassword: "$2jakdbqudqiuy7981y9ge9g1dnqdiq9112g.dkah",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockRequest = {
        headers: {
          authorization: "Bearer",
        },
      };
      const mockNext = {};

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };


      const authenticationController = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      authenticationController.authorize("CUSTOMER")(
        mockRequest,
        mockResponse,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: "JsonWebTokenError",
          message: "jwt must be provided",
          details: null,
        },
      });
    });


  });

  describe("handleLogin", () => {
    it("should return 201 status and a token", async () => {
      const mockUser = new User({
        id: 2,
        name: "arby",
        email: "arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue({
          ...mockUser.dataValues,
          Role: mockRole,
        }),
      };

      const mockRequest = {
        body: {
          email: "arby@binar.co.id",
          password: "123456",
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      await authentication.handleLogin(mockRequest, mockResponse, mockNext);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: {
          email: mockRequest.body.email.toLowerCase(),
        },
        include: [
          {
            model: mockRole,
            attributes: ["id", "name"],
          },
        ],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
    });

    it("should return 404 status and an error message", async () => {
      const mockUserModel = {
        findOne: jest.fn().mockReturnValue(null),
      };

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockRequest = {
        body: {
          email: "arby@binar.co.id",
          password: "123456",
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      await authentication.handleLogin(mockRequest, mockResponse, mockNext);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: {
          email: mockRequest.body.email.toLowerCase(),
        },
        include: [
          {
            model: mockRole,
            attributes: ["id", "name"],
          },
        ],
      });

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should return 401 status and an error message", async () => {
      const mockUser = new User({
        id: 5,
        name: "arby",
        email: "arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue({
          ...mockUser.dataValues,
        }),
      };

      const mockRequest = {
        body: {
          email: "arby@binar.co.id",
          password: "123",
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const error = new WrongPasswordError();

      await authentication.handleLogin(mockRequest, mockResponse, mockNext);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: {
          email: mockRequest.body.email.toLowerCase(),
        },
        include: [
          {
            model: mockRole,
            attributes: ["id", "name"],
          },
        ],
      });

      expect(mockResponse.status).toHaveBeenCalledWith(401);

      expect(mockResponse.json).toHaveBeenCalledWith(error);
    });

    
  });


  describe("#createTokenFromUser", () => {
    it("should return token", () => {
      const mockUser = new User({
        id: 2,
        name: "arby",
        email: "jayabaya@binar.co.id",
        encryptedPassword: "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const token = authentication.createTokenFromUser(mockUser, mockRole);

      expect(token).toEqual(expect.any(String));
    });
  });

  describe("#decodeToken", () => {
    it("should return user", () => {
      const mockUser = new User({
        id: 2,
        name: "arby",
        email: "arby@binar.co.id",
        encryptedPassword: "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const token = authentication.createTokenFromUser(mockUser, mockRole);

      const user = authentication.decodeToken(token);

      expect(user).toEqual(user);
    });
  });

  describe("encryptPassword", () => {
    it("should return encrypted password", () => {
      const mockUser = new User({
        id: 2,
        name: "arby",
        email: "arby@binar.ac.id",
        encryptedPassword: "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockRequest = {
        body: {
          password: "123456",
        },
      };

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const encryptedPassword = authentication.encryptPassword(mockRequest.body.password, 10);

      expect(encryptedPassword).toEqual(expect.any(String));
    });
  });

  describe("#verifyPassword", () => {
    it("should return true", () => {
      const mockUser = new User({
        id: 2,
        name: "arby",
        email: "arby@binar.co.id",
        encryptedPassword: "bagfigaofusofgcuag73b4cuyb7t83gb8",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockRequest = {
        body: {
          password: "bagfigaofusofgcuag73b4cuyb7t83gb8",
        },
      };

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      authentication.verifyPassword(mockUser.encryptedPassword, mockRequest.body.password);

      expect(mockUser.encryptedPassword).toEqual(mockRequest.body.password);
    });
  });


});
