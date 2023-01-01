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
import { generateToken, authToken } from "../src/middleware/token";
const uri = process.env.MONGOURI_TEST;
const port = process.env.PORT_TEST || 2500;
const eventIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
];
const locationIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
];
const userIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
];
let testServer: any;
//connect to database and run app before testing anything
beforeAll(async () => {
  connect(uri);
  testServer = app.listen(port, () => {
    console.log(`testing events, listening at port: ${port}`);
  });
});
//clean data:
let tokens = [];
const createUsers = async () => {
  let users: UserInterface[] = [];
  const hashed = await hashing("password");
  users.push({
    _id: userIds[0],
    email: "used@email.com",
    password: hashed,
    isAdm: false,
    isOrg: false,
    preferiti: [eventIds[0]],
    alias: "",
    img: "",
  });
  users.push({
    _id: userIds[1],
    email: "admin@email.com",
    password: hashed,
    isAdm: true,
    isOrg: false,
    preferiti: [],
    alias: "",
    img: "",
  });
  users.push({
    _id: userIds[2],
    email: "org@email.com",
    password: hashed,
    isAdm: false,
    isOrg: true,
    preferiti: [],
    alias: "foo",
    img: "bar",
  });
  await User.insertMany(users);
  users.forEach((element) => {
    const token = generateToken({
      _id: element._id,
      sub: element.email,
      isAdm: element.isAdm,
      isOrg: element.isOrg,
    });
    tokens.push(token);
  });
};
const createEvents = async () => {
  let events: EventoInterface[] = [];
  /* const startDate = new Date();
  const wipDate = startDate.getTime() + getRandomInt(86400000);
  const finishDate = new Date(wipDate); */
  events.push({
    _id: eventIds[0],
    idOwner: userIds[2],
    location: {
      _id: locationIds[0],
      name: "string",
      city: "string",
      street: "string",
      lat: 0,
      lon: 0,
    },
    dateStart: new Date("2022-12-31T12:00:00.000Z"),
    dateFinish: new Date("2022-12-31T14:00:00.000Z"),
    title: "string",
    tags: ["tag1", "tag2"],
    image: "string",
    description: "string",
    nParticipants: 0,
  });
  events.push({
    _id: eventIds[1],
    idOwner: userIds[2],
    location: {
      _id: locationIds[1],
      name: "string",
      city: "string",
      street: "string",
      lat: 0,
      lon: 0,
    },
    dateStart: new Date("2022-12-29T12:00:00.000Z"),
    dateFinish: new Date("2022-12-29T14:00:00.000Z"),
    title: "string",
    tags: ["tag2", "tag3"],
    image: "string",
    description: "string",
    nParticipants: 0,
  });
  events.push({
    _id: eventIds[2],
    idOwner: userIds[2],
    location: {
      _id: locationIds[2],
      name: "string",
      city: "string",
      street: "string",
      lat: 0,
      lon: 0,
    },
    dateStart: new Date("2022-12-27T12:00:00.000Z"),
    dateFinish: new Date("2022-12-27T14:00:00.000Z"),
    title: "string",
    tags: ["tag1", "tag3"],
    image: "string",
    description: "string",
    nParticipants: 0,
  });
  await Evento.insertMany(events);
};
//before each test:
beforeEach(async () => {
  //remove old data before each test
  await User.remove({});
  await Evento.remove({});
  //add clean data before each test
  await createUsers();
  await createEvents();
});
//when testing ends:
afterAll(async () => {
  await mongoose.disconnect();
  testServer.close();
});

