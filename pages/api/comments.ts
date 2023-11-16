import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  try {
    const { body, userId } = req.body;
    const { postId } = req.query;
    if (!postId || typeof postId !== "string") {
      throw new Error("Post Id is invalid!");
    }
    const comment = await prisma.comment.create({
      data: {
        postId,
        body,
        userId: userId,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    try {
      const p = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (p?.userId && currentUser?.username) {
        await prisma.notifications.create({
          data: {
            body: `@${currentUser.username} replied on your tweet`,
            userId: p.userId,
          },
        });

        await prisma.user.update({
          where: {
            id: p.userId,
          },
          data: {
            hasNotification: true,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }

    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
};

export default handler;
