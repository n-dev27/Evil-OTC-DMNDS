import { Dialog, Transition } from '@headlessui/react'
import { React, Fragment, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid';

export default function NotificationModal({ isOpen, content }) {
  
  const [popUpFlag, setPopUpFlag] = useState(isOpen);

  function closeModal() {
    setPopUpFlag(false);
  };

  function openModal() {};

  return (
    <>
      <Transition appear show={popUpFlag} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={openModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                  <div className='flex w-full justify-between p-4 md:p-5'>
                    <div className='flex gap-2'>
                      <div className='w-8 h-8 flex justify-center items-center'>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-6 w-6 text-gray-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                          />
                        </svg>
                      </div>
                      <p className="flex justify-center items-center text-md text-gray-500">
                        {content === '1' ? 'No token available or the token address wrong!' : 'The website coming soon!'}
                      </p>
                    </div>

                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="course-modal"
                      onClick={() => closeModal()}
                    >
                      <XMarkIcon className='w-6 h-6' />
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>

                  <div className="px-4 pb-4 md:px-5 md:pb-5">
                    {content === '1' && (
                    <button type="button" className="py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
                      onClick={() => closeModal()}
                    >Got it, thanks!</button>
                    )}
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
