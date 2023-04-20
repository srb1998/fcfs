import Head from "next/head";
import { useEffect, useRef, useState } from 'react';
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { Contract, providers }from "ethers";
import { WHITELIST_CONTRACT_ADDRESS,abi } from "../constants";


export default function Home() {
  
  const [walletConnected, setWalletConnected]= useState(false);
  const [numOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [joinedWhitelist , setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async(needSigner = false) => {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if(chainId !== 11155111) {
        window.alert("Change the Network to Sepolia Testnet");
        throw new Error("Change the Network to Sepolia Testnet");
      }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;  
      }
      return web3Provider;
    
  }

  const addAddressToWhitelist = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);

      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);      
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numOfWhitelisted);
    } catch (err) {
      console.error(err);      
    }
  };

  const checkIfAddressIsWhitelisted = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
          address
      );
        setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);   
    }
  };

  const connectWallet = async() => {
    try {
        await getProviderOrSigner();
        setWalletConnected(true);

        checkIfAddressIsWhitelisted();
        getNumberOfWhitelisted();
    } catch(err){
      console.error(err);
    }
  };


  const renderButton = () => {
    if(walletConnected){
      if(joinedWhitelist){
        return(
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if(loading){
        return <button className={styles.button}>
          Loading....
        </button>;
      } else {
        return(
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return(
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };



  useEffect(() => {
    if(!walletConnected) {

      web3ModalRef.current =new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
    <Head>
      <title>FCFS Whitelist dApp</title>
      <meta name="description" content="Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to SpiderVerse!</h1>
        <div className={styles.description}>
          WITH GREAT NFT COMES GREAT MONEY.          
        </div>
        <div className={styles.description}>
        {numOfWhitelisted}/10 spots taken
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./spiderman.svg" />
      </div>
    </div>


      <footer className={styles.footer}>
        Made with &#10084; by Sourabh
      </footer>
    </div>
  );
}

