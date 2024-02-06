import { UserButton, auth, currentUser } from '@clerk/nextjs';
import React from 'react';
import { fetchOrGenerateUserTokens } from '../utils/actions';

type Props = {};

const MemberProfile = async (props: Props) => {
  const user = await currentUser();
  const { userId } = auth();

  if (userId) {
    await fetchOrGenerateUserTokens(userId);
  }
  return (
    <div className="px-4 flex items-center gap-2">
      <UserButton afterSignOutUrl="/" />
      <p>{user?.emailAddresses[0].emailAddress}</p>
    </div>
  );
};

export default MemberProfile;
