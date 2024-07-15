import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAccount, useBalance, useNetwork } from 'wagmi'
import TokenModal from '../../sellAssetsComponents/tokens/TokenModal'
import { convertTokenNewPrice } from '../../../utils/tokenCoinNewPrice'
import walletIcon from '../../../assets/bal_logo.svg';
import { countLeadingZerosAfterDecimal } from '../../../utils/countDecimals';

const style = {
  sellOutput: 'customShare flex w-full h-[90px] sm:min-h-[140px] justify-between bg-[rgba(255,255,255,0.05)] rounded-[6px] sm:rounded-[8px] p-4 sm:p-6',
  sellOutputText: 'w-full text-[10px] sm:text-base text-[rgba(255,255,255,0.5)] font_Inter',
  sellOutputBalanceContainer: 'flex flex-col items-center',
  sellOutputBalance: 'flex w-full justify-end items-center gap-2',
  sellOutputSelector: 'flex justify-start',
  sellOutputInputContainer: 'flex justify-end items-center text-white text-[2rem] sm:pt-3',
  sellOutputAmount:
    'defaultPlaceholder flex w-full justify-end text-white font-[Abel] sm:font-bold bg-transparent text-xl sm:text-3xl border-none outline-none focus:outline-none focus:ring-transparent text-end p-0',
  sellOutputValue: 'flex w-full justify-end  text-sm sm:text-base text-[rgba(255,255,255,0.5)] font-[Abel]',
}

const SellTokenOutput = props => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [outputTokenData, setOutputTokenData] = useState();
  const [tokenAmountValue, setTokenAmountValue] = useState('');

  const outputRestricted = true;
  const outputRestrictedValue = 'WETH';

  const outputTokenBalance = useBalance({
    address: address,
    token: outputTokenData?.address,
  });

  const tokenOutputBalance = outputTokenBalance.data?.value.toString() / 10 ** outputTokenBalance.data?.decimals;

  useEffect(() => {
    props.setOutputTokenData(outputTokenData);
    props.setOutputTokenAmount('');
  }, [outputTokenData]);

  // async function getTokenPrice() {
  //   if (chain?.id != (42161 || 1 || 56 || 137 || 97 || 42161 || 80001)) {
  //     return
  //   } else {
  //     {
  //       convertTokenPrice(
  //         outputTokenData?.address ? outputTokenData?.address.toString() : '',
  //         outputTokenData?.symbol.toString(),
  //         props.setOutputTokenPrice,
  //         chain?.id.toString(),
  //         false,
  //         '',
  //         ''
  //       )
  //     }
  //   }
  // }

  async function getTokenPrice() {
    if (chain?.id != (42161 || 1 || 56 || 137 || 97 || 42161 || 80001)) {
      return
    } else {
      {
        convertTokenNewPrice(
          outputTokenData?.symbol.toString(),
          props.setOutputTokenPrice,
          chain?.id.toString(),
        )
      }
    }
  }

  useEffect(() => {
    if (props.outputTokenData) {
      getTokenPrice()
      props.setOutputTokenAmount('')
    }
  }, [props.outputTokenData])

  useEffect(() => {
    if (props.outputTokenAmount && props.outputTokenAmount > 0 && props.outputTokenPrice > 0) {
      let priceTotal = countLeadingZerosAfterDecimal(props.outputTokenAmount * props.outputTokenPrice).toString()
      setTokenAmountValue(priceTotal)
      props.setOutputTokenAmountValue(priceTotal)
    }
  }, [props.outputTokenAmount])

  useEffect(() => {
    if (props.inputTokenAmount > 0 && props.inputTokenAmountValue && props.outputTokenPrice > 0 ) {
      let outputDiamondCalculation = (props.inputTokenAmountValue / props.outputTokenPrice).toString()
      props.setOutputTokenAmount(Number(outputDiamondCalculation)?.toLocaleString(undefined, {maximumFractionDigits: 10}))
    } else if (props.inputTokenAmount == '') {
      props.setOutputTokenAmount('')
    }
    if(props.sellOptions == 'existingpool') {
      props.setOutputTokenMarketAmount(true)
    }
  }, [props.inputTokenAmount, props.inputTokenAmountValue, props.outputTokenPrice, props.outputTokenData, props.sellOptions])

  useEffect(() => {
    setOutputTokenData()
    setTokenAmountValue('')
  }, [chain, address])

  return (
    <div>
      <div className={style.sellOutput}>
        <div className="flex flex-col gap-3">
          <div className={style.sellOutputText}>You&apos;ll receive</div>
          <button type="button" className={style.sellOutputSelector}>
            <TokenModal
              SetTokenData={setOutputTokenData}
              outputTokenData={outputTokenData}
              outputRestricted={outputRestricted}
              outputRestrictedValue={outputRestrictedValue}
              inputTokenData={props.inputTokenData}
            />
          </button>
        </div>
        <div className={style.sellOutputBalanceContainer}>
          <div className={style.sellOutputBalance}>
            <Image src={walletIcon} alt="bal_logo" height={12} width={12} className='text-white'></Image>
            {address && (outputTokenData?.address || outputTokenData?.symbol) ? (
              <div className='text-[rgba(255,255,255,0.5)] font-[Abel] text-sm sm:text-base'>{Number(parseFloat(tokenOutputBalance).toFixed(4))?.toLocaleString()}</div>
            ) : (
              <div className='text-[rgba(255,255,255,0.6)]'>-</div>
            )}
          </div>
          <div className={style.sellOutputInputContainer}>
            <input
              className={style.sellOutputAmount}
              disabled={!outputTokenData || props.sellOptions == 'existingpool'}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="0.0"
              pattern="^[0-9]*[.,]?[0-9]*$"
              minLength="1"
              maxLength="79"
              value={props.outputTokenAmount}
              onChange={
                outputTokenData
                  ? event => {
                      props.setOutputTokenAmount(event.target.value)
                      props.setOutputTokenMarketAmount(false)
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
          {/* {props.outputTokenAmount && props.outputTokenMarketAmount && tokenAmountValue && (
              <div className={style.sellOutputValue}>
                Current Market Value:&nbsp;{'$' + (tokenAmountValue)?.toLocaleString() + ''}
              </div>
            )}
            {props.outputTokenAmount && props.outputTokenMarketAmount && tokenAmountValue && (
              <div className={style.sellOutputValue}>
                Manual Set Value:&nbsp;{'($' + (tokenAmountValue)?.toLocaleString() + ')'}
              </div>
            )} */}

            {props.outputTokenAmount && tokenAmountValue && (
              <div className={style.sellOutputValue}>
                {'$' + (tokenAmountValue)?.toLocaleString() + ''}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default SellTokenOutput
