const CarController = require("../CarController");
const { Car, UserCar } = require("../../models");
const { CarAlreadyRentedError } = require("../../errors");
const { Op } = require("sequelize");

describe("CarController", () => {
  describe("#constructorCarController", () => {
    it("should set the car model", () => {
      const carModel = {};
      const userCarModel = {};
      const dayjs = {};
      const controller = new CarController({ carModel, userCarModel, dayjs });

      expect(controller.carModel).toBe(carModel);
    });
  });

  describe("#handleListCars", () => {
    it("should return list cars", async () => {
      const car = new Car([
        {
          name: "Bajaj",
          price: "10000",
          size: "SMALL",
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
          isCurrentlyRented: false,
          createdAt: "2022-11-1 09:44:35",
          updatedAt: "2022-11-1 11:00:00",
        },

        {
          name: "bus",
          price: "10000",
          size: "LARGE",
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
          isCurrentlyRented: false,
          createdAt: "2022-11-1 09:44:35",
          updatedAt: "2022-11-1 11:00:00",
        },

        {
          name: "Lambo",
          price: "10000000",
          size: "SMALL",
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
          isCurrentlyRented: false,
          createdAt: "2022-11-1 09:44:35",
          updatedAt: "2022-11-1 11:00:00",
        },
      ]);

      const cars = [];

      cars.push(car);

      const mockCarModel = {
        findAll: jest.fn().mockReturnValue(cars),
        count: jest.fn().mockReturnValue(5),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
      });

      const mockRequest = {
        query: {},
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleListCars(mockRequest, mockResponse);

      expect(mockCarModel.findAll).toHaveBeenCalled();
      expect(mockCarModel.count).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cars,
        meta: {
          pagination: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            count: 5,
          },
        },
      });
    });
  });

  describe("#handleGetCar", () => {
    // return a car
    it("should call res.status(200) and res.Json with status and message", async () => {
      const mockCar = new Car({
        name: "Lambo",
        price: "10000000",
        size: "SMALL",
        image:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
        isCurrentlyRented: false,
        createdAt: "2022-11-1 09:44:35",
        updatedAt: "2022-11-1 11:00:00",
      });

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: "2022-11-4 11:00:00",
        rentEndedAt: "2022-11-5 11:00:00",
        createdAt: "2022-11-1 11:00:00",
        updatedAt: "2022-11-2 11:00:00",
      });

      const mockRequest = {
        params: {
          id: 1,
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
      });

      await carController.handleGetCar(mockRequest, mockResponse);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("#handleCreateCar", () => {
    it("should call res.status(201) and response json", async () => {
      const mockCar = new Car({
        name: "Lambo",
        price: "10000000",
        size: "SMALL",
        image:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
        isCurrentlyRented: false,
        createdAt: "2022-11-1 09:44:35",
        updatedAt: "2022-11-1 11:00:00",
      });

      const mockCarModel = {
        create: jest.fn().mockReturnValue(mockCar),
      };

      const mockRequest = {
        body: {
          name: "Lambo",
          price: "10000000",
          size: "SMALL",
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
          isCurrentlyRented: false,
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({
        carModel: mockCarModel,
      });

      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockCarModel.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
    });

    it("should call res.status(422) and res.Json with status and message", async () => {
      const mockCarModel = {
        create: jest.fn().mockImplementation(() => {
          throw new Error("error");
        }),
      };

      const mockRequest = {
        body: {
          name: "Lambo",
          price: "10000000",
          size: "SMALL",
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
          isCurrentlyRented: false,
        },
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({
        carModel: mockCarModel,
      });

      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: expect.any(String),
        },
      });
    });
  });

  describe("handleRentCar", () => {
    it("should rent a car", async () => {
      const mockCar = new Car({
        name: "Lambo",
        price: "10000000",
        size: "SMALL",
        image:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
        isCurrentlyRented: false,
        createdAt: "2022-11-1 09:44:35",
        updatedAt: "2022-11-1 11:00:00",
      });

      const mockUserCar = new UserCar({
        userId: 5,
        carId: 1,
        rentStartedAt: "2022-11-1 09:44:35",
        rentEndedAt: "2022-11-2 09:44:35"
      });

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCarModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({
          userId: mockUserCar.userId,
          carId: mockUserCar.carId,
          rentStartedAt: mockUserCar.rentStartedAt,
          rentEndedAt: mockUserCar.rentEndedAt,
        }),
      };

      const mockRequest = {
        body: {
          rentStartedAt: "2022-11-1 09:44:35",
          rentEndedAt: "2022-11-2 09:44:35"
        },
        params: {
          id: 1,
        },
        user: {
          id: 5,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
      });

      await carController.handleRentCar(mockRequest, mockResponse, mockNext);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
        where: {
          carId: mockCar.id,
          rentStartedAt: {
            [Op.gte]: mockRequest.body.rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: mockRequest.body.rentEndedAt,
          },
        },
      });
      expect(mockUserCarModel.create).toHaveBeenCalledWith({
        userId: mockRequest.user.id,
        carId: mockCar.id,
        rentStartedAt: mockRequest.body.rentStartedAt,
        rentEndedAt: mockRequest.body.rentEndedAt,
      });
    });

    // it("should return error status 422", async () => {
    //   const mockCar = new Car({
    //     carId: 1,
    //     name: "Lambo",
    //     price: "10000000",
    //     size: "SMALL",
    //     image:
    //       "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
    //     isCurrentlyRented: false,
    //     createdAt: "2022-11-1 09:44:35",
    //     updatedAt: "2022-11-1 11:00:00",
    //   });

    //   const mockUserCar = new UserCar({
    //     userId: 5,
    //     carId: 1,
    //     rentStartedAt: "2022-11-1 09:44:35",
    //     rentEndedAt:  "2022-11-2 09:44:35",
    //   });

    //   const mockCarModel = {
    //     findByPk: jest.fn().mockReturnValue(mockCar),
    //   };

    //   const mockUserCarModel = {
    //     findOne: jest.fn().mockReturnValue(mockUserCar),
    //   };

    //   const mockRequest = {
    //     body: {
    //       rentStartedAt: "2022-11-1 09:44:35",
    //       rentEndedAt:  "2022-11-2 09:44:35",
    //     },
    //     params: {
    //       id: 1,
    //     },
    //     user: {
    //       id: 5,
    //     },
    //   };

    //   const mockResponse = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn().mockReturnThis(),
    //   };

    //   const mockNext = jest.fn();

    //   const carController = new CarController({
    //     carModel: mockCarModel,
    //     userCarModel: mockUserCarModel,
    //   });

    //   const error = new CarAlreadyRentedError(mockCar);

    //   await carController.handleRentCar(mockRequest, mockResponse, mockNext);

    //   expect(mockResponse.status).toHaveBeenCalledWith(422);
    //   expect(mockResponse.json).toHaveBeenCalledWith(error);
    // });
  });

  describe("handleUpdateCar", () => {
    // it("should update a car and status 200", async () => {
    //   const mockCar = new Car({
    //     id: 1,
    //     name: "Lambo",
    //     price: "10000000",
    //     size: "SMALL",
    //     image:
    //       "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
    //     isCurrentlyRented: false,
    //     createdAt: "2022-11-1 09:44:35",
    //     updatedAt: "2022-11-2 11:00:00",
    //   });

    //   const mockCarModel = {
    //     update: jest.fn().mockReturnValue(mockCar),
    //   };

    //   mockUserCar = new UserCar({
    //     userId: 5,
    //     carId: 1,
    //     rentStartedAt: "2022-11-1 09:44:35",
    //     rentEndedAt: "2022-11-1 09:44:35",
    //   });

    //   const mockUserCarModel = {
    //     findOne: jest.fn().mockReturnValue(mockUserCar),
    //   };

    //   const mockRequest = {
    //     params: {
    //       id: 1,
    //     },
    //     body: {
    //       name: "Bajai",
    //       price: "100000",
    //       size: "SMALL",
    //       image:
    //         "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
    //       isCurrentlyRented: false,
    //     },
    //   };
    //   const mockResponse = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn().mockReturnThis(),
    //   };

    //   const carController = new CarController({
    //     carModel: mockCarModel,
    //   });

    //   await carController.handleUpdateCar(mockRequest, mockResponse);

    //   expect(mockCarModel.update).toEqual(mockRequest);
    //   expect(mockResponse.status).toHaveBeenCalledWith(200);
    //   expect(mockResponse.json).mockReturnValue(mockCar);

    //   expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
    //     where: {
    //       carId: mockRequest.params.id,
    //     },
    //   });
    // });

    it("should return error 422", async () => {
      const mockCarModel = {
        update: jest.fn().mockImplementation(() => {
          throw new Error("error");
        }),
      };

      const mockRequest = {
        params: {
          id: 1,
        },
        body: {
          name: "Bajai",
          price: "100000",
          size: "SMALL",
          image:
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
          isCurrentlyRented: false,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({
        carModel: mockCarModel,
      });

      await carController.handleUpdateCar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: expect.any(String),
        },
      });
    });
  });

  describe("#handleDeleteCar", () => {
    it("should delete a car", async () => {
      const mockCarModel = {
        destroy: jest.fn().mockReturnValue(1),
      };

      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({
        carModel: mockCarModel,
      });

      await carController.handleDeleteCar(mockRequest, mockResponse);

      expect(mockCarModel.destroy).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });

  describe("getCarFromRequest", () => {
    it("should Get a car by pk", () => {
      const mockCar = new Car({
        id: 1,
        name: "BAJAJ",
        price: "100000",
        size: "SMALL",
        image:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",

        isCurrentlyRented: false,
        createdAt: "2022-11-1 11:00:00",
        updatedAt: "2022-11-2 11:00:00",
      });

      mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const carController = new CarController({
        carModel: mockCarModel,
      });

      const car = carController.getCarFromRequest(mockRequest);

      expect(car).toEqual(mockCar);
    });
  });
});
