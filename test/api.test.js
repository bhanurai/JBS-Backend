const request = require("supertest");
const app = require("../index");

describe("API Endpoint Test", () => {
  //Register test
  it("POST /api/user/create | Response with success message", async () => {
    const response = await request(app).post("/api/user/create").send({
      firstName: "Sanjimunna",
      lastName: "Dumb",
      email: "bhanurai001@gmail.com",
      password: "hola123",
    });
    if (response.body.success) {
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual("User created successfully.");
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual("User already exists.");
    }
  });

  //login test
  it("Check user login", async () => {
    const response = await request(app).post("/api/user/login").send({
      //for 'User logged in successfully.'
      email: "bhanurai001@gmail.com",
      password: "hola123",

      //for 'User does not exist'
      // email: 'test@gmail.com',
      // password: '123456'
    });
    // if user is not found
    if (!response.body.success) {
      expect(response.body.message).toEqual("User does not exist");
    }
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("User logged in successfully.");
  });

  //getting all products test
  it("GET /api/product/get_products | Response should be json", async () => {
    const response = await request(app).get("/api/product/get_products");
    //can write any of the two ^ v
    // const response = await request(app).get('/get_products');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.message).toEqual("All products fetched successfully!");
  });

  //get single product test
  it("GET /api/product/get_product/:id | Response should be json", async () => {
    const response = await request(app).get(
      "/api/product/get_product/65dc7d3f913724102cdd58bf"
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("product");
  });

  //update product test
  it("PUT /api/product/update_product/:id | Response with success message or error message", async () => {
    const response = await request(app)
      .put("/api/product/update_product/65dc7d55913724102cdd58c2")
      .send({
        name: "UpdateTestName",
        description: "UpdateTestDescription",
        price: 2000,
      });

    if (response.body.success) {
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual("Product updated successfully.");
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual("Required fields are missing.");
    }
  });

  //create cart test
  it("POST /api/user/create_cart | Response with success message for creating a cart", async () => {
    const response = await request(app).post("/api/user/create_cart").send({
      userId: "65c0b032f9256b40dcecc956",
      quantity: 1,
      productId: "65dc7d55913724102cdd58c2",
    });

    if (response.body.success) {
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual(
        "Product added to cart successfully"
      );
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        "Product is already added to the cart"
      );
    }
  });

  //remove cart item test
  it("DELETE /api/user/remove_cart/:id | Response with success message for removing a product from the cart", async () => {
    // First, add a product to the cart for testing removal
    const createCartResponse = await request(app)
      .post("/api/user/create_cart")
      .send({
        userId: "65dc6cbb6e5ed787a37a5e5f",
        quantity: 1,
        productId: "65b504af688079ce72d5cd13",
      });

    const cartItemId = createCartResponse.body.cart[0]._id;

    const removeFromCartResponse = await request(app).delete(
      `/api/user/remove_cart/${cartItemId}`
    );

    expect(removeFromCartResponse.statusCode).toBe(200);
    expect(removeFromCartResponse.body.success).toBe(true);
    expect(removeFromCartResponse.body.message).toEqual(
      "Item removed from cart successfully"
    );
    expect(removeFromCartResponse.body.cart).toBeDefined();
  });

  //edit profile test
  it("PUT /api/user/update_profile/:id | Response with success message", async () => {
    const response = await request(app)
      .put("/api/user/update_profile/65a0c68705d56c6d7896d2ec")
      .send({
        firstName: "UpdateTestFirstName",
        lastName: "UpdateTestLastName",
      });

    if (response.body.success) {
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual(
        "User profile updated successfully"
      );
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual("Authorization header missing!");
    }
  });

  //create product
  it("POST /api/product/create_product | Response with success message", async () => {
    const response = await request(app)
      .post("/api/product/create_product")
      .send({
        productId: "quweyt61311",
        productName: "Test Product",
        productPrice: 10,
        productDescription: "Test description",
        productCategory: "Test category",
        productImage: "test.jpg",
      });
    if (response.body.success) {
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toEqual("Product created successfully.");
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual("Please fill all the fields");
    }
  });

  //delete product
  it("DELETE /api/product/delete_product/:id | Response with success message for deleting a product", async () => {
    const deleteProductResponse = await request(app).delete(
      `/api/product/deleteProduct/quweyt61311`
    );
    expect(deleteProductResponse.statusCode).toBe(200);
    expect(deleteProductResponse.body.success).toBe(true);
    expect(deleteProductResponse.body.message).toEqual(
      "Product deleted successfully"
    );
  });
});
