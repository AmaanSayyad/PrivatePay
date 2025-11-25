import { prismaClient } from "../../../lib/db/prisma.js";

export const getNextAliasKey = async () => {
  const allUserAliasCount = await prismaClient.userAlias.findMany({
    orderBy: {
      key: "desc",
    },
  });

  if(allUserAliasCount.length === 0) {
    return 1;
  }

  const lastAliasKey = allUserAliasCount[0].key;
  const nextAliasKey = lastAliasKey + 1;

  return nextAliasKey;
};
