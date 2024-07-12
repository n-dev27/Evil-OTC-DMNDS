import React from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { Switch } from '@headlessui/react'
import IsAddressValid from '../../utils/isAddressValid'
import PoolVisibility from '../poolComponents/PoolVisibility'
import TransferPoolOwner from '../poolComponents/TransferPoolOwner'
import edit from '../../assets/edit.svg';

const style = {
  updateButton:
    'cursor-pointer hover:scale-110 text-[#B2BCCC] text-[8px]',
  confirmationUpdateButton:
    'enabled:bg-[#1C76FF] enabled:dark:bg-gray-400 disabled:bg-[#B9BCC7]/50 enabled:hover:scale-110 w-full border border-[#354B75] my-2 text-white rounded-3xl py-2 px-8 text-xl font-semibold flex items-center justify-center enabled:cursor-pointer',
}

function UpdatePoolModal(props) {
  let [isOpen, setIsOpen] = useState(false)


  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const [poolVisibility, setPoolVisibility] = useState(false);

  const [newOwnerAddress, setNewOwnerAddess] = useState('');

  const [preventCancel, setPreventCancel] = useState(false)

  const [isRecipientAddressValid, setIsRecipientAddressValid] = useState(false);

  return (
    <>
      <div onClick={() => openModal()} className={style.updateButton}>
        <Image src={edit} alt='edit' />
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Panel className="overflow max-h-[35rem] w-full max-w-md transform rounded-2xl border border-white bg-[#E6ECF2] p-4 text-left align-middle font-bold text-[#566C90] shadow-xl transition-all dark:border-black dark:bg-slate-600 dark:text-white">
                  <Dialog.Title
                    as="h3"
                    className="text-md flex w-full font-medium leading-6 text-[#8295B3] dark:text-gray-500 md:text-lg"
                  >
                    <div className="flex w-full justify-between">
                      <div className="flex px-2 dark:text-white">Pool Listing Update</div>
                      <div className="flex px-1">
                        <button
                          type="button"
                          className="h-5 w-6 items-center rounded-md border border-transparent bg-transparent text-sm text-black hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  </Dialog.Title>
                      <div className="">
                        <div>
                          <div className="px-2 text-xs font-medium text-[#8295B3] dark:text-gray-500">
                            <div className="flex-col border-b-2 border-gray-300 p-2 text-center dark:text-white">
                              Update Details on Pool Listing
                            </div>
                            <div className='p-2'>
                            <div className="justify-center text-center rounded-2xl bg-[#F5F5F5] shadow-xl">
                              <div className='flex-col p-2'>
                                    <div className='text-base'>Pool Information</div>
                                    <div><a className='font-semibold'>Pool Address:</a> {props.ownedPool}</div>
                                </div>
                                <div className='p-2'>
                                    <a className='text-base'>Show/Hide Pool Listing</a>
                                    <div className='flex justify-center p-2'>
                                        <div>Hide</div>
                                        <div className="flex w-[4rem] justify-center">
                                            <Switch
                                            checked={poolVisibility}
                                            onChange={setPoolVisibility}
                                            className={`${poolVisibility ? 'bg-white' : 'bg-[#A5B1C6]'}
                                                        h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-inner transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                                            >
                                            <span className="sr-only">Use setting</span>
                                            <span
                                                aria-hidden="true"
                                                className={`${poolVisibility ? 'translate-x-3' : '-translate-x-3'}
                                                        -mt-1.5 flex h-6 w-6 rounded-full border border-slate-300 bg-gradient-to-b from-[#3E547E] to-[#7791BB] shadow-xl ring-0 transition duration-300 ease-in-out dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-500`}
                                            />
                                            </Switch>
                                        </div>
                                        <div>Show</div>
                                    </div>
                                    <PoolVisibility tokenAddress={props.tokenAddress} ownedPool={props.ownedPool} visibility={poolVisibility}/>
                                </div>
                                <div className='p-2'>
                                    <a className='text-base'>Transfer Ownership of Pool</a>
                                    <div className="w-full pb-4">
                                      <form>
                                          <label className="flex-inline">
                                              <input
                                              required={true}
                                              type="text"
                                              className="... peer mt-0.5 w-full items-center justify-center rounded-2xl border-none bg-[#E1E5EC] p-1 pl-6 text-center text-[0.55rem] outline-none focus:outline-none focus:ring-transparent dark:text-gray-700 md:p-2 md:pl-4 md:text-xs"
                                              onChange={event => setNewOwnerAddess(event.target.value)}
                                              placeholder="Enter new owners wallet address"
                                              />
                                              <div className="-mt-[1.5rem] flex items-center justify-end px-1 md:px-2">
                                              <IsAddressValid
                                                  recipientAddress={newOwnerAddress ? newOwnerAddress : ''}
                                                  setIsRecipientAddressValid={setIsRecipientAddressValid}
                                              />
                                              </div>
                                              {!isRecipientAddressValid && (
                                              <p className="mt-6 ml-2 text-[.60rem] text-[#1C76FF] dark:text-black md:text-xs">
                                                  Please provide a valid wallet address with no spaces.
                                              </p>
                                              )}
                                          </label>
                                      </form>
                                      <div className="flex justify-between px-2 items-center mt-2">
                                        <div>Prevent Cancellation of Pool?</div>
                                        <div className='flex justify-center p-2'>
                                          <div>No</div>
                                          <div className="flex w-[4rem] justify-center">
                                              <Switch
                                              checked={preventCancel}
                                              onChange={setPreventCancel}
                                              className={`${preventCancel ? 'bg-white' : 'bg-[#A5B1C6]'}
                                                          h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-inner transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                                              >
                                              <span className="sr-only">Use setting</span>
                                              <span
                                                  aria-hidden="true"
                                                  className={`${preventCancel ? 'translate-x-3' : '-translate-x-3'}
                                                          -mt-1.5 flex h-6 w-6 rounded-full border border-slate-300 bg-gradient-to-b from-[#3E547E] to-[#7791BB] shadow-xl ring-0 transition duration-300 ease-in-out dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-500`}
                                              />
                                              </Switch>
                                          </div>
                                          <div>Yes</div>
                                        </div>
                                      </div>
                                    </div>
                                    <TransferPoolOwner tokenAddress={props.tokenAddress} ownedPool={props.ownedPool} newOwner={newOwnerAddress} preventCancel={preventCancel}/>
                                </div>
                            </div>
                            </div>
                          </div>
                        </div>
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

export default UpdatePoolModal