//tests:
//
//  GET EVENTS
//
describe("ALL Event print", () => {
  test(`GET localhost:${port}/api/event/all should get all created events present in the database`, async () => {
    const output = {
      status: "success",
      data: [
        {
          _id: eventIds[0].toString(),
          idOwner: userIds[2].toString(),
          location: {
            name: "string",
            city: "string",
            street: "string",
            lat: 0,
            lon: 0,
            _id: locationIds[0].toString(),
          },
          dateStart: "2022-12-31T12:00:00.000Z",
          dateFinish: "2022-12-31T14:00:00.000Z",
          title: "string",
          tags: ["tag1", "tag2"],
          image: "string",
          description: "string",
          nParticipants: 0,
          __v: 0,
        },
        {
          _id: eventIds[1].toString(),
          idOwner: userIds[2].toString(),
          location: {
            name: "string",
            city: "string",
            street: "string",
            lat: 0,
            lon: 0,
            _id: locationIds[1].toString(),
          },
          dateStart: "2022-12-29T12:00:00.000Z",
          dateFinish: "2022-12-29T14:00:00.000Z",
          title: "string",
          tags: ["tag2", "tag3"],
          image: "string",
          description: "string",
          nParticipants: 0,
          __v: 0,
        },
        {
          _id: eventIds[2].toString(),
          idOwner: userIds[2].toString(),
          location: {
            name: "string",
            city: "string",
            street: "string",
            lat: 0,
            lon: 0,
            _id: locationIds[2].toString(),
          },
          dateStart: "2022-12-27T12:00:00.000Z",
          dateFinish: "2022-12-27T14:00:00.000Z",
          title: "string",
          tags: ["tag1", "tag3"],
          image: "string",
          description: "string",
          nParticipants: 0,
          __v: 0,
        },
      ],
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/all`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
describe("uses empty dataset", () => {
  test(`GET localhost:${port}/api/event/all should return error if no events are found`, async () => {
    const output = {
      status: "error",
      message: "Not found",
    };
    await Evento.remove({});
    const res = await nodeFetch(`http://localhost:${port}/api/event/all`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  GET EVENT
//
describe("Single Event print", () => {
  test(`POST localhost:${port}/api/event/ should return single event corresponding to id`, async () => {
    const input = { _id: eventIds[0].toString() };
    const output = {
      data: {
        __v: 0,
        _id: eventIds[0].toString(),
        dateFinish: "2022-12-31T14:00:00.000Z",
        dateStart: "2022-12-31T12:00:00.000Z",
        description: "string",
        idOwner: {
          _id: userIds[2].toString(),
          alias: "foo",
          img: "bar",
        },
        image: "string",
        location: {
          _id: locationIds[0].toString(),
          city: "string",
          lat: 0,
          lon: 0,
          name: "string",
          street: "string",
        },
        nParticipants: 0,
        tags: ["tag1", "tag2"],
        title: "string",
      },
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/event/ should return error if no event is found, but _id is a valid format`, async () => {
    const input = { _id: eventIds[4].toString() };
    const output = {
      status: "error",
      message: "Not found",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test(`POST localhost:${port}/api/event/ should return error if _id is not a valid format`, async () => {
    const input = { _id: "wrong" };
    const output = {
      status: "error",
      message:
        'Cast to ObjectId failed for value "wrong" (type string) at path "_id" for model "Evento"',
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  CREATE EVENT
//
describe("Create new Event", () => {
  test("`POST localhost:${port}/api/event/new should create a new event if data is sent correctly and the user is autohrized. JWT required", async () => {
    const input = {
      location: {
        _id: locationIds[3],
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "new",
      tags: [],
      image: "string",
      description: "string",
      nParticipants: 0,
    };
    const output = {
      data: {},
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[2]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/new should not create a new event if data is sent correctly but the user is not autohrized (token exists but doesn't identify an organizer). JWT required", async () => {
    const input = {
      location: {
        _id: locationIds[3],
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "new",
      tags: [],
      image: "string",
      description: "string",
      nParticipants: 0,
    };
    const output = {
      message: "Unauthorized",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[0]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/new should not create a new event if data is sent correctly and the user is autohrized but there is already an event with the same title and the same startDate. JWT required", async () => {
    const input = {
      location: {
        _id: locationIds[3].toString(),
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "string",
      tags: [],
      image: "string",
      description: "string",
      nParticipants: 0,
    };
    const output = {
      message: "Event already exists",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[2]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  MODIFY EVENT
//
describe("Modify Event", () => {
  test("`POST localhost:${port}/api/event/modify should edit an existing event if data is sent correctly and the user is autohrized (organizer). JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
      idOwner: userIds[2].toString(),
      location: {
        _id: locationIds[0].toString(),
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "modified",
      tags: [],
      image: "string",
      description: "modified",
      nParticipants: 0,
    };
    const output = {
      data: {
        __v: 0,
        _id: eventIds[0].toString(),
        idOwner: userIds[2].toString(),
        location: {
          _id: locationIds[0].toString(),
          name: "string",
          city: "string",
          street: "string",
          lat: 0,
          lon: 0,
        },
        dateStart: "2022-12-31T12:00:00.000Z",
        dateFinish: "2022-12-31T14:00:00.000Z",
        title: "modified",
        tags: [],
        image: "string",
        description: "modified",
        nParticipants: 0,
      },
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[2]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/modify should edit an existing event if data is sent correctly and the user is autohrized (admin). JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
      idOwner: userIds[2].toString(),
      location: {
        _id: locationIds[0].toString(),
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "modified",
      tags: [],
      image: "string",
      description: "modified",
      nParticipants: 0,
    };
    const output = {
      data: {
        __v: 0,
        _id: eventIds[0].toString(),
        idOwner: userIds[2].toString(),
        location: {
          _id: locationIds[0].toString(),
          name: "string",
          city: "string",
          street: "string",
          lat: 0,
          lon: 0,
        },
        dateStart: "2022-12-31T12:00:00.000Z",
        dateFinish: "2022-12-31T14:00:00.000Z",
        title: "modified",
        tags: [],
        image: "string",
        description: "modified",
        nParticipants: 0,
      },
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[1]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/modify should not allow to modify the event if the JWT identifies a user that isn't an organizer or an admin. JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
      idOwner: userIds[2].toString(),
      location: {
        _id: locationIds[0].toString(),
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "modified",
      tags: [],
      image: "string",
      description: "modified",
      nParticipants: 0,
    };
    const output = {
      message: "Unauthorized",
      status: "fail",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[0]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/modify should respond with an error if the id of the event doesn't identify an event existing in the DB. JWT required", async () => {
    const input = {
      _id: eventIds[4].toString(),
      idOwner: userIds[2].toString(),
      location: {
        _id: locationIds[0].toString(),
        name: "string",
        city: "string",
        street: "string",
        lat: 0,
        lon: 0,
      },
      dateStart: new Date("2022-12-31T12:00:00.000Z"),
      dateFinish: new Date("2022-12-31T14:00:00.000Z"),
      title: "modified",
      tags: [],
      image: "string",
      description: "modified",
      nParticipants: 0,
    };
    const output = {
      message: "Not found",
      status: "error",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/modify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[2]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  DELETE EVENT
//
describe("Delete Event", () => {
  test("`POST localhost:${port}/api/event/delete should delete the event if it exists and the user is authorized (organizer). JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
    };
    const output = {
      status: "success",
      data: {
        acknowledged: true,
        deletedCount: 1,
      },
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[2]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/delete should delete the event if it exists and the user is authorized (admin). JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
    };
    const output = {
      status: "success",
      data: {
        acknowledged: true,
        deletedCount: 1,
      },
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[1]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/delete should not delete the event if it exists but the user is not authorized. JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
    };
    const output = {
      status: "fail",
      message: "Unauthorized",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[0]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/delete should return an error if the id doesn't identify an event present in the DB. JWT required", async () => {
    const input = {
      _id: eventIds[4].toString(),
    };
    const output = {
      status: "error",
      message: "Not found",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokens[2]}`,
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  SEARCH BY TAG
//
describe("Search by tag", () => {
  test("`POST localhost:${port}/api/event/tag should return every event that contains the desired tag in the tag array property", async () => {
    const input = {
      tags: ["tag1", "tag2"],
    };
    const output = {
      data: [
        {
          __v: 0,
          _id: eventIds[0].toString(),
          dateFinish: "2022-12-31T14:00:00.000Z",
          dateStart: "2022-12-31T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[0].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag1", "tag2"],
          title: "string",
        },
        {
          __v: 0,
          _id: eventIds[1].toString(),
          dateFinish: "2022-12-29T14:00:00.000Z",
          dateStart: "2022-12-29T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[1].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag2", "tag3"],
          title: "string",
        },
        {
          __v: 0,
          _id: eventIds[2].toString(),
          dateFinish: "2022-12-27T14:00:00.000Z",
          dateStart: "2022-12-27T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[2].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag1", "tag3"],
          title: "string",
        },
      ],
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/tag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/tag returns an error if no event is found with the submitted tags", async () => {
    const input = {
      tag: ["tag4"],
    };
    const output = {
      status: "error",
      message: "Not found",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/tag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  SEARCH BY PERIOD
//
describe("Search by period", () => {
  test("`POST localhost:${port}/api/event/period returns all events with startDate or finishDate between the submitted day and the choosen timeframe (day)", async () => {
    const input = {
      date: "2022-12-31T00:00:00.000Z",
      span: "day",
    };
    const output = {
      data: [
        {
          __v: 0,
          _id: eventIds[0].toString(),
          dateFinish: "2022-12-31T14:00:00.000Z",
          dateStart: "2022-12-31T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[0].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag1", "tag2"],
          title: "string",
        },
      ],
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/period`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/period returns all events with startDate or finishDate between the submitted day and the choosen timeframe (week)", async () => {
    const input = {
      date: "2022-12-24T00:00:00.000Z",
      span: "week",
    };
    const output = {
      data: [
        {
          __v: 0,
          _id: eventIds[2].toString(),
          dateFinish: "2022-12-27T14:00:00.000Z",
          dateStart: "2022-12-27T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[2].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag1", "tag3"],
          title: "string",
        },
        {
          __v: 0,
          _id: eventIds[1].toString(),
          dateFinish: "2022-12-29T14:00:00.000Z",
          dateStart: "2022-12-29T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[1].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag2", "tag3"],
          title: "string",
        },
      ],
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/period`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/period returns all events with startDate or finishDate between the submitted day and the choosen timeframe (month)", async () => {
    const input = {
      date: "2022-12-02T00:00:00.000Z",
      span: "month",
    };
    const output = {
      data: [
        {
          __v: 0,
          _id: eventIds[2].toString(),
          dateFinish: "2022-12-27T14:00:00.000Z",
          dateStart: "2022-12-27T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[2].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag1", "tag3"],
          title: "string",
        },
        {
          __v: 0,
          _id: eventIds[1].toString(),
          dateFinish: "2022-12-29T14:00:00.000Z",
          dateStart: "2022-12-29T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[1].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag2", "tag3"],
          title: "string",
        },
        {
          __v: 0,
          _id: eventIds[0].toString(),
          dateFinish: "2022-12-31T14:00:00.000Z",
          dateStart: "2022-12-31T12:00:00.000Z",
          description: "string",
          idOwner: userIds[2].toString(),
          image: "string",
          location: {
            _id: locationIds[0].toString(),
            city: "string",
            lat: 0,
            lon: 0,
            name: "string",
            street: "string",
          },
          nParticipants: 0,
          tags: ["tag1", "tag2"],
          title: "string",
        },
      ],
      status: "success",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/period`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/period returns an error if no events are found", async () => {
    const input = {
      date: "2022-12-02T00:00:00.000Z",
      span: "day",
    };
    const output = {
      message: "Not found",
      status: "error",
    };
    const res = await nodeFetch(`http://localhost:${port}/api/event/period`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
//
//  ADD/REMOVE FAVOURITE
//
describe("Add/Remove favorite", () => {
  test("`POST localhost:${port}/api/event/preferito should add an event to the array of favourites of the user if it isn't already present, remove from it if it's already there (add). JWT required", async () => {
    const input = {
      _id: eventIds[1].toString(),
    };
    const output = {
      status: "success",
      data: {},
    };
    const res = await nodeFetch(
      `http://localhost:${port}/api/event/preferito`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokens[0]}`,
        },
        body: JSON.stringify(input),
      }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/preferito should add an event to the array of favourites of the user if it isn't already present, remove from it if it's already there (remove). JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
    };
    const output = {
      status: "success",
      data: {},
    };
    const res = await nodeFetch(
      `http://localhost:${port}/api/event/preferito`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokens[0]}`,
        },
        body: JSON.stringify(input),
      }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/preferito returns an error if the token is not valid. JWT required", async () => {
    const input = {
      _id: eventIds[0].toString(),
    };
    const output = {
      status: "error",
      message: "jwt malformed",
    };
    const res = await nodeFetch(
      `http://localhost:${port}/api/event/preferito`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer wrong`,
        },
        body: JSON.stringify(input),
      }
    );
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual(output);
  });
  test("`POST localhost:${port}/api/event/preferito returns an error the id doesn't identify an event in the DB. JWT required", async () => {
    const input = {
      _id: eventIds[4].toString(),
    };
    const output = {
      status: "error",
      message: "Not found",
    };
    const res = await nodeFetch(
      `http://localhost:${port}/api/event/preferito`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${tokens[0]}`,
        },
        body: JSON.stringify(input),
      }
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual(output);
  });
});
