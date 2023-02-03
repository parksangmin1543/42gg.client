import { NextApiRequest, NextApiResponse } from 'next';

interface IPenalty {
  intraId: string;
  penaltyTime: string;
  reason: string;
}

const penalties: IPenalty[] = [
  {
    intraId: 'mosong',
    penaltyTime: '2021-10-10 10:10:10',
    reason: '노쇼',
  },
  {
    intraId: 'mosong2',
    penaltyTime: '2021-10-10 10:10:12',
    reason: '노쇼2',
  },
  {
    intraId: 'mmmm',
    penaltyTime: '2021-10-10 10:30:12',
    reason: '기물파손',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  if (method === 'GET') {
    if (query.q) {
      const result: IPenalty[] = penalties.filter(
        (penalty) => penalty.intraId === query.q
      );
      res.status(200).json(result);
    } else {
      res.status(200).json(penalties);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
