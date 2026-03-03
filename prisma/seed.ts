import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding master data...");

  // Life Insurance
  const life = await prisma.service.upsert({
    where: { code: "LIFE" },
    update: {},
    create: { name: "Life Insurance", code: "LIFE" },
  });

  const lifeProducts = ["LIC", "Bajaj Life", "ICICI Life", "HDFC Life"];
  for (const name of lifeProducts) {
    const id = `life-${name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.product.upsert({
      where: { id },
      update: {},
      create: { id, name, serviceId: life.id, apiSlug: name.toLowerCase().replace(/\s+/g, "-") },
    });
  }

  // Health Insurance
  const health = await prisma.service.upsert({
    where: { code: "HEALTH" },
    update: {},
    create: { name: "Health Insurance", code: "HEALTH" },
  });

  const healthProducts = ["Star Health", "Care Health", "TATA AIG Health"];
  for (const name of healthProducts) {
    const id = `health-${name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.product.upsert({
      where: { id },
      update: {},
      create: { id, name, serviceId: health.id, apiSlug: name.toLowerCase().replace(/\s+/g, "-") },
    });
  }

  // Mutual Funds
  const mf = await prisma.service.upsert({
    where: { code: "MF" },
    update: {},
    create: { name: "Mutual Funds", code: "MF" },
  });

  const mfProducts = ["NJ", "Prudent"];
  for (const name of mfProducts) {
    const id = `mf-${name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.product.upsert({
      where: { id },
      update: {},
      create: { id, name, serviceId: mf.id, apiSlug: name.toLowerCase().replace(/\s+/g, "-") },
    });
  }

  // IT Returns
  const itr = await prisma.service.upsert({
    where: { code: "ITR" },
    update: {},
    create: { name: "IT Returns", code: "ITR" },
  });

  const itrProducts = ["Salaried", "Business", "Retired"];
  for (const name of itrProducts) {
    const id = `itr-${name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.product.upsert({
      where: { id },
      update: {},
      create: { id, name, serviceId: itr.id },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
