const AuthenticationController = require("../AuthenticationController");
const { User, Role } = require("../../models");
const WrongPasswordError = require("../../errors");
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
        id: 1,
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
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = {};

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


});
