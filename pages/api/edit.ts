import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).end();
  }

  try {
    const { name, username, bio, profileImage, coverImage, currentUserId } =
      req.body;

    if (!name || !username) {
      throw new Error("Missing fields");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        name,
        username,
        bio,
        profileImage,
        coverImage,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
