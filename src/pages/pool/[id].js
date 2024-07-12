import React from 'react';
import { useRouter } from "next/router";
import BuyLayout from '../../components/buyComponents/BuyLayout';

export default function Address() {
  const router = useRouter();
  const id = router.query.id;

  return (
    <div key={id} className='h-full'>
      <BuyLayout poolRouter={id}/>
    </div>
  );
};