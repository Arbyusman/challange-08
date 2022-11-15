const request = require("supertest");
const app = require("../../../app");

describe("POST /v1/cars", () => {
  let token;

  beforeAll((done) => {
    request(app)
      .post("/v1/auth/login")
      .send({
        email: "Fikri@binar.co.id",
        password: "123456",
      })
      .expect(201)
      .end((err, res) => {
        if(err) throw err;
        token = res.body.accessToken;
        done();
      });
  });
  
  it("should response with 201 as status code", async () => {
    const name = "Bajai";
    const price = 100000;
    const size = "Small";
    const image = "https://dl.kaskus.id/jawawakan.files.wordpress.com/2012/07/708px-gas_fuelled_bajaj_in_jakarta.jpg";

    return request(app)
      .post("/v1/cars")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({ name, price, size, image })
      .then((res) => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            createdAt: expect.any(String),
            id: expect.any(Number),
            image: expect.any(String),
            isCurrentlyRented: expect.any(Boolean),
            name: expect.any(String),
            price: expect.any(Number),
            size: expect.any(String),
            updatedAt: expect.any(String),
          })
        );
      });
  });

  it("should response with 422 as status code", async () => {
    const name = [];
    const price = null;
    const size = 2;
    const image = "";
    
    return request(app)
      .post("/v1/cars")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({ name, price, size, image })
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body).toEqual(
          expect.objectContaining({
            error: {
              name: expect.any(String),
              message: expect.any(String),
            }
          })
        );
      });
  });
});