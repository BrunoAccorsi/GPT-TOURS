import React from 'react';
import { UserProfile, auth } from '@clerk/nextjs';
import { fetchUserTokensById } from '@/app/utils/actions';

type Props = {};

const ProfilePage = async (props: Props) => {
  const { userId } = auth();
  let currentTokens; // Declare the currentTokens variable
  if (userId) {
    currentTokens = await fetchUserTokensById(userId); // Assign a value to currentTokens
  }
  const tokenAmount = currentTokens ? currentTokens : 0;
  return (
    <div>
      <h2 className="mb-8 ml-8 text-xl font-extrabold">
        Token Amount : {tokenAmount}
      </h2>{' '}
      {/* Use tokenAmount variable */}
      <UserProfile />;
    </div>
  );
};

export default ProfilePage;
