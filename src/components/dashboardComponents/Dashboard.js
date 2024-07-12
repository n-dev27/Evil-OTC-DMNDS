import React from 'react'
import { useAccount, useNetwork, useContractRead } from 'wagmi'
import { Tab } from '@headlessui/react'
import SelectWalletModal from '../walletComponents/SelectWalletModal.js'
import UnsupportedNetworkDash from '../../hooks/UnsupportedNetworkDash.js'
import AccountContainer from './AccountContainer.js'
import DiamondSwapAccountContainer from './DiamondSwapAccountContainer.js'
import ProfitLossContainer from './ProfitLossContainer.js'
import TokensContainer from './portfolioComponents/TokensContainer.js'
import NFTContainer from './portfolioComponents/NFTContainer.js'


const style = {
  wrapper: 'text-gray-300',
  dashboardContainer: 'w-full justify-center',
  dashboardHeader: 'text-center text-gray-300 text-5xl font-bold p-4',
  nav: `w-fit bg-[#727578]/50 rounded-xl`,
  navItem: ` px-2 py-1 items-center text-lg text-white hover:bg-[#566C90]/70 hover:bg-[#d3d7db] text-[1.0rem] cursor-pointer rounded-xl`,
  activeNavItem: `px-2 py-1 items-center shadow-xl text-lg bg-[#d3d7db] text-[black] text-[1.0rem] rounded-xl`,
  containers: 'flex justify-center',
  importedContainers: 'flex justify-center xs:w-fit h-fit p-2 md:p-4',
  accountContainer: 'flex justify-center h-fit p-2 md:p-4',
  diamondSwapAccountContainer: 'flex justify-center h-fit p-2 md:p-4',
  diamondSwapOwnedPools: 'flex justify-center h-fit p-2 md:p-4',
}

function Dashboard() {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  return (
    <div className={style.wrapper}>
      <div className={style.dashboardContainer}>
        <div className={style.dashboardHeader}>
          <h2>Welcome to Diamond Swap</h2>
        </div>
        <div className={style.containers}>
          {!isConnected ? (
            <div>
              <h1 className="p-4 text-center text-xl">Connect your wallet to get started</h1>
              <div className="flex justify-center">
                <SelectWalletModal />
              </div>
            </div>
          ) : (
            <div>
              {chain?.unsupported ? (
                <div className="xs:flex-col w-full justify-center md:flex">
                  <UnsupportedNetworkDash />
                </div>
              ) : (
                <div className="xs:flex-col md:flex">
                  <div className={style.accountContainer}>
                    <AccountContainer />
                  </div>
                  <div className={style.diamondSwapAccountContainer}>
                    <DiamondSwapAccountContainer />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
