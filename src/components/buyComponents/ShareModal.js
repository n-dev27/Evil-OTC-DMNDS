import { React, Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ClipboardIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';
import { useCopyToClipboard } from "usehooks-ts";
import { Tooltip } from "@material-tailwind/react";

export default function ShareModal({ isOpen, setIsOpen, poolInfo }) {

  const id = encodeURIComponent('?' + poolInfo.poolAddress);

  const [copyFlag, setCopyFlag] = useState(false);
  const [urlValue, setUrlValue] = useState(process.env.NEXT_PUBLIC_UNIQUE_ROUTER + `/pool/${id}`);
  const [value, copy] = useCopyToClipboard();

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => { };
  
  const handleOnCopy = () => {
    copy(urlValue);
    setCopyFlag(true);
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => openModal()}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[20px]" aria-hidden="true" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[38rem] transform overflow-hidden rounded-2xl shadow bg-[rgba(22,41,48,0.8)] text-left align-middle transition-all border border-[rgba(255,255,255,0.1)]">
                  <div className="flex items-center justify-between p-4 md:p-5">
                    <h3 className="text-lg text-[rgba(255,255,255,0.8)] font-[Inter] font-semibold">
                      Share link
                    </h3>
                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="course-modal"
                      onClick={() => closeModal()}
                    >
                      <XMarkIcon className='w-6 h-6' />
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>

                  <div className='px-4 pb-4 md:px-5 md:pb-5'>
                    <label htmlFor="course-url" className="text-sm text-[rgba(255,255,255,0.6)] font-[Inter] mb-2 block">Share the link below with your friends:</label>
                    <div className="relative mb-4">
                      <input id="course-url" type="text" className="pr-[2.5rem] col-span-6 bg-[rgba(255,255,255,0.05)] font-[Inter] border-none text-[rgba(255,255,255,0.2)] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={urlValue} disabled readOnly />
                      <Tooltip
                        className='z-20 font-[Inter]'
                        content={copyFlag ? "Copied!" : "Copy to clipboard"}
                        animate={{
                          mount: { scale: 1, y: 0 },
                          unmount: { scale: 0, y: 25 },
                        }}
                      >
                        <button className="absolute end-2 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] font-[Inter] hover:bg-[rgba(255,255,255,0.2)] rounded-lg p-2 inline-flex items-center justify-center"
                          onClick={() => handleOnCopy()}  
                        >
                          {copyFlag ? (
                            <CheckIcon className='w-3.5 h-3.5' />
                          ) : (
                            <ClipboardIcon className='w-3.5 h-3.5' />
                          )}   
                        </button>
                      </Tooltip>
                    </div>
                    <button type="button" className="py-1 px-4 text-sm font-medium text-[rgba(255,255,255,0.6)] font-[Inter] focus:outline-none bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] hover:text-[rgba(255,255,255,0.8)] focus:z-10 focus:ring-4 focus:ring-gray-200"
                      onClick={() => closeModal()}
                    >Close</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
