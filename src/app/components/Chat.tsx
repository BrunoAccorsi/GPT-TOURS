'use client';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  fetchUserTokensById,
  generateChatResponse,
  subtractTokens,
} from '../utils/actions';
import toast from 'react-hot-toast';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';
import { useAuth } from '@clerk/nextjs';

type Props = {};

export interface ChatResponse {
  message: ChatCompletionMessage;
  tokens: number;
}

const Chat = (props: Props) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatCompletionMessage[]>([]);
  const { userId } = useAuth();

  const { mutate, isPending, data } = useMutation({
    mutationFn: async (query: ChatCompletionMessage) => {
      const currentTokens = await fetchUserTokensById(userId || '');

      if ((currentTokens ?? 0) <= 0) {
        toast.error('You do not have enough tokens to create a new tour...');
        return;
      }

      const response = await generateChatResponse([...messages, query]);
      if (!response?.message) {
        toast.error('Something went wrong...');
        return;
      }
      setMessages((prev) => [...prev, response.message]);

      const newTokens = await subtractTokens(
        userId || '',
        response.tokens || 0
      );
      toast.success(`${newTokens} tokens remaining...`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = { role: 'user', content: text } as ChatCompletionMessage;
    mutate(query);
    setMessages((prev) => [...prev, query]);
    setText('');
  };
  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr,auto]">
      <div>
        {messages.map(({ role, content }, index) => {
          const avatar = role === 'user' ? '👤' : '🤖';
          const bgc = role === 'user' ? 'bg-base-200' : 'bg-base-100';
          return (
            <div
              key={index}
              className={`${bgc} flex py-6 mx-8 px-8 text-xl leading-loose border-b border-base-300`}
            >
              <span className="mr-4">{avatar}</span>
              <p className="max-w-3xl">{content}</p>
            </div>
          );
        })}
        {isPending && <span className="loaging"></span>}
      </div>
      <form onSubmit={handleSubmit} className="max-w-4xl pt-12">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Message me"
            className="input input-bordered join-item w-full"
            value={text}
            required
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn btn-primary join-item"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Sending...' : 'Ask Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
