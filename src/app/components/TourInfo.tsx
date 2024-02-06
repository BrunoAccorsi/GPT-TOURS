import { Prisma } from '@prisma/client';
import React from 'react';
import Image from 'next/image';

type Props = {
  tour: Tour;
};

interface Tour {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  city: string;
  country: string;
  title: string;
  description: string;
  image: string | null;
  stops: Prisma.JsonValue;
}

const TourInfo = ({ tour }: Props) => {
  const tourImage = tour.image;
  return (
    <div className="max-w-2xl">
      {tourImage ? (
        <div>
          <Image
            src={tourImage}
            width={300}
            height={300}
            className="rounded-xl shadow-xl mb-16 h-96 w-96 object-cover"
            alt={tour.title}
            priority
          />
        </div>
      ) : null}
      <h1 className="text-4xl font-semibold mb-4">{tour.title}</h1>
      <p className="leading-loose mb-6">{tour.description}</p>
      <ul>
        {Array.isArray(tour.stops) &&
          tour.stops.map((stop, index) => {
            return (
              <li key={index} className="mb-4 bg-base-100 p-4 rounded-xl">
                <p>{String(stop)}</p>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default TourInfo;
