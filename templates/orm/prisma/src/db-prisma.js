import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function connect() {
  await prisma.$connect();
}

export async function checkDatabase() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function getAppInfo() {
  return prisma.appInfo.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function seedIfEmpty(seedData) {
  const existing = await getAppInfo();
  if (existing) {
    return existing;
  }
  return prisma.appInfo.create({ data: seedData });
}
