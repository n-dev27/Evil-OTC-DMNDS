import React, {Fragment, useContext, useState} from "react";
import { FireIcon, ChevronDownIcon, ChevronUpIcon, ArrowTrendingUpIcon } from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';
import { LayoutContext } from "../layout/layout";

export default function HotDropComponent() {
  const { hotButtonFlag, setHotButtonFlag } = useContext(LayoutContext);
  const [isClick, setIsClick] = useState(false);

  return (
    <Menu>
      <Menu.Button className='flex w-fit ssm:min-w-[160px] py-2 px-2 items-center bg-slate-900 text-[#818ea3] hover:bg-slate-700 hover:text-white rounded-l-full justify-center gap-[4px] cursor-pointer'
        onClick={() => setIsClick(!isClick)}
      >
        <FireIcon className="h-5 w-5" color='#ffc762' />
        <p className='hidden ssm:flex text-[12px]'>{hotButtonFlag === 0 ? 'HOT OTC POOLS' : hotButtonFlag === 1 ? 'BY VOLUME' : 'BY DISCOUNT'}</p>
        {isClick ? (
          <ChevronDownIcon className='w-4 h-4' color='white' />
        ) : (
          <ChevronUpIcon className='w-4 h-4' color='white' />
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="flex flex-col absolute left-0 ssm:left-[24px] w-fit mt-[2.5rem] bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <Menu.Item>
            {({ active }) => (
              <a
                className={`${hotButtonFlag === 1 && 'bg-slate-500 rounded-t-md'} flex text-slate-400 px-4 pt-3 pb-2 hover:rounded-t-md hover:text-white text-[12px] cursor-pointer gap-2`}
                onClick={() => {
                  setHotButtonFlag(1);
                }}
              >
                <ArrowTrendingUpIcon className="h-4 w-4" color='#ffc762' />
                by Volume
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                className={`${hotButtonFlag === 2 && 'bg-slate-500 rounded-b-md'} flex text-slate-400 px-4 pt-3 pb-2 hover:rounded-b-md hover:text-white text-[12px] cursor-pointer gap-2`}
                onClick={() => {
                  setHotButtonFlag(2);
                }}
              >
                <ArrowTrendingUpIcon className="w-4 h-4" color='#ffc762' />
                by Discount
              </a>
            )}
              </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}