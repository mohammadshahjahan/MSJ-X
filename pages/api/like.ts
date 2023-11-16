import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).end();
  }

  try {
    const { postId, currentUser } = req.body;
    if (!postId || typeof postId !== "string") {
      throw new Error("Invalid ID");
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new Error("Unable to find Post!");
    }
    let likedUpdatedIds = [...(post.likedIds || [])];
    if (req.method === "POST") {
      likedUpdatedIds.push(currentUser.id);
      try {
        const p = await prisma.post.findUnique({
          where: {
            id: postId,
          },
        });
        if (p?.userId) {
          await prisma.notifications.create({
            data: {
              body: `@${currentUser.username} liked your tweet`,
              userId: post.userId,
            },
          });

          await prisma.user.update({
            where: {
              id: post.userId,
            },
            data: {
              hasNotification: true,
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (req.method === "DELETE") {
      likedUpdatedIds = likedUpdatedIds.filter((ids) => ids !== currentUser.id);
    }
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedIds: likedUpdatedIds,
      },
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
