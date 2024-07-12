import { useState } from 'react'
import * as React from 'react'
import ReactDOMServer from 'react-dom/server'
import { ethers } from 'ethers'
import { utils } from 'ethers'
import { useNetwork, useAccount, useContractRead, useToken, useBalance } from 'wagmi'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'
import GetTokenImage from '../../utils/GetTokenImage'
import BuyConfirmationModal from './BuyConfirmationModal'
import { convertTokenPrice } from '../../utils/tokenCoinPrice'
import { getVestingSchedule } from '../../utils/getVestingSchedule'

const diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const AssignedPools = () => {
  const { address, isConnected } = useAccount()

  const { chain } = useNetwork()

  const { data: chainData } = useBalance({
    addressOrName: address,
  })

  let chainSymbol = chainData?.symbol

  let chainDecimals = chainData?.decimals

  const [formattedPoolsData, setFormattedPoolsData] = useState()

  const [tokenPrice, setTokenPrice] = useState('')


  const { data: searchedPoolsData } = useContractRead({
    addressOrName: diamondswapContract,
    contractInterface: diamondSwapABI,
    functionName: 'searchPools',
    overrides: { from: address },
    args: ['1', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', ''],
    onSuccess(searchedPoolsData) {
      console.log('Found Assigned Pools', searchedPoolsData)
      const formattedPoolsData =
        searchedPoolsData &&
        searchedPoolsData
          ?.filter(pool => pool?.tokenInformation[5] > '0')
          .map((pool, index) => ({
            poolAddress: pool?.poolAddress,
            poolType: pool?.PoolType,
            poolData: pool?.tokenInformation,
            tokenName: pool?.tokenName,
            tokenSymbol: pool?.symbol,
            tokenAddress: pool?.tokenAddress,
            tokenDecimals: pool?.decimals,
          }))
      console.log('Formatted Assigned Pools Data', formattedPoolsData)
      setFormattedPoolsData(formattedPoolsData)
    },
    onError(error) {
      console.log('Error retrieve pools from contract', error)
    },
  })

  const [nativeTokenPrice, setNativeTokenPrice] = useState('5000000')

  const [usdTokenPrice, setUsdTokenPrice] = useState('0.0000001159174312')

  const [chainTokenPrice, setChainTokenPrice] = useState('1350.022813289872815406562403503535')

  async function getTokenMarketValue({ token }) {
    if (chain?.id != (1 || 56 || 137 || 97 || 80001)) {
      console.log('Chain Not Supported.')
      return
    } else {
      {
        convertTokenPrice(
          token?.data?.address ? token?.data?.address.toString() : '',
          token?.data?.symbol?.toString(),
          setTokenPrice,
          chain?.id.toString()
        )
      }
    }
  }

  return (
    <>
      {isConnected ? (
        <div className="mt-4 flex justify-center">
          <div className="flex w-full justify-center ">
            <div className="md:text-large w-full text-sm text-[#566C90] dark:text-white">
              {formattedPoolsData && formattedPoolsData?.length > 0 ? (
                <div>
                  <>
                    <div className="hidden justify-center md:flex">
                      <table>
                        <thead>
                          <tr>
                            <th className="xs:w-20 px-4">Token</th>
                            <th className="xs:w-20 px-4">Tokens Remaining</th>
                            <th className="xs:w-20 px-4">Market Price</th>
                            <th className="xs:w-20 px-4">Discount</th>
                            <th className="xs:w-20 px-4">Vesting</th>
                            <th className="xs:w-20 px-4">Buy Price</th>
                            <th className="xs:w-20 px-4">Trade</th>
                          </tr>
                        </thead>
                        <>
                          {formattedPoolsData?.map((pool, index) => {
                            let tokenImage = ReactDOMServer.renderToString(<GetTokenImage token={pool?.tokenAddress} />)
                            return (
                              <tbody key={index} className="text-center">
                                <tr>
                                  <td>
                                    <div className="flex w-full justify-start items-center mb-1">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#374D77] to-[#7993BD] text-center">
                                        {tokenImage != '' ? (
                                          <img
                                            src={tokenImage}
                                            className="h-12 w-12 items-center justify-center rounded-full text-center"
                                          />
                                        ) : (
                                          <a className="flex w-auto items-center justify-center text-center text-xs text-white">
                                            {pool?.tokenSymbol}
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex-col pl-2 text-start">
                                        <div>{pool?.tokenSymbol}</div>
                                        <div className="text-xs text-gray-400">{pool?.tokenName}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      {utils.commify(
                                        utils.formatUnits(pool?.poolData[5]?.toString(), pool?.tokenDecimals)
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400">Buy assigned Pool</div>
                                  </td>
                                  <td>
                                    {' '}
                                    {tokenPrice
                                      ? '~$' +
                                        parseFloat(
                                          utils.formatUnits(pool?.poolData[5]?.toString(), pool?.tokenDecimals) *
                                            tokenPrice
                                        ).toFixed(4) +
                                        ' USD'
                                      : 'N/A'}
                                  </td>
                                  <td>
                                    {pool?.poolData[3]?.toString() > '0' ? (
                                      <div>{pool?.poolData[3]?.toString() / '10'}%</div>
                                    ) : (
                                      <div>N/A</div>
                                    )}
                                  </td>
                                  <td>
                                    {pool?.poolData[0]?.toString() > '0' ? (
                                      <div>
                                        <div>
                                          {pool?.poolData[1]?.toString() / '10'}%/{' '}
                                          {getVestingSchedule(pool?.poolData[0]?.toString())}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          Initial Release: {pool?.poolData[2]?.toString() / '10'}%
                                        </div>
                                      </div>
                                    ) : (
                                      <div>N/A</div>
                                    )}
                                  </td>
                                  <td>
                                    {pool?.poolData[4]?.toString() > '0' ? (
                                      <div className="flex-col px-1">
                                        <a className="flex h-4 justify-center text-center">
                                          {parseFloat(
                                            (pool.poolData[4]?.toString() *
                                              utils.formatUnits(pool.poolData[5]?.toString(), pool?.tokenDecimals)) /
                                              10 ** chainDecimals
                                          ).toFixed(2)}
                                          {' '}
                                          {chainSymbol}
                                        </a>
                                        <a className="flex h-3 justify-center text-center text-[.65rem] text-gray-400">
                                          ~$1,519
                                        </a>
                                        <a className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                          Fixed
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="flex-col px-1">
                                        <a className="flex h-4 justify-center text-center">
                                          Market Value {chainSymbol}
                                        </a>
                                        <a className="flex h-3 justify-center text-center text-[.65rem] text-gray-400">
                                          ~$1,219
                                        </a>
                                        <a className="flex h-2 justify-center text-center text-[.65rem] text-gray-400">
                                          Market
                                        </a>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div className="px-2">
                                      <BuyConfirmationModal
                                        modalKey={index}
                                        buyType={pool.poolType?.toString()}
                                        buyTokenAddress={pool?.tokenAddress}
                                        buyTokenName={pool?.tokenName}
                                        buyTokenDecimals={pool?.tokenDecimals}
                                        buyTokenSymbol={pool?.tokenSymbol}
                                        buyTokenPoolAddress={pool.poolAddress?.toString()}
                                        buyTokenAmountAvailable={parseFloat(
                                          utils.formatUnits(pool.poolData[5]?.toString(), pool?.tokenDecimals)
                                        ).toFixed(0)}
                                        buyTokenPrice={pool.poolData[4]?.toString()}
                                        buyTokenFixedPrice={
                                          (pool.poolData[4]?.toString() *
                                            utils.formatUnits(pool.poolData[5]?.toString(), pool?.tokenDecimals)) /
                                          10 ** chainDecimals
                                        }
                                        buyTokenNativePrice={nativeTokenPrice}
                                        buyTokenUsdPrice={usdTokenPrice}
                                        payTokenSymbol={chainSymbol}
                                        payTokenDecimals={chainDecimals}
                                        buyDiscount={pool.poolData[3]?.toString() / '10'}
                                        buyVestingInitialAmount={pool.poolData[2]?.toString() / '10'}
                                        buyVestingSchedulePercent={pool.poolData[1]?.toString() / '10'}
                                        buyVestingScheduleTimeframe={getVestingSchedule(pool.poolData[0]?.toString())}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            )
                          })}
                        </>
                      </table>
                    </div>

                    <div className="flex w-full text-xs text-[#8295B3] dark:text-gray-400 md:hidden">
                      <div className="w-full">
                        {formattedPoolsData?.map((pool, index) => {
                          let tokenImage = ReactDOMServer.renderToString(<GetTokenImage token={pool?.tokenAddress} />)
                          return (
                            <div key={index} className="py-2">
                              <div className="w-full rounded-xl bg-white p-2 dark:bg-gray-500/30">
                                <div className="w-full flex-col">
                                  <div className="flex justify-between">
                                    <div className="flex">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#374D77] to-[#7993BD] text-center">
                                        {tokenImage != '' ? (
                                          <img
                                            src={tokenImage}
                                            className="h-12 w-12 items-center justify-center rounded-full text-center"
                                          />
                                        ) : (
                                          <a className="flex w-auto items-center justify-center text-center text-xs text-white">
                                            {pool?.tokenSymbol}
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex-col justify-start px-2 text-start ">
                                        <div className="text-sm font-semibold text-[#566C90] dark:text-white">
                                          {pool?.tokenName}
                                        </div>
                                        <div className="text-xs">{pool?.tokenSymbol}</div>
                                      </div>
                                    </div>
                                    <div className="flex-col">
                                      <div className="flex items-center justify-between">
                                        <div className="flex justify-end px-1">Market Price:</div>
                                        <div className="text-[#566C90] dark:text-white">$123.45</div>
                                      </div>
                                      <div className="flex items-center justify-between py-1">
                                        <div className="flex justify-end px-1">Discount:</div>
                                        {pool.poolData[3]?.toString() > '0' ? (
                                          <div className="text-[#566C90] dark:text-white">
                                            {pool.poolData[3]?.toString() / '10'}%
                                          </div>
                                        ) : (
                                          <div className="text-[#566C90] dark:text-white">N/A</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <div className="flex-col">
                                      <div className="py-1">Buy Price</div>
                                      {pool.poolData[4]?.toString() > '0' ? (
                                        <div className="flex items-center">
                                          <a className="text-lg font-semibold text-[#566C90] dark:text-white">
                                            {(pool.poolData[4]?.toString() *
                                              utils.formatUnits(
                                                pool.poolData[5]?.toString(),
                                                pool?.tokenDecimals
                                              )) /
                                              10 ** 18}{' '}
                                            {chainSymbol}
                                          </a>
                                          <div className="flex px-1">
                                            (<a className="text-gray-400">~$1,519 USD</a>)
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center">
                                          <a className="text-lg font-semibold text-[#566C90]">
                                            Market Value {chainSymbol}
                                          </a>
                                          <div className="flex px-1">
                                            <a className="text-gray-400">~$1,219</a>
                                            <a className="text-gray-400">Market</a>
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <a>
                                          Tokens:{' '}
                                          {utils.commify(
                                            utils.formatUnits(pool.poolData[5]?.toString(), pool?.tokenDecimals)
                                          )}
                                        </a>
                                      </div>
                                    </div>

                                    <div className="mt-4 flex-col items-end">
                                      <div className="flex justify-end">Vesting</div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex justify-end px-1">Schedule:</div>
                                        {pool.poolData[0]?.toString() > '0' ? (
                                          <div className="text-[#566C90] dark:text-white">
                                            <div>
                                              {pool.poolData[1]?.toString() / '10'}% /{' '}
                                              {getVestingSchedule(pool.poolData[0]?.toString())}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-[#566C90] dark:text-white">N/A</div>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between py-1">
                                        <div className="flex justify-end px-1">Initial Release:</div>
                                        {pool.poolData[0]?.toString() > '0' ? (
                                          <div className="text-[#566C90] dark:text-white">
                                            <div className="text-xs text-[#566C90] dark:text-white">
                                              {pool.poolData[2]?.toString() / '10'}%
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-[#566C90] dark:text-white">100%</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="">
                                  <BuyConfirmationModal
                                    modalKey={index}
                                    buyType={pool.poolType?.toString()}
                                    buyTokenAddress={pool?.tokenAddress}
                                    buyTokenName={pool?.tokenName}
                                    buyTokenDecimals={pool?.tokenDecimals}
                                    buyTokenSymbol={pool?.tokenSymbol}
                                    buyTokenPoolAddress={pool.poolAddress?.toString()}
                                    buyTokenAmountAvailable={parseFloat(
                                      utils.formatUnits(pool.poolData[5]?.toString(), pool?.tokenDecimals)
                                    ).toFixed(0)}
                                    buyTokenPrice={pool.poolData[4]?.toString()}
                                    buyTokenFixedPrice={
                                      (pool.poolData[4]?.toString() *
                                        utils.formatUnits(pool.poolData[5]?.toString(), pool?.tokenDecimals)) /
                                      10 ** chainDecimals
                                    }
                                    buyTokenNativePrice={nativeTokenPrice}
                                    buyTokenUsdPrice={usdTokenPrice}
                                    payTokenSymbol={chainSymbol}
                                    payTokenDecimals={chainDecimals}
                                    buyDiscount={pool.poolData[3]?.toString() / '10'}
                                    buyVestingInitialAmount={pool.poolData[2]?.toString() / '10'}
                                    buyVestingSchedulePercent={pool.poolData[1]?.toString() / '10'}
                                    buyVestingScheduleTimeframe={getVestingSchedule(pool.poolData[0]?.toString())}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                </div>
              ) : (
                <div>
                  <div
                    className="mt-2 mb-2 flex justify-center rounded-lg bg-red-500 p-2 text-center text-sm text-white "
                    role="alert"
                  >
                    <span className="font-medium md:text-xl">No pools currently offered to the connected wallet.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="mt-2 mb-2 flex justify-center rounded-lg bg-red-500 p-2 text-center text-sm text-white "
            role="alert"
          >
            <span className="font-medium md:text-xl">Please connect to your wallet.</span>
          </div>
        </div>
      )}
    </>
  )
}

export default AssignedPools
