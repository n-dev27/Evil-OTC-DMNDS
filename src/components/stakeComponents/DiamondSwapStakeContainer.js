import React, { useState } from 'react'
import { utils } from 'ethers'
import {
  useToken,
  useBalance,
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  erc20ABI,
} from 'wagmi'
import DMNDStakingABI from '../../constants/contracts/diamondStakingABI.json'

const diamondTokenContract = process.env.NEXT_PUBLIC_DIAMOND_TOKEN_CONTRACT
const xdiamondTokenContract = process.env.NEXT_PUBLIC_XDIAMOND_TOKEN_CONTRACT
const diamondstakingContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_STAKING_CONTRACT

function DiamondSwapStakeRewards() {
  const { isConnected, address } = useAccount()

  const { data: DMND_Token } = useToken({
    address: diamondTokenContract,
  })

  const { data: xDMND_Token } = useToken({
    address: xdiamondTokenContract,
  })

  const { data: DMND_Token_Balance } = useBalance({
    addressOrName: address,
    token: diamondTokenContract,
  })

  const { data: xDMND_Token_Balance } = useBalance({
    addressOrName: address,
    token: xdiamondTokenContract,
  })

  const [amountToStake, setAmountToStake] = useState('')

  const [approvalComplete, setApprovalComplete] = useState(false)

  const [amountToUnstake, setAmountToUnstake] = useState('')

  const [approvalUnstakeComplete, setApprovalUnstakeComplete] = useState(false)

  const stakeAllowance = useContractRead({
    addressOrName: diamondTokenContract,
    contractInterface: erc20ABI,
    functionName: 'allowance',
    enabled: amountToStake > '0',
    args: [address, diamondstakingContract],
    watch: true,
    onSuccess(data) {
      if (stakeAllowance.data?.toString() >= DMND_Token?.value?.toString()) {
        console.log('allowane', data)
        setApprovalComplete(true)
      }
    },
  })

  const { config: approveStakeToken, error: approveStakeTokenError } = usePrepareContractWrite({
    addressOrName: diamondTokenContract,
    contractInterface: erc20ABI,
    enabled: !approvalComplete && amountToStake > '0',
    functionName: 'approve',
    args: [diamondstakingContract, amountToStake && utils.parseUnits(amountToStake, DMND_Token?.decimals)],
  })

  const {
    data: approveStakeTokenData,
    isLoading: approveStakeTokenLoading,
    isSuccess: approveStakeTokenSuccess,
    write: approveStakeTokenWrite,
  } = useContractWrite(approveStakeToken)

  const approveStakeTokenWaitForTransaction = useWaitForTransaction({
    hash: approveStakeTokenData?.hash,
    onSuccess(approveStakeTokenData) {
      console.log('Success', approveStakeTokenData)
    },
    onSettled(approveStakeTokenData) {
      setApprovalComplete(true)
    },
  })

  const { config: stakeToken, error: stakeTokenError } = usePrepareContractWrite({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    enabled: approvalComplete,
    watch: true,
    functionName: 'stake',
    args: amountToStake && utils.parseUnits(amountToStake, DMND_Token?.decimals),
  })

  const {
    data: stakeTokenData,
    isLoading: stakeTokenLoading,
    isSuccess: stakeTokenSuccess,
    write: stakeTokenWrite,
  } = useContractWrite(stakeToken)

  const stakeTokenWaitForTransaction = useWaitForTransaction({
    hash: stakeTokenData?.hash,
    onSuccess(stakeTokenData) {
      console.log('Success', stakeTokenData)
    },
  })

  const { config: sacrificeToken, error: sacrificeTokenError } = usePrepareContractWrite({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    enabled: approvalComplete,
    watch: true,
    functionName: 'sacrifice',
    args: amountToStake && utils.parseUnits(amountToStake, DMND_Token?.decimals),
  })

  const {
    data: sacrificeTokenData,
    isLoading: sacrificeTokenLoading,
    isSuccess: sacrificeTokenSuccess,
    write: sacrificeTokenWrite,
  } = useContractWrite(sacrificeToken)

  const sacrificeTokenWaitForTransaction = useWaitForTransaction({
    hash: sacrificeTokenData?.hash,
    onSuccess(sacrificeTokenData) {
      console.log('Success', sacrificeTokenData)
    },
  })

  /*Unstaking hooks*/
  const { data: stakedDiamondBalance } = useContractRead({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    functionName: 'stakedDiamondBalance',
    args: address,
  })

  const { config: approveUnstakeToken, error: approveUnstakeTokenError } = usePrepareContractWrite({
    addressOrName: xdiamondTokenContract,
    contractInterface: erc20ABI,
    enabled: !approvalUnstakeComplete && amountToUnstake > '0',
    functionName: 'approve',
    args: [diamondstakingContract, amountToUnstake && utils.parseUnits(amountToUnstake, xDMND_Token?.decimals)],
  })

  const {
    data: approveUnstakeTokenData,
    isLoading: approveUnstakeTokenLoading,
    isSuccess: approveUnstakeTokenSuccess,
    write: approveUnstakeTokenWrite,
  } = useContractWrite(approveUnstakeToken)

  const approveUnstakeTokenWaitForTransaction = useWaitForTransaction({
    hash: approveUnstakeTokenData?.hash,
    onSuccess(approveUnstakeTokenData) {
      console.log('Success', approveUnstakeTokenData)
    },
    onSettled(approveUnstakeTokenData) {
      setApprovalUnstakeComplete(true)
    },
  })

  const { config: unstakeToken, error: unstakeTokenError } = usePrepareContractWrite({
    addressOrName: diamondstakingContract,
    contractInterface: DMNDStakingABI,
    enabled: approvalUnstakeComplete,
    watch: true,
    functionName: 'unstake',
    args: amountToUnstake && utils.parseUnits(amountToUnstake, DMND_Token?.decimals),
  })

  const {
    data: unstakeTokenData,
    isLoading: unstakeTokenLoading,
    isSuccess: unstakeTokenSuccess,
    write: unstakeTokenWrite,
  } = useContractWrite(unstakeToken)

  const unstakeTokenWaitForTransaction = useWaitForTransaction({
    hash: unstakeTokenData?.hash,
    onSuccess(unstakeTokenData) {
      console.log('Success', unstakeTokenData)
    },
  })

  return (
    <div className="w-[45rem] rounded-3xl border border-white bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 p-5 dark:border-black dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40">
      <dl>
        <div>
          <h1 className="text-xl font-bold text-[#566B90] dark:text-white">Staking</h1>
          <div className="text-start">
            <p className="dark:text-white">
              <a className="font-bold">Option 1:</a> Stake your DIAMOND tokens for equivalant 1:1 xDIAMOND tokens, to
              receive dividends from fees generated on the Diamond Swap platform.
            </p>
            <br />
            <p className="dark:text-white">
              <a className="font-bold">Option 2:</a> Permanently lock (burn) your DIAMOND tokens and as a bonus, recieve
              2x amount of xDIAMOND tokens.
            </p>
          </div>
          <div className="w-full justify-between p-1 md:flex">
            <div className="rounded-2xl p-1 px-2 dark:text-white md:w-1/2">
              <div className="p-2">
                <div>
                  DMNDS Balance:{' '}
                  <a className="font-bold">
                    {DMND_Token_Balance ? utils.commify(DMND_Token_Balance?.formatted) : '0.0'}
                  </a>
                </div>
                <div>
                  xDMNDS Balance:{' '}
                  <a className="font-bold">
                    {xDMND_Token_Balance ? utils.commify(xDMND_Token_Balance?.formatted) : '0.0'}
                  </a>
                </div>
              </div>
              {DMND_Token_Balance?.value.toString() > '0' && (
                <div className="flex-col items-center justify-center p-2">
                  <div className="flex justify-center">
                    <input
                      disabled={DMND_Token_Balance && DMND_Token_Balance.formatted <= '0'}
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
                      value={amountToStake}
                      onChange={event => {
                        setAmountToStake(event.target.value)
                      }}
                      onKeyPress={event => {
                        if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                          event.preventDefault()
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <div className="p-2">
                      <button
                        hidden={approvalComplete}
                        disabled={amountToStake <= '0'}
                        className="rounded-2xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                        onClick={() => approveStakeTokenWrite?.()}
                      >
                        {approveStakeTokenLoading || approveStakeTokenWaitForTransaction.isLoading ? (
                          <a className="animate-pulse">Approving...</a>
                        ) : (
                          <a>Approve DMND for staking</a>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-1/2 p-2">
                      <button
                        disabled={
                          !approvalComplete || sacrificeTokenLoading || sacrificeTokenWaitForTransaction.isLoading
                        }
                        className="w-full rounded-2xl bg-[#619FFF] p-1 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                        onClick={() => stakeTokenWrite?.()}
                      >
                        {stakeTokenLoading || stakeTokenWaitForTransaction.isLoading ? <a>Staking...</a> : <a>Stake</a>}
                      </button>
                    </div>
                    <div className="w-1/2 p-2">
                      <button
                        disabled={!approvalComplete || stakeTokenLoading || stakeTokenWaitForTransaction.isLoading}
                        className="w-full rounded-2xl bg-[#619FFF] p-1 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                        onClick={() => sacrificeTokenWrite?.()}
                      >
                        {sacrificeTokenLoading || sacrificeTokenWaitForTransaction.isLoading ? (
                          <a>Sacrificing...</a>
                        ) : (
                          <a>Sacrifice</a>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-2xl px-2 dark:text-white md:w-1/2">
              <div className="p-2">
                <div>
                  Staked DMNDS Balance:{' '}
                  <a className="font-bold">
                    {stakedDiamondBalance
                      ? utils.commify(
                          utils.formatUnits(stakedDiamondBalance?.toString(), DMND_Token?.decimals)
                        )
                      : '0.0'}
                  </a>
                </div>
                <div className="text-xs text-yellow-400">
                  Note: When unstaking, there is a 7 day cool down period before you can claim out your DIAMOND tokens.
                </div>
              </div>
              {stakedDiamondBalance?.toString() > '0' && (
                <div className="flex-col items-center justify-center p-2">
                  <div className="flex justify-center">
                    <input
                      disabled={stakedDiamondBalance && stakedDiamondBalance?.toString() <= '0'}
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
                      value={amountToUnstake}
                      onChange={event => {
                        setAmountToUnstake(event.target.value)
                      }}
                      onKeyPress={event => {
                        if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                          event.preventDefault()
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <div className="p-2">
                      <button
                        hidden={approvalUnstakeComplete}
                        disabled={amountToUnstake <= '0'}
                        className="rounded-2xl bg-[#619FFF] p-2 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                        onClick={() => approveUnstakeTokenWrite?.()}
                      >
                        {approveUnstakeTokenLoading || approveUnstakeTokenWaitForTransaction.isLoading ? (
                          <a className="animate-pulse">Approving...</a>
                        ) : (
                          <a>Approve xDMND for unstaking</a>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-3/6 p-2">
                      <button
                        disabled={
                          !approvalUnstakeComplete || unstakeTokenLoading || unstakeTokenWaitForTransaction.isLoading
                        }
                        className="w-full rounded-2xl bg-[#619FFF] p-1 text-center text-white enabled:hover:scale-105 disabled:bg-gray-400 dark:text-black enabled:dark:bg-gray-300"
                        onClick={() => unstakeTokenWrite?.()}
                      >
                        {unstakeTokenLoading || unstakeTokenWaitForTransaction.isLoading ? (
                          <a>Unstaking...</a>
                        ) : (
                          <a>Unstake</a>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </dl>
    </div>
  )
}

export default DiamondSwapStakeRewards
