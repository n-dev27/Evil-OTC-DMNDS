import { gql } from "@apollo/client";

export const GET_POOL_INFO = gql`
query poolSearch {
  pools {
    poolAddress
    ownerAddress
    poolCreator
    poolCreatedDate
    poolStatus
    tokenSelling {
      tokenAddress
      tokenName
      tokenSymbol
      decimals
      amount
      amountAvailable
      vestedAmount
    }
    claimVestedTokenInfo {
      sender
      amountClaimed
      timestamp
    }
    vestingComplete
    fixedPrice
    fixedPriceTotal
    fixedPricePerToken
    fixedEthPrice
    poolType
    poolValue
    statusFlag
    publicPool {
      partialBuys
    }
    poolOptions {
      poolVisible
      hasDiscount
      discountPercent
      vesting
      transferPoolOnCreation
      transfereeAddress
      hidePoolOnCreation
      vestingOptions {
        initialReleasePercent
        vestingPercentPerPeriod
        vestingPeriod
      }
    }
    detail {
      blockNumber
      blockTimestamp
    }
    visibility
  }
  
  purchaseDatas {
    id
    publicSaleAmount
    poolAddress
    tokenAddress
    poolType
    priceType
    userClaimedTokens
    userVestedTokens
    tokenBuying {
      tokenAddress
      tokenName
      tokenSymbol
      decimals
      amountAvailable
    }
    vesting {
      vestingSet
      vestingAmountReleased
      vestingAmountPending
      vestingAmountPerPeriod
      vestingPeriod
    }
    buyers {
      buyer
      amount
      timestamp
      newPrice
      value
    }
    detail {
      blockNumber
      blockTimestamp
    }
  }
}
`

export const GET_PURCHASED_INFO = gql`
query purchaseData { 
  purchaseDatas {
    id
    publicSaleAmount
    poolAddress
    poolType
    priceType
    tokenBuying {
      tokenAddress
      tokenName
      tokenSymbol
      decimals
      amountAvailable
    }
    vesting {
      vestingSet
      vestingAmountReleased
      vestingAmountPending
      vestingAmountPerPeriod
      vestingPeriod
    }
    buyers {
      buyer
      amount
      timestamp
      newPrice
      value
    }
    detail {
      blockNumber
      blockTimestamp
    }
  }
}
`