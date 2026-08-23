import { verifyToken } from '../verify/route.js';
import { NextResponse } from 'next/server';

const scheduleDataP = [
  {
    name: 'Koris',
    location: 'Parka iela 12 / zāle',
    teacher: 'Elīna Priede',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '13.10-13.50 (1.a, 2.a, 3.a klase)',
    ceturtdiena: '',
    piektdiena: '',
    classes: '1.a, 2.a, 3.a',
  },
  {
    name: 'Vizuālā māksla',
    location: 'Parka iela 12 / 103.k.',
    teacher: 'Rūdolfs Lācis',
    pirmdiena: '',
    otrdiena: '14.00-14.50 (2.a, 3.a klase)',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '',
    classes: '2.a, 3.a',
  },
  {
    name: 'Sporta pulciņš',
    location: 'Parka iela 12 / sporta zāle',
    teacher: 'Andris Vītoliņš',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '14.00-15.00 (1.a, 2.a, 3.a, 5.a klase)',
    piektdiena: '',
    classes: '1.a, 2.a, 3.a, 5.a',
  },
  {
    name: 'Datorika',
    location: 'Parka iela 12 / 201.k.',
    teacher: 'Toms Ziediņš',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '14.00-14.50 (5.a klase)',
    classes: '5.a',
  },
];

const scheduleDataE = [
  {
    name: 'Koris',
    location: 'Ezera iela 5 / zāle',
    teacher: 'Elīna Priede',
    pirmdiena: '15.00-16.00 (6.a, 7.a, 8.a klase)',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '',
    classes: '6.a, 7.a, 8.a',
  },
  {
    name: 'Teātris',
    location: 'Ezera iela 5 / 302.k.',
    teacher: 'Nora Vilka',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '14.50-16.10 (6.a, 7.a klase)',
    ceturtdiena: '',
    piektdiena: '',
    classes: '6.a, 7.a',
  },
  {
    name: 'Basketbols',
    location: 'Ezera iela 5 / sporta zāle',
    teacher: 'Andris Vītoliņš',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '15.00-16.20 (6.a, 7.a, 8.a klase)',
    classes: '6.a, 7.a, 8.a',
  },
];

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const isValid = await verifyToken(token);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || 'P';
  const data = address === 'P' ? scheduleDataP : scheduleDataE;

  return NextResponse.json({ schedules: data });
}
