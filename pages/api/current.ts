import serverAuth from "@/libs/severAuth";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(404).end();
  }
  try {
    const { currentUser } = await serverAuth(req);
    return res.status(200).json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}

export default handler;
