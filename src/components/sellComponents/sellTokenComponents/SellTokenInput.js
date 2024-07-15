import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import TokenModal from '../../sellAssetsComponents/tokens/TokenModal';
import { convertTokenNewPrice } from '../../../utils/tokenCoinNewPrice';
import walletIcon from '../../../assets/bal_logo.svg';
import { countLeadingZerosAfterDecimal } from '../../../utils/countDecimals';

const style = {
  sellInput: 'customShare flex w-full h-[90px] sm:min-h-[140px] justify-between bg-[rgba(255,255,255,0.05)] rounded-[6px] sm:rounded-[8px] p-4 sm:p-6',
  sellInputText: 'w-full text-[10px] sm:text-base text-[rgba(255,255,255,0.5)] font_Inter',
  sellInputBalanceContainer: 'flex flex-col',
  sellInputBalance: 'flex w-full justify-end items-center gap-2',
  sellInputSelector: 'flex justify-start',
  sellInputMaxButton:
    'flex justify-center text-[rgba(28,118,255,1)] text-xs sm:text-base font-bold font_Inter items-center hover:animate-pulse rounded-md',
  sellInputInputContainer: 'flex justify-end items-center text-white text-[2rem] sm:pt-3',
  sellInputAmount:
    'defaultPlaceholder flex w-full justify-end text-white font-[Abel] sm:font-bold bg-transparent text-xl sm:text-3xl border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellInputValue: 'flex w-full justify-end  text-sm sm:text-base text-[rgba(255,255,255,0.5)] font-[Abel]',
}

const SellTokenInput = props => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [inputTokenData, setInputTokenData] = useState();
  const [tokenAmountValue, setTokenAmountValue] = useState('');

  const inputTokenBalance = useBalance({
    address: address,
    token: inputTokenData?.address,
    watch: true,
  });

  const tokenInputBalance = inputTokenBalance?.data?.formatted;

  useEffect(() => {
    props.setInputTokenData(inputTokenData)
    chain?.id === 1 && props.setZeroxAPIurl('api.0x.org')
    chain?.id === 5 && props.setZeroxAPIurl('goerli.api.0x.org')
    chain?.id === 56 && props.setZeroxAPIurl('bsc.api.0x.org')
    chain?.id === 137 && props.setZeroxAPIurl('polygon.api.0x.org')
    chain?.id === 80001 && props.setZeroxAPIurl('mumbai.api.0x.org')
    chain?.id === 42161 && props.setZeroxAPIurl('arbitrum.api.0x.org')
    props.setInputTokenAmount('')
    props.setOutputTokenAmount('')
  }, [inputTokenData]);

  // async function getTokenPrice() {
  //   if (chain?.id != (42161 || 56 || 137 || 97 || 80001 || 1)) {
  //     return
  //   } else {
  //     {
  //       convertTokenPrice(
  //         inputTokenData?.address ? inputTokenData?.address.toString() : '',
  //         inputTokenData?.symbol?.toString(),
  //         props.setInputTokenPrice,
  //         chain?.id.toString(),
  //         false,
  //         '',
  //         ''
  //       )
  //     }
  //   }
  // }

  async function getTokenPrice() {
    if (chain?.id != (42161 || 56 || 137 || 97 || 80001 || 1)) {
      return
    } else {
      {
        convertTokenNewPrice(
          inputTokenData?.symbol?.toString(),
          props.setInputTokenPrice,
          chain?.id.toString(),
        )
      }
    }
  };

  useEffect(() => {
    if (props.inputTokenData) {
      getTokenPrice()
    }
    if (props.inputTokenAmount && props.inputTokenAmount > 0 && props.inputTokenPrice > 0) {
      let priceTotal = countLeadingZerosAfterDecimal(props.inputTokenAmount * props.inputTokenPrice).toString()
      setTokenAmountValue(priceTotal)
      props.setInputTokenAmountValue(priceTotal)
    } else if (props.inputTokenAmount && props.inputTokenAmount <= 0) {
      setTokenAmountValue()
      props.setInputTokenAmountValue()
    }
  }, [props.inputTokenData, props.inputTokenAmount]);

  useEffect(() => {
    setInputTokenData()
    setTokenAmountValue('')
  }, [chain, address]);

  return (
    <div className={style.sellInput}>
      <div className="flex flex-col gap-3">
        <div className={style.sellInputText}>You&apos;ll sell</div>
        <div className="flex items-center">
          <button type="button" className={style.sellInputSelector}>
            <TokenModal SetTokenData={setInputTokenData} outputTokenData={props.outputTokenData} />
          </button>
        </div>
      </div>
      <div className={style.sellInputBalanceContainer}>
        <div className='flex justify-end gap-[4px]'>
          <div className={style.sellInputBalance}>
            <Image src={walletIcon} alt="bal_logo" height={12} width={12} className='text-white'></Image>
            {address && tokenInputBalance && (inputTokenData?.address || inputTokenData?.symbol) ? (
              <div className='text-[rgba(255,255,255,0.5)] font-[Abel] text-sm sm:text-base'>{Number(parseFloat(tokenInputBalance).toFixed(4))?.toLocaleString()}</div>
            ) : (
              <div className='text-[rgba(255,255,255,0.6)]'>-</div>
            )}
          </div>
          {inputTokenData ? (
              <div className={style.sellInputMaxButton}>
                <button onClick={() => props.setInputTokenAmount(tokenInputBalance.toString())}>MAX</button>
              </div>
            ) : (<></>)}
        </div>
        <div className={style.sellInputInputContainer}>
          <input
            className={style.sellInputAmount}
            disabled={!inputTokenData}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="0.0"
            pattern="^[0-9]*[.,]?[0-9]*$"
            minLength="1"
            maxLength="79"
            value={props.inputTokenAmount}
            onChange={
              inputTokenData
                ? event => {
                    props.setInputTokenAmount(event.target.value)
                    props.setOutputTokenMarketAmount(true)
                  }
                : null
            }
            onKeyPress={event => {
              const value = event.target.value;
              if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key) || (event.key === "." && value.includes("."))) {
                event.preventDefault()
              }
            }}
          />
        </div>
        {props.inputTokenAmount && tokenAmountValue && (
            <div className={style.sellInputValue}>
              {'$' + Number(tokenAmountValue).toLocaleString(undefined, {maximumFractionDigits: 2}) + ''}
            </div>
          )}
      </div>
    </div>
  )
}

export default SellTokenInput
