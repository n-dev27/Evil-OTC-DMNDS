import React, { Fragment, useState } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/router';
import { utils } from 'ethers'
import { XMarkIcon, XCircleIcon, ArrowUpRightIcon, InformationCircleIcon } from '@heroicons/react/20/solid'
import { Dialog, Transition } from '@headlessui/react'
import Switch from 'react-switch';
import {
  useFeeData,
  useNetwork,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { erc20ABI } from 'wagmi'
import { Tooltip } from 'flowbite-react'
import { countLeadingZerosAfterDecimal } from '../../../utils/countDecimals';
import diamondSwapABI from '../../../constants/contracts/diamondSwapABI.json'
import checkLogo from '../../../assets/check_logo.svg'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT;
const minDSPoolAmount = process.env.NEXT_PUBLIC_DS_MIN_POOL_OPTIONS;

function SellTokenConfirmationModal(props) {
  const router = useRouter();

  function afterOpenModal(e) {
    props.onAfterOpen(e, 'After Modal Opened');
  };

  function onModalClose(event) {;
    props.onCloseModal(event, 'closed from child');
  };

  const [hidePool, setHidePool] = useState(false);

  const {
    data: feeInfo,
    isError: feeInfoError,
    isLoading: feeInfoLoading,
  } = useFeeData({
    formatUnits: 'gwei',
    watch: true,
    enabled: props.IsModalOpened,
  });

  const { chain } = useNetwork();

  let outputAmountToWei = ''

  if (props.IsModalOpened) {
    let inputTokenAmountToWei = BigInt(
      utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals)
    )
  }

  if (
    props.IsModalOpened &&
    !props.outputTokenMarketAmount &&
    props.outputTokenAmount > '0' &&
    props.outputTokenAmount != '' &&
    props.outputTokenAmount != 'NaN'
  ) {
    outputAmountToWei = utils.parseEther(props.outputTokenAmount.toString()).toString()
  }

  let poolType = 0

  if (
    (props.sellOptions == 'newpool' && props.recipient == 'public' && props.allowPartialBuys == 'no') ||
    (props.sellOptions == 'newpool' && props.recipient == 'private')
  )
    poolType = 1
  if (props.sellOptions == 'newpool' && props.recipient == 'public' && props.allowPartialBuys == 'yes') poolType = 2
  if (props.sellOptions == 'newpool' && props.recipient == 'public' && props.outputTokenAmount < minDSPoolAmount)
    poolType = 3
  if (props.sellOptions == 'existingpool') poolType = 3

  const [approvalComplete, setApprovalComplete] = useState()

  const sellTokenAllowance = useContractRead({
    address: props.inputTokenData?.address,
    abi: erc20ABI,
    enabled: props.sellOptions && props.inputTokenAmount > '0' && props.outputTokenAmount > '0',
    functionName: 'allowance',
    args: [
      props.userAddress,
      diamondswapContract,
    ],
    onSuccess(data) {
      if (sellTokenAllowance) {
        if ( 
          props.inputTokenAmount &&
          props.inputTokenData?.decimals &&
          BigInt(sellTokenAllowance?.data?.toString()) >=
            BigInt(utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals))
        ) {
          setApprovalComplete(true)
        } else {
          setApprovalComplete(false)
        }
      } else {
        setApprovalComplete(false)
      }
      
    },
  })

  const { config: approveListToken } = usePrepareContractWrite({
    address: props.inputTokenData?.address,
    abi: erc20ABI,
    enabled: props.IsModalOpened && !approvalComplete,
    functionName: 'approve',
    args: [
      diamondswapContract,
      BigInt(utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals)).toString(),
    ],
    onError(approveListTokenError) {
      console.log('Approve Error', approveListTokenError)
    },
  })

  const {
    data: approveListTokenData,
    isLoading: approveListTokenLoading,
    isSuccess: approveListTokenStarted,
    error: approveListTokenError,
    write: approveListTokenWrite,
  } = useContractWrite(approveListToken)

  const { isSuccess: approveListTokenTxSuccess } = useWaitForTransaction({
    hash: approveListTokenData?.hash,
    onSuccess(approveListTokenData) {
      console.log('Success', approveListTokenData)
    },
    onSettled() {
      setApprovalComplete(true)
    },
  })

  const { config: listForSellToken } = usePrepareContractWrite({
    address: diamondswapContract,
    abi: diamondSwapABI,
    functionName: 'createPool',
    enabled: props.IsModalOpened && (approvalComplete || approveListTokenTxSuccess),
    args: [
      props.vestingPeriodOption
        ? [
            props.vestingPeriodPercent != '' ? props.vestingPeriodPercent * '10' : 0,
            props.vestingPeriodTimeframe != '' ? props.vestingPeriodTimeframe?.time.toString() : 0,
            props.vestingInitialAmount != '' ? props.vestingInitialAmountPercent * '10' : 0,
          ]
        : [0, 0, 0],
      poolType,
      [
        props.vestingPeriodOption,
        props.outputTokenMarketAmount?.toString() == 'false' ? true : false,
        hidePool,
        props.preventCanel == 'yes' ? true : false,
        false
      ],
      utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals).toString(),
      props.recipient == 'private' && props.recipientType == 'address'
        ? [props.recipientAddress]
        : ['0x0000000000000000000000000000000000000000'],
      props.recipient == 'private' && props.recipientType == 'address' ? [utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals).toString()] : [0],
      props.recipient == 'private' && props.recipientType == 'twitter' ? [props.recipientHandle?.toString()] : [''],
      props.recipient == 'private' && props.recipientType == 'twitter' ? [utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals).toString()] : [0],
      [props.inputTokenData?.address,props.newOwner == 'yes' ? props.newOwnerAddress : props.userAddress],
      [props.discountOption?.toString() == 'true'
        ? props.selectedDiscount == 'custom'
          ? props.customDiscount * '10'
          : props.selectedDiscount
        : 0, props.outputTokenMarketAmount.toString() == 'false' && Number(props?.outputTokenAmount) > 0
        ? utils.parseEther(Number(props?.outputTokenAmount)?.toFixed(10)).toString()
        : '0'],
    ],
    onSuccess(listForSellToken) {
      console.log('Ready to list Success', listForSellToken)
    },
    onError(listForSellToken) {
      console.log('Ready to list Error', listForSellToken)
    },
  })

  const {
    data: listForSellTokenData,
    isLoading: listForSellTokenLoading,
    isSuccess: listForSellTokenStarted,
    error: listForSellTokenError,
    write: listForSellTokenWrite,
  } = useContractWrite(listForSellToken)

  const listForSellTokenWaitForTransaction = useWaitForTransaction({
    hash: listForSellTokenData?.hash,
    onSuccess(listForSellTokenData) {
      console.log('Success!!!!', listForSellTokenData)
    },
  })

  return (
    <>
      <Transition appear show={props.IsModalOpened} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={e => afterOpenModal(e)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[12px]" aria-hidden="true" />
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
                <Dialog.Panel className={`${listForSellTokenStarted && !listForSellTokenWaitForTransaction.isSuccess || listForSellTokenWaitForTransaction.isSuccess ? 'h-[418px] sm:h-[640px]' : 'max-h-[626px] sm:max-h-[754px]'} min-w-[350px] w-full sm:w-[720px] transform rounded-2xl border-[1.2px] border-[rgba(255,255,255,0.1)] bg-[rgba(40,24,85,0.6)] p-1 pt-5 sm:p-6 shadow-[rgba(0,0,0,0.16)] transition-all`}>
                  <Dialog.Title
                    as="h3"
                    className={`${listForSellTokenStarted && !listForSellTokenWaitForTransaction.isSuccess ? 'hidden' : 'flex'} flex-col gap-4 relative w-full justify-center items-center px-4`}
                  >
                    <span className='text-[rgba(255,255,255,0.8)] text-[20px] sm:text-[28px] pt-5 font-[Inter] font-semibold'>
                      {listForSellTokenWaitForTransaction.isSuccess ? 'Transaction Successful' : 'Selling Confirmation'}
                    </span>
                    <span className={`${listForSellTokenWaitForTransaction.isSuccess ? '' : 'border-b-[1px] border-[rgba(255,255,255,0.1)]'} w-full text-xs sm:text-lg text-[rgba(255,255,255,0.6)] font-[Inter] pb-6`}>
                      {listForSellTokenWaitForTransaction.isSuccess ? `Listing ${props.outputTokenData?.symbol} for ${props.inputTokenData?.symbol} for ${countLeadingZerosAfterDecimal(props.outputTokenAmount)} ${props.outputTokenData?.symbol}` : `Verify the details below to sell ${props.outputTokenData?.symbol} for ${props.inputTokenData?.symbol}`}
                    </span>
                    <button
                      type="button"
                      className="absolute right-2 sm:right-0 top-0 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-[rgba(255,255,255,0.2)] text-center"
                      onClick={e => onModalClose(e)}
                    >
                      <XMarkIcon className='h-6 w-6 sm:w-8 sm:h-8 text-[rgba(255,255,255,0.2)] hover:text-white'/>
                    </button>
                  </Dialog.Title>
                  {!listForSellTokenStarted &&
                    !listForSellTokenWaitForTransaction.isSuccess &&
                    !listForSellTokenWaitForTransaction.isError && (
                      <div>
                        <div className="h-[440px] sm:h-[513px] overflow-y-auto py-6 px-4 text-xs sm:text-base text-[rgba(255,255,255,0.5)]">
                          <div className="flex justify-between pb-2 items-center">
                            <div className='font-[Inter_Regular]'>Token Selling:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{props.inputTokenData?.symbol}</div>
                          </div>
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>Token Selling Amount:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{countLeadingZerosAfterDecimal(props.inputTokenAmount)}</div>
                          </div>
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>Token Receiving:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{props.outputTokenData?.symbol}</div>
                          </div>
                          <div className="flex justify-between py-2 items-center border-b-[2px] border-[rgba(255,255,255,0.1)] pb-6">
                            <div className='font-[Inter_Regular]'>Token Receiving Amount:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{Number(parseFloat(props.outputTokenAmount).toFixed(4))?.toLocaleString()}</div>
                          </div>
                          <div className="flex justify-between pt-6 pb-2 items-center">
                            <div className='font-[Inter_Regular]'>Sell Option:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{props.recipient === 'public' ? <div>public</div> : <div>private</div>}</div>
                          </div>
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>Allow Partial Buys:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{props.allowPartialBuys === "yes" ? <div>Yes</div> : <div>No</div>}</div>
                          </div>
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>Specific Recipient:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{props.recipient?.toString() == 'public' ? <div>No</div> : <div>Yes</div>}</div>
                          </div>
                          {props.recipient?.toString() == 'private' && (
                            <div className="flex justify-between py-2 items-center">
                              <div className='font-[Inter_Regular]'>Recipient Type:</div>
                              <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>
                                {props.recipientType?.toString() == 'address' ? (
                                  <div>Address</div>
                                ) : (
                                  <div>Twitter Handle</div>
                                )}
                              </div>
                            </div>
                          )}
                          {props.recipientAddress && (
                            <div className="flex justify-center rounded-2xl bg-[rgba(255,255,255,0.1)] py-2 my-2 items-center text-lg font-[Inter] border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                              {props.recipientAddress}
                            </div>
                          )}
                          {props.recipientHandle && (
                            <div className="flex justify-center rounded-2xl bg-[rgba(255,255,255,0.1)] py-2 my-2 items-center text-lg font-[Inter] border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                              {props.recipientHandle}
                            </div>
                          )}
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>New Owner:</div>
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{props.transferAddress !== '' || props.transferHandle !== '' ? <div>Yes</div> : <div>No</div>}</div>
                          </div>
                          {props.recipient?.toString() == 'public' && props.transferPool && (
                            <div className="flex justify-between py-2 items-center">
                              <div className='font-[Inter_Regular]'>Transfer Owner Type:</div>
                              <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>
                                {props.recipientType?.toString() == 'address' ? (
                                  <div>Address</div>
                                ) : (
                                  <div>Twitter Handle</div>
                                )}
                              </div>
                            </div>
                        )}
                          {props.transferAddress && (
                            <div className="flex justify-center rounded-lg sm:rounded-2xl bg-[rgba(255,255,255,0.1)] py-2 my-2 items-center text-sm sm:text-lg font-[Inter] border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                              {props.transferAddress}
                            </div>
                          )}
                          {props.transferHandle && (
                            <div className="flex justify-center rounded-lg sm:rounded-2xl bg-[rgba(255,255,255,0.1)] py-2 my-2 items-center text-sm sm:text-lg font-[Inter] border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                              {props.transferHandle}
                            </div>
                          )}
                          {poolType == '1' && (
                            <div className="flex justify-between py-2 items-center">
                              <div>Discount for buyer:</div>
                              <div className='flex justify-end text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>
                                {props.selectedDiscount != 'custom' && (
                                  <div>
                                    {props.discountOption?.toString() == 'false' ? (
                                      <div>No</div>
                                    ) : (
                                      <div>{props.selectedDiscount / 10}%</div>
                                    )}
                                  </div>
                                )}
                                <div>
                                  {props.discountOption?.toString() == 'true' && props.selectedDiscount == 'custom' && (
                                    <div>{props.customDiscount}%</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {props.vestingPeriodOption?.toString() == 'true' && (
                            <div className="flex justify-between py-2 items-center">
                              <div className='font-[Inter_Regular]'>Initial Distribution Amount:</div>
                              <div className="flex justify-end text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]">
                                <div>
                                  {((props.inputTokenAmount * props.vestingInitialAmountPercent) / '100').toString()}{' '}
                                  {props.inputTokenData?.symbol}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>Vesting Period:</div>
                            <div className="flex justify-end text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]">
                              <div>
                                {props.vestingPeriodOption?.toString() == 'false' ? (
                                  <div>No</div>
                                ) : (
                                  <div>
                                    {props.vestingPeriodPercent}% of remaining tokens every {props.vestingPeriodTimeframe?.time === '60' ? 'minute' : props.vestingPeriodTimeframe?.time === '3600' ? 'hour' : props.vestingPeriodTimeframe?.time === '86400' ? 'day' : props.vestingPeriodTimeframe?.time === '604800' ? 'week' : props.vestingPeriodTimeframe?.time === '1184400' ? 'other week' : props.vestingPeriodTimeframe?.time === '2635200' ? 'month' : props.vestingPeriodTimeframe?.time === '7776000' ? 'quarter' : 'year'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between py-2 items-center">
                            <div className='font-[Inter_Regular]'>Current Gas Fee:</div>{' '}
                            <div className='text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter]'>{parseFloat(feeInfo?.formatted.gasPrice).toFixed(0)} gwei</div>
                          </div>
                          <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            Hide pool hidden on creation?
                            <Tooltip animation="duration-500" content="When set, pool will be hidden upon creation. You will need to manually unhide the pool for it to be visible to buyers.">
                              <InformationCircleIcon className="h-3 w-3 sm:h-5 sm:w-5" />
                            </Tooltip>
                          </div>
                            <Switch
                              className={`customSwitch ${hidePool === false ? 'checked' : 'unchecked'}`}
                              checked={hidePool}
                              onChange={e => setHidePool(e)}
                              uncheckedIcon={false}
                              checkedIcon={false}
                              onColor='#1c76ff'
                            />
                        </div>
                        </div>
                        <div className="w-full flex-col justify-center text-center px-4 pb-4 sm:p-0">
                          <button
                            hidden={approvalComplete}
                            className="w-full rounded-full bg-[rgba(95,219,197,1)] py-2 sm:py-4 enabled:hover:bg-[rgba(95,219,197,0.3)]"
                            disabled={approveListTokenLoading || approveListTokenStarted}
                            onClick={() => approveListTokenWrite?.()}
                          >
                            {approveListTokenLoading && <a className="animate-pulse text-[rgba(0,0,0,0.6)] text-xs sm:text-lg font-[Inter] font-bold">Waiting for approval</a>}
                            {approveListTokenStarted && <a className="animate-pulse text-[rgba(0,0,0,0.6)] text-xs sm:text-lg font-[Inter] font-bold">Approving...</a>}
                            {!approveListTokenLoading && !approveListTokenStarted && (
                              <a className='text-[rgba(0,0,0,0.6)] text-xs sm:text-lg font-[Inter] font-bold'>Approve Diamond Swap to use your {props.inputTokenData?.symbol}</a>
                            )}
                          </button>
                          <button
                            hidden={!approvalComplete}
                            disabled={listForSellTokenLoading || listForSellTokenStarted}
                            className="w-full rounded-full bg-[rgba(95,219,197,1)] py-2 sm:py-4 enabled:hover:bg-[rgba(95,219,197,0.3)]"
                            onClick={() => listForSellTokenWrite?.()}
                          >
                            {listForSellTokenLoading && <a className="animate-pulse text-[rgba(0,0,0,0.5)] text-xs sm:text-lg font-[Inter] font-bold">Waiting for confirmation</a>}
                            {!listForSellTokenLoading && !listForSellTokenStarted && <a className='text-[rgba(0,0,0,0.5)] text-xs sm:text-lg font-[Inter] font-bold'>List for sell</a>}
                          </button>
                          {/* {approveListTokenError && (
                            <div className="xs:text-xs p-1 text-center text-red-500">
                              {approveListTokenError.message.split('(')[0]} (Try Again)
                            </div>
                          )}
                          {listForSellTokenError && (
                            <div className="xs:text-xs p-1 text-center text-red-500">
                              {listForSellTokenError.message.split('(')[0]} (Try Again)
                            </div>
                          )} */}
                        </div>
                      </div>
                  )}
                  <div className="hidden">
                    <div className="flex-col">
                      <div>Allowance: {sellTokenAllowance?.data?.toString()}</div>
                      <div>Sell Amount: {countLeadingZerosAfterDecimal(props.inputTokenAmount)}</div>
                      <div>
                        Sell Amount WEI:{' '}
                        {BigInt(
                          utils.parseUnits(props.inputTokenAmount, props.inputTokenData?.decimals)
                        ).toString()}
                      </div>
                      <div>
                        Sell Amount WEI (2):{' '}
                        {utils.parseUnits(props.inputTokenAmount, props.outputTokenData?.decimals).toString()}
                      </div>
                      <div>Get Amount: {props.outputTokenAmount}</div>
                      <div>
                        Get Amount WEI:{' '}
                        {props.outputTokenMarketAmount.toString() == 'false' && props.outputTokenAmount > '0'
                        ? utils.parseEther(props.outputTokenAmount).toString()
                        : '0'}
                      </div>
                      <div>PoolType: {poolType}</div>
                      <div>
                        Discount:{' '}
                        {props.discountOption?.toString() == 'true'
                          ? props.selectedDiscount == 'custom'
                            ? props.customDiscount * '10'
                            : props.selectedDiscount
                          : 0}
                      </div>
                      <div>
                        Vesting Info: {props.vestingPeriodPercent != '' ? props.vestingPeriodPercent * '10' : 0}
                      </div>
                      <div>{props.vestingInitialAmountPercent * '10'}</div>
                      <div>Market Price: {props.outputTokenMarketAmount.toString()}</div>
                    </div>
                  </div>
                  <div className="flex justify-center text-center">
                    {listForSellTokenStarted && !listForSellTokenWaitForTransaction.isSuccess && (
                      <div>
                        <div className="flex flex-col pt-5 sm:pt-10">
                          <div className="py-2 text-[rgba(255,255,255,0.8)] text-xl sm:text-[28px] font-[Inter_Bold]">Transaction Processing</div>
                          <div className="py-2 text-[rgba(255,255,255,0.6)] text-xs sm:text-lg font-[Inter]">
                            Listing {props.outputTokenData?.symbol} for {props.inputTokenData?.symbol} for {countLeadingZerosAfterDecimal(props.outputTokenAmount)} {props.outputTokenData?.symbol}
                          </div>
                          <video className="-mt-[72px] h-auto w-full max-w-full" autoPlay muted loop>
                            <source src="/videos/dswap_loader.webm" type="video/webm" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}
                    {listForSellTokenWaitForTransaction.isSuccess && (
                      <>
                        <div className="flex flex-col justify-center pt-4 gap-8 text-center">
                          <Image src={checkLogo} alt='check_logo' className='w-[148px] h-[148px] sm:w-[290px] sm:h-[290px]'></Image>
                          <div className='flex flex-col gap-4'>
                            <div className="flex gap-2 justify-center">
                              <a className='text-[rgba(255,255,255,0.8)] text-xs sm:text-lg font-[Inter_Bold]'>Transaction Details</a>
                              <a
                                className="flex items-center"
                                href={`${chain?.blockExplorers?.default?.url}/tx/${listForSellTokenData?.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ArrowUpRightIcon className="h-4 w-4 sm:h-5 sm:w-5 items-center" color='rgba(255,255,255,0.6)'/>
                              </a>
                            </div>
                            <button
                              className="w-full text-center text-xs sm:text-lg font-[Inter] font-semibold rounded-full bg-[rgba(255,255,255,0.2)] py-3 sm:py-4 text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.6)] hover:text-white"
                              onClick={e => {
                                  onModalClose(e) + props.resetSellPageState();
                                  props.setSelectedOne(true);
                                  router.push('/pending');
                                }
                              }
                            >
                              Close
                              </button>
                          </div>
                        </div>
                      </>
                    )}
                    {listForSellTokenWaitForTransaction.isError && (
                      <div>
                        <div className="flex-col justify-center p-4 text-center">
                          <div className="py-2 text-[rgba(255,255,255,0.8)] text-lg font-[Inter]">Listing {props.inputTokenData?.symbol} Failure</div>
                          <XCircleIcon className="h-[290px] w-[290px] text-red-400" />
                          <div className="flex justify-center">
                            <a className='text-[rgba(255,255,255,0.6)] text-lg font-[Inter]'>Transaction Details</a>
                            <div
                              className="flex items-center"
                              href={
                                chain ? `${chain?.blockExplorers?.default.url}/tx/${listForSellTokenData?.hash}` : 'N/A'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowUpRightIcon className="h-5 w-5 items-center" color='rgba(255,255,255,0.6)'/>
                              {listForSellTokenData?.hash}
                            </div>
                          </div>
                          <button
                            className="w-full text-center text-lg font-[Inter] rounded-full bg-[rgba(255,255,255,0.2)] px-6 py-4 text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.6)] hover:text-white"
                            onClick={e => onModalClose(e) + props.resetSellPageState()}
                          >
                            Close
                          </button>
                        </div>
                      </div>
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

export default SellTokenConfirmationModal
