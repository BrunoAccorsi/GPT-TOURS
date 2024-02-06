'use client';
import React from 'react';
import TourInfo from './TourInfo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExistingTour,
  generateTourResponse,
  createNewTour,
  fetchUserTokensById,
  subtractTokens,
} from '../utils/actions';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { Tour } from '@prisma/client';
type Props = {};

interface DestinationProps {
  city: string;
  country: string;
}

const NewTour = (props: Props) => {
  const queryClient = useQueryClient();

  const { userId } = useAuth();
  const {
    mutate,
    isPending,
    data: tour,
  } = useMutation({
    mutationFn: async (destination: any) => {
      const existingTour = await getExistingTour(destination);

      if (existingTour) {
        return existingTour;
      }

      const currentTokens = await fetchUserTokensById(userId || '');

      const newTour = await generateTourResponse(destination);
      console.log(currentTokens);
      if ((currentTokens ?? 0) <= 0) {
        toast.error('You do not have enough tokens to create a new tour...');
        return;
      }

      if (!newTour) {
        toast.error('No matching city found...');
        return null;
      }

      if (newTour) {
        await createNewTour(newTour.tour);
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        const newTokens = await subtractTokens(
          userId || '',
          newTour.tokens || 0
        );
        toast.success(`${newTokens} tokens remaining...`);
        return newTour.tour;
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destination = Object.fromEntries(formData.entries());
    mutate(destination);
  };

  if (isPending) {
    return (
      <div className="w-full h-56 flex items-center justify-center">
        <span className="loading loading-ring w-32 h-32"></span>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <h2 className="mb-4">Select your dream destination</h2>
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered join-item w-full"
            placeholder="city"
            name="city"
            required
          />
          <input
            type="text"
            className="input input-bordered join-item w-full"
            placeholder="country"
            name="country"
            required
          />
          <button className="btn btn-primary join-item" type="submit">
            Generate Tour
          </button>
        </div>
      </form>

      <div className="mt-16">
        {tour ? <TourInfo tour={tour as Tour} /> : null}
      </div>
    </>
  );
};

export default NewTour;
