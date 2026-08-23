import { verifyToken } from '../verify/route.js';
import { NextResponse } from 'next/server';

const konsultacijasDataP = [
  {
    name: '',
    location: 'Parka iela 12',
    telpa: '101.k.',
    teacher: 'Anna Liepiņa',
    pirmdiena: '14.00-14.40',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '',
    classes: '1.a klase',
  },
  {
    name: 'Matemātika',
    location: 'Parka iela 12',
    telpa: '201.k.',
    teacher: 'Pēteris Salna',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '13.10-13.50',
    ceturtdiena: '',
    piektdiena: '',
    classes: '2.a, 3.a, 5.a klase',
  },
  {
    name: 'Latviešu valoda',
    location: 'Parka iela 12',
    telpa: '102.k.',
    teacher: 'Līga Avotiņa',
    pirmdiena: '',
    otrdiena: '14.00-14.40',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '',
    classes: '',
  },
  {
    name: 'Sports',
    location: 'Parka iela 12',
    telpa: 'sporta zāle',
    teacher: 'Andris Vītoliņš',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '15.10-15.40',
    piektdiena: '',
    classes: '',
  },
];

const konsultacijasDataE = [
  {
    name: '',
    location: 'Ezera iela 5',
    telpa: '301.k.',
    teacher: 'Baiba Ceriņa',
    pirmdiena: '14.50-15.30',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '',
    classes: '6.a klase',
  },
  {
    name: '',
    location: 'Ezera iela 5',
    telpa: '302.k.',
    teacher: 'Kārlis Strauts',
    pirmdiena: '',
    otrdiena: '14.50-15.30',
    tresdiena: '',
    ceturtdiena: '',
    piektdiena: '',
    classes: '7.a klase',
  },
  {
    name: 'Angļu valoda',
    location: 'Ezera iela 5',
    telpa: '401.k.',
    teacher: 'Māra Egle',
    pirmdiena: '',
    otrdiena: '',
    tresdiena: '',
    ceturtdiena: '14.50-15.30',
    piektdiena: '',
    classes: '6.a, 7.a, 8.a klase',
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
  const data = address === 'P' ? konsultacijasDataP : konsultacijasDataE;

  return NextResponse.json({ konsultacijas: data });
}
