import React from 'react';
import { SavedTourProps } from '../utils/actions';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  tour: SavedTourProps;
};

const TourCard = (props: Props) => {
  const { city, id, country, image } = props.tour;
  return (
    <Link href={`/tours/${id}`}>
      <div className="card card-side bg-base-100 shadow-xl h-64 w-80">
        <div className="card-body flex flex-col justify-between p-4">
          <h2 className="card-title line-clamp-1">{city}</h2>{' '}
          {/* This clamps the city name to one line */}
          <p className="line-clamp-2">{country}</p>{' '}
          {/* This clamps the country name to two lines */}
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
