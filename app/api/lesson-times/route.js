import { verifyToken } from '../verify/route.js';
import { NextResponse } from 'next/server';

function les(stunda, laiks, nosaukums, telpa, skolotājs) {
  return { stunda, laiks, nosaukums, telpa, skolotājs };
}

const LUNCH = les('P.*', '11.50-12.20', '*Pusdienas*', '', '');
const SNACK = les('L.*', '14.40-15.00', '*Launags*', '', '');

const lessonTimesP = {
  '1.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '101.k.', 'Anna Liepiņa'),
      les('3.', '10.20-11.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      les('4.', '11.10-11.50', 'Angļu valoda', '101.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      SNACK,
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '101.k.', 'Anna Liepiņa'),
      les('3.', '10.20-11.00', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      les('4.', '11.10-11.50', 'Matemātika', '101.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '101.k.', 'Anna Liepiņa'),
      SNACK,
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '101.k.', 'Anna Liepiņa'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      SNACK,
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '101.k.', 'Anna Liepiņa'),
      les('3.', '10.20-11.00', 'Angļu valoda', '101.k.', 'Māra Egle'),
      les('4.', '11.10-11.50', 'Matemātika', '101.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '101.k.', 'Anna Liepiņa'),
      SNACK,
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '101.k.', 'Anna Liepiņa'),
      les('3.', '10.20-11.00', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      les('4.', '11.10-11.50', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      LUNCH,
      les('5.', '12.20-13.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      SNACK,
    ],
  },
  '2.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '102.k.', 'Jānis Ozols'),
      les('3.', '10.20-11.00', 'Matemātika', '102.k.', 'Pēteris Salna'),
      les('4.', '11.10-11.50', 'Angļu valoda', '102.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      SNACK,
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '102.k.', 'Jānis Ozols'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '102.k.', 'Jānis Ozols'),
      SNACK,
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '102.k.', 'Jānis Ozols'),
      les('3.', '10.20-11.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      les('4.', '11.10-11.50', 'Matemātika', '102.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Angļu valoda', '102.k.', 'Māra Egle'),
      SNACK,
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '102.k.', 'Jānis Ozols'),
      les('3.', '10.20-11.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      les('4.', '11.10-11.50', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '102.k.', 'Jānis Ozols'),
      SNACK,
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '102.k.', 'Jānis Ozols'),
      les('3.', '10.20-11.00', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Matemātika', '102.k.', 'Pēteris Salna'),
      SNACK,
    ],
  },
  '3.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '201.k.', 'Ieva Kalniņa'),
      les('3.', '10.20-11.00', 'Angļu valoda', '201.k.', 'Māra Egle'),
      les('4.', '11.10-11.50', 'Matemātika', '201.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      SNACK,
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '201.k.', 'Ieva Kalniņa'),
      les('3.', '10.20-11.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      les('4.', '11.10-11.50', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '201.k.', 'Ieva Kalniņa'),
      SNACK,
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '201.k.', 'Ieva Kalniņa'),
      les('3.', '10.20-11.00', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      les('4.', '11.10-11.50', 'Angļu valoda', '201.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Matemātika', '201.k.', 'Pēteris Salna'),
      SNACK,
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '201.k.', 'Ieva Kalniņa'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      SNACK,
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '201.k.', 'Ieva Kalniņa'),
      les('3.', '10.20-11.00', 'Matemātika', '201.k.', 'Pēteris Salna'),
      les('4.', '11.10-11.50', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '201.k.', 'Ieva Kalniņa'),
      SNACK,
    ],
  },
  '5.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '202.k.', 'Santa Dzelme'),
      les('3.', '10.20-11.00', 'Matemātika', '201.k.', 'Pēteris Salna'),
      les('4.', '11.10-11.50', 'Angļu valoda', '202.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Datorika', '201.k.', 'Toms Ziediņš'),
      les('6.', '13.10-13.50', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      SNACK,
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '202.k.', 'Santa Dzelme'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '202.k.', 'Santa Dzelme'),
      SNACK,
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '202.k.', 'Santa Dzelme'),
      les('3.', '10.20-11.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      les('4.', '11.10-11.50', 'Matemātika', '201.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Angļu valoda', '202.k.', 'Māra Egle'),
      SNACK,
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '202.k.', 'Santa Dzelme'),
      les('3.', '10.20-11.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      les('4.', '11.10-11.50', 'Latviešu valoda', '102.k.', 'Līga Avotiņa'),
      LUNCH,
      les('5.', '12.20-13.00', 'Datorika', '201.k.', 'Toms Ziediņš'),
      SNACK,
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '202.k.', 'Santa Dzelme'),
      les('3.', '10.20-11.00', 'Vizuālā māksla', '103.k.', 'Rūdolfs Lācis'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '202.k.', 'Santa Dzelme'),
      SNACK,
    ],
  },
};

