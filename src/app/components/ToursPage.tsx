'use client';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getAllTours } from '../utils/actions';
import ToursList from './ToursList';

type Props = {};

const TourPage = (props: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const { data, isPending } = useQuery({
    queryKey: ['tours', searchValue],
    queryFn: () => getAllTours(searchValue),
  });
  return (
    <>
      <form className="max-w-lg mb-12">
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered join-item w-full"
            placeholder="Enter city ot Country here..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            required
          />
          <button
            type="button"
            className="btn btn-primary join-item"
            disabled={isPending}
            onClick={() => setSearchValue('')}
          >
            {isPending ? 'Please Wait...' : 'Reset'}
          </button>
        </div>
      </form>
      {isPending ? (
        <span className="loading"></span>
      ) : (
        <ToursList data={data} />
      )}
    </>
  );
};

export default TourPage;
