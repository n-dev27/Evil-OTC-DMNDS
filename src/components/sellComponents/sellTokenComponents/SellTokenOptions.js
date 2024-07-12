const qs = require('qs');
import React, { Fragment, useState, useEffect, useContext } from 'react';
import Image from 'next/image.js';
import { utils } from 'ethers';
import { useAccount, useNetwork, useBalance, useToken } from 'wagmi';
import { Listbox, Transition, RadioGroup, Disclosure } from '@headlessui/react';
import Switch from 'react-switch';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { Tooltip } from 'flowbite-react';
import { useMediaQuery } from 'react-responsive';
import IsAddressValid from '../../../utils/isAddressValid.js';
import SellTokenInput from './SellTokenInput';
import SellTokenOutput from './SellTokenOutput';
import SelectWalletModal from '../../walletComponents/SelectWalletModal.js';
import SellTokenConfirmationModal from './SellTokenConfirmationModal';
import { LayoutContext } from '../../layout/layout.js';
import { getSlippageValue } from '../../../services/slippageServices.js';
import { countLeadingZerosAfterDecimal } from  '../../../utils/countDecimals.js';
import Arrow_Icon from '../../../assets/arrows_swap.svg'
import wallet_Icon from '../../../assets/wallet.svg'
import twitter_Icon from '../../../assets/twitter_x.svg'

const style = {
  discountButton: 'rounded-lg h-[2rem] w-1/5 bg-[#E1E5EC] hover:bg-[#8295B3] text-[#B2BCCC]',
  discountOptionsButton:
    'customShare flex rounded sm:rounded-lg h-[30px] sm:h-[46px] max-w-[120px] w-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(28,118,255,0.2)] cursor-pointer justify-center text-center items-center focus:outline-none border-[1.5px] border-[rgba(255,255,255,0.1)]',
  activeDiscountOptionButton:
    'flex rounded sm:rounded-lg h-[30px] sm:h-[46px] w-full text-[rgba(255,255,255,0.8)] font-[Inter] text-xs sm:text-lg cursor-pointer justify-center items-center focus:outline-none border-[1.5px] border-[rgba(255,255,255,0.1)]',
  listforsellButton:
    'bg-[rgba(95,219,197,1)] w-full rounded-[26px] py-3 sm:py-4 text-sm sm:text-lg text-[rgba(0,0,0,0.8)] font-[Inter] flex items-center justify-center',
  disabledButton:
    'bg-[rgba(95,219,197,1)] w-full rounded-[26px] py-3 sm:py-4 text-sm sm:text-lg text-[rgba(0,0,0,0.5)] font-[Inter] flex items-center justify-center',
}

const vestingTimeframes = [
  { name: 'Minute/s', time: '60' },
  { name: 'Hour/s', time: '3600' },
  { name: 'Daily', time: '86400' },
  { name: 'Weekly', time: '604800' },
  { name: 'Bi-Weekly', time: '1184400' },
  { name: 'Monthly', time: '2635200' },
  { name: 'Quarterly', time: '7776000' },
  { name: 'Yearly', time: '31536000' },
]

const addressOptions = [
  { name: 'address' },
  {name: 'twitter'}
];

const minDSPoolAmount = process.env.NEXT_PUBLIC_DS_MIN_POOL_OPTIONS;

