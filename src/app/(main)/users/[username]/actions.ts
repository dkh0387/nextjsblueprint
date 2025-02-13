"use server";

import {updateUserProfileSchema, UpdateUserProfileValues,} from "@/lib/validation";
import {validateRequest} from "@/auth";
import {prisma} from "@/lib/prisma";
import {getFollowingUserDataSelect} from "@/lib/types";
import streamServerClient from "@/lib/stream";

/**
 * Server hook for updating user displayname and bio.
 * @param values
 */
export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    throw new Error("Unauthorized");
  }
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: loggedInUser.id },
      data: validatedValues,
      select: getFollowingUserDataSelect(loggedInUser.id),
    });
    await streamServerClient.partialUpdateUser({
      id: loggedInUser.id,
      set: {
        name: validatedValues.displayName,
      },
    });
    return updatedUser;
  });

  return updatedUser;
}
