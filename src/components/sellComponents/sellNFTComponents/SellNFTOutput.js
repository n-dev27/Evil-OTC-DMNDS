import React, { useState, useEffect } from 'react'
import { useAccount, useBalance, useNetwork } from 'wagmi'
import { utils } from 'ethers'
import TokenModal from '../../sellAssetsComponents/tokens/TokenModal'
import { convertTokenPrice } from '../../../utils/tokenCoinPrice'

const style = {
  sellOutput: 'flex w-full justify-between bg-white dark:bg-gray-500/70 rounded-2xl p-2 md:px-3 pb-0 md:pb-3',
  sellOutputText: 'w-full p-1 md:px-1 text-xs text-[#B9BCC7]',
  sellOutputBalanceContainer: 'flex-col px-1 items-center',
  sellOutputBalance: 'flex p-1 md:p-1 justify-end w-full text-xs text-end text-[#B9BCC7]',
  sellOutputSelector: 'flex px-1 justify-start rounded-xl',
  sellOutputInputContainer: 'flex-col items-center md:h-8 text-end',
  sellOutputAmount:
    'flex w-full px-1 justify-end text-[#354B75] dark:text-white text-xs md:text-lg bg-transparent border-none outline-none focus:outline-none focus:ring-transparent text-end',
  sellOutputValue: 'flex px-1 -mt-1 md:-mt-3 justify-end text-[.65rem] text-[#B2BCC7] h-3.5 text-end',
}

const SellNFTOutput = props => {
  const { address } = useAccount()

  const { chain } = useNetwork()

  const [outputTokenData, setOutputTokenData] = useState()

  const [tokenAmountValue, setTokenAmountValue] = useState('')

  const outputRestricted = true

  const outputRestrictedValue = 'WETH'

  const outputTokenBalance = useBalance({
    addressOrName: address,
    token: outputTokenData?.address,
  })

  const tokenOutputBalance = outputTokenBalance.data?.value.toString() / 10 ** outputTokenBalance.data?.decimals

  useEffect(() => {
    props.setOutputTokenData(outputTokenData)
    props.setOutputTokenAmount('')
  }, [outputTokenData])

  async function getTokenPrice() {
    if (chain?.id != (1 || 56 || 137 || 97 || 80001)) {
      return
    } else {
      {
        convertTokenPrice(
          outputTokenData?.address ? outputTokenData?.address.toString() : '',
          outputTokenData?.symbol.toString(),
          props.setOutputTokenPrice,
          chain?.id.toString()
        )
      }
    }
    console.log('price', props.outputTokenPrice)
  }

  useEffect(() => {
    if (props.outputTokenData) {
      getTokenPrice()
      props.setOutputTokenAmount('')
    }
  }, [props.outputTokenData])

  useEffect(() => {
    if (props.outputTokenAmount && props.outputTokenAmount > 0 && props.outputTokenPrice > 0) {
      let priceTotal = parseFloat(props.outputTokenAmount * props.outputTokenPrice)
        .toFixed(4)
        .toString()
      setTokenAmountValue(priceTotal)
      props.setOutputTokenAmountValue(priceTotal)
    } else {
      setTokenAmountValue('')
    }
  }, [props.outputTokenAmount])

  useEffect(() => {
    setOutputTokenData()
    setTokenAmountValue('')
  }, [chain, address])

  return (
    <div>
      <div className={style.sellOutput}>
        <div className="flex-col">
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
            Balance:&nbsp;
            {address && (outputTokenData?.address || outputTokenData?.symbol) ? (
              <div>{parseFloat(tokenOutputBalance).toFixed(4)}</div>
            ) : (
              <div>-</div>
            )}
          </div>
          <div className={style.sellOutputInputContainer}>
            <input
              className={style.sellOutputAmount}
              disabled={!outputTokenData}
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
                    }
                  : null
              }
              onKeyPress={event => {
                if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                  event.preventDefault()
                }
              }}
            />
            {tokenAmountValue && (
              <div className={style.sellOutputValue}>
                Current Market Value:&nbsp;{'~$' + utils.commify(tokenAmountValue) + ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellNFTOutput
