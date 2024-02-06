'use server';
import { MutationFunction } from '@tanstack/react-query';
import OpenAI from 'openai';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';
import prisma from './db';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (
  chatMessages: ChatCompletionMessage[]
): Promise<{ message: ChatCompletionMessage; tokens: number } | null> => {
  try {
    const response = await openAi.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...chatMessages,
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0,
      max_tokens: 100,
    });
    return {
      message: response.choices[0].message,
      tokens: response.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    return null;
  }
};

interface TourProps {
  city: string;
  country: string;
}

export const generateTourResponse = async ({ city, country }: TourProps) => {
  const query = `Find a exact ${city} in this exact ${country}.
    If ${city} and ${country} exist, create a list of things families can do in this ${city},${country}. 
    Once you have a list, create a one-day tour. Response should be  in the following JSON format: 
    {
      "tour": {
        "city": "${city}",
        "country": "${country}",
        "title": "title of the tour",
        "description": "short description of the city and tour",
        "stops": ["short paragraph on the stop 1 ", "short paragraph on the stop 2","short paragraph on the stop 3"]
      }
    }
    "stops" property should include only three stops.
    Its important to never add , at the last element of the array. Ensure its a valid JSON, with no additional characters.
    If you can't find info on exact ${city}, or ${city} does not exist, or it's population is less than 1, or it is not located in the following ${country},   return { "tour": null }, with no additional characters.`;

  try {
    const response = await openAi.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a tour guide.' },
        { role: 'user', content: query },
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0,
    });
    console.log(response.choices[0].message.content);
    const tourData = JSON.parse(response.choices[0].message.content as string);
    if (!tourData.tour) {
      return null;
    }
    return { tour: tourData.tour, tokens: response.usage?.total_tokens };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getExistingTour = async ({ city, country }: TourProps) => {
  return prisma.tour.findUnique({
    where: {
      city_country: {
        city,
        country,
      },
    },
  });
};

interface NewTourProps {
  city: string;
  country: string;
  title: string;
  description: string;
  stops: string[];
  image: string | null;
}

export interface SavedTourProps {
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

export const createNewTour = async (tour: NewTourProps) => {
  const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;

  const { data } = await axios.get(`${url}${tour.city}`);
  const tourImage = data?.results[0]?.urls?.raw;

  if (tourImage) {
    tour.image = tourImage;
  }

  return prisma.tour.create({
    data: tour,
  });
};

export const getAllTours = async (searchTerm?: string) => {
  if (!searchTerm) {
    const tours = await prisma.tour.findMany({
      orderBy: {
        city: 'asc',
      },
    });
    return tours;
  }

  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
          },
          country: {
            contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      city: 'asc',
    },
  });

  return tours;
};

export const getSingleTour = async (id: string) => {
  return prisma.tour.findUnique({
    where: {
      id,
    },
  });
};

export const generateTourImage = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  try {
    const tourImage = await openAi.images.generate({
      prompt: `Create a panoramic view of the ${city}, ${country}.`,
      n: 1,
      size: '512x512',
    });

    return tourImage?.data[0].url;
  } catch (error) {
    return null;
  }
};

export const fetchUserTokensById = async (clerkId: string) => {
  const result = await prisma.token.findUnique({
    where: {
      clerkId,
    },
  });

  return result?.tokens;
};

export const generateUserTokensForId = async (clerkId: string) => {
  const result = await prisma.token.create({
    data: {
      clerkId,
    },
  });

  return result?.tokens;
};

export const fetchOrGenerateUserTokens = async (clerkId: string) => {
  const result = await fetchUserTokensById(clerkId);
  if (result) {
    return result;
  }

  return await generateUserTokensForId(clerkId);
};

export const subtractTokens = async (clerkId: string, tokens: number) => {
  const result = await prisma.token.update({
    where: {
      clerkId,
    },
    data: {
      tokens: {
        decrement: tokens,
      },
    },
  });

  revalidatePath('/profile');
  return result.tokens;
};
