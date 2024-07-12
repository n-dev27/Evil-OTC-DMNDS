import React from 'react'
import { useCookies } from 'react-cookie';
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon, ArrowTopRightOnSquareIcon, InformationCircleIcon } from '@heroicons/react/20/solid'
import {
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
  useNetwork,
} from 'wagmi'
import { Tooltip } from 'flowbite-react'
import { utils } from 'ethers'
import { Toast } from 'flowbite-react'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const style = {
  buyButton:
    'enabled:bg-[#1C76FF] disabled:bg-[#B9BCC7]/50 cursor-pointer w-full text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center',
  confirmationBuyButton:
    'enabled:bg-[#1C76FF] disabled:bg-[#B9BCC7]/50 enabled:hover:scale-105 w-full shadow text-white rounded-3xl py-4 text-2xl font-roboto flex items-center justify-center enabled:cursor-pointer',
  CancelButton: 'bg-slate-700 hover:scale-105 w-full shadow text-white rounded-3xl py-4 text-2xl font-roboto flex items-center justify-center enabled:cursor-pointer',

  sellInput: 'flex w-full min-h-[117px] justify-between bg-white bg-opacity-10 rounded-xl shadow md:px-5 md:py-4',
  sellInputText: 'w-full text-sm text-white font_Inter',
  sellInputBalanceContainer: 'flex flex-col items-center',
  sellInputBalance: 'flex w-full justify-end items-center text-sm text-slate-400 font_Inter',
  sellInputSelector: 'flex justify-start rounded-lg font-roboto',
  sellInputMaxButton:
    'flex h-5 w-10 justify-center text-center items-center bg-[#192846] hover:animate-pulse text-white text-xs rounded-md',
  sellInputInputContainer: 'flex justify-end items-center text-white text-[1.6rem] pt-1',
  sellInputAmount:
    'defaultPlaceholder flex w-full justify-end text-white font-[Abel] bg-transparent text-3xl border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellInputValue: 'flex w-full justify-end text-sm text-slate-400 font_Inter',

  sellOutput: 'flex w-full min-h-[117px] justify-between bg-white bg-opacity-10 rounded-xl shadow md:px-5 md:py-4',
  sellOutputText: 'w-full text-sm text-white font_Inter',
  sellOutputBalanceContainer: 'flex flex-col items-center',
  sellOutputBalance: 'flex w-full justify-end items-center text-sm text-slate-400 font_Inter',
  sellOutputSelector: 'flex justify-start rounded-lg font-roboto',
  sellOutputInputContainer: 'flex justify-end items-center text-white text-[1.6rem] pt-1',
  sellOutputAmount:
  'defaultPlaceholder flex w-full justify-end text-white font-[Abel] bg-transparent text-3xl border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellOutputValue: 'flex w-full justify-end text-sm text-slate-400 font_Inter',
}

