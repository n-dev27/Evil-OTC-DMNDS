export const fetchProfitLoss = async (token, chainId, userAddress, setProfitLoss) => {
  if (chainId != (1 || 56 || 137)) {
    return
  }

  let unmarshalChain = ''

  if (chainId == 1) unmarshalChain = 'ethereum'
  if (chainId == 56) unmarshalChain = 'bsc'
  if (chainId == 137) unmarshalChain = 'matic'

  const query = new URLSearchParams({
    contract: token,
    auth_key: process.env.NEXT_PUBLIC_UNMARSHAL_API,
  }).toString()

  const resp = await fetch(`https://api.unmarshal.com/v2/${unmarshalChain}/address/${userAddress}/userData?${query}`, {
    method: 'GET',
  })

  const data = await resp.json()
  console.log(data)

  setProfitLoss(data.overall_profit_loss != '0' ? data.overall_profit_loss : 'N/A')

  return data
}
