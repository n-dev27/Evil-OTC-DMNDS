import React, { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'

const RewardsPage = () => {

    return(
        <div className='w-full text-[#ACACAC]'>
            <div className='w-full p-2 bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40 border border-white dark:border-black rounded-3xl'>
                <div className='flex justify-between p-6'>
                    <div className='flex justify-between'>
                        <div className='w-28 h-28 rounded-full bg-gradient-to-b from-[#D3FFE7] to-[#EFFFF6]'></div>
                        <div className='px-4'>
                            <div className='text-sm'>TOTAL REWARDS PAID</div>
                            <div className='text-2xl font-bold text-black dark:text-white'>$2,443,022.00</div>
                        </div>
                    </div>
                    <span className='w-0.5 bg-[#F0F0F0]'></span>
                    <div className='flex justify-between'>
                        <div className='w-28 h-28 rounded-full bg-gradient-to-b from-[#D3FFE7] to-[#EFFFF6]'></div>
                        <div className='px-4'>
                            <div className='text-sm'>REWARDS LAST MONTH</div>
                            <div className='text-2xl font-bold text-black dark:text-white'>$142,200.00</div>
                            <div className='flex items-center py-2'><ArrowDownIcon className='w-6 h-6 text-red-500' /><a className='font-bold text-red-500'>1%</a>&nbsp;vs previous month</div>
                        </div>
                    </div>
                    <span className='w-0.5 bg-[#F0F0F0]'></span>
                    <div className='flex justify-between'>
                        <div className='w-28 h-28 rounded-full bg-gradient-to-b from-[#D3FFE7] to-[#EFFFF6]'></div>
                        <div className='px-4'>
                            <div className='text-sm'>REWARDS THIS MONTH</div>
                            <div className='text-2xl font-bold text-black dark:text-white'>$163,827.88</div>
                            <div className='flex items-center py-2'><ArrowUpIcon className='w-6 h-6 text-green-500' /><a className='font-bold text-green-500'>13.2%</a>&nbsp;this month</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='py-4'></div>
            <div className='w-full p-2 bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/40 dark:bg-gradient-to-b dark:from-slate-600/60 dark:dark:to-slate-600/40 border border-white dark:border-black rounded-3xl'>
                <div className='flex justify-between p-6'>
                    <div className='flex justify-between'>
                        <div className='text-xl font-bold text-black dark:text-white px-4'>
                            <div>DAO</div>
                            <div>Rewards</div>
                        </div>
                    </div>
                    <div>
                        <div>MY $CARATS</div>
                        <div className='text-black dark:text-white text-2xl font-bold'>12,443,890,000</div>
                        <div className='py-1'>
                            <div className='bg-[#16C098]/40 rounded-md border border-[#008767] text-sm p-1 text-center text-[#008767]'>CONVERT INTO $CARATS</div>
                        </div>
                    </div>
                    <span className='w-0.5 bg-[#F0F0F0]'></span>
                    <div>
                        <div>MY $DMNDS</div>
                        <div className='text-black dark:text-white text-2xl font-bold'>6,322,000,000</div>
                        <div className='py-1'>
                            <div className='bg-[#FFC5C5] rounded-md border border-[#DF0404] text-sm p-1 text-center text-[#DF0404]'>CONVERT INTO $DMNDS</div>
                        </div>
                    </div>
                    <span className='w-0.5 bg-[#8295B3]'></span>
                    <div className=''>
                        <div className=''>
                            <div className='text-sm'>TOTAL $CARATS ASSIGNED</div>
                            <div className='text-2xl font-bold text-black dark:text-white'>6,322,000,000</div>
                        </div>
                    </div>
                    <span className='w-0.5 bg-[#F0F0F0]'></span>
                    <div className=''>
                        <div className=''>
                            <div className='text-sm'>TOTAL $CARATS UNASSIGNED</div>
                            <div className='text-2xl font-bold text-black dark:text-white'>0</div>
                        </div>
                    </div>
                </div>
                <div className='p-6'>
                    <table className="w-full table-auto">
                        <thead className=''>
                            <tr className=''>
                                <th className='text-start'>
                                    <div className='flex-col'>
                                    <div>Reseller Name</div>
                                    <div> </div>
                                    </div>
                                </th>
                                <th className='text-start'>
                                    <div className='flex-col'>
                                        <div>Last Month</div>
                                        <div>Total Rewards</div>
                                    </div>
                                </th>
                                <th className='text-start'>Your Rewards</th>
                                <th className='text-start'>Total $CARATS</th>
                                <th className='text-start'>Your $CARATS</th>
                                <th className='text-start'>Your %</th>
                                <th className='text-start'>Current Month</th>
                                <th className='text-start'>Pending Rewards</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Bobby Buy Bot</td>
                                <td>$12,453.22</td>
                                <td>$980.07</td>
                                <td>40,200,203,112</td>
                                <td><input className='rounded-md bg-[#E7E7E7] p-2' /></td>
                                <td className='flex items-center'>
                                    <div className='pr-2'>3.28%</div>
                                    <div className='bg-[#FFC5C5] rounded-md border border-[#DF0404] text-xs p-1 px-4 text-center text-[#DF0404]'>EDIT</div>
                                </td>
                                <td>$12,453.22</td>
                                <td>$12,453.22</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


export default RewardsPage