function BuyConfirmationModal(props) {

  let [isOpen, setIsOpen] = useState(false)

  let [modalKey, setModalKey] = useState('')

  const [cookies, setCookie] = useCookies(undefined);

  function closeModal() {
    setIsOpen(false)
    setModalKey('')
    setCookie(undefined)
  }

  function openModal() {
    setIsOpen(true)
    setCookie(['reseller'])
  }

  useEffect(() => {
    if(!isOpen){
      setModalKey('')
    }
  }, [isOpen])


  const { chain } = useNetwork()

  const [buyFromPoolAmount, setBuyFromPoolAmount] = useState('')

  const [buyFromPoolPrice, setBuyFromPoolPrice] = useState()

  const [buyFromPoolRange, setBuyFromPoolRange] = useState()

  const { config: buyFromPool } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'buyFromPool',
    enabled: 
    isOpen &&
      ((props.buyType || (props.buyType == '2')
      ? buyFromPoolAmount > '0'
      : props.buyTokenFixedPrice > '0') || props.buyType == '1'),
    args: [
      props.buyTokenPoolAddress,
      props.buyType == '1' ? (props?.buyTokenAmountAvailable && utils.parseUnits(props?.buyTokenAmountAvailable?.toString(), props.buyTokenDecimals)?.toString()) : (buyFromPoolAmount && utils.parseUnits(buyFromPoolAmount, props.buyTokenDecimals)?.toString()),
      "",
    ],
    value:
      (props.buyType == '1' && props.buyTokenFixedPrice > '0' && utils.parseEther(props.buyTokenFixedPrice.toString()).toString()) ||
      (props.buyType == '2') && props.buyTokenFixedPrice > '0' && (buyFromPoolAmount * props.buyTokenPrice).toString() ||
      (props.buyType == '1' && props.buyTokenFixedPrice <= '0' && utils.parseUnits((props.buyTokenAmountAvailable * props.buyTokenNativePrice).toString(),props.buyTokenDecimals).toString()) || 
      (props.buyType == '2') && props.buyTokenFixedPrice <= '0' && utils.parseUnits((buyFromPoolAmount * props.buyTokenNativePrice).toString(),props.buyTokenDecimals).toString(),
    onSuccess(listForSellToken) {
      console.log('Ready to buy', buyFromPool)
    },
    onError(listForSellToken) {
      console.log('Ready to buy Error', buyFromPool)
    },
  })

  const {
    data: buyFromPoolTokenData,
    isLoading: buyFromPoolLoading,
    isSuccess: buyFromPoolStarted,
    error: buyFromPoolError,
    write: buyFromPoolWrite,
  } = useContractWrite(buyFromPool)

  const buyFromPoolWaitForTransaction = useWaitForTransaction({
    hash: buyFromPoolTokenData?.hash,
    onSuccess(buyFromPoolTokenData) {
      console.log('Success', buyFromPoolTokenData)
    },
  })

  return (
    <>
      <button 
        onClick={() => {props.setModalKey(props.modalKey); props.setIsFlipped(true);}} 
        className={`${props.type === "mobile" ? "text-xs font-roboto py-3 rounded-[14.50px]" : "text-[7px] font-bold font_Inter px-4 py-1 rounded-3xl"} bg-[#1B75FF] w-full text-white flex items-center justify-center`}>
        Buy Now
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={e => closeModal(e)}>
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
                <Dialog.Panel className="max-w-[625px] max-h-[730px] overflow w-full transform rounded-[20px] bg-gray-200 dark:bg-[rgba(255,255,255,0.07)] px-5 py-8 text-left align-middle font-bold text-[#566C90] shadow-[0_0_12px_8px_rgba(28,118,255,0.5)] transition-all dark:text-white">
                  <Dialog.Title
                    as="h3"
                    className="text-md flex w-full font-medium leading-6 text-[#8295B3] dark:text-gray-500 md:text-lg"
                  >
                    <div className="flex w-full justify-between">
                      <div className="flex text-black dark:text-slate-50 text-2xl font-roboto">Buy {props.buyTokenName} Confirmation {cookies.Reseller}</div>
                      <div className="flex">
                        <button
                          type="button"
                          className="h-6 w-6 items-center rounded-md border border-transparent bg-transparent text-white hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          onClick={e => closeModal(e)}
                        >
                          <XMarkIcon />
                        </button>
                      </div>
                    </div>
                  </Dialog.Title>
                  {!buyFromPoolStarted &&
                    !buyFromPoolWaitForTransaction.isSuccess &&
                    !buyFromPoolWaitForTransaction.isError && (
                      <div className="">
                        <div>
                          <div className="flex flex-col gap-[6px] font-normal text-[#8295B3] dark:text-gray-500">
                            <div className="flex-col pb-2 dark:text-slate-50 text-[19px] font-roboto">
                              Verify the buy details below and select ‘Buy from Pool’ when ready!
                            </div>

                            <div className={style.sellInput}>
                              <div className="flex flex-col gap-1.5">
                                <div className={style.sellInputText}>Enter Amount to Spend:</div>
                                <div className="flex items-center">
                                  <button type="button" className={style.sellInputSelector}>
                                    ETH
                                  </button>
                                  {/* {inputTokenData && tokenInputBalance > 0 && (
                                    <div className={style.sellInputMaxButton}>
                                      <button onClick={() => props.setInputTokenAmount(tokenInputBalance.toString())}>MAX</button>
                                    </div>
                                  )} */}
                                </div>
                              </div>
                              <div className={style.sellInputBalanceContainer}>
                                <div className={style.sellInputBalance}>
                                  Balance:&nbsp;
                                  {/* {address && tokenInputBalance && (inputTokenData?.address || inputTokenData?.symbol) ? (
                                    <div>{Number(parseFloat(tokenInputBalance).toFixed(4))?.toLocaleString()}</div>
                                  ) : (
                                    <div>-</div>
                                  )} */}
                                </div>
                                <div className={style.sellInputInputContainer}>
                                  <input
                                    className={style.sellInputAmount}
                                    // disabled={!inputTokenData}
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    placeholder="0.0"
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    minLength="1"
                                    maxLength="79"
                                    // value={props.inputTokenAmount}
                                    // onChange={
                                    //   inputTokenData
                                    //     ? event => {
                                    //         props.setInputTokenAmount(event.target.value)
                                    //         props.setOutputTokenMarketAmount(true)
                                    //       }
                                    //     : null
                                    // }
                                    onKeyPress={event => {
                                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                        event.preventDefault()
                                      }
                                    }}
                                  />
                                </div>
                                <div className={style.sellInputValue}>$$$</div>
                                {/* {props.inputTokenAmount && tokenAmountValue && (
                                    <div className={style.sellInputValue}>
                                      <a>{'$' + Number(tokenAmountValue).toLocaleString(undefined, {maximumFractionDigits: 2}) + ''}</a>
                                    </div>
                                  )} */}
                              </div>
                            </div>

                            <div className="absolute top-[12.4rem] left-[17rem] w-[50px] h-[40px] flex justify-center items-center bg-slate-700 rounded-lg shadow border-[5px] border-[#1A2346]">
                              <p className="text-base text-slate-50 font-roboto">OR</p>
                            </div>


                            <div className={style.sellOutput}>
                              <div className="flex flex-col gap-1.5">
                                <div className={style.sellOutputText}>Enter Amount to Receive:</div>
                                <button type="button" className={style.sellOutputSelector}>
                                  DMNDS
                                </button>
                              </div>
                              <div className={style.sellOutputBalanceContainer}>
                                <div className={style.sellOutputBalance}>
                                  Balance:&nbsp;
                                  {/* {address && (outputTokenData?.address || outputTokenData?.symbol) ? (
                                    <div>{Number(parseFloat(tokenOutputBalance).toFixed(4))?.toLocaleString()}</div>
                                  ) : (
                                    <div>-</div>
                                  )} */}
                                </div>
                                <div className={style.sellOutputInputContainer}>
                                  <input
                                    className={style.sellOutputAmount}
                                    // disabled={!outputTokenData || props.sellOptions == 'existingpool'}
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    placeholder="0.0"
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    minLength="1"
                                    maxLength="79"
                                    // value={props.outputTokenAmount}
                                    // onChange={
                                    //   outputTokenData
                                    //     ? event => {
                                    //         props.setOutputTokenAmount(event.target.value)
                                    //         props.setOutputTokenMarketAmount(false)
                                    //       }
                                    //     : null
                                    // }
                                    onKeyPress={event => {
                                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                        event.preventDefault()
                                      }
                                    }}
                                  />
                                </div>

                                <div className={style.sellOutputValue}>
                                  $$$$
                                </div>
                                  {/* {props.outputTokenAmount && props.outputTokenMarketAmount && tokenAmountValue && (
                                    <div className={style.sellOutputValue}>
                                      {'$' + (tokenAmountValue)?.toLocaleString() + ''}
                                    </div>
                                  )} */}
                              </div>
                            </div>


                              {/* <div className="m-2 p-2">
                                <div className="flex justify-between py-1">
                                  <p>Asset Buying</p>
                                  <p className="text-black">
                                    {props.buyTokenName} ({props.buyTokenSymbol})
                                  </p>
                                </div>
                                {props.buyType && (props.buyType == '2' || props.buyType == '3') && (
                                  <div className="flex justify-between py-1">
                                    <p>Amount Available</p>
                                    <p className="text-black">
                                      {props.buyTokenAmountAvailable ?
                                        (props.buyTokenAmountAvailable?.toString())?.toLocaleString() : 'N/A'}
                                    </p>
                                  </div>
                                )}
                                <div className="flex justify-between py-1">
                                  <div className="flex items-center">
                                    <p>Buying Amount</p>
                                    {props.buyType && (props.buyType == '2' || props.buyType == '3') && (
                                      <div className="px-1">
                                        <button
                                          className="flex h-4 w-8 items-center justify-center rounded-md bg-[#192846] text-center text-[0.6rem] text-white hover:animate-pulse"
                                          onClick={() => setBuyFromPoolAmount(props.buyTokenAmountAvailable)}
                                        >
                                          MAX
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {props.buyType && (props.buyType == '2' || props.buyType == '3') ? (
                                    <div className="flex h-5 items-center justify-end text-end md:h-8">
                                      <input
                                        className="flex h-full w-32 justify-end rounded-md border-none bg-[#FFFFFF] px-1 text-end text-[#354B75] outline-none focus:outline-none focus:ring-transparent dark:bg-gray-200 md:w-auto md:rounded-lg"
                                        type="text"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        placeholder="0.0"
                                        pattern="^[0-9]*[.,]?[0-9]*$"
                                        minLength="1"
                                        maxLength="79"
                                        value={
                                          props.buyType &&
                                          (props.buyType == '2' || props.buyType == '3') &&
                                          buyFromPoolAmount
                                        }
                                        onChange={event => setBuyFromPoolAmount(event.target.value)}
                                        onKeyPress={event => {
                                          if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                            event.preventDefault()
                                          }
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-black">{props.buyTokenAmountAvailable}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-between py-1">
                                  <p>{props.buyTokenSymbol} Market Value: </p>
                                  <p className="text-black">
                                    {props.buyType == '2' || props.buyType == '3' ?
                                      parseFloat((buyFromPoolAmount * props.buyTokenNativePrice) / 10 ** props.payTokenDecimals).toFixed(4)
                                      : parseFloat((props.buyTokenAmountAvailable * props.buyTokenNativePrice) / 10 ** props.payTokenDecimals).toFixed(4)}{' '}
                                    {props.payTokenSymbol}
                                  </p>
                                </div>
                                {props.buyDiscount > '0' && (
                                  <div className="flex justify-between py-1">
                                    <p>Discount:</p>
                                    <p className="text-black">{props.buyDiscount}%</p>
                                  </div>
                                )}
                                <div className="flex justify-between py-1">
                                  <p>Buy Price:</p>
                                  <p className="text-black">
                                  {props.buyTokenFixedPrice > '0' && props.buyType == '1'
                                    ? parseFloat(props.buyTokenFixedPrice).toFixed(4)
                                    : parseFloat((buyFromPoolAmount * props.buyTokenPrice) / 10 ** props.payTokenDecimals).toFixed(4)}{' '}
                                    {props.payTokenSymbol}
                                  </p>
                                </div>
                                {props.buyVestingInitialAmount > '0' && (
                                  <>
                                    <div className="flex justify-center border-b border-gray-500 py-1">
                                      Vesting Details
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <p>Initial Release</p>
                                      <p className="text-black">
                                        {(props.buyTokenAmountAvailable * props.buyVestingInitialAmount) / '100'}{' '}
                                        {props.buyTokenSymbol}
                                      </p>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <p>Distribution Schedule</p>
                                      <p className="text-black">
                                        {props.buyVestingSchedulePercent}%/{props.buyVestingScheduleTimeframe}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div> */}


                          </div>
                        </div>
                        <div className="py-4 flex flex-col">
                          <div className="flex gap-2 text-slate-400 text-base font-roboto">
                            <div className="flex items-center">
                              <Tooltip
                                animation="duration-500"
                                content="If recipient is known, specify the recipients wallet address or twitter handle."
                              >
                                <InformationCircleIcon className="h-4 w-4" />
                              </Tooltip>
                            </div>
                            {' '}
                            Output is estimated
                          </div>
                          <div className="flex text-black dark:text-white text-base font-roboto">
                            You will receive at least
                            <a className="flex items-center text-[#8295B3] dark:text-blue-600">&nbsp;0.1154 {props.payTokenSymbol}&nbsp;</a>
                            or the transaction will revert.
                          </div>
                        </div>
                        <div className="py-4 text-xl text-[#8295B3] dark:text-slate-50 font-roboto">
                          <div className="flex flex-col gap-[6px]">
                            <div className="flex justify-between">
                              <p>Market Price Per Token</p>
                              <p className="text-black dark:text-gray-400">650 Diamond / {props.payTokenSymbol}</p>
                            </div>
                            <div className="flex justify-between">
                              <p>Discount</p>
                              <p className="text-black dark:text-gray-400">0.10778 {props.payTokenSymbol}</p>
                            </div>
                            <div className="flex justify-between">
                              <p>Your Price Per Token</p>
                              <p className="text-black dark:text-gray-400">.10%</p>
                            </div>
                            <div className="flex justify-between">
                              <p>Vesting</p>
                              <p className="text-black dark:text-gray-400">0.000458</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                          <button
                            disabled={
                              props.buyType && (props.buyType == '2' || props.buyType == '3')
                                ? !buyFromPoolAmount
                                : !props.buyTokenAmountAvailable
                            }
                            onClick={() => buyFromPoolWrite?.()}
                            className={style.confirmationBuyButton}
                          >
                            {props.buyType == '1' && 'Buy 1 to 1'}
                            {(props.buyType == '2' || props.buyType == '3') && 'Buy from Pool'}
                          </button>

                          <button
                            onClick={e => closeModal(e)}
                            className={style.CancelButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  <div className="hidden flex-col text-xs">
                    <div className="text-red-500">*****TEMP INFORMATION*****</div>
                    <div>Pool Address: {props.buyTokenPoolAddress}</div>
                    <div>Buy Amount:{props.buyType == '1' ? props.buyTokenAmountAvailable : buyFromPoolAmount}</div>
                    <div>
                      Price:{' '}
                      {props.buyTokenFixedPrice > '0' && props.buyType == '1'
                        ? parseFloat(props.buyTokenFixedPrice).toFixed(2)
                        : parseFloat((buyFromPoolAmount * props.buyTokenPrice) / 10 ** props.payTokenDecimals).toFixed(18)}
                    </div>
                    <div>
                      Price In Wei:{' '}
                      {
                      (props.buyType == '1' && props.buyTokenFixedPrice > '0' && utils.parseEther(props.buyTokenFixedPrice.toString()).toString()) ||
                      (props.buyType == '2' || props.buyType =='3') && props.buyTokenFixedPrice > '0' && (buyFromPoolAmount * props.buyTokenPrice).toString() ||
                      (props.buyType == '1' && props.buyTokenFixedPrice <= '0' && (props.buyTokenAmountAvailable * props.buyTokenNativePrice).toString()) ||
                      (props.buyType == '2' || props.buyType =='3') && props.buyTokenFixedPrice <= '0' && (buyFromPoolAmount * props.buyTokenNativePrice).toString()
                      }
                    </div>
                    <div>Range: {buyFromPoolRange}</div>
                  </div>
                  <div className="text-[#566B90] dark:text-white">
                    <div className="flex w-full justify-center">
                      {buyFromPoolStarted && !buyFromPoolWaitForTransaction.isSuccess && (
                        <div>
                          <div className="flex-col p-4">
                            <div className="py-2">Transaction Processing</div>
                            <video className="-mt-16 h-auto w-full max-w-full" autoPlay muted loop>
                              <source src="/videos/dswap_loader.webm" type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                      {buyFromPoolWaitForTransaction.isSuccess && (
                        <div>
                          <div className="flex-col justify-center text-center">
                            <div className="py-2">Purchase of {props.buyTokenName} Successful</div>
                            <div className="flex justify-center text-center">
                              <CheckCircleIcon className="h-[12rem] w-[12rem] text-green-400" />
                            </div>
                            <div className="flex justify-center text-center text-xs">
                              <a>Transaction Details</a>
                              <a
                                className="flex items-center px-1"
                                href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
                              </a>
                            </div>
                            <div className="mt-2">
                              <button
                                className="w-full rounded-2xl bg-blue-400 p-2 text-white hover:bg-blue-500 dark:bg-gray-400 dark:hover:bg-gray-500"
                                onClick={e => closeModal(e)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {buyFromPoolWaitForTransaction.isError && (
                        <div>
                          <div className="flex-col justify-center p-4 text-center">
                            <div className="py-2">Purchase of {props.buyTokenName} Failure</div>
                            <div className="flex justify-center text-center">
                              <XCircleIcon className="h-[12rem] w-[12rem] text-red-400" />
                            </div>
                            <div className="flex justify-center text-xs">
                              <a>Transaction Details</a>
                              <a
                                className="flex items-center px-1"
                                href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
                              </a>
                            </div>
                            <div className="mt-2">
                              <button
                                className="w-full rounded-2xl bg-blue-400 p-2 text-white hover:bg-blue-500 dark:bg-gray-400 dark:hover:bg-gray-500"
                                onClick={e => closeModal(e)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {buyFromPoolStarted && !buyFromPoolWaitForTransaction.isSuccess && !props.IsModalOpened && (
        <Toast>
        <div className="space-x absolute right-5 top-20 hidden max-w-xs items-center space-x-4 divide-x divide-gray-200 rounded-lg bg-white p-4 text-gray-500 shadow dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-400 md:flex">
          <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-500 dark:text-white">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Info</span>
          </div>
          <div className="flex-col text-[#566C90] dark:text-white">
            <div className="ml-1 text-sm font-normal">Transaction Processing</div>
            <div className="ml-1 flex items-center text-xs">
              Purchasing {props.buyTokenSymbol}.
              <a
                className="flex items-center px-1 text-xs text-blue-400"
                href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
              </a>
            </div>
          </div>
          <Toast.Toggle />
          </div>
        </Toast>
      )}
      {buyFromPoolWaitForTransaction.isSuccess && !props.IsModalOpened && (
        <Toast>
          <div className="space-x absolute right-5 top-20 hidden max-w-xs items-center space-x-4 divide-x divide-gray-200 rounded-lg bg-white p-2 text-gray-500 shadow dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-400 md:flex">
            <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-500 dark:text-white">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Check icon</span>
            </div>
          <div className="flex-col text-[#566C90] dark:text-white">
            <div className="ml-1 text-sm font-normal">Purchase of {props.buyTokenName} Successful</div>
            <a
              className="flex items-center px-1 text-xs text-blue-400"
              href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Transaction: <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
            </a>
          </div>
          <Toast.Toggle />
        </div>
        </Toast>
      )}
      {buyFromPoolWaitForTransaction.isError && !props.IsModalOpened && (
        <Toast>
        <div className="space-x absolute right-5 top-20 hidden max-w-xs items-center space-x-4 divide-x divide-gray-200 rounded-lg bg-white p-4 text-gray-500 shadow dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-400 md:flex">
          <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-white">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Error icon</span>
          </div>
          <div className="flex-col text-[#566C90] dark:text-white">
            <div className="ml-3 text-sm font-normal">Purchase of {props.buyTokenName} Failure</div>
            <div
              className="flex items-center px-1 text-xs text-blue-400"
              href={`${chain?.blockExplorers?.default?.url}/tx/${buyFromPoolTokenData?.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowTopRightOnSquareIcon className="h-3 w-3 items-center" />
            </div>
          </div>
          <Toast.Toggle />
          </div>
        </Toast>
      )}
    </>
  )
}

export default BuyConfirmationModal
