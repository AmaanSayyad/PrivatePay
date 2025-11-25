import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing alias keys");

  // Step 1: Retrieve all user aliases sorted by id
  const allUserAlias = await prisma.userAlias.findMany({
    orderBy: { id: "asc" },
  });

  // Step 2: Assign temporary unique values to avoid conflicts
  for (let i = 0; i < allUserAlias.length; i++) {
    const userAlias = allUserAlias[i];
    const tempKey = -(i + 1); // Temporary negative keys
    await prisma.userAlias.update({
      where: { id: userAlias.id },
      data: {
        key: tempKey,
      },
    });
  }

  // Step 3: Set the correct sequential values for the `key` field
  for (let i = 0; i < allUserAlias.length; i++) {
    const userAlias = allUserAlias[i];
    const aliasKey = i + 1; // Sequential key starting from 1
    await prisma.userAlias.update({
      where: { id: userAlias.id },
      data: {
        key: aliasKey,
      },
    });
  }

  console.log("Fixed alias keys");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
