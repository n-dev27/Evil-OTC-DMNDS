import React, { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { useQuery } from "@apollo/client";
import { GET_PURCHASED_INFO } from '../../constants/graphql/query';
import NotificationModal from '../buyComponents/NotificationModal';
import TxHistorySellContainer from './TxHistorySellContainer'
import TxHistoryBuyContainer from './TxHistoryBuyContainer'

const style = {
  wrapper: 'flex py-4 px-2 sm:px-8 sm:pt-5 sm:pb-6 justify-center h-full w-full',
  txHistoryContainer:
  'customShare relative h-full flex flex-col gap-8 sm:p-8 w-full sm:bg-[rgba(6,11,39,0.8)] shadow-[rgba(0,0,0,0.16)] rounded-[20px]',
  navItem: `bg-white dark:bg-[#727578] w-24 py-1 items-center text-lg text-[#566C90]/50 dark:text-white/50 hover:bg-[#8295B3]/50 dark:hover:bg-[#d3d7db] hover:text-[#566B90] dark:hover:text-black cursor-pointer rounded-xl`,
  activeNavItem: `w-24 py-1 items-center shadow-xl text-lg bg-[#566C90]/70 dark:bg-[#d3d7db] text-white dark:text-[black] rounded-xl`,
}

function TxHistoryLayout() {
  const [selectedOne, setSelectedOne] = useState('purchased')
  const {loading, error, data} = useQuery(GET_PURCHASED_INFO);

  return (
    <div className={style.wrapper}>
      {error ? (
        <NotificationModal content={error}/>
      ) : (
        <div className={style.txHistoryContainer}>
        <div className='w-full flex items-center justify-center sm:justify-between px-2'>
          <div className='hidden sm:flex text-[rgba(255,255,255,0.8)] font-[Inter] font-bold text-[28px]'>History</div>
          <RadioGroup
            className="customShare flex h-[34px] sm:h-[50px] w-full sm:w-fit cursor-pointer items-center rounded-full sm:bg-[rgba(255,255,255,0.1)] border-[0.62px] sm:border-2 text-xs text-[#AAAAAA] border-[rgba(255,255,255,0.1)]"
            value={selectedOne}
            onChange={setSelectedOne}
          >
            <div className='w-1/2'>
              <RadioGroup.Option value="purchased">
                {({ checked }) => (
                  <span
                    className={`flex h-[34px] sm:h-[50px] items-center rounded-full w-full sm:min-w-[160px] justify-center text-[rgba(255,255,255,0.6)] text-xs sm:text-lg ${
                      checked
                        ? 'border-[rgba(255,255,255,0.1)] border bg-[rgba(255,255,255,0.05)] sm:bg-[#1C76FF] customShare text-white'
                        : ''
                    }`}
                  >
                    Purchased
                  </span>
                )}
              </RadioGroup.Option>
            </div>
            <div className='w-1/2'>
              <RadioGroup.Option value="sold">
                {({ checked }) => (
                  <span
                    className={`flex h-[34px] sm:h-[50px] items-center rounded-full w-full sm:min-w-[160px] justify-center text-[rgba(255,255,255,0.6)] text-xs sm:text-lg ${
                      checked
                        ? 'border-[rgba(255,255,255,0.1)] border bg-[rgba(255,255,255,0.05)] sm:bg-[#1C76FF] customShare text-white'
                        : ''
                    }`}
                  >
                    Sold
                  </span>
                )}
              </RadioGroup.Option>
            </div>
          </RadioGroup>
        </div>

          {selectedOne === 'purchased' ? (
            <TxHistoryBuyContainer loading={loading} dataList={data}/>
          ) : (
            <TxHistorySellContainer />
          )}
        </div>
      )}
    </div>
  )
}
export default TxHistoryLayout
