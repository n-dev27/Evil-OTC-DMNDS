import React, { useRouter, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import SelectWalletModal from '../walletComponents/SelectWalletModal.js'
import UnsupportedNetworkDash from '../../hooks/UnsupportedNetworkDash.js'
import { Sidebar, Tabs, Button } from 'flowbite-react';
import RewardsPage from './RewardsPage.js';
import DaoIcon from '../../assets/DAO_Icons/daoicon.svg'
import DiamondSwapStakeContainer from './DiamondSwapStakeContainer.js'
import DiamondSwapStakeRewards from './DiamondSwapStakeRewards.js'

const style = {
  wrapper: 'text-[#566C90] dark:text-gray-300',
  dashboardContainer: 'w-full h-full justify-center ',
  dashboardHeader: 'text-center text-[#566C90] dark:text-gray-300 text-5xl font-bold p-4',
  containers: 'md:grid md:p-4 justify-center',
  diamondSwapStakeContainer: 'flex justify-center h-fit p-2 md:p-4',
  diamondSwapStakeRewards: 'flex justify-center h-fit p-2 md:p-4',
}

function Stake() {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={style.wrapper}>
      <div className={style.dashboardContainer}>
        <div className='overflow-hidden'>
          {!isConnected ? (
            <div>
              <h1 className="p-4 text-center text-xl">Connect your wallet to get started</h1>
              <div className="flex justify-center">
                <SelectWalletModal />
              </div>
            </div>
          ) : (
            <div className='w-full'>
              {chain.unsupported ? (
                <div className="xs:flex-col w-full justify-center md:flex">
                  <UnsupportedNetworkDash />
                </div>
              ) : (
                <div className="flex w-full">
                  <div className='w-1/6 h-full'>
                    <div className="fixed w-fit h-full ">
                      <Sidebar aria-label="Default sidebar example">
                        <Sidebar.Logo
                          href="#"
                          img={DaoIcon}
                          imgAlt="DAODash"
                        >
                          <div className="text-black whitespace-pre-line">DIAMOND DAO Dashboard</div>
                        </Sidebar.Logo>
                        <Sidebar.Items>
                          <Sidebar.ItemGroup>
                            <Sidebar.Item
                              href="#"
                              onClick={() => setActiveTab(0)}
                              active={activeTab === 0}
                            >
                              Dashboard
                            </Sidebar.Item>
                            <Sidebar.Item
                              href="#"
                              label=">"
                              labelColor="alternative"
                              onClick={() => setActiveTab(1)}
                              active={activeTab === 1}
                            >
                              Stake/Unstake
                            </Sidebar.Item>
                            <Sidebar.Item
                              href="#"
                              label=">"
                              labelColor="alternative"
                              onClick={() => setActiveTab(2)}
                              active={activeTab === 2}
                            >
                              Rewards
                            </Sidebar.Item>
                            <Sidebar.Item
                              href="#"
                              label=">"
                              labelColor="alternative"
                              onClick={() => setActiveTab(3)}
                              active={activeTab === 3}
                            >
                              Resellers
                            </Sidebar.Item>
                            <Sidebar.Item
                              href="#"
                              label=">"
                              labelColor="alternative"
                              onClick={() => setActiveTab(4)}
                              active={activeTab === 4}
                            >
                              Promote
                            </Sidebar.Item>
                            <Sidebar.Item
                              href="#"
                              label=">"
                              labelColor="alternative"
                              onClick={() => setActiveTab(5)}
                              active={activeTab === 5}
                            >
                              Help
                            </Sidebar.Item>
                          </Sidebar.ItemGroup>
                        </Sidebar.Items>
                      </Sidebar>
                    </div>
                  </div>
                  <div className='w-5/6 flex mr-4 p-4'>
                    <div className='w-full '>
                      <RewardsPage  />
                    </div>
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

export default Stake
