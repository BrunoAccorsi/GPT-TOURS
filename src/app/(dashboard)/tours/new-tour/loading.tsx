import React from 'react';

type Props = {};

const loading = (props: Props) => {
  return (
    <div className="w-full h-56 flex items-center justify-center">
      <span className="loading loading-ring w-32 h-32"></span>
    </div>
  );
};

export default loading;
