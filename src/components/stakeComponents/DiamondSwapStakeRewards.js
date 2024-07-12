import React, { useState } from 'react'
import { utils } from 'ethers'
import {
  useAccount,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useToken,
} from 'wagmi'
import Countdown from 'react-countdown'
import DMNDStakingABI from '../../constants/contracts/diamondStakingABI.json'
import xDMNDContractABI from '../../constants/contracts/xdiamondDivABI.json'

const diamondTokenContract = process.env.NEXT_PUBLIC_DIAMOND_TOKEN_CONTRACT
const xdiamondTokenContract = process.env.NEXT_PUBLIC_XDIAMOND_TOKEN_CONTRACT
const diamondstakingContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_STAKING_CONTRACT

const DiamondSwapAccountContainer = () => {
  const { address } = useAccount()

  const [amountToRestake, setAmountToRestake] = useState('')

  const { data: DMND_Token } = useToken({
    address: diamondTokenContract,
  })

  const { data: claimableEth } = useContractRead({
    addressOrName: xdiamondTokenContract,
    contractInterface: xDMNDContractABI,
    functionName: 'withdrawableDividendOf',
    args: address,
  })

  const { config: claimETH, error: claimETHError } = usePrepareContractWrite({
    addressOrName: xdiamondTokenContract,
    contractInterface: xDMNDContractABI,
    functionName: 'claim',
  })

  const {
    data: claimETHData,
    isLoading: claimETHLoading,
    isSuccess: claimETHSuccess,
    write: claimETHWrite,
  } = useContractWrite(claimETH)

  const claimETHWaitForTransaction = useWaitForTransaction({
    hash: claimETHData?.hash,
    onSuccess() {
      console.log('Success', claimETHData)
    },
  })

  const Completionist = () => <span>Cooldown period completed!</span>

  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a complete state
      return <Completionist />
    } else {
      // Render a countdown
      return (
        <span>
          {days}D:{hours}H:{minutes}M:{seconds}s
        </span>
      )
    }
  }

  const { data: unstakedDiamondBalance } = useContractRead({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    functionName: 'unstakedDiamondBalance',
    args: address,
  })

  const { data: unstakedTimestamp } = useContractRead({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    functionName: 'unstakedTimestamp',
    args: address,
  })

  const { data: unstakeCoolDownPeriod } = useContractRead({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    functionName: 'unstakeCoolDownPeriod',
  })

  const { data: coolDownTimeRemaining } = useContractRead({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    functionName: 'getCooldownRemainingTime',
    overrides: { from: address },
  })

  const {
    config: claimUnstaked,
    error: claimUnstakedError,
    isSuccess: prepClaimUnstakedSuccess,
  } = usePrepareContractWrite({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    enabled: unstakedDiamondBalance?.toString() > '0',
    functionName: 'claimUnstaked',
  })

  const {
    data: claimUnstakedData,
    isLoading: claimUnstakedLoading,
    isSuccess: claimUnstakedSuccess,
    write: claimUnstakedWrite,
  } = useContractWrite(claimUnstaked)

  const claimUnstakedWaitForTransaction = useWaitForTransaction({
    hash: claimUnstakedData?.hash,
    onSuccess() {
      console.log('Success', claimUnstakedData)
    },
  })

  const { config: restakeToken, error: restakeTokenError } = usePrepareContractWrite({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    enabled: amountToRestake > '0',
    functionName: 'restake',
    args: amountToRestake && utils.parseUnits(amountToRestake, DMND_Token?.decimals),
  })

  const {
    data: restakeTokenData,
    isLoading: restakeTokenLoading,
    isSuccess: restakeTokenSuccess,
    write: restakeTokenWrite,
  } = useContractWrite(restakeToken)

  const restakeTokenWaitForTransaction = useWaitForTransaction({
    hash: restakeTokenData?.hash,
    onSuccess(restakeTokenData) {
      console.log('Success', restakeTokenData)
    },
  })

  return (
    <div className="w-[30rem] rounded-3xl border border-white bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 p-5 dark:border-black dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40">
      <dl>
        <h1 className="flex justify-center text-xl font-bold text-[#566B90] dark:text-white">
          Staking and Reward Balances
        </h1>
        <div className="flex items-center justify-center">
          <div className="items-center p-2 px-4">
            <div className="dark:text-white">Claimable earned ETH</div>
            <div className="mt-2 flex justify-between rounded-2xl bg-[#F4F9FF] p-2 px-3 dark:bg-gray-500 dark:text-white">
              <div>
                {claimableEth ? parseFloat(utils.formatEther(claimableEth.toString())).toFixed(6) : '0.0'}
              </div>
              <div>ETH</div>
            </div>
            <div className="flex justify-center p-1">
              <button
                disabled={claimableEth?.toString() <= '0'}
                className="rounded-2xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                onClick={() => claimETHWrite?.()}
              >
                {claimETHLoading || claimETHWaitForTransaction.isLoading ? (
                  <a className="animate-pulse">Claiming...</a>
                ) : (
                  <a>Claim ETH</a>
                )}
              </button>
            </div>
          </div>
          {unstakedDiamondBalance?.toString() > '0' && (
            <div className="items-center p-2 px-4">
              <div className="dark:text-white">Claimable Unstaked DMNDs</div>
              <div>
                <div>
                  DIAMONDS Claimable Balance:{' '}
                  <a className="font-bold">
                    {unstakedDiamondBalance
                      ? utils.commify(
                          utils.formatUnits(unstakedDiamondBalance.toString(), DMND_Token?.decimals)
                        )
                      : '0.0'}
                  </a>
                </div>
                <div className="dark:text-white">
                  Cooldown Time Remaining:&nbsp;
                  <Countdown
                    date={
                      Number(new Date(Number(unstakedTimestamp?.toString()) * 1000)) +
                      Number(unstakeCoolDownPeriod?.toString()) * 1000
                    }
                    renderer={renderer}
                  />
                </div>
              </div>
              <div className="flex justify-center p-2">
                <input
                  disabled={(unstakedDiamondBalance && unstakedDiamondBalance.toString() <= '0') || restakeTokenError}
                  className="m-0 flex justify-end rounded-xl border-none bg-[#F4F9FF] px-1 text-end text-xs text-[#354B75] outline-none focus:outline-none focus:ring-transparent dark:bg-gray-300 dark:text-black md:text-lg"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder="0.0"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  minLength="1"
                  maxLength="79"
                  value={amountToRestake}
                  onChange={event => {
                    setAmountToRestake(event.target.value)
                  }}
                  onKeyPress={event => {
                    if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                      event.preventDefault()
                    }
                  }}
                />
              </div>
              <div className="flex justify-center">
                <div className="p-1">
                  <button
                    disabled={unstakedDiamondBalance?.toString() <= '0' && !prepClaimUnstakedSuccess}
                    className="rounded-2xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                    onClick={() => claimUnstakedWrite?.()}
                  >
                    {claimUnstakedLoading || claimUnstakedWaitForTransaction.isLoading ? (
                      <a className="animate-pulse">Claiming...</a>
                    ) : (
                      <a>Claim DMND</a>
                    )}
                  </button>
                </div>
                <div className="p-1">
                  <button
                    disabled={amountToRestake <= '0' || restakeTokenError}
                    className="rounded-2xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                    onClick={() => restakeTokenWrite?.()}
                  >
                    {restakeTokenLoading || restakeTokenWaitForTransaction.isLoading ? (
                      <a className="animate-pulse">Restaking...</a>
                    ) : (
                      <a>Restake DMND</a>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </dl>
      {unstakedDiamondBalance?.toString() > '0' && (
        <div className="text-yellow-400">
          Note: You can restake your DMND tokens within the cool down period if you change your mind.
        </div>
      )}
    </div>
  )
}

export default DiamondSwapAccountContainer
