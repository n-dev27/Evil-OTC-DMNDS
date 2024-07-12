import React from 'react'

export function getVestingSchedule(timeframe) {
  let timeframeName = ''

  if (timeframe == '60') timeframeName = 'Minute'
  if (timeframe == '3600') timeframeName = 'Hourly'
  if (timeframe == '86400') timeframeName = 'Daily'
  if (timeframe == '604800') timeframeName = 'Weekly'
  if (timeframe == '1184400') timeframeName = 'Bi-Weekly'
  if (timeframe == '2635200') timeframeName = 'Monthly'
  if (timeframe == '7776000') timeframeName = 'Quarterly'
  if (timeframe == '31536000') timeframeName = 'Yearly'

  return timeframeName
}
