import React from 'react'

const SellNftCard = ({ image, id, title, address }) => {
  return (
    <div className="flex h-36 w-28 p-1">
      <div className="w-auto">
        <img className="rounded-md" key={id} src={image}></img>
        <div className="bg-[#619FFF]/20 p-1 dark:bg-gray-400">
          <div className="flex ">
            <div className="flex-grow">
              <h3 className="text-xs">{title}</h3>
              <a
                target="_blank"
                className="text-xs text-blue-700"
                href={`https://etherscan.io/token/${address}`}
                rel="noreferrer"
              >{`${address.slice(0, 4)}...${address.slice(address.length - 4)}`}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellNftCard
