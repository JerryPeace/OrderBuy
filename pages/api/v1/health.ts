// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};
/**
 * @swagger
 * /api/health:
 *   get:
 *     description: Returns the hello world
 *     responses:
 *       200:
 *         description: { message: ' server is healthy' }
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ message: ' server is healthy' });
}
