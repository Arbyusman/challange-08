const ApplicationError = require("../ApplicationError");

describe("ApplicationError", () => {
  describe("#details", () => {
    it("should return empty object ", () => {
      const applicationError = new ApplicationError("error");

      expect(applicationError.details).toEqual({});
    });
  });

  describe("#toJSON", () => {
    it("should return json error ", () => {
      const applicationError = new ApplicationError("error");

      expect(applicationError.toJSON()).toEqual({
        error: {
          name: applicationError.name,
          message: applicationError.message,
          details: applicationError.details,
        },
      });
    });
  });
});
