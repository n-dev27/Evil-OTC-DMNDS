import React, { useState } from 'react'
import { useContractRead } from 'wagmi'
import TwitterLogin from './TwitterLogin'
import TwitterTokenPools from './TwitterPools'
import diamondSwapABI from '../../constants/contracts/diamondSwapABI.json'

let diamondswapContract = process.env.NEXT_PUBLIC_DIAMONDSWAP_CONTRACT

const style = {
  content:
    'bg-gradient-to-b from-slate-600/60 to-slate-600/40 flex justify-center mt-4 text-white border border-gray-700 rounded-2xl py-2 px-2 text-center',
}

function TwitterPoolsLayout() {
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false)
  const [twitterUser, setTwitterUser] = useState([])


  return (
    <div className={style.content}>
      <div className="w-full flex-col">
        <div className="flex items-center justify-center px-2 font-bold">
          <a className="px-2">View Twitter assigned Pools</a>
        </div>
        <div className="flex w-auto justify-center text-center">
          <TwitterLogin setTwitterUser={setTwitterUser} setIsTwitterAuthenticated={setIsTwitterAuthenticated} />
        </div>
        {!isTwitterAuthenticated && (
          <div className="p-1 text-xs">Login with Twitter to view pools assigned to you.</div>
        )}
        {isTwitterAuthenticated && (
          <div className="w-full">
            <div className="flex justify-center">
              <TwitterTokenPools twitterUser={twitterUser} isTwitterAuthenticated={isTwitterAuthenticated} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwitterPoolsLayout
