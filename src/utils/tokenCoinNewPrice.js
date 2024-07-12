export const convertTokenNewPrice = async (
  symbol,
  setTokenPrice,
  chainId,
) => {
    const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbol}&tsyms=BTC,USD,EUR&api_key=${process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API}`)
    if (response.ok) {
        const data = await response.json()
        setTokenPrice(data[symbol]?.USD)
    } else {
      throw new Error('Failed to fetch token paris');
    }

  return
}
