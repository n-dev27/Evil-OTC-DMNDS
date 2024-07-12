import { useToken } from 'wagmi'

export const getTokenInfo = async (token, decimals, name, symbol, totalSupply) => {
  const tokenDetails = useToken({
    address: token,
    onSuccess(data) {
      console.log('Token Details', data)
    },
  })

  if (decimals == true) {
    return tokenDetails?.data?.decimals?.toString()
  }
  if (name == true) {
    return tokenDetails?.data?.name?.toString()
  }
  if (symbol == true) {
    return tokenDetails?.data?.symbol?.toString()
  }
  if (totalSupply == true) {
    return tokenDetails?.data?.totalSupply?.toString()
  }
}
