import TourInfo from '@/app/components/TourInfo';
import { generateTourImage, getSingleTour } from '@/app/utils/actions';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  params: {
    id: string;
  };
};

const SingleTourPage = async (props: Props) => {
  const tour = await getSingleTour(props.params.id);

  if (!tour) {
    redirect('/tours');
  }

  // const tourImage = await generateTourImage({
  //   city: tour.city,
  //   country: tour.country,
  // });

  return (
    <div>
      <Link href="/tours" className="btn btn-secondary mb-12">
        Back to tours
      </Link>
      <TourInfo tour={tour} />
    </div>
  );
};

export default SingleTourPage;
