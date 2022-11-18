const AuthenticationController = require("../AuthenticationController");
const { User, Role } = require("../../models");
const {
  WrongPasswordError,
  RecordNotFoundError,
  InsufficientAccessError,
  EmailNotRegisteredError,
} = require("../../errors");
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
    it("should run next function .", async () => {
      const mockUser = {
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      };
      const mockRole = { id: 1, name: "COSTUMER" };

      const roleModel = jest.fn().mockReturnValue(null);
      const userModel = jest.fn().mockReturnValue(null);

      const controller = new AuthenticationController({
        roleModel,
        userModel,
        bcrypt,
        jwt,
      });
      const mockToken = controller.createTokenFromUser(mockUser, mockRole);
      const mockReq = {
        headers: {
          authorization: "Bearer " + mockToken,
        },
      };
      const mockNext = jest.fn();

      const authorizeCustomer = controller.authorize("COSTUMER");
      await authorizeCustomer(mockReq, {}, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should res.status(401) with InsufficientAccessError ", async () => {
      const mockUser = {
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      };
      const mockRole = { id: 1, name: "COSTUMER" };

      const roleModel = jest.fn().mockReturnValue(null);
      const userModel = jest.fn().mockReturnValue(null);

      const controller = new AuthenticationController({
        roleModel,
        userModel,
        bcrypt,
        jwt,
      });
      const mockToken = controller.createTokenFromUser(mockUser, mockRole);
      const mockReq = {
        headers: {
          authorization: "Bearer " + mockToken,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const authorizeCustomer = controller.authorize("ADMIN");
      await authorizeCustomer(mockReq, mockRes, mockNext);

      const err = new InsufficientAccessError("COSTUMER");

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });
    });
    it("should res.status(401) with error token wrong.", async () => {
      const mockUser = {
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      };
      const mockRole = { id: 1, name: "COSTUMER" };
      const roleModel = jest.fn().mockReturnValue(null);
      const userModel = jest.fn().mockReturnValue(null);
      const controller = new AuthenticationController({
        roleModel,
        userModel,
        bcrypt,
        jwt,
      });
      const mockToken = controller.createTokenFromUser(mockUser, mockRole);
      const mockReq = {
        headers: {
          authorization: "Bearer " + mockToken + "alsdnalnjd",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const authorizeCustomer = controller.authorize("ADMIN");
      await authorizeCustomer(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("handleLogin", () => {
    it("should return json staus 201 and token", async () => {
      const mockUser = new User({
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
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
          email: "Arby@binar.co.id",
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

    // it("should res.status(404) and return error if email not registered.", async () => {
    //   const mockUser = {
    //     id: 2,
    //     name: "Arby",
    //     email: "Arby@binar.co.id",
    //     password:"123456",       
    //     image: "gambar",
    //     roleId: 1,
    //   };

    //   const mockRole = new Role({ id: 1, name: "CUSTOMER" });
    //   const mockRoleModel = {
    //     findOne: jest.fn().mockReturnValue(mockRole),
    //   };

    //   const mockReq = {
    //     body: {
    //       email: mockUser.email,
    //       password: mockUser.password,
    //     },
    //   };
    //   const mockRes = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn().mockReturnThis(),
    //   };
    //   const mockNext = jest.fn();

    //   const mockUserModel = {
    //     findOne: jest.fn().mockReturnValue(null),
    //   };

    //   const controller = new AuthenticationController({
    //     userModel: mockUserModel,
    //     roleModel: mockRoleModel,
    //     bcrypt,
    //     jwt,
    //   });

    //   await controller.handleLogin(mockReq, mockRes, mockNext);

    //   const expectedErr = new EmailNotRegisteredError(mockUser.email);

    //   expect(mockUserModel.findOne).toHaveBeenCalled();
    //   expect(mockRes.status).toHaveBeenCalledWith(404);
    //   expect(mockRes.json).toHaveBeenCalledWith(expectedErr);
    // });

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

      const err = new EmailNotRegisteredError(mockRequest.body.email)

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
      expect(mockResponse.json).toHaveBeenCalledWith(err);
    });

    it("should return 401 status and an error message", async () => {
      const mockUser = new User({
        id: 5,
        name: "Arby",
        email: "Arby@binar.co.id",
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
          email: "Arby@binar.co.id",
          password: "123",
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = {};

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

  describe("#handleRegister", () => {
    it("should return status 201  and token", async () => {
      const mockUser = new User({
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue(mockUser),
      };

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue(mockRole.name),
      };

      const mockRequest = {
        body: {
          name: "Arby",
          email: "Arby@binar.co.id",
          password: "123456",
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = {};

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });

      await authentication.handleRegister(mockRequest, mockResponse, mockNext);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: mockRequest.body.email.toLowerCase() },
      });
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({
        where: { name: mockRole.name },
      });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
    });

    // it("should return status 422 status and json error message", async () => {

    //   const mockRole = {
    //     id: 1,
    //     name: "COSTUMER",
    //   };
    //   const mockRoleModel = {
    //     findOne: jest.fn().mockReturnValue(mockRole),
    //   };
    //   const mockReq = {
    //     body: {
    //       name: "Arby",
    //       email: "Arby@binar.co.id",
    //       password: "123456",
    //     },
    //   };
    //   const mockRes = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn().mockReturnThis(),
    //   };
    //   const mockNext = jest.fn();

    //   const mockUserModel = {
    //     findOne: jest.fn().mockReturnValue(true),
    //   };
    //   const controller = new AuthenticationController({
    //     userModel: mockUserModel,
    //     roleModel: mockRoleModel,
    //     bcrypt,
    //     jwt,
    //   });

    //   await controller.handleRegister(
    //       mockReq, mockRes, mockNext,
    //   );

    //   expect(mockUserModel.findOne).toHaveBeenCalled();
    //   expect(mockRes.status).toHaveBeenCalledWith(422);

    // });
  });

  describe("handleGetUser", () => {
    it("should return 200 status and user", async () => {
      const mockUser = new User({
        id: 5,
        name: "Arby",
        email: "Arby@binar.ac.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
        roleId: 1,
      });

      const mockUserModel = {
        ...mockUser.dataValues,
        findByPk: jest.fn().mockReturnValue(mockUser),
      };

      const mockRole = new Role({ id: 1, name: "CUSTOMER" });

      const mockRoleModel = {
        ...mockRole.dataValues,
        findByPk: jest.fn().mockReturnValue(mockRole),
      };

      const mockRequest = {
        user: {
          id: 5,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });

      await authentication.handleGetUser(mockRequest, mockResponse, mockNext);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(mockRequest.user.id);
      expect(mockRoleModel.findByPk).toHaveBeenCalledWith(mockUserModel.roleId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it(
      "should res.status(404) with RecordNotFoundError " + "if user not found.",
      async () => {
        const mockUser = {
          id: 2,
          name: "Arby",
          email: "Arby@binar.co.id",
          encryptedPassword: "$2jakdbqudqiuy7981y9ge9g1dnqdiq9112g.dkah",
          roleId: 1,
        };
        const mockReq = {
          user: mockUser,
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };

        const mockUserModel = {
          findByPk: jest.fn().mockReturnValue(false),
        };
        const mockRoleModel = {
          findByPk: jest.fn().mockReturnValue(false),
        };

        const controller = new AuthenticationController({
          userModel: mockUserModel,
          roleModel: mockRoleModel,
          bcrypt,
          jwt,
        });

        await controller.handleGetUser(mockReq, mockRes);
        const err = new RecordNotFoundError(mockUser.name);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(err);
      }
    );
  });

  describe("#createTokenFromUser", () => {
    it("should return token", () => {
      const mockUser = new User({
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
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
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
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
        name: "Arby",
        email: "Arby@binar.co.id",
        encryptedPassword:
          "$2a$10$a/Nv0ULUmsfDUDbgf7991uENTqBMEA0LbcUcQ3U4xElPZumsV.Kmy",
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

      const encryptedPassword = authentication.encryptPassword(
        mockRequest.body.password,
        10
      );

      expect(encryptedPassword).toEqual(expect.any(String));
    });
  });

  describe("#verifyPassword", () => {
    it("should return true", () => {
      const mockUser = new User({
        id: 2,
        name: "Arby",
        email: "Arby@binar.co.id",
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

      authentication.verifyPassword(
        mockUser.encryptedPassword,
        mockRequest.body.password
      );

      expect(mockUser.encryptedPassword).toEqual(mockRequest.body.password);
    });
  });
});
