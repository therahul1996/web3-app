import { useState } from 'react'
import './App.css'
import { useAccount } from 'wagmi'
import Header from './components/layout/Header'
import Swap from './components/layout/Swap'
function App() {
  const { address } = useAccount()
  console.log(address, 'address')
  return (
    <>
      <Header />
      <Swap />
    </>

  )
}

export default App
