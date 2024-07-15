import React from 'react'
import { useNetwork, useAccount, useBalance } from 'wagmi'
import CopyToClipboard from '../../utils/CopyToClipboard.js'

const style = {
  content:
    'customShare customBorder bg-[rgba(22,41,48,0.8)] rounded-2xl p-2 md:p-4 text-center',
  clipboardIcon: 'ml-1 mt-1 items-center justify-center w-4 h-4 cursor-pointer',
}

const AccountContainer = () => {
  const { address, connector } = useAccount()
  const { chain } = useNetwork()

  const { data: balance } = useBalance({
    addressOrName: address,
  })

  const { data: diamondbalance } = useBalance({
    addressOrName: address,
    token: '0xbBCD93A1809239E3A4bEB1B02fa6f8a83f7000B2',
    chainId: 1,
  })

  return (
    <div className={style.content}>
      <div className="flex justify-center">
        <div className="md:text-large text-sm">
          <dl>
            <div className='flex flex-col gap-[4px]'>
              <h1 className="text-xl text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Account Information</h1>
              <dt className="text-large text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Connected wallet:</dt>
              <dd>{connector?.name}</dd>
              <dt className="text-large text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Connected Network</dt>
              <dd>{chain ? `Chain ID: ${chain?.id}` : 'n/a'}</dd>
              <dd>{chain ? `Network Name: ${chain?.name}` : 'n/a'}</dd>
              <dt className="text-large flex items-center justify-center text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">
                Account Address
                <CopyToClipboard copyText={address} />
              </dt>
              <a
                className="text-[#619FFF] hover:text-[#1C76FF]"
                href={address ? `${chain?.blockExplorers?.default.url}/address/${address}` : 'N/A'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {address ? `${address}` : 'n/a'}
              </a>
              <dt className="text-large text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Block Explorer</dt>
              <a
                className="text-[#619FFF] hover:text-[#1C76FF]"
                href={chain ? `${chain?.blockExplorers?.default.url}` : 'N/A'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {chain?.blockExplorers?.default.name}
              </a>
              <dt className="text-large text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Balance</dt>
              <dd className="break-all">{chain ? `${balance?.formatted} ${balance?.symbol}` : 'n/a'} </dd>
              <dt className="text-large text-[rgba(255,255,255,0.8)] font-[Inter_Bold]">Diamond Token Balance</dt>
              <dd className="break-all">
                {chain?.id == 1
                  ? `${diamondbalance?.formatted} ${diamondbalance?.symbol}`
                  : `${diamondbalance?.symbol}` + ' unsupported on ' + `${chain?.name}`}{' '}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default AccountContainer
