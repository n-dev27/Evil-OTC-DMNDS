import { configureChains, createConfig, mainnet, sepolia } from 'wagmi'
import { arbitrum, bsc, bscTestnet, goerli } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { InjectedConnector } from 'wagmi/connectors/injected'

// API key for Ethereum node
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

// Custom chains to configure


// Configure chains for connectors to support
export const { chains, publicClient } = configureChains(
  [ mainnet, sepolia, arbitrum, bsc, goerli],
  //[chain.mainnet, chain.goerli, chain.polygon, chain.polygonMumbai, bsc, bscTestnet, nahmii, nahmiiTestnet],
  [
    publicProvider(),
  ]
)

// Set up connectors
export const connectors = [
  new InjectedConnector({
    chains,
  }),
  new MetaMaskConnector({
    chains,
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: 'c248f21b1e3ad86d36738b5ae05b3e90',
      showQrModal: true,
    },
  }),
  new WalletConnectLegacyConnector({
    chains,
    options: {
      infuraId,
      qrcode: true,
    },
  }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: 'Diamond Swap',
    },
  }),
]

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})