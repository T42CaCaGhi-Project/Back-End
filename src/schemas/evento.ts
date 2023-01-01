import { Types, SchemaTypes, Schema, model } from "mongoose";

export interface EventoInterface {
  _id?: Types.ObjectId;
  idOwner: any;
  location: {
    _id?: Types.ObjectId;
    name: string;
    city: string;
    street: string;
    lat: number;
    lon: number;
  };
  dateStart: Date;
  dateFinish: Date;
  title: string;
  tags: string[];
  image: string;
  description: string;
  nParticipants: number;
}

interface LocationInterface {
  _id?: Types.ObjectId;
  name: string;
  city: string;
  street: string;
  lat: number;
  lon: number;
}

const LocationSchema = new Schema<LocationInterface>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  lat: { type: Number },
  lon: { type: Number },
});

const EventoSchema = new Schema<EventoInterface>({
  idOwner: { type: SchemaTypes.ObjectId, ref: "User" },
  location: { type: LocationSchema },
  dateStart: { type: Date, required: true },
  dateFinish: { type: Date, required: true },
  title: { type: String, required: true },
  tags: [{ type: String, required: true }],
  image: { type: String },
  description: { type: String, required: true },
  nParticipants: { type: Number, default: 0 },
});

const Evento = model("Evento", EventoSchema);
export { Evento };
