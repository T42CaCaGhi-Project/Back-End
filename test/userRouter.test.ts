const nodeFetch = require("node-fetch");
import mongoose from "mongoose";
import { app } from "../src/app";
import { connect } from "../src/db";
import {
  User,
  UserInterface,
  Evento,
  EventoInterface,
} from "../src/schemas/schemaIndex";
import { hashing } from "../src/handlers/userHandle";
const uri = process.env.MONGOURI_TEST;
const port = process.env.PORT_TEST || 2500;

let testServer: any;
//connect to database and run app before testing anything
beforeAll(async () => {
  connect(uri);
  testServer = app.listen(port, () => {
    console.log(`testing users, listening at port: ${port}`);
  });
});
//clean data:
const createUsers = async () => {
  let users: UserInterface[] = [];
  const hashed = await hashing("password");
  users.push({
    email: "used@email.com",
    password: hashed,
    isAdm: false,
    isOrg: false,
    preferiti: [],
    alias: "",
    img: "",
  });
  users.push({
    email: "admin@email.com",
    password: hashed,
    isAdm: true,
    isOrg: false,
    preferiti: [],
    alias: "",
    img: "",
  });
  users.push({
    email: "org@email.com",
    password: hashed,
    isAdm: false,
    isOrg: true,
    preferiti: [],
    alias: "foo",
    img: "bar",
  });
  await User.insertMany(users);
};

//before each test:
beforeEach(async () => {
  //remove old data before each test
  await User.remove({});
  await Evento.remove({});
  //add clean data before each test
  await createUsers();
});
//when testing ends:
afterAll(async () => {
  await mongoose.disconnect();
  testServer.close();
});

//tests:
//
//  USER CREATION
//
describe("User creation", () => {
  test(`POST localhost:${port}/api/user/new should post with no problems if both an email and a password are provided`, async () => {
    const input = {
      email: "test@email.com",
      password: "password",
    };
    const output = {
      status: "success",
      data: {},
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/new`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/new should fail if email or password (or both) are not provided`, async () => {
    const input = {
      email: "test@email.com",
      password: "",
    };
    const output = {
      status: "fail",
      message: "Dati Mancanti",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/new`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/new should fail if the email has already been used to create an account`, async () => {
    const input = {
      email: "used@email.com",
      password: "password",
    };
    const output = {
      status: "fail",
      message: "User already exists",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/new`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  USER LOGIN
//
describe("User login", () => {
  test(`POST localhost:${port}/api/user/login should post with no problems if both email and password identify a previously created user`, async () => {
    const input = {
      email: "used@email.com",
      password: "password",
    };
    const output = {
      alias: "",
      email: "used@email.com",
      img: "",
      isAdm: false,
      isOrg: false,
      preferiti: [],
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/login`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.token).toMatch(/^[^\.]+\.[^\.]+\.[^\.]+$/);
    expect(data.data.userResData).toMatchObject(output);
  });
  test(`POST localhost:${port}/api/user/login should return an error if login credentials are incomplete (password case)`, async () => {
    const input = {
      email: "used@email.com",
      password: "",
    };
    const output = {
      message: "Login credentials not submitted",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/login`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/login should return an error if login credentials are incomplete (email case)`, async () => {
    const input = {
      email: "",
      password: "password",
    };
    const output = {
      message: "Login credentials not submitted",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/login`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/login should return an error if password is incorrect`, async () => {
    const input = {
      email: "used@email.com",
      password: "wrongpassword",
    };
    const output = {
      message: "incorrect password",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/login`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/login should return an error if no user is identified by the credentials submitted`, async () => {
    const input = {
      email: "typo@email.com",
      password: "password",
    };
    const output = {
      message: "not found",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/login`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  USER DELETE
//
describe("User delete", () => {
  test(`POST localhost:${port}/api/user/delete should delete the user if both email and password identify a previously created user. A valid JWT is required`, async () => {
    const input = {
      email: "used@email.com",
      password: "password",
    };
    const output = {
      status: "success",
      data: {
        acknowledged: true,
        deletedCount: 1,
      },
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/delete`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2IwMDJkM2U1MDgwMzUyYjZkZjg4ZjIiLCJpc0FkbSI6MCwiaXNPcmciOjAsInN1YiI6InVzZWRAZW1haWwuY29tIiwiaWF0IjoxNjcyNDc5NDQzfQ.e1FhmoaQIxDvN1KY33O5c1lPN2KfuDmW5l8AqYPBrl0",
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/delete should return an error if the token provided is incorrect`, async () => {
    const input = {
      email: "used@email.com",
      password: "password",
    };
    const output = {
      status: "error",
      message: "invalid token",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/delete`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer wrongeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2IwMDJkM2U1MDgwMzUyYjZkZjg4ZjIiLCJpc0FkbSI6MCwiaXNPcmciOjAsInN1YiI6InVzZWRAZW1haWwuY29tIiwiaWF0IjoxNjcyNDc5NDQzfQ.e1FhmoaQIxDvN1KY33O5c1lPN2KfuDmW5l8AqYPBrl0",
      },
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/delete should delete the user corresponding to the email if the requester is an admin. A valid JWT is required`, async () => {
    const input = {
      email: "used@email.com",
    };
    const output = {
      status: "success",
      data: {
        acknowledged: true,
        deletedCount: 1,
      },
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/delete`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2IwMjZlYmU4YTk4OWU5NGM1NTIzYmYiLCJpc0FkbSI6MSwiaXNPcmciOjAsInN1YiI6ImFkbWluQG1haWwuY29tIiwiaWF0IjoxNjcyNDg4NjkwfQ.exjyBnxM8y5-G2ky_AhT1PbuhX6EIybaOdjOTVvx3HI",
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/user/delete should respond with an error if the email contains a typo. A valid JWT is required`, async () => {
    const input = {
      email: "typo@email.com",
      password: "password",
    };
    const output = {
      status: "error",
      message: "user not found",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/user/delete`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2IwMjZlYmU4YTk4OWU5NGM1NTIzYmYiLCJpc0FkbSI6MSwiaXNPcmciOjAsInN1YiI6ImFkbWluQG1haWwuY29tIiwiaWF0IjoxNjcyNDg4NjkwfQ.exjyBnxM8y5-G2ky_AhT1PbuhX6EIybaOdjOTVvx3HI",
      },
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
