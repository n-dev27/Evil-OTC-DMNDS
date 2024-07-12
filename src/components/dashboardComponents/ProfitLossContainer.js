import React, { useState } from 'react'
import { utils } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import { fetchProfitLoss } from '../dashboardComponents/utils/checkProfitLoss'

const ProfitLossContainer = () => {
  const { address } = useAccount()

  const { chain } = useNetwork()

  const [tokenToCheck, setTokenToCheck] = useState('')

  const [profitLoss, setProfitLoss] = useState('')

  return (
    <div className="md:text-large justify-center rounded-3xl border border-white bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 p-4 px-8 text-center text-sm text-[#566C90] dark:border-black dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40">
      <dl>
        <div>
          <h1 className="text-xl font-bold text-[#566B90] dark:text-white">Check Profit/Loss for an asset</h1>
          <div className="dark:text-white">Input token address to check your profit/loss</div>
          <div className="text-xs dark:text-white">(Chains Supported: Ethereum)</div>
          <div className="flex w-full justify-center p-1">
            <input
              className="flex w-full justify-center rounded-md border-none px-1 text-xs text-[#354B75] outline-none dark:text-white md:text-lg"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Token Contract Address"
              minLength="1"
              maxLength="79"
              value={tokenToCheck}
              onChange={event => setTokenToCheck(event.target.value)}
            />
          </div>
          <div className="flex justify-center">
            <div className="mt-2 flex items-center rounded-2xl bg-[#F4F9FF] p-1 px-2 dark:bg-gray-500 dark:text-white">
              <div className="flex justify-center px-2 text-center">
                {tokenToCheck && profitLoss ? (
                  profitLoss == 'N/A' ? (
                    profitLoss
                  ) : profitLoss > 0 ? (
                    <a className="text-green-500">{parseFloat(profitLoss).toFixed(2)}</a>
                  ) : (
                    <a className="text-red-400">{'$' + utils.commify(parseFloat(profitLoss).toFixed(2))}</a>
                  )
                ) : (
                  'Input Token to Check'
                )}
              </div>
              <div>USD</div>
            </div>
          </div>
          <div className="flex w-full justify-center p-1">
            <div className="w-1/2">
              <button
                disabled={!tokenToCheck}
                className="dark:hover:bg-gray600 mt-3 rounded-3xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:opacity-60 dark:bg-gray-400 dark:text-black "
                onClick={() => fetchProfitLoss(tokenToCheck, chain?.id, address, setProfitLoss)}
              >
                <a>Check profit/loss</a>
              </button>
            </div>
            <div className="w-1/2">
              <button
                disabled={!tokenToCheck}
                className="dark:hover:bg-gray600 mt-3 w-full rounded-3xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:opacity-60 dark:bg-gray-400 dark:text-black"
                onClick={() => setTokenToCheck('') + setProfitLoss('')}
              >
                <a>Clear</a>
              </button>
            </div>
          </div>
        </div>
      </dl>
    </div>
  )
}

export default ProfitLossContainer
