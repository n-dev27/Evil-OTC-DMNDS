export function getSvgLogoPath(svgName) {
  const logoPaths = {
    ETH: require('./Eth.svg').default,
    AAVE: require('./Aave.svg').default,
    MAGIC: require('./Magic.svg').default,
    ARB: require('./Arb.svg').default,
    USDT: require('./Usdt.svg').default,
    USDC: require('./Usdc.svg').default,
    WETH: require('./Weth.svg').default,
    // Add more logos as needed
  };

  return logoPaths[svgName] || null;
}