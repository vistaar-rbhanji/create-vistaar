import mongoose from "mongoose";

import { AppInfo } from "./models/AppInfo.js";

export async function connect() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
}

export async function checkDatabase() {
  try {
    await connect();
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

function toPlainAppInfo(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  plain.id = String(plain._id);
  delete plain._id;
  delete plain.__v;
  return plain;
}

export async function getAppInfo() {
  await connect();
  const doc = await AppInfo.findOne().sort({ createdAt: 1 });
  return doc ? toPlainAppInfo(doc) : null;
}

export async function seedIfEmpty(seedData) {
  await connect();
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  const record = await AppInfo.create(
    Object.assign({}, seedData, { createdAt: new Date(seedData.createdAt) }),
  );
  return toPlainAppInfo(record);
}
