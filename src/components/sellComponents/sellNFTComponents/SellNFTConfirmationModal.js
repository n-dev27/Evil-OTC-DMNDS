import React from 'react'
import LoadingSpin from 'react-loading-spin'
import { CheckCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useFeeData, useNetwork } from 'wagmi'

function SellNFTConfirmationModal(props) {
  function afterOpenModal(e) {
    props.onAfterOpen(e, 'After Modal Opened')
  }

  function onModalClose(event) {
    props.onCloseModal(event, 'closed from child')
  }

  const {
    data: feeInfo,
    isError: feeInfoError,
    isLoading: feeInfoLoading,
  } = useFeeData({
    formatUnits: 'gwei',
    watch: true,
  })

  const { chain } = useNetwork()

  const [approvalComplete, setApprovalComplete] = useState()
  /*

    const sellNftAllowance = useContractRead({
        addressOrName: props.inputTokenData?.address,
        contractInterface: erc20ABI,
        functionName: 'allowance',
        args: [ props.userAddress, diamondswapContract],
      })


    const { config: approveListNft, error: approveListNftError } = usePrepareContractWrite({
        addressOrName: props.inputTokenData?.address,
        contractInterface: erc20ABI,
        functionName: 'approve',
        args: [diamondswapContract],
        onError(approveListToken) {
            console.log('Error', approveListNft)
        }
    })

    const {
        data: approveListNftData,
        isLoading: approveListNftLoading,
        isSuccess: approveListNftSuccess,
        write: approveListTokenWrite,
    } = useContractWrite(approveListNft)

    const approveListNftWaitForTransaction = useWaitForTransaction({
        hash: approveListNftData?.hash,
        onSuccess(approveListNftData) {
        console.log('Success', approveListNftData)
        },
        onSettled(approveListNftData) {
            setApprovalComplete(true)
        },
    })

    const { config: listForSellNft, error: listForSellNftError } = usePrepareContractWrite({
        addressOrName: diamondswapContract,
        contractInterface: diamondSwapABI,
        functionName: 'createPool',
        onSuccess(listForSellNft) {
            console.log('Cheese', listForSellNft)
        },
        onError(listForSellNft) {
            console.log('Bacon', listForSellNft)
        }
      })

    const { 
        data: listForSellNftData,
        isLoading: listForSellNftLoading,
        isSuccess: listForSellNftSucess,
        write: listForSellNftWrite,
     } = useContractWrite(listForSellNft)

    const listForSellNftWaitForTransaction = useWaitForTransaction({
        hash: listForSellNftData?.hash,
        onSuccess(listForSellNftData) {
            console.log('Success', listForSellNftData)
          }
      })
    */

  return (
    <>
      <Transition appear show={props.IsModalOpened} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={e => onModalClose(e)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
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
                    className="flex justify-between py-1 text-lg font-bold leading-6 text-gray-500 dark:text-white"
                  >
                    Sell {props.inputNftData?.title} for {props.outputTokenData?.symbol} Confirmation
                    <button
                      type="button"
                      className="-mt-1 flex h-5 w-6 items-center justify-center rounded-md border border-transparent bg-transparent text-center text-sm font-semibold text-black hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={e => onModalClose(e)}
                    >
                      X
                    </button>
                  </Dialog.Title>
                  {props.inputNftData && (
                    <div className="">
                      <div className="flex-col border-b-4 border-gray-300 p-2 text-center">
                        Verify the NFT listing details below and select list for sell when ready!
                      </div>
                      <div className="p-1 text-sm font-semibold">
                        <div className="flex justify-between p-1">
                          <div className="flex items-center">NFT Selling:</div>
                          <div className="flex-col justify-center rounded-md bg-transparent px-1">
                            <img
                              className="flex h-12 w-12 items-center justify-center rounded-xl p-1 md:h-28 md:w-28"
                              src={props.inputNftData?.media[0].gateway}
                            />
                            <div className="xs:text-xs flex justify-center md:text-base md:font-semibold">
                              {props.inputNftData?.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between p-1">
                          <div>NFT Contract:</div>
                          <div>
                            <a
                              target="_blank"
                              className="text-xs text-blue-700"
                              href={`https://etherscan.io/token/${props.inputNftData?.contract.address}`}
                              rel="noreferrer"
                            >{`${props.inputNftData?.contract.address.slice(
                              0,
                              4
                            )}...${props.inputNftData?.contract.address.slice(
                              props.inputNftData?.contract.address.length - 4
                            )}`}</a>
                          </div>
                        </div>
                        <div className="flex justify-between p-1">
                          <div>Token Receiving:</div>
                          <div>{props.outputTokenData?.symbol}</div>
                        </div>
                        <div className="flex justify-between p-1">
                          <div>Token Receiving Amount:</div>
                          <div>{parseFloat(props.outputTokenAmount).toFixed(6)}</div>
                        </div>
                        <div className="flex justify-between p-1">
                          <div>Recipient Type:</div>
                          <div>
                            {props.recipientType?.toString() == 'address' ? (
                              <div>Address</div>
                            ) : (
                              <div>Twitter Handle</div>
                            )}
                          </div>
                        </div>
                        {props.recipientAddress && (
                          <div className="flex justify-center rounded-2xl bg-[#C6CCD6] p-1 text-xs dark:text-gray-800 md:text-sm">
                            {props.recipientAddress}
                          </div>
                        )}
                        {props.recipientHandle && (
                          <div className="flex justify-center rounded-2xl bg-[#C6CCD6] p-1 text-xs dark:text-gray-800 md:text-sm">
                            {props.recipientHandle}
                          </div>
                        )}
                        <div className="flex justify-between p-1">
                          <div>Current Gas Fee:</div>{' '}
                          <div>{parseFloat(feeInfo?.formatted.gasPrice).toFixed(0)} gwei</div>
                        </div>
                      </div>
                      <div className="w-full flex-col justify-center text-center">
                        <div className="w-full p-1">
                          <button
                            hidden="true"
                            className="w-full rounded-2xl bg-blue-400 p-2 text-white enabled:hover:bg-blue-500 dark:bg-gray-400 enabled:dark:hover:bg-gray-500"
                          >
                            {approvalComplete ? (
                              <a className="animate-pulse">Approving...</a>
                            ) : (
                              <a>Approve Diamond Swap to use your {props.inputTokenData?.symbol}</a>
                            )}
                          </button>
                        </div>
                        <div className="w-full p-1">
                          <button className="w-full rounded-2xl bg-blue-400 p-2 text-white enabled:hover:bg-blue-500 dark:bg-gray-400 enabled:dark:hover:bg-gray-500">
                            List for sell
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="hidden justify-center  text-center">
                    {
                      <div>
                        <div className="flex-col p-4">
                          <div className="py-2">Transaction Processing</div>
                          <LoadingSpin
                            animationDuration="2s"
                            width="4px"
                            animationTimingFunction="ease-in-out"
                            animationDirection="alternate"
                            size="150px"
                            primaryColor="#566C90"
                            secondaryColor="#333"
                            numberOfRotationsInAnimation={3}
                          />
                          <div className="py-2">
                            Listing {props.inputTokenData?.symbol} for {props.outputTokenData?.symbol} for{' '}
                            {parseFloat(props.outputTokenAmount).toFixed(6)} {props.outputTokenData?.symbol}
                          </div>
                        </div>
                      </div>
                    }
                    {
                      <div>
                        <div className="flex-col justify-center p-4 text-center">
                          <div className="py-2">Listing {props.inputTokenData?.symbol} Successful</div>
                          <CheckCircleIcon className="h-[12rem] w-[12rem] text-green-400" />
                          <div className="flex justify-center text-xs">
                            <a>Transaction Details</a>
                            <a
                              className="flex items-center px-1"
                              href={chain ? `${chain?.blockExplorers?.default.url}/tx/$` : 'N/A'}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
                            </a>
                          </div>
                          <div className="mt-2">
                            <button
                              className="w-full rounded-2xl bg-blue-400 p-2 text-white hover:bg-blue-500 dark:bg-gray-400 dark:hover:bg-gray-500"
                              onClick={e => onModalClose(e) + props.resetSellPageState()}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                    {
                      <div>
                        <div className="flex-col justify-center p-4 text-center">
                          <div className="py-2">Listing {props.inputTokenData?.symbol} Failure</div>
                          <XCircleIcon className="h-[12rem] w-[12rem] text-red-400" />
                          <div className="flex justify-center text-xs">
                            <a>Transaction Details</a>
                            <div
                              className="flex items-center px-1"
                              href={chain ? `${chain?.blockExplorers?.default.url}/tx/$` : 'N/A'}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />-
                            </div>
                          </div>
                          <div className="mt-2">
                            <button
                              className="w-full rounded-2xl bg-blue-400 p-2 text-white hover:bg-blue-500 dark:bg-gray-400 dark:hover:bg-gray-500"
                              onClick={e => onModalClose(e) + props.resetSellPageState()}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    }
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

export default SellNFTConfirmationModal