const SellTokenOptions = props => {
  const isDesktopOrLaptop = useMediaQuery({ 
    query: '(min-width: 540px)'
  });


  const { address, isConnected } = useAccount();
  let userAddress = address;

  const { chain } = useNetwork();

  const [modalIsOpen, setIsOpen] = useState(false);

  function openFromParent() {
    setIsOpen(true);
  }

  function handleCloseModal(event, data) {
    setIsOpen(false);
  }

  function handleAfterOpen(event, data) {
  }

  const { setSelectedOne } = useContext(LayoutContext);
  const [isRequestPending, setIsRequestPending] = useState(false);

  const [sellOptions, setSellOptions] = useState('newpool');

  const [recipient, setRecipient] = useState('public');
  const [recipientType, setRecipientType] = useState('address');

  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [isTransferAddressValid, setIsTransferAddressValid] = useState(true);
  const [transferHandle, setTransferHandle] = useState('');
  
  const [isValidPublicHandle, setIsValidPublicHandle] = useState(false);
  const [isValidPrivateHandle, setIsValidPrivateHandle] = useState(true);

  const [isRecipientAddressValid, setIsRecipientAddressValid] = useState(true);

  const [transferHandleAddress, setTransferHandleAddress] = useState(true);
  const [handleAddress, setHandleAddress] = useState(true);
  
  const [recipientHandle, setRecipientHandle] = useState('');

  const [allowPartialBuys, setAllowPartialBuys] = useState('yes');

  const [discountOption, setDiscountOption] = useState(false);

  const [selectedDiscount, setSelectedDiscount] = useState('');

  const [customDiscount, setCustomDiscount] = useState('');
  
  const [vestingPeriodOption, setVestingPeriodOption] = useState(false);

  const [vestingInitialAmountPercent, setVestingInitialAmountPercent] = useState('');

  const [vestingPeriodPercent, setVestingPeriodPercent] = useState('');

  const [vestingPeriodTimeframe, setVestingPeriodTimeframe] = useState([]);

  const [newOwner, setNewOwner] = useState('no');

  const [newOwnerAddress, setNewOwnerAddess] = useState('');

  const [isNewOwnerAddressValid, setNewOwnerAddressValid] = useState(false);

  const [preventCancel, setPreventCancel] = useState('no');

  const [inputTokenData, setInputTokenData] = useState();

  const [inputTokenAmount, setInputTokenAmount] = useState(null);

  const [inputTokenAmountValue, setInputTokenAmountValue] = useState('');

  const [inputTokenSellAmount, setInputTokenSellAmount] = useState();

  const [outputTokenData, setOutputTokenData] = useState();

  const [outputTokenAmount, setOutputTokenAmount] = useState('');

  const [outputTokenMarketAmount, setOutputTokenMarketAmount] = useState(true);

  const [outputTokenAmountValue, setOutputTokenAmountValue] = useState('');

  const [sellTokenRateAmount, setSellTokenRateAmount] = useState('');

  const [buyTokenRateAmount, setBuyTokenRateAmount] = useState('');

  const [tradePriceImpact, setTradePriceImpact] = useState('');

  const [inputTokenPrice, setInputTokenPrice] = useState('');

  const [outputTokenPrice, setOutputTokenPrice] = useState('');

  const [percentSaved, setPercentSaved] = useState('');

  const [transferPool, setTransferPool] = useState(false);

  const [zeroxAPIurl, setZeroxAPIurl] = useState('');
  const inputTokenBalance = useBalance({
    address: address,
    token: inputTokenData?.address,
  })

  const { data: inputToken } = useToken({
    address: inputTokenData?.address,
  })

  const tokenInputBalance = inputTokenBalance.data?.value.toString() / 10 ** inputTokenBalance.data?.decimals;

  async function resetSellPageState() {
    setSellOptions('newpool');
    setRecipient('public');
    setRecipientType('');
    setRecipientAddress('');
    setTransferAddress('');
    setIsRecipientAddressValid(false);
    setRecipientHandle('');
    setDiscountOption(false);
    setAllowPartialBuys('yes');
    setSelectedDiscount('');
    setCustomDiscount('');
    setVestingPeriodOption(false);
    setVestingPeriodPercent('');
    setVestingInitialAmountPercent('');
    setVestingPeriodTimeframe('');
    setInputTokenAmount('');
    setInputTokenAmountValue('');
    setOutputTokenAmount('');
    setOutputTokenAmountValue('');
    setOutputTokenMarketAmount(true);
    setSellTokenRateAmount('');
    setBuyTokenRateAmount('');
    setInputTokenPrice('');
    setOutputTokenPrice('');
    setTradePriceImpact('');
    setPercentSaved('');
  }

  async function getPriceSlippage() {

    if (isRequestPending) return;

    setIsRequestPending(true);

    if (!inputTokenData || !outputTokenData) {
      return
    }
    if (!inputTokenData || !outputTokenData || inputTokenAmount <= 0 || inputTokenAmount?.toString() == '.') {
      return
    }
    if (
      chain?.id != 1 && 
      chain?.id != 3 && 
      chain?.id != 5 && 
      chain?.id != 56 && 
      chain?.id != 42161
    ) {
      console.log('here is the return page with Chain ID');
      return
    }

    const params = {
      sellToken: inputTokenData?.address ? inputTokenData.address : inputTokenData.symbol,
      buyToken: outputTokenData?.address ? outputTokenData.address : outputTokenData.symbol,
      sellAmount: utils.parseUnits(inputTokenAmount, inputTokenData?.decimals).toString(),
    }

    const response = await getSlippageValue(chain?.id, params.sellToken, 18, params.buyToken, params.sellAmount);
    // fetch the current swap price according to currently connected chain
    // const response = await fetch(
    //   `https://${zeroxAPIurl?.toString()}/swap/v1/price?${qs.stringify(params)}&enableSlippageProtection=false`, {
    //     method: 'GET',
    //     headers: {
    //       '0x-api-key': process.env.NEXT_PUBLIC_ZEROX_API,
    //     },
    //   }
    // )

    if (response.status === 200) {
      const swapPriceJSON = response.data.data;
      const tradeSlippage = swapPriceJSON.estimatedPriceImpact;
      const percentSavings = (outputTokenAmountValue * (tradeSlippage / 100).toString()).toString();
      setTradePriceImpact(tradeSlippage);
      setPercentSaved(percentSavings);
      setIsRequestPending(false);
    }

    /*
        const outputAmount = ((swapPriceJSON.sellAmount * swapPriceJSON.price) / (10 ** outputTokenData?.decimals));
        const outputAmountPerOutputTToken = swapPriceJSON.price;
        const outputAmountToWei = swapPriceJSON.buyAmount;
        const sellTokenRate = swapPriceJSON.sellTokenToEthRate;
        const buyTokenRate = swapPriceJSON.buyTokenToEthRate;
        */


    /*
        setOutputTokenMarketAmount(true);
        setSellTokenRateAmount(sellTokenRate);
        setBuyTokenRateAmount(buyTokenRate);
        setOutputTokenAmountValue(outputAmountToWei)
        */
  }

  useEffect(() => {
    if (sellOptions == 'newpool' && outputTokenAmount < minDSPoolAmount) {
      if (recipientType == '') {
        setRecipientType('address');
      }
      setAllowPartialBuys('yes');
    }
    if (sellOptions == 'existingpool') {
      setRecipient('public');
      setRecipientType('');
      setRecipientAddress('');
      setRecipientHandle('');
      setAllowPartialBuys('yes');
      setDiscountOption(false);
      setSelectedDiscount('');
      setVestingPeriodOption(false);
      setVestingPeriodPercent('');
      setVestingInitialAmountPercent('');
      setVestingPeriodTimeframe('');
    };
    if (recipient == 'public') {
      setRecipientAddress('');
      setRecipientHandle('');
      if (recipientType == '') {
        setRecipientType('address');
      };
      recipientType == 'address' && transferHandle ? setTransferHandle('') : '';
      recipientType == 'twitter' && transferAddress ? setTransferAddress('') : '';
    };
    if (recipient == 'private') {
      setAllowPartialBuys('no');
    };
    if (recipient == 'private') {
      setTransferPool(false);
      setTransferAddress('');
      setTransferHandle('');
      if (recipientType == '') {
        setRecipientType('address');
      };
      recipientType == 'address' && recipientHandle ? setRecipientHandle('') : '';
      recipientType == 'twitter' && recipientAddress ? setRecipientAddress('') : '';
    };
    if (selectedDiscount == '25' || selectedDiscount == '50' || selectedDiscount == '75') {
      setCustomDiscount('');
    };
  }, [sellOptions, recipient, recipientType, selectedDiscount, outputTokenAmount]);

  useEffect(() => {
    resetSellPageState();
    setInputTokenData();
    setOutputTokenData();
  }, [chain])

  useEffect(() => {
    if (
      inputTokenData &&
      outputTokenData &&
      inputTokenAmount > '0' &&
      outputTokenAmount > '0' &&
      inputTokenAmountValue > '0' &&
      outputTokenAmountValue > '0'
    ) {
      getPriceSlippage();
    }
  }, [tradePriceImpact, inputTokenAmountValue, outputTokenAmountValue, inputTokenAmount, outputTokenAmount])

  // useEffect(() => {
  //   if(inputTokenAmount && outputTokenAmount) {
  //     setRecipient('public')
  //   }
  // }, [outputTokenAmount])

  /*
    useEffect(() => {
        if(outputTokenAmount < minDSPoolAmount) {
            setSellOptions('existingpool')
            setRecipient('no')
            setVestingPeriodOption(false)
        }
    },[outputTokenAmount,outputTokenAmountValue])
    */

  const handleInputPublicChange = (value) => {
    setTransferHandle(value);

    if (!value.startsWith("@")) {
      setIsValidPublicHandle(false);
      setTransferHandleAddress(false)
    } else {
      setIsValidPublicHandle(true);
      setTransferHandleAddress(true)
    }
  };

  const handleInputPrivateChange = (value) => {
    setRecipientHandle(value);

    // Check if the input value starts with "@"
    if (!value.startsWith("@")) {
      setIsValidPrivateHandle(false);
      setHandleAddress(false)
    } else {
      setIsValidPrivateHandle(true);
      setHandleAddress(true)
    }
  };

  return (
    <div className='h-full flex flex-col justify-between'>
      <div className="flex flex-col">
        <div className='relative flex flex-col gap-2 sm:gap-[10px]'>
          <SellTokenInput
            setZeroxAPIurl={setZeroxAPIurl}
            outputTokenData={outputTokenData}
            setInputTokenData={setInputTokenData}
            inputTokenData={inputTokenData}
            setInputTokenAmount={setInputTokenAmount}
            setInputTokenAmountValue={setInputTokenAmountValue}
            inputTokenPrice={inputTokenPrice}
            setInputTokenPrice={setInputTokenPrice}
            inputTokenAmount={inputTokenAmount}
            setOutputTokenAmount={setOutputTokenAmount}
            setOutputTokenMarketAmount={setOutputTokenMarketAmount}
          />

          <div className='absolute top-[calc(50%-14px)] left-[calc(50%-14px)] sm:top-[calc(50%-24px)] sm:left-[calc(50%-24px)] flex justify-center items-center bg-[rgba(25,30,78,1)] rounded-lg sm:rounded-xl x-7 h-7 sm:w-12 sm:h-12 p-2 sm:p-3'>
            <Image src={Arrow_Icon} alt="arrow_logo" className='w-3 h-3 sm:w-5 sm:h-5'></Image>
          </div>
          <SellTokenOutput
            inputTokenData={inputTokenData}
            setInputTokenAmount={setInputTokenAmount}
            inputTokenAmount={inputTokenAmount}
            inputTokenAmountValue={inputTokenAmountValue}
            outputTokenData={outputTokenData}
            setOutputTokenData={setOutputTokenData}
            outputTokenAmount={outputTokenAmount}
            setOutputTokenAmount={setOutputTokenAmount}
            outputTokenAmountValue={outputTokenAmountValue}
            setOutputTokenAmountValue={setOutputTokenAmountValue}
            outputTokenPrice={outputTokenPrice}
            setOutputTokenPrice={setOutputTokenPrice}
            outputTokenMarketAmount={outputTokenMarketAmount}
            setOutputTokenMarketAmount={setOutputTokenMarketAmount}
            tradePriceImpact={tradePriceImpact}
            sellOptions={sellOptions}
          />
        </div>

        <div>
          {outputTokenAmount && inputTokenAmount && (
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center text-[rgba(255,255,255,0.5)] text-[12px] sm:text-base font-[Inter_Regular]">
                  <InformationCircleIcon className="w-3 h-3 sm:h-5 sm:w-5" color='rgba(255,255,255,0.5)'/>
                  &nbsp;1&nbsp;{outputTokenData?.symbol}&nbsp;=&nbsp;
                  {countLeadingZerosAfterDecimal(outputTokenPrice / inputTokenPrice)}&nbsp;{inputTokenData?.symbol}
                </div>
                <div className='text-[rgba(255,255,255,0.8)] text-[10px] sm:text-sm font-[Inter_Regular]'>
                  Approximate slippage free gains vs traditional DEX:{' '}
                  <a className="font-bold"> $ {countLeadingZerosAfterDecimal(percentSaved)}</a> (
                  {countLeadingZerosAfterDecimal(tradePriceImpact)}%){' '}
                </div>
              </div>
            </div>
          )}

          {inputTokenData &&
            inputTokenAmount &&
            outputTokenData &&
            outputTokenAmount &&
            inputTokenBalance?.data &&
            BigInt(utils.parseUnits(inputTokenAmount, inputTokenData?.decimals)) <=
              BigInt(inputTokenBalance?.data?.value.toString())
              
            && (
              <div className="relative w-full flex-col items-center py-2 text-base text-[#F8FAFC]">
                <div className="hidden dark:bg-gray items-center justify-between py-2">
                  <div className="flex items-center">
                    Sell options
                    <Tooltip
                      animation="duration-500"
                      content="Create a new pool or add to an exisitng pool. Certain options are disabled when the recieving value of ETH is less than 1."
                    >
                      <InformationCircleIcon className="h-4 w-4" />
                    </Tooltip>
                  </div>
                  <RadioGroup
                    className="flex h-8 w-fit cursor-pointer items-center rounded-3xl bg-white text-xs text-[#B2BCCC] dark:bg-gray-500 "
                    value={sellOptions}
                    onChange={setSellOptions}
                  >
                    <div>
                      <RadioGroup.Option value="newpool">
                        {({ checked }) => (
                          <span
                            className={
                              checked
                                ? 'flex h-8 items-center rounded-3xl bg-[#1C76FF] py-1 px-1 text-center text-white dark:bg-gray-700 md:py-0 md:px-4 md:text-start '
                                : 'flex py-1 px-1 text-center md:py-0 md:px-4 md:text-start'
                            }
                          >
                            Create New Pool
                          </span>
                        )}
                      </RadioGroup.Option>
                    </div>
                    <div>
                      <RadioGroup.Option value="existingpool">
                        {({ checked }) => (
                          <span
                            className={
                              checked
                                ? 'flex h-8 items-center rounded-3xl bg-[#1C76FF] py-1 px-1 text-center text-white dark:bg-gray-700 md:py-0 md:px-4 md:text-start '
                                : 'flex py-1 px-1 text-center md:py-0 md:px-4 md:text-start'
                            }
                          >
                            Add to Public Pool
                          </span>
                        )}
                      </RadioGroup.Option>
                    </div>
                  </RadioGroup>
                </div>

                {sellOptions === 'newpool' && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 font-[Inter] text-xs sm:text-lg text-[rgba(255,255,255,0.8)]">
                      Pool Type
                      <Tooltip
                        animation="duration-500"
                        content="If recipient is known, specify the recipients wallet address or twitter handle."
                      >
                        <InformationCircleIcon className="h-3 w-3 sm:h-5 sm:w-5" color='rgba(255,255,255,0.5)'/>
                      </Tooltip>
                    </div>
                    <RadioGroup
                      className="flex h-[34.4px] sm:h-[45px] w-fit p-[1.2px] sm:p-[2px] cursor-pointer items-center rounded-full bg-[rgba(255,255,255,0.2)] border-[1.2px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)] backdrop-blur-[20px]"
                      value={recipient}
                      onChange={setRecipient}
                    >
                      <div>
                        <RadioGroup.Option value="public">
                          {({ checked }) => (
                            <span
                              className={`flex h-[30px] sm:h-[41px] items-center text-[rgba(255,255,255,0.8)] rounded-full border-none px-6 text-xs sm:text-sm font-[Inter] ${
                                checked
                                  ? 'bg-[rgba(95,219,197,1)] py-3 outline-none focus:outline-none focus:ring-transparent !text-[rgba(0,0,0,1)]'
                                  : ''
                              }`}
                            >
                              Public
                            </span>
                          )}
                        </RadioGroup.Option>
                      </div>
                      <div>
                        <RadioGroup.Option value="private">
                          {({ checked }) => (
                            <span
                              className={`flex h-[30px] sm:h-[41px] items-center text-[rgba(255,255,255,0.8)] rounded-full border-none px-6 text-xs sm:text-sm font-[Inter] ${
                                checked
                                  ? 'bg-[rgba(95,219,197,1)] py-3 outline-none focus:outline-none focus:ring-transparent !text-[rgba(0,0,0,1)]'
                                  : ''
                              }`}
                            >
                              Private
                            </span>
                          )}
                        </RadioGroup.Option>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* NNNNN */}
                {sellOptions == 'newpool' && recipient == 'private' && (
                  <div className="absolute px-4 sm:px-5 z-10">
                    <Listbox value={recipientType} onChange={setRecipientType}>
                      <div className="mt-[1.6rem] sm:mt-[1.8rem] flex h-5 w-12 cursor-pointer items-center rounded-3xl text-xs">
                        <Listbox.Button className="w-full h-full flex justify-between items-center">
                          {recipientType === 'address' ? (
                            <Image src={wallet_Icon} alt='wallet_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                          ) : (
                            <Image src={twitter_Icon} alt='twitter_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                          )}
                          <div className="w-5 h-5 flex items-center justify-center">
                            <ChevronDownIcon className="h-5 w-5 text-[rgba(255,255,255,0.8)]" aria-hidden="true" />
                          </div>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute left-[1%] mt-[9rem] sm:mt-[11rem] bg-[rgba(6,11,39,1)] w-[76px] h-[82px] sm:h-[100px] rounded-lg border-[1.2px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                            {addressOptions?.map((item, index) => (
                              <Listbox.Option
                                key={index}
                                className={({ active }) =>
                                  `flex justify-between p-3 sm:p-4 hover:bg-[rgba(255,255,255,0.2)] hover:rounded-lg`
                                }
                                value={item.name}
                              >
                                <>
                                  {item.name === 'address' ? (
                                    <Image src={wallet_Icon} alt='wallet_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                                  ) : (
                                    <Image src={twitter_Icon} alt='twitter_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                                  )}
                                  {recipientType === item.name ? (
                                    <CheckIcon className='w-4 h-4 text-white'/>
                                  ) : <></>}
                                </>
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
              )}
              
                {/* NNNNN */}
                {sellOptions == 'newpool' && recipient == 'private' && recipientType == 'address' && (
                  <div className="w-full py-2">
                    <form>
                      <label className="flex-inline">
                        <input
                          required={true}
                          type="text"
                          className="... peer customInputPlaceholder font-[Inter_Regular] text-sm sm:text-lg w-full flex items-center justify-center pl-[80px] sm:pl-[88px] pr-12 py-4 bg-[rgba(255,255,255,0.1)] rounded-lg sm:rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)] outline-none focus:outline-none focus:ring-transparent"
                          onChange={event => setRecipientAddress(event.target.value)}
                          placeholder="Enter address..."
                        />
                        <div className="-mt-[2.2rem] sm:-mt-[2.4rem] flex items-center justify-end px-4 sm:px-5 z-10">
                          <IsAddressValid
                            recipientAddress={recipientAddress ? recipientAddress : ''}
                            setIsRecipientAddressValid={setIsRecipientAddressValid}
                          />
                        </div>
                        {isRecipientAddressValid == false ? (
                          <p className="mt-7 sm:mt-8 px-2 text-[rgba(255,255,255,0.2)] text-[10px] sm:text-xs font-[Inter]">
                            Please provide a valid wallet address with no spaces
                          </p>
                        ) : (
                           <p className='w-full mt-4'></p>
                        )}
                      </label>
                    </form>
                  </div>
                )}

                {/* NNNNN */}
                {sellOptions == 'newpool' && recipient == 'private' && recipientType == 'twitter' && (
                  <div className="w-full py-2">
                    <form>
                      <label className="flex-inline">
                        <input
                          required={true}
                          type="text"
                          className="... peer customInputPlaceholder font-[Inter_Regular] text-sm sm:text-lg w-full flex items-center justify-center pl-[80px] sm:pl-[88px] pr-12 py-4 bg-[rgba(255,255,255,0.1)] rounded-lg sm:rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)] outline-none focus:outline-none focus:ring-transparent"
                          onChange={event => handleInputPrivateChange(event.target.value)}
                          placeholder="Enter username..."
                        />
                        <div className="-mt-[2.2rem] sm:-mt-[2.4rem] h-4 flex items-center justify-end px-5 z-10">
                        </div>
                        {isValidPrivateHandle == false ? (
                          <p className="mt-7 sm:mt-8 px-2 text-[rgba(255,255,255,0.2)] text-[10px] sm:text-xs font-[Inter]">
                          Please provide a valid Twitter handle for user
                          </p>
                        ) : (
                          <p className='w-full mt-4'></p>
                        )}
                      </label>
                    </form>
                  </div>
                )}

                {sellOptions == 'newpool' && recipient == 'public' && outputTokenAmount >= minDSPoolAmount && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)] text-xs sm:text-lg font-[Inter]">
                      Allow Partial Buys?
                      <Tooltip animation="duration-500" content="Allow buyers to buy from your pool in portions.">
                        <InformationCircleIcon className="h-3 w-3 sm:h-5 sm:w-5" color='rgba(255,255,255,0.5)'/>
                      </Tooltip>
                    </div>
                    <Switch
                      className={`customSwitch ${allowPartialBuys === 'yes' ? 'checked': 'unchecked'}`}
                      checked={allowPartialBuys === 'yes' ? false : true}
                      onChange={e => {
                            if (e === false) {
                              setAllowPartialBuys('yes');
                            } else {
                              setAllowPartialBuys('no')
                            }
                          }}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onColor='#1c76ff'
                    />
                  </div>
                )}

                {/* {sellOptions == 'newpool' && outputTokenAmount < minDSPoolAmount && (
                  <div className="mt-2">
                    <Alert
                      className='bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-30 backdrop-blur-[0px]'
                      color="info"
                      onDismiss={function onDismiss() {
                        return alert('Alert dismissed!')
                      }}
                    >
                      <span className="text-xs">
                        The following features are disabled for receiving amounts under {minDSPoolAmount} ETH. (Discounts,
                        Vesting, and Public Partial Buy Pools). This listing will go into a public pool, where purchases are
                        done on a first in, first out basis.
                      </span>
                    </Alert>
                  </div>
                )} */}

                    {sellOptions == 'newpool' && outputTokenMarketAmount && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)] text-xs sm:text-lg font-[Inter]">
                          Do you want to provide a discount?
                          <Tooltip animation="duration-500" content="Allow buyers to buy from your pool in portions.">
                            <InformationCircleIcon className="h-3 w-3 sm:h-5 sm:w-5" color='rgba(255,255,255,0.5)'/>
                          </Tooltip>
                        </div>
                        <Switch
                          className={`customSwitch ${discountOption === false ? 'checked' : 'unchecked'}`}
                          disabled={outputTokenAmount < minDSPoolAmount}
                          checked={discountOption}
                          onChange={e => {
                            setDiscountOption(e)
                            setSelectedDiscount('')
                            setCustomDiscount('')
                          }}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          onColor='#1c76ff'
                        />
                        {/* <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`${
                              discountOption ? 'translate-x-3 md:translate-x-3' : '-translate-x-2 md:-translate-x-3'
                            }
                                pointer-events-none ml-1 inline-block h-4 w-4 rounded-full border border-white bg-gradient-to-b from-[#3E547E] to-[#7791BB] shadow-2xl shadow-black ring-0 transition duration-200 ease-in-out dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-500 md:h-6 md:w-6`}
                          /> */}
                      </div>
                    )}

                    {sellOptions == 'newpool' && discountOption && outputTokenMarketAmount && (
                      <div>
                        <RadioGroup req="true" value={selectedDiscount} onChange={setSelectedDiscount}>
                        <RadioGroup.Label className="sr-only">Discount Amount</RadioGroup.Label>
                          <span className='text-[rgba(255,255,255,0.5)] text-xs sm:text-base font-[Inter_Regular]'>How much discount?</span>
                          <div className="flex gap-1 justify-between py-4 text-xs sm:text-base text-[#B2BCCC]">
                            <RadioGroup.Option value="25" className={style.discountOptionsButton}>
                              {({ checked }) => (
                                <span
                                  className={`${
                                    checked
                                      ? 'bg-[rgba(95,219,197,1)] font-bold !text-[rgba(0,0,0,1)]'
                                      : ''
                                  } + ${style.activeDiscountOptionButton}`}
                                >
                                  2.5%
                                </span>
                              )}
                            </RadioGroup.Option>
                            <RadioGroup.Option value="50" className={style.discountOptionsButton}>
                              {({ checked }) => (
                                <span
                                  className={`${
                                    checked
                                      ? 'bg-[rgba(95,219,197,1)] font-bold !text-[rgba(0,0,0,1)]'
                                      : ''
                                  } + ${style.activeDiscountOptionButton}`}
                                >
                                  5.0%
                                </span>
                              )}
                            </RadioGroup.Option>
                            <RadioGroup.Option value="75" className={style.discountOptionsButton}>
                              {({ checked }) => (
                                <span
                                  className={`${
                                    checked
                                      ? 'bg-[rgba(95,219,197,1)] font-bold !text-[rgba(0,0,0,1)]'
                                      : ''
                                  } + ${style.activeDiscountOptionButton}`}
                                >
                                  7.5%
                                </span>
                              )}
                            </RadioGroup.Option>
                            <RadioGroup.Option value="custom" className={style.discountOptionsButton}>
                              {({ checked }) => (
                                <span
                                  className={`${
                                    checked
                                      ? 'bg-[rgba(95,219,197,1)] font-bold !text-[rgba(0,0,0,1)]'
                                      : ''
                                  } + ${style.activeDiscountOptionButton}`}
                                >
                                  <input
                                    className="discountInputPlaceholder w-full h-full rounded-full border-none bg-transparent text-center text-xs sm:text-base outline-none focus:outline-none focus:ring-transparent"
                                    type="text"
                                    inputMode="number"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    placeholder="Custom"
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    minLength="1"
                                    maxLength="2"
                                    onChange={event => setCustomDiscount(event.target.value)}
                                    value={customDiscount}
                                    onKeyPress={event => {
                                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                        event.preventDefault()
                                      }
                                    }}
                                    onBlur={() => {
                                      if (selectedDiscount != 'custom') {
                                        setCustomDiscount('')
                                      }
                                    }}
                                  />
                                </span>
                              )}
                            </RadioGroup.Option>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {sellOptions == 'newpool' && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)] text-xs sm:text-lg font-[Inter]">
                          Vesting Period?
                          <Tooltip animation="duration-500" content="Create a pool on behalf of another address.">
                            <InformationCircleIcon className="h-3 w-3 sm:h-5 sm:w-5" color='rgba(255,255,255,0.5)'/>
                          </Tooltip>
                        </div>
                        <Switch
                          className={`customSwitch ${vestingPeriodOption === false ? 'checked' : 'unchecked'}`}
                          disabled={outputTokenAmount < minDSPoolAmount}
                          checked={vestingPeriodOption}
                          onChange={e => {
                            setVestingPeriodOption(e)
                            setVestingPeriodPercent()
                            setVestingPeriodTimeframe({ name: 'Daily', time: '86400' })
                            setVestingInitialAmountPercent()
                          }}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          onColor='#1c76ff'
                        />
                        {/* <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`${
                              vestingPeriodOption ? 'translate-x-3 md:translate-x-3' : '-translate-x-2 md:-translate-x-3'
                            }
                                pointer-events-none ml-1 inline-block h-4 w-4 rounded-full border border-white bg-gradient-to-b from-[#3E547E] to-[#7791BB] shadow-2xl shadow-black ring-0 transition duration-200 ease-in-out dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-500 md:h-6 md:w-6`}
                          /> */}
                      </div>
                    )}

                    {sellOptions == 'newpool' && vestingPeriodOption ? (
                      <div className="relative z-10 flex justify-between gap-2 py-4">
                        <div className="customShare flex flex-col justify-between p-2 gap-2 w-1/3 sm:w-[160px] bg-[rgba(255,255,255,0.1)] rounded-md border border-[rgba(255,255,255,0.1)]">
                          <a className="flex items-start text-[9px] sm:text-xs text-[rgba(255,255,255,0.5)] font-[Inter]">% released immediately</a>
                          <input
                            className="w-full customPlaceholder flex border-none text-xs sm:text-base bg-transparent text-[rgba(255,255,255,0.8)] font-[Inter] outline-none focus:outline-none focus:ring-transparent"
                            placeholder="0%"
                            pattern="^[0-9]*[.,]?[0-9]*$"
                            minLength="1"
                            maxLength="3"
                            onChange={event => {
                              const inputValue = parseFloat(event.target.value); 
                              if (isNaN(inputValue)) {
                                // If the input value is not a number (i.e., empty), set it to 0
                                setVestingInitialAmountPercent('');
                              } else if (inputValue > 100) {
                                // If the value is more than 100, limit it to 100
                                setVestingInitialAmountPercent(100);
                              } else {
                                // If the value is less than or equal to 100, keep it as is
                                setVestingInitialAmountPercent(inputValue);
                              }
                            }}
                            onKeyPress={event => {
                              if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                event.preventDefault()
                              }
                            }}
                            onBlur={event => {
                              const inputValue = parseFloat(event.target.value); 
                              if (isNaN(inputValue)) {
                                // If the input value is not a number (i.e., empty), set it to 0
                                setVestingInitialAmountPercent('');
                              } else if (inputValue > 100) {
                                // If the value is more than 100, limit it to 100
                                setVestingInitialAmountPercent(100);
                              }
                            }}
                            value={vestingInitialAmountPercent}
                          />
                        </div>
                        <div className="customShare flex flex-col p-2 justify-between gap-2 w-1/3 sm:w-[160px] bg-[rgba(255,255,255,0.1)] rounded-md border border-[rgba(255,255,255,0.1)]">
                          <a className="flex items-start text-[9px] sm:text-xs text-[rgba(255,255,255,0.5)] font-[Inter]">Vesting period</a>
                          <Listbox value={vestingPeriodTimeframe} onChange={setVestingPeriodTimeframe}>
                            <div className="relative cursor-pointer text-xs sm:text-base">
                              <Listbox.Button className="flex items-center justify-between focus:outline-none relative w-full cursor-pointer rounded-lg bg-transparent text-[rgba(255,255,255,0.8)] font-[Inter_bold] focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-300 ">
                                {/* {vestingPeriodTimeframe?.name ? (
                                  <>
                                    {vestingPeriodTimeframe?.name}
                                  </>
                                ) : (
                                  vestingTimeframes[2].name
                                )} */}
                                {vestingPeriodTimeframe?.name}
                                <div className="flex items-center justify-center">
                                  <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[rgba(255,255,255,0.8)]" aria-hidden="true" />
                                </div>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute left-[-7%] sm:left-[-6%] mt-[0.95rem] sm:mt-[1.05rem] max-h-56 w-[120px] sm:w-[160px] overflow-auto rounded-md sm:rounded-lg bg-[rgba(6,11,39,0.8)] text-xs sm:text-lg text-[rgba(255,255,255,0.8)] font-[Inter_bold] border-[1.2px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                                  {vestingTimeframes?.map((timeframe, timeframeIdx) => (
                                    <Listbox.Option
                                      key={timeframeIdx}
                                      className={({ active }) =>
                                        `relative flex justify-between cursor-pointer p-1 sm:p-2 hover:bg-[rgba(255,255,255,0.1)] hover:rounded-md sm:hover:rounded-lg`
                                      }
                                      value={timeframe}
                                    >
                                      <span>{timeframe.name}</span>
                                      {vestingPeriodTimeframe?.name === timeframe.name ? (
                                        <CheckIcon className='w-3 h-3 sm:w-4 sm:h-4 text-white'/>
                                      ) : null}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                        <div className="customShare flex flex-col justify-between p-2 gap-2 w-1/3 sm:w-[160px] bg-[rgba(255,255,255,0.1)] rounded-md border border-[rgba(255,255,255,0.1)]">
                          <a className="flex items-start text-[9px] sm:text-xs text-[rgba(255,255,255,0.5)] font-[Inter]">% released per period</a>
                          <input
                            className="w-full customPlaceholder flex border-none text-xs sm:text-base bg-transparent text-[rgba(255,255,255,0.8)] font-[Inter] outline-none focus:outline-none focus:ring-transparent"
                            placeholder="0%"
                            pattern="^[0-9]*[.,]?[0-9]*$"
                            minLength="1"
                            maxLength="3"
                            onChange={event => {
                              const inputValue = parseFloat(event.target.value); 
                              if (isNaN(inputValue)) {
                                // If the input value is not a number (i.e., empty), set it to 0
                                setVestingPeriodPercent('');
                              } else if (inputValue > 100) {
                                // If the value is more than 100, limit it to 100
                                setVestingPeriodPercent(100);
                              } else {
                                // If the value is less than or equal to 100, keep it as is
                                setVestingPeriodPercent(inputValue);
                              }
                            }}
                            onKeyPress={event => {
                              if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                event.preventDefault()
                              }
                            }}
                            onBlur={event => {
                              const inputValue = parseFloat(event.target.value); 
                              if (isNaN(inputValue)) {
                                // If the input value is not a number (i.e., empty), set it to 0
                                setVestingPeriodPercent('');
                              } else if (inputValue > 100) {
                                // If the value is more than 100, limit it to 100
                                setVestingPeriodPercent(100);
                              }
                            }}
                            value={vestingPeriodPercent}
                          />
                        </div>
                        {/* <div className="flex justify-between">
                          <div className="w-32 py-1 hidden md:py-0">
                            <div className="flex-col justify-center rounded-xl bg-white p-1">
                              <a className="flex h-3 items-start px-1 text-[0.6rem] text-[#B2BCCC]">% released immediately</a>
                              <input
                                className="flex border-none bg-transparent px-1 text-[#354B75] outline-none focus:outline-none focus:ring-transparent"
                                placeholder="0%"
                                pattern="^[0-9]*[.,]?[0-9]*$"
                                minLength="1"
                                maxLength="2"
                                onChange={event => setVestingInitialAmountPercent(event.target.value)}
                                onKeyPress={event => {
                                  if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                                    event.preventDefault()
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div> */}
                      </div>
                    ) : (
                      <></>
                    )}

                    {recipient == 'public' && (
                      <Disclosure>
                      {({ open }) => (
                      <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 text-left focus:outline-none focus-visible:ring focus-visible:ring-none focus-visible:ring-opacity-75">
                          <span className='text-[rgba(255,255,255,0.8)] text-xs sm:text-lg font-[Inter]'>Advanced</span>
                          <ChevronUpIcon
                            className={`${
                              open ? 'rotate-180 transform' : ''
                            } h-5 w-5 `}
                            color='rgba(255,255,255,0.5)'
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="relative">
                          {sellOptions == 'newpool' && recipient == 'public' && (
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center text-xs sm:text-base text-[rgba(255,255,255,0.5)] font-[Inter_Regular]">
                                  Transfer pool on creation?
                                </div>
                                <Switch
                                  className={`customSwitch ${transferPool === false ? 'checked' : 'unchecked'}`}
                                  checked={transferPool}
                                  onChange={e => {
                                        setTransferPool(e)
                                        if (e === false) {
                                          setTransferAddress('');
                                          setTransferHandle('');
                                        }
                                      }}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  onColor='#1c76ff'
                                />
                              </div>
                            )}

                            {sellOptions == 'newpool' && recipient == 'public' && transferPool === true && (
                              <div className='absolute px-4 sm:px-5 z-10'>
                                <Listbox value={recipientType} onChange={setRecipientType}>
                                  <div className="mt-[1.6rem] sm:mt-[1.8rem] flex h-5 w-12 cursor-pointer items-center rounded-3xl text-xs">
                                    <Listbox.Button className="w-full h-full flex justify-between items-center">
                                      {recipientType === 'address' ? (
                                        <Image src={wallet_Icon} alt='wallet_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                                      ) : (
                                        <Image src={twitter_Icon} alt='twitter_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                                      )}
                                      <div className="w-5 h-5 flex items-center justify-center">
                                        <ChevronDownIcon className="h-5 w-5 text-[rgba(255,255,255,0.8)]" aria-hidden="true" />
                                      </div>
                                    </Listbox.Button>
                                    <Transition
                                      as={Fragment}
                                      leave="transition ease-in duration-100"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <Listbox.Options className="absolute left-[1%] mt-[9rem] sm:mt-[11rem] bg-[rgba(6,11,39,1)] w-[76px] h-[82px] sm:h-[100px] rounded-lg border-[1.2px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)]">
                                        {addressOptions?.map((item, index) => (
                                          <Listbox.Option
                                            key={index}
                                            className={({ active }) =>
                                              `flex justify-between p-3 sm:p-4 hover:bg-[rgba(255,255,255,0.2)] hover:rounded-lg`
                                            }
                                            value={item.name}
                                          >
                                            <>
                                              {item.name === 'address' ? (
                                                <Image src={wallet_Icon} alt='wallet_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                                              ) : (
                                                <Image src={twitter_Icon} alt='twitter_logo' className='w-4 h-4 sm:w-[18px] sm:h-[18px]'></Image>
                                              )}
                                              {recipientType === item.name ? (
                                                <CheckIcon className='w-4 h-4 text-white'/>
                                              ) : <></>}
                                            </>
                                          </Listbox.Option>
                                        ))}
                                      </Listbox.Options>
                                    </Transition>
                                  </div>
                                </Listbox>
                              </div>
                            )}

                            {sellOptions == 'newpool' && recipient == 'public' && recipientType == 'address' && transferPool === true && (
                              <div className="w-full py-2">
                                <form>
                                  <label className="flex-inline">
                                    <input
                                      required={true}
                                      type="text"
                                      className="... peer customInputPlaceholder font-[Inter_Regular] text-sm sm:text-lg w-full flex items-center justify-center pl-[80px] sm:pl-[88px] pr-12 py-4 bg-[rgba(255,255,255,0.1)] rounded-lg sm:rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)] outline-none focus:outline-none focus:ring-transparent"
                                      onChange={event => setTransferAddress(event.target.value)}
                                      placeholder="Enter address..."
                                    />
                                    <div className="-mt-[2.2rem] sm:-mt-[2.4rem] flex items-center justify-end px-4 sm:px-5 z-10">
                                      <IsAddressValid
                                        recipientAddress={transferAddress ? transferAddress : ''}
                                        setIsRecipientAddressValid={setIsTransferAddressValid}
                                      />
                                    </div>
                                    {isTransferAddressValid == false ? (
                                        <p className="mt-7 sm:mt-8 px-2 text-[rgba(255,255,255,0.2)] text-xs font-[Inter]">
                                          Please provide a valid wallet address with no spaces
                                        </p>
                                      ) : (
                                        <p className='w-full mt-4'></p>
                                      )}
                                  </label>
                                </form>
                              </div>
                            )}

                            {sellOptions == 'newpool' && recipient == 'public' && recipientType == 'twitter' && transferPool === true && (
                              <div className="w-full py-2">
                                <form>
                                  <label className="flex-inline">
                                    <input
                                      required={true}
                                      type="text"
                                      className="... peer customInputPlaceholder font-[Inter_Regular] text-sm sm:text-lg w-full flex items-center justify-center pl-[80px] sm:pl-[88px] pr-12 py-4 bg-[rgba(255,255,255,0.1)] rounded-lg sm:rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[rgba(0,0,0,0.16)] outline-none focus:outline-none focus:ring-transparent"
                                      onChange={event => handleInputPublicChange(event.target.value)}
                                      placeholder="Enter username..."
                                    />
                                    <div className="-mt-[2.2rem] sm:-mt-[2.4rem] h-4 flex items-center justify-end px-5 z-10">
                                      {/* {isValidPublicHandle === true ? <CheckIcon className='cursor-pointer text-[#F8FAFC] items-center justify-center w-4 h-4' /> : <XMarkIcon className='cursor-pointer text-[#F8FAFC] items-center justify-center w-4 h-4' />} */}
                                    </div>
                                    {isValidPublicHandle == false ? (
                                      <p className="mt-7 sm:mt-8 px-2 text-[rgba(255,255,255,0.2)] text-[10px] sm:text-xs font-[Inter]">
                                        Please provide a valid Twitter handle for user
                                      </p>
                                    ) : (
                                      <p className='w-full mt-4'></p>
                                    )}
                                  </label>
                                </form>
                              </div>
                            )}

                            {sellOptions == 'newpool' && recipient == 'public' && newOwner == 'yes' && (
                              <div className="w-full py-2">
                                <form>
                                  <label className="flex-inline">
                                    <input
                                      required={true}
                                      type="text"
                                      className="... peer mt-0.5 w-full items-center justify-center rounded-2xl border-none bg-[#E1E5EC] p-1 pl-6 text-center text-[0.55rem] outline-none focus:outline-none focus:ring-transparent dark:text-gray-700 md:p-2 md:pl-4 md:text-xs"
                                      onChange={event => setNewOwnerAddess(event.target.value)}
                                      placeholder="Enter new owner wallet address"
                                    />
                                    <div className="-mt-[1.88rem] flex items-center justify-end px-1 md:px-2">
                                      <IsAddressValid
                                        recipientAddress={newOwnerAddress ? newOwnerAddress : ''}
                                        setIsRecipientAddressValid={setNewOwnerAddressValid}
                                      />
                                    </div>
                                    {!isNewOwnerAddressValid && (
                                      <p className="mt-2 ml-2 text-[.60rem] text-[#1C76FF] dark:text-white md:text-xs">
                                        Please provide a valid wallet address with no spaces.
                                      </p>
                                    )}
                                  </label>
                                </form>
                              </div>
                            )}

                            {sellOptions == 'newpool' && recipient == 'private' && newOwner == 'yes' && (
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center">
                                Prevent Cancellation of Pool?
                                  <Tooltip animation="duration-500" content="Pool will be unable to be cancelled, and assets can only be sold through Diamond Swap.">
                                    <InformationCircleIcon className="h-4 w-4" />
                                  </Tooltip>
                                </div>
                                <RadioGroup
                                  className="flex h-6 w-fit cursor-pointer items-center rounded-3xl bg-white text-xs text-[#B2BCCC] dark:bg-gray-500"
                                  value={preventCancel}
                                  onChange={setPreventCancel}
                                >
                                  <div>
                                    <RadioGroup.Option value="no">
                                      {({ checked }) => (
                                        <span
                                          className={
                                            checked
                                              ? 'flex h-6 items-center rounded-3xl bg-[#1C76FF] px-2 text-white dark:bg-gray-700'
                                              : 'px-2 '
                                          }
                                        >
                                          No
                                        </span>
                                      )}
                                    </RadioGroup.Option>
                                  </div>
                                  <div>
                                    <RadioGroup.Option value="yes">
                                      {({ checked }) => (
                                        <span
                                          className={
                                            checked
                                              ? 'flex h-6 items-center rounded-3xl bg-[#1C76FF] px-2 text-white dark:bg-gray-700'
                                              : 'px-2'
                                          }
                                        >
                                          Yes
                                        </span>
                                      )}
                                    </RadioGroup.Option>
                                  </div>
                                </RadioGroup>
                              </div>
                            )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                )}
              </div>
              )}
        </div>
      </div>

      <div className='mt-3 sm:mt-5'>
        {!inputTokenData || !outputTokenData ? (
          <>
            {isConnected ? <div className={style.disabledButton}>Select a token</div> : <SelectWalletModal />}
          </>
        ) : (
          <div>
            {!inputTokenAmount || inputTokenAmount <= '0' ? (
              <div className={style.disabledButton}>Input amount</div>
            ) : (
              <div>
                {inputTokenAmount &&
                inputTokenBalance?.data &&
                BigInt(utils.parseUnits(inputTokenAmount, inputTokenData?.decimals)) >
                  BigInt(inputTokenBalance?.data?.value.toString())
                ? (
                  <div className={style.disabledButton}>Insufficient {inputTokenData?.symbol} balance</div>
                ) : (
                  <div>
                    <SellTokenConfirmationModal
                      setSelectedOne={setSelectedOne}
                      resetSellPageState={resetSellPageState}
                      userAddress={userAddress}
                      inputTokenData={inputTokenData}
                      inputTokenAmount={inputTokenAmount}
                      inputTokenSellAmount={inputTokenSellAmount}
                      outputTokenData={outputTokenData}
                      outputTokenAmount={outputTokenAmount}
                      outputTokenMarketAmount={outputTokenMarketAmount}
                      sellOptions={sellOptions}
                      recipient={recipient}
                      recipientType={recipientType}
                      transferPool={transferPool}
                      transferAddress={transferAddress}
                      transferHandle={transferHandle}
                      recipientAddress={recipientAddress}
                      recipientHandle={recipientHandle}
                      allowPartialBuys={allowPartialBuys}
                      discountOption={discountOption}
                      selectedDiscount={selectedDiscount}
                      customDiscount={customDiscount}
                      vestingPeriodOption={vestingPeriodOption}
                      vestingInitialAmountPercent={vestingInitialAmountPercent}
                      vestingPeriodPercent={vestingPeriodPercent}
                      vestingPeriodTimeframe={vestingPeriodTimeframe}
                      newOwner={newOwner}
                      newOwnerAddress={newOwnerAddress}
                      preventCancel={preventCancel}
                      IsModalOpened={modalIsOpen}
                      onCloseModal={handleCloseModal}
                      onAfterOpen={handleAfterOpen}
                    />
                    <button
                      disabled={
                        !inputTokenData ||
                        !outputTokenData ||
                        !inputTokenAmount ||
                        !outputTokenAmount ||
                        !sellOptions ||
                        (sellOptions == 'newpool' && !recipient) ||
                        (recipient == 'public' && !recipientType) ||
                        (recipient == 'public' && recipientType == 'address' && transferPool && (!transferAddress || !isTransferAddressValid)) ||
                        (recipient == 'public' && recipientType == 'twitter'  && transferPool && !transferHandle) ||
                        (recipient == 'private' && !recipientType) ||
                        (recipient == 'private' && recipientType == 'address' && (!recipientAddress || !isRecipientAddressValid)) ||
                        (recipient == 'private' && recipientType == 'twitter' && !recipientHandle) ||
                        (discountOption && !selectedDiscount) ||
                        (discountOption && selectedDiscount == 'custom' && !customDiscount) ||
                        (vestingPeriodOption && (!vestingPeriodPercent || !vestingPeriodTimeframe)) || !handleAddress || !transferHandleAddress
                      }
                      onClick={openFromParent}
                      className={style.listforsellButton}
                    >
                      {!sellOptions ? (
                        <a>Select sell option</a>
                      ) : sellOptions == 'newpool' && (recipient == '' || recipient == 'public') ? (
                        recipient == 'public' && recipientType == '' ? (
                          <a>Select recipient option</a>
                        ) : recipient == 'public' && recipientType == 'address' && transferPool && !isTransferAddressValid ? (
                        <a>Enter counterparty address</a>
                        ) : (
                        <a>List for sell</a>
                        )
                      ) : recipient == 'private' && recipientType == '' ? (
                        <a>Select recipient option type</a>
                      ) : recipient == 'private' && recipientType == 'address' && !isRecipientAddressValid ? (
                        <a>Enter counterparty address</a>
                      ) : (
                        <a>List for sell</a>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hidden flex-col text-center text-black dark:text-white">
        <h1 className="text-red-500">Temp Confirmation Data to list for sell</h1>
        <div>
          {inputTokenData?.symbol}:{inputTokenAmount}
        </div>
        <div>
          {outputTokenData?.symbol}:{outputTokenAmount}
        </div>
        <div>{sellOptions}</div>
        <div>
          {recipient}:&nbsp;{recipientType}
        </div>
        <div>
          {recipientAddress}:&nbsp;{recipientHandle}
        </div>
        <div>{allowPartialBuys}</div>
        <div>
          {discountOption?.toString()}:&nbsp;{selectedDiscount}&nbsp;{customDiscount * '10'}
        </div>
        <div>
          {vestingPeriodOption?.toString()}:&nbsp;{vestingPeriodPercent * '10'}:&nbsp;{vestingPeriodTimeframe?.name}
          {vestingPeriodTimeframe?.time}:&nbsp;{vestingInitialAmountPercent * '10'}
        </div>
      </div>
    </div>
  )
}

export default SellTokenOptions
