const request = require("supertest");
const app = require("../../../../app");
const { Car } = require("../../../../app/models");

describe("GET /v1/cars/:id", () => {
  let car;
  beforeEach(async () => {
    car = await Car.create({
      name: "Bajai",
      price: 100000,
      size: "Small",
      image:
        "https://dl.kaskus.id/jawawakan.files.wordpress.com/2012/07/708px-gas_fuelled_bajaj_in_jakarta.jpg",
      isCurrentlyRented: false,
    });
    return car;
  });
  afterEach(() => car.destroy());

  it("should response with 200 as status code", async () => {
    return request(app)
      .get(`/v1/cars/${car.id}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            name: car.name,
            price: car.price,
            size: car.size,
            image: car.image,
            isCurrentlyRented: car.isCurrentlyRented,
          })
        );
      });
  });
});
