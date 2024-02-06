import React from 'react';
import TourCard from './TourCard';

type Props = {
  data: any;
};

const ToursList = (props: Props) => {
  if (props.data.length === 0)
    return <h4 className="text-lg">No Tours fund...</h4>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {props.data.map((tour: any) => {
        return <TourCard tour={tour} />;
      })}
    </div>
  );
};

export default ToursList;
