import React, { useState, useEffect } from "react";
import { Input, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import tokenList from "../../data/tokenList.json";
import axios from "axios";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useAppKitState } from "@reown/appkit/react";


function Swap() {
  const { address, isConnected } = useAccount()
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const { selectedNetworkId } = useAppKitState()
  console.log(selectedNetworkId.replace('eip155:', ''))

  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  const { data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    }
  })

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: data?.hash,
  })

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address)
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address)
    }
    setIsOpen(false);
  }

  async function fetchPrices(one, two) {

    const res = await axios.get(`https://web3-app-backend.onrender.com/tokenPrice`, {
      params: { addressOne: one, addressTwo: two }
    })


    setPrices(res.data)
  }
  async function fetchDexSwap() {
    const networkId = selectedNetworkId.replace('eip155:', '');
    const amount = tokenOneAmount.padEnd(tokenOne.decimals + tokenOneAmount.length, '0');

    try {
      const allowance = await axios.get(`https://web3-app-backend.onrender.com/allowance`, {
        params: {
          networkId: networkId,
          tokenAddress: tokenOne.address,
          walletAddress: address,
        },
      })

      console.log(allowance, 'allowance')
      if (allowance.data.allowance === "0") {
        const approve = await axios.get(`https://web3-app-backend.onrender.com/transaction`, {
          params: {
            networkId: networkId,
            amount: amount,
            tokenAddress: tokenOne.address,
          },
        })

        console.log(approve, 'approve')
        setTxDetails(approve.data);
        console.log("not approved")
        return
      }
      const tx = await axios.get(
        `https://api.1inch.io/v6.0/137/v6.0/137/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals + tokenOneAmount.length, '0')}&fromAddress=${address}&slippage=${slippage}`, {
        headers: {
          Accept: 'application/json',
          "Authorization": "Bearer 001ReTUf6iepbN7VPfbMd0Y5w5MWEUuD"
        },
        params: {},
        paramsSerializer: {
          indexes: null
        }
      }
      )

      let decimals = Number(`1E${tokenTwo.decimals}`)
      setTokenTwoAmount((Number(tx.data.toTokenAmount) / decimals).toFixed(2));

      setTxDetails(tx.data.tx);
    }
    catch (err) {
      console.log('Error:', err);
    }


  }

  // async function fetchDexSwap() {

  //   const url = `https://api.1inch.dev/swap/v6.0/${selectedNetworkId.replace('eip155:', '')}/approve/allowance`;
  //   const config = {

  //     params: {
  //       tokenAddress: tokenOne.address,
  //       walletAddress: address,
  //     },
  //     paramsSerializer: {
  //       indexes: null
  //     }
  //   };


  //   try {
  //     const response = await axios.get(url, config);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  useEffect(() => {

    fetchPrices(tokenList[0].address, tokenList[1].address)

  }, [])

  useEffect(() => {

    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails])

  useEffect(() => {

    messageApi.destroy();

    if (isLoading) {
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }

  }, [isLoading])

  useEffect(() => {
    messageApi.destroy();
    if (isSuccess) {
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    } else if (txDetails.to) {
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }


  }, [isSuccess])




  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBoxparent">
        <div className="tradeBox">
          <div className="tradeBoxHeader">
            <h4>Swap</h4>
          </div>
          <div className="inputs">
            <Input
              placeholder="0"
              value={tokenOneAmount}
              onChange={changeAmount}
              disabled={!prices}
            />
            <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
            <div className="switchButton" onClick={switchTokens}>
              <SwapOutlined className="switchArrow" />
            </div>
            <div className="assetOne" onClick={() => openModal(1)}>
              <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
              {tokenOne.ticker}
              <DownOutlined />
            </div>
            <div className="assetTwo" onClick={() => openModal(2)}>
              <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
              {tokenTwo.ticker}
              <DownOutlined />
            </div>
          </div>
          <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
        </div>
      </div>
    </>
  );
}

export default Swap;
