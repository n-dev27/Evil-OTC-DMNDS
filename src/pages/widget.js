import React from 'react'
import SellLayout from '../components/sellComponents/SellLayout'
import WalletInfo from '../components/walletComponents/WalletInfo'
import SelectWalletModal from '../components/walletComponents/SelectWalletModal'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import diamondswapLogo from '../assets/App_Logo.png'

function Widget() {
const { isConnected } = useAccount()
  return (
    <div className=''>
        <div className="flex justify-center items-center text-xs">
            <div className='p-2 w-14 h-14 mr-6'>
                <Image src={diamondswapLogo} alt="diamondswap" height={60} width={60}></Image>
            </div>
            <div className="flex items-center justify-center">{!isConnected ? <SelectWalletModal /> : <WalletInfo />}</div>
        </div>
        <div className='flex justify-center'>
            <SellLayout isWidget={true}/>
        </div>
    </div>
  )
}
export default Widget