const lessonTimesE = {
  '6.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '301.k.', 'Baiba Ceriņa'),
      les('3.', '10.20-11.00', 'Matemātika', '301.k.', 'Pēteris Salna'),
      les('4.', '11.10-11.50', 'Angļu valoda', '401.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Datorika', '401.k.', 'Toms Ziediņš'),
      les('6.', '13.10-13.50', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '301.k.', 'Baiba Ceriņa'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '301.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Vizuālā māksla', '302.k.', 'Rūdolfs Lācis'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '301.k.', 'Baiba Ceriņa'),
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '301.k.', 'Baiba Ceriņa'),
      les('3.', '10.20-11.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      les('4.', '11.10-11.50', 'Matemātika', '301.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Angļu valoda', '401.k.', 'Māra Egle'),
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '301.k.', 'Baiba Ceriņa'),
      les('3.', '10.20-11.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      les('4.', '11.10-11.50', 'Latviešu valoda', '301.k.', 'Līga Avotiņa'),
      LUNCH,
      les('5.', '12.20-13.00', 'Datorika', '401.k.', 'Toms Ziediņš'),
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '301.k.', 'Baiba Ceriņa'),
      les('3.', '10.20-11.00', 'Vizuālā māksla', '302.k.', 'Rūdolfs Lācis'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '301.k.', 'Baiba Ceriņa'),
    ],
  },
  '7.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '302.k.', 'Kārlis Strauts'),
      les('3.', '10.20-11.00', 'Angļu valoda', '401.k.', 'Māra Egle'),
      les('4.', '11.10-11.50', 'Matemātika', '302.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '302.k.', 'Kārlis Strauts'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '302.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Datorika', '401.k.', 'Toms Ziediņš'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '302.k.', 'Kārlis Strauts'),
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '302.k.', 'Kārlis Strauts'),
      les('3.', '10.20-11.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      les('4.', '11.10-11.50', 'Angļu valoda', '401.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Matemātika', '302.k.', 'Pēteris Salna'),
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '302.k.', 'Kārlis Strauts'),
      les('3.', '10.20-11.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      les('4.', '11.10-11.50', 'Latviešu valoda', '302.k.', 'Līga Avotiņa'),
      LUNCH,
      les('5.', '12.20-13.00', 'Vizuālā māksla', '302.k.', 'Rūdolfs Lācis'),
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '302.k.', 'Kārlis Strauts'),
      les('3.', '10.20-11.00', 'Datorika', '401.k.', 'Toms Ziediņš'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '302.k.', 'Kārlis Strauts'),
    ],
  },
  '8.a': {
    Pirmdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '401.k.', 'Nora Vilka'),
      les('3.', '10.20-11.00', 'Matemātika', '401.k.', 'Pēteris Salna'),
      les('4.', '11.10-11.50', 'Angļu valoda', '401.k.', 'Māra Egle'),
      LUNCH,
      les('5.', '12.20-13.00', 'Latviešu valoda', '401.k.', 'Līga Avotiņa'),
    ],
    Otrdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '401.k.', 'Nora Vilka'),
      les('3.', '10.20-11.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
      les('4.', '11.10-11.50', 'Datorika', '401.k.', 'Toms Ziediņš'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '401.k.', 'Nora Vilka'),
    ],
    Trešdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '401.k.', 'Nora Vilka'),
      les('3.', '10.20-11.00', 'Mūzika', 'zāle', 'Elīna Priede'),
      les('4.', '11.10-11.50', 'Matemātika', '401.k.', 'Pēteris Salna'),
      LUNCH,
      les('5.', '12.20-13.00', 'Angļu valoda', '401.k.', 'Māra Egle'),
    ],
    Ceturtdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '401.k.', 'Nora Vilka'),
      les('3.', '10.20-11.00', 'Latviešu valoda', '401.k.', 'Līga Avotiņa'),
      les('4.', '11.10-11.50', 'Vizuālā māksla', '302.k.', 'Rūdolfs Lācis'),
      LUNCH,
      les('5.', '12.20-13.00', 'Sports', 'sporta zāle', 'Andris Vītoliņš'),
    ],
    Piektdiena: [
      les('1.-2.', '08.30-10.00', 'Perioda stunda', '401.k.', 'Nora Vilka'),
      les('3.', '10.20-11.00', 'Datorika', '401.k.', 'Toms Ziediņš'),
      les('4.', '11.10-11.50', 'Mūzika', 'zāle', 'Elīna Priede'),
      LUNCH,
      les('5.', '12.20-13.00', 'Klases stunda', '401.k.', 'Nora Vilka'),
    ],
  },
};

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
  const data = address === 'P' ? lessonTimesP : lessonTimesE;

  return NextResponse.json({ lessonTimes: data });
}
