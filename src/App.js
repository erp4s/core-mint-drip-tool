import logo from './logo.svg';
import './App.css';
import { Button, Input, Typography, message } from 'antd';
import { useState, useEffect } from 'react';
import { Conflux, Drip } from 'js-conflux-sdk';
const { Text, Link } = Typography;

  
const dripAddress = 'cfx:acd35cp6pjgj1hbb32wrh6bary43ykbabed1vmfmct';

function App() {
    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState("");
    const [client, setClient] = useState(null);
    const [transition, setTrainsition] = useState("");

    const connect = async () => {
        console.log('connect')
        let accounts = await window.conflux.request({ method: 'cfx_accounts' })
        console.log('connect2', accounts);
            // .then(handleAccountsChanged)
            // .catch((err) => {
            //     console.error(err);
            // });
        if (accounts.length === 0) {
            accounts = await window.conflux.request({ method: 'cfx_requestAccounts' })
        }

        if (accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);
            setConnected(true);
        } else {
            message.error('Fluent connect failed');
        } 
    };

    const mintCfxs = async () => {
        try {
            const cfxClient = new Conflux({
                url: 'https://main.confluxrpc.com',
                networkId: 1029,
            });
            cfxClient.provider = window.conflux;
			
			 // prepare the tx meta info
			const currentEpoch = await cfxClient.cfx.getEpochNumber();
			const nonce = await cfxClient.cfx.getNextNonce(account);
			const value = Drip.fromCFX(0);
			const chainId = 1029;
			const gasPrice = 2001000000000;
			let txInfo = {
				from: account,
				to: dripAddress,
				value,
				nonce,
				gasPrice,
				chainId,
				epochHeight: currentEpoch,
			};
			// estimate gas and storageCollateralized
			let estimate = await cfxClient.cfx.estimateGasAndCollateral(txInfo);
			txInfo.gas = estimate.gasLimit;
			txInfo.storageLimit = estimate.storageCollateralized;
			const hash = await cfxClient.cfx.sendTransaction(txInfo);
			
			setTrainsition(hash)

            message.success('Mint TX send Success!');
        } catch(error) {
			setTrainsition("tx error")
            message.error('Mint TX send Failed!' + error.message);
        }
    }

  return (
    <div className="App">
      <header className="App-header">
        <br />
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <h5> Drip Core Mint Tool</h5>
        <br />
        {
            !window.conflux && <a
                className="App-link"
                href="https://fluentwallet.com/"
                target="_blank"
                rel="noopener noreferrer"
            >
                Install Fluent Here
            </a>
        }
        <br />
        {
            !connected && <Button type='primary' onClick={connect}>Connect Fluent Wallet</Button>
        }
        {
            account && <>
                <Text type="success">Address: {account}</Text>
                <Text type="success">Mint Drip hash: {transition}</Text>
                <br />
                {/* <Input style={{maxWidth: '500px'}}/> */}
                {/* <br /> */}
                <Button type='primary' onClick={mintCfxs}>Mint Drip</Button>
            </>
        }
      </header>
    </div>
  );
}

export default App;
