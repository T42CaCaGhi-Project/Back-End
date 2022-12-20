import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "FenFesta API docs",
      description:
        "documentation for the usage of FenFesta APIs for TACAGHIproject university assignment",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [{ name: "Development server", url: "http://localhost:3000" }],
    tags: [
      {
        name: "User",
        description: "Api centered around Users of the system",
      },
      {
        name: "Event",
        description: "Api centered around Events of the system",
      },
    ],
    components: {
      securitySchemes: {
        JWT: {
          type: "http",
          description: "Insert JWT token for authorization",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        errorRes: {
          type: "object",
          properties: {
            status: { type: "string", example: "errorStatus" },
            message: { type: "string", example: "errorMessage" },
          },
        },
      },
    },
    definitions: {
      User: {
        required: ["email", "password"],
        properties: {
          _id: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
          preferiti: { type: "array", items: { type: "string" } },
          isAdm: { type: "boolean" },
          isOrg: { type: "boolean" },
          alias: { type: "string" },
          img: { type: "string" },
        },
      },
      Location: {
        required: ["name", "city", "street"],
        properties: {
          name: { type: "string" },
          city: { type: "string" },
          street: { type: "string" },
          lat: { type: "number" },
          lon: { type: "number" },
        },
      },
      Event: {
        required: ["dateStart", "dateFinish", "title", "tags", "description"],
        properties: {
          _id: { type: "string" },
          idOwner: { type: "string" },
          location: { $ref: "#/definitions/Location" },
          dateStart: { type: "string", format: "date-time" },
          dateFinish: { type: "string", format: "date-time" },
          title: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          image: { type: "string" },
          description: { type: "string" },
          nParticipants: { type: "number" },
        },
      },
    },
    security: [{ JWT: [] }],
  },
  apis: ["./**/*.ts"],
};

export const swaggerDocs = swaggerJsDoc(options);
