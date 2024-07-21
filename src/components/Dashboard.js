import React, { useState, useEffect } from "react";
import Web3 from "web3";
import moment from "moment";
import {
  contractAddress,
  abi,
  examAddress,
  examABI,
  stableCoinAddress,
  stableCoinABI,
} from "./../utils/contract"; // Import from contract.js

const Dashboard = () => {
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [examInstance, setExamInstance] = useState(null);
  const [stableCoinInstance, setStableCoinInstance] = useState(null);

  const [currRound, setCurrRound] = useState();
  const [currRoundStartTime, setCurrRoundStartTime] = useState();
  const [currentUserId, setCurrentUserId] = useState();
  const [directIncome, setDirectIncome] = useState();
  const [endTime, setEndTime] = useState();
  const [regTime, setRegTime] = useState();
  const [rewards, setRewards] = useState();
  const [roundProfitPercent, setRoundProfitPercent] = useState();
  const [roundProfitUser, setRoundProfitUser] = useState();
  const [stakeAmount, setStakeAmount] = useState();
  const [startTime, setStartTime] = useState();
  const [startRound, setStartRound] = useState();
  const [takenRound, setTakenRound] = useState();
  const [totalDeposit, setTotalDeposit] = useState();
  const [withdrawableROI, setWithdrawableROI] = useState();
  const [levelIncome, setLevelIncome] = useState([]);
  const [levelsRoi, setLevelsRoi] = useState([]);
  const [users, setUsers] = useState([]);

  const [isExamQualifier, setIsExamQualifier] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem("connectedAddress");
    if (storedAddress) {
      setConnectedAddress(storedAddress);
      setIsConnected(true);
    }
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Fetch current network and account on load
      handleChainChanged();
      handleAccountsChanged();
    }
    // Cleanup event listeners on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        let account = accounts[0];
        // account = "0xb8D4217B314192857a2Ba34F413008F4EAdfd0f0";
        localStorage.setItem("connectedAddress", account);
        setConnectedAddress(account);
        setIsConnected(true);
      } else {
        localStorage.removeItem("connectedAddress");
        setConnectedAddress("");
        setIsConnected(false);
      }
    }
  };

  const handleChainChanged = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkId(chainId);
      // Optionally, handle network-specific logic here
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        localStorage.setItem("connectedAddress", account);
        setConnectedAddress(account);
        setIsConnected(true);
      } catch (e) {
        if (
          e.message.includes("Returned values aren't valid") ||
          e.message.includes("Out of Gas") ||
          e.message.includes("correct ABI") ||
          e.message.includes("not fully synced")
        ) {
          alert("ON Wrong Chain");
        }
        console.error("Error caught:", e.message);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("connectedAddress");
    setConnectedAddress("");
    setIsConnected(false);
  };
  useEffect(() => {
    const initWeb3AndContracts = async () => {
      if (connectedAddress) {
        const web3 = new Web3(window.ethereum);
        const contractInstance = new web3.eth.Contract(abi, contractAddress);
        const examInstance = new web3.eth.Contract(examABI, examAddress);
        const stableInstance = new web3.eth.Contract(
          stableCoinABI,
          stableCoinAddress
        );

        setContractInstance(contractInstance);
        setExamInstance(examInstance);
        setStableCoinInstance(stableInstance);
        const isExamPassed = await examInstance.methods
          .isPass(connectedAddress)
          .call({ from: connectedAddress });
        setIsExamQualifier(isExamPassed);
      }
    };
    initWeb3AndContracts();
  }, [connectedAddress]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (contractInstance && connectedAddress) {
        const currRound = await contractInstance.methods
          .currRound()
          .call({ from: connectedAddress });

        setCurrRound(currRound);
        let currRoundStartTime = await contractInstance.methods
          .currRoundStartTime()
          .call({ from: connectedAddress });
        setCurrRoundStartTime(currRoundStartTime);
        const currUserID = await contractInstance.methods
          .currUserID()
          .call({ from: connectedAddress });
        setCurrentUserId(currUserID);

        let directIncome = await contractInstance.methods
          .directIncome(connectedAddress)
          .call({ from: connectedAddress });
        setDirectIncome(directIncome);
        let endTime = await contractInstance.methods
          .endTime(connectedAddress)
          .call({ from: connectedAddress });
        setEndTime(endTime);
        let regTime = await contractInstance.methods
          .regTime(connectedAddress)
          .call({ from: connectedAddress });
        setRegTime(regTime);
        let rewards = await contractInstance.methods
          .rewards(currRound, connectedAddress)
          .call({ from: connectedAddress });
        setRewards(rewards);

        let roundProfitPercent = await contractInstance.methods
          .roundProfitPercent(currRound)
          .call({ from: connectedAddress });
        setRoundProfitPercent(roundProfitPercent.profit);
        let roundProfitUser = await contractInstance.methods
          .roundProfitUser(currRound, connectedAddress)
          .call({ from: connectedAddress });
        setRoundProfitUser(roundProfitUser);

        let stakeAmount = await contractInstance.methods
          .stakeAmount(connectedAddress)
          .call({ from: connectedAddress });
        setStakeAmount(stakeAmount);
        let startTime = await contractInstance.methods
          .startTime()
          .call({ from: connectedAddress });
        setStartTime(startTime);
        let startRound = await contractInstance.methods
          .startRound(connectedAddress)
          .call({ from: connectedAddress });
        setStartRound(startRound);

        let takenRound = await contractInstance.methods
          .takenRound(connectedAddress)
          .call({ from: connectedAddress });
        setTakenRound(takenRound);

        let totalDeposit = await contractInstance.methods
          .totalDeposit()
          .call({ from: connectedAddress });
        setTotalDeposit(totalDeposit);
        let withdrawableROI = await contractInstance.methods
          .withdrawableROI(connectedAddress)
          .call({ from: connectedAddress });
        setWithdrawableROI(withdrawableROI);
      }
    };
    fetchUserData();
  }, [contractInstance, connectedAddress]);

  useEffect(() => {
    const userLevelInfoCall = async () => {
      if (contractInstance && connectedAddress) {
        let levels = await contractInstance.methods
          .levelsIncome(connectedAddress)
          .call({ from: connectedAddress });

        const levelIncome = [
          { level: 1, income: levels.one },
          { level: 2, income: levels.two },
          { level: 3, income: levels.three },
          { level: 4, income: levels.four },
          { level: 5, income: levels.five },
          { level: 6, income: levels.six },
          { level: 7, income: levels.seven },
          { level: 8, income: levels.eight },
          { level: 9, income: levels.nine },
          { level: 10, income: levels.ten },
          { level: 11, income: levels.eleven },
          { level: 12, income: levels.twelve },
          { level: 13, income: levels.thirteen },
          { level: 14, income: levels.forteen },
        ];

        setLevelIncome(levelIncome);
        let levelsRoi1 = await contractInstance.methods
          .levelsRoi(connectedAddress)
          .call({ from: connectedAddress });
        const levelsRoi = [
          { level: 1, income: levelsRoi1.one },
          { level: 2, income: levelsRoi1.two },
          { level: 3, income: levelsRoi1.three },
          { level: 4, income: levelsRoi1.four },
          { level: 5, income: levelsRoi1.five },
          { level: 6, income: levelsRoi1.six },
          { level: 7, income: levelsRoi1.seven },
          { level: 8, income: levelsRoi1.eight },
          { level: 9, income: levelsRoi1.nine },
          { level: 10, income: levelsRoi1.ten },
          { level: 11, income: levelsRoi1.eleven },
          { level: 12, income: levelsRoi1.twelve },
          { level: 13, income: levelsRoi1.thirteen },
          { level: 14, income: levelsRoi1.forteen },
        ];
        setLevelsRoi(levelsRoi);
        let users = await contractInstance.methods
          .users(connectedAddress)
          .call({ from: connectedAddress });
        const userList = [
          { title: "isExist", value: users.isExist },
          { title: "User ID", value: users.id },
          { title: "Referrer ID", value: users.referrerID },
          { title: "Referred Users", value: users.referredUsers },
          { title: "Income", value: users.income },
          { title: "Level Income Received", value: users.levelIncomeReceived },
          { title: "Taken ROI", value: users.takenROI },
          { title: "Stake Times", value: users.stakeTimes },
          { title: "Income Missed", value: users.incomeMissed },
        ];

        setUsers(userList);
      }
    };
    userLevelInfoCall();
  }, [contractInstance, connectedAddress]);

  const handlePayNowClick = async () => {
    const referrerId = document.getElementById("referralIdInput").value;
    const regAmount = document.getElementById("regAmountInput").value;
    console.log("Referr ID: ", referrerId, regAmount);

    try {
      let userList = await contractInstance.methods
        .userList(referrerId)
        .call({ from: connectedAddress });
      await stableCoinInstance.methods
        .approve(contractAddress, regAmount)
        .send({ from: connectedAddress })
        .on("error", function (error) {
          alert("Error On apprve:", error);
        })
        .on("receipt", async function (receipt) {
          await contractInstance.methods
            .Registration(referrerId, regAmount)
            .send({ from: connectedAddress, value: 0 })
            .on("error", function (error) {
              console.log("Contract error: ", error);
              alert("Error On Registration:", error);
            })
            .on("receipt", async function (receipt) {
              alert("Registered Successfully");
            });
        });
    } catch (e) {
      console.log("Error: ", e);
      alert("Error in Catch");
    }

    // payNow(referrerId, coReferrerId);
  };
  const handleWithdrawStable = async () => {
    const toAddressInput = document.getElementById("toAddressInput").value;
    const stableAmountInput =
      document.getElementById("stableAmountInput").value;
    console.log("Referr ID: ", toAddressInput, stableAmountInput);

    try {
      await contractInstance.methods
        .withdrawalStableCoin(toAddressInput, stableAmountInput)
        .send({ from: connectedAddress })
        .on("error", function (error) {
          console.log("Contract error: ", error);
          alert("Error On Registration:", error);
        })
        .on("receipt", async function (receipt) {
          alert("Registered Successfully");
        });
    } catch (e) {
      console.log("Error: ", e);
      alert("Error in Catch");
    }
  };

  const [newPartnerAddress, setNewPartnerAddress] = useState("");
  //handleTransferPartnershipClick
  const handleCloseRoundPercent = async () => {
    let closeRoundPercentage =
      document.getElementById("closeRoundPercent").value;
    //   const loader = document.getElementById("loader-overlay");
    console.log("closeRoundPercentage: ", closeRoundPercentage);

    try {
      const payPartnerFee1 = await contractInstance.methods
        .closeRound(closeRoundPercentage)
        .send({ from: connectedAddress })
        .on("error", function (error) {
          console.log("Contract error: ", error);
          // loader.style.display = "none";
          alert("Error On Registration:", error);
        })
        .on("receipt", async function (receipt) {
          // loader.style.display = "none";
          alert("Upgra Successfully");
        });
    } catch (e) {
      // loader.style.display = "none";
      console.log("Catch: ", e);
    }
    // transferPartnership(newPartnerAddress);
  };
  const handleDepositProfit = async () => {
    let depositProfitInput =
      document.getElementById("depositProfitInput").value;

    try {
      const payPartnerFee1 = await contractInstance.methods
        .depositProfit(depositProfitInput)
        .send({ from: connectedAddress })
        .on("error", function (error) {
          console.log("Contract error: ", error);
          // loader.style.display = "none";
          alert("Error On Registration:", error);
        })
        .on("receipt", async function (receipt) {
          // loader.style.display = "none";
          alert("Upgra Successfully");
        });
    } catch (e) {
      console.log("Catch: ", e);
    }
  };
  const handleRoundCloserAddress = async () => {
    let roundCloserAddressInput = document.getElementById(
      "roundCloserAddressInput"
    ).value;
    try {
      const payPartnerFee1 = await contractInstance.methods
        .setRoundCloserAddress(roundCloserAddressInput)
        .send({ from: connectedAddress })
        .on("error", function (error) {
          console.log("Contract error: ", error);
          // loader.style.display = "none";
          alert("Error On Registration:", error);
        })
        .on("receipt", async function (receipt) {
          // loader.style.display = "none";
          alert("Upgra Successfully");
        });
    } catch (e) {
      console.log("Catch: ", e);
    }
  };

  const handleWithdrawROI = async () => {
    try {
      await contractInstance.methods
        .withdrawROI()
        .send({ from: connectedAddress })
        .on("error", function (error) {
          console.log("Contract error: ", error);
          alert("Error On PAy Partner Fee:", error);
        })
        .on("receipt", async function (receipt) {
          alert("Pay Partner Fee Successfully");
        });
      // });
    } catch (e) {
      alert("Error in Catch", e);
    }
  };

  return (
    <div className="wrap">
      {/* Dashboard Container */}
      <div className="dashboard min-vh-100">
        {/* Navbar */}
        <nav className="navbar bg-dashboard">
          <div className="container-fluid d-flex justify-content-center">
            <div>
              <a className="navbar-brand" href="#">
                <img
                  src="./logo.png"
                  alt="Logo"
                  width="140"
                  height="24"
                  className="d-inline-block align-text-top"
                />
              </a>
            </div>
          </div>
        </nav>
        {/* Welcome Title */}
        <div className="d-flex justify-content-center input-section">
          <a
            className="mybtn1"
            href="#"
            id="notConnectedButton"
            onClick={() => connectWallet()}
          >
            {isConnected ? <>Connected: {connectedAddress}</> : "Not Connected"}
          </a>
        </div>
        <div className="head-card skew mx-5 mt-4">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="regAmount" className="cards-numbers">
                  {Number(currRound)}
                  {/* {regFee
                    ? parseFloat(Web3.utils.fromWei(regFee, "ether")).toFixed(4)
                    : 0} */}
                </p>
                <p className="cards-title">Current Round</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="currentUserId" className="cards-numbers">
                  {Number(currRoundStartTime) > 0
                    ? moment
                        .unix(Number(currRoundStartTime))
                        .format("DD-MM-YYYY")
                    : "00/00/00"}
                </p>
                <p className="cards-title">Curr Round Start Time</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="totalQualifiedUser" className="cards-numbers">
                  {currentUserId ? Number(currentUserId) : 0}
                </p>
                <p className="cards-title">Current User ID</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerFee" className="cards-numbers">
                  {directIncome
                    ? parseFloat(
                        Web3.utils.fromWei(directIncome, "ether")
                      ).toFixed(4)
                    : 0}
                </p>
                <p className="cards-title">Direct Income</p>
              </div>
            </div>
          </div>
        </div>

        <div className="head-card skew mx-5 mt-4">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="tokenPrice" className="cards-numbers">
                  {Number(endTime) > 0
                    ? moment.unix(Number(endTime)).format("DD-MM-YYYY")
                    : "00/00/00"}
                </p>
                <p className="cards-title">End Time</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerCount1" className="cards-numbers">
                  {Number(regTime) > 0
                    ? moment.unix(Number(regTime)).format("DD-MM-YYYY")
                    : "00/00/00"}
                </p>
                <p className="cards-title">Register Time</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="totalReward" className="cards-numbers">
                  {rewards
                    ? parseFloat(Web3.utils.fromWei(rewards, "ether")).toFixed(
                        4
                      )
                    : 0}{" "}
                  <span className="sub-number"></span>
                </p>
                <p className="cards-title">Rewards</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerID1" className="cards-numbers">
                  {Number(roundProfitPercent) ? Number(roundProfitPercent) : 0}
                </p>
                <p className="cards-title">Round Profit Percent</p>
              </div>
            </div>
          </div>
        </div>
        {/* Third Row */}
        <div className="head-card skew mx-5 mt-4">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="tokenPrice" className="cards-numbers">
                  {roundProfitUser
                    ? parseFloat(
                        Web3.utils.fromWei(roundProfitUser, "ether")
                      ).toFixed(4)
                    : 0}{" "}
                </p>
                <p className="cards-title">Round Profit User</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerCount1" className="cards-numbers">
                  {stakeAmount
                    ? parseFloat(
                        Web3.utils.fromWei(stakeAmount, "ether")
                      ).toFixed(4)
                    : 0}{" "}
                </p>
                <p className="cards-title">Register Time</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="totalReward" className="cards-numbers">
                  {Number(startTime) > 0
                    ? moment.unix(Number(startTime)).format("DD-MM-YYYY")
                    : "00/00/00"}

                  <span className="sub-number"></span>
                </p>
                <p className="cards-title">Strat Time</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerID1" className="cards-numbers">
                  {Number(startRound) ? Number(startRound) : 0}
                </p>
                <p className="cards-title">Start Round</p>
              </div>
            </div>
          </div>
        </div>
        {/* Fourth Row */}
        <div className="head-card skew mx-5 mt-4">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="tokenPrice" className="cards-numbers">
                  {takenRound ? Number(takenRound) : 0}{" "}
                </p>
                <p className="cards-title">Taken Round</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerCount1" className="cards-numbers">
                  {totalDeposit
                    ? parseFloat(
                        Web3.utils.fromWei(totalDeposit, "ether")
                      ).toFixed(4)
                    : 0}{" "}
                </p>
                <p className="cards-title">Total Deposit</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="totalReward" className="cards-numbers">
                  {withdrawableROI
                    ? parseFloat(
                        Web3.utils.fromWei(withdrawableROI, "ether")
                      ).toFixed(4)
                    : 0}{" "}
                  <span className="sub-number"></span>
                </p>
                <p className="cards-title">Withdrawable ROI</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerID1" className="cards-numbers">
                  {Number(startRound) ? Number(startRound) : 0}
                </p>
                <p className="cards-title">Not Assigned</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row px-5">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center mt-4">
              <div className="network-heading text-center rounded-top-2">
                Level Income
              </div>
            </div>
            <div className="user-box">
              <div className="user-item">
                <div className="col-6 user-title">Level Number</div>
                <div className="col-6  user-value">Income</div>
                {/* <div className="col-3 user-value">Upgraded Count</div>
                <div className="col-2 user-value">Upgrade Status</div> */}
              </div>
              {levelIncome.map(({ level, income }) => (
                <div className="user-item" key={level}>
                  <div className="col-6 user-title">Level {level}</div>
                  <div className="col-6 user-value">
                    {income ? Number(income) : 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex justify-content-center mt-4">
              <div className="network-heading text-center rounded-top-2">
                Level ROI
              </div>
            </div>
            <div className="user-box">
              <div className="user-item">
                <div className="col-6 user-title">Level Number</div>
                <div className="col-6  user-value">Income</div>
                {/* <div className="col-3 user-value">Upgraded Count</div>
                <div className="col-2 user-value">Upgrade Status</div> */}
              </div>
              {levelsRoi.map(({ level, income }) => (
                <div className="user-item" key={level}>
                  <div className="col-6 user-title">Level {level}</div>
                  <div className="col-6 user-value">
                    {income ? Number(income) : 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row px-5">
          <div className="col-lg-6 mt-4">
            <div className="d-flex justify-content-center mt-4">
              <div className="network-heading text-center rounded-top-2">
                USERS Data
              </div>
            </div>
            <div className="user-box">
              {users.map(({ title, value }) => (
                <div className="user-item" key={title}>
                  <div className="col-6 user-title">{title}</div>
                  <div id={title} className="col-6 user-value">
                    {value ? Number(value) : 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registration */}
          <div className="col-lg-6 mt-4">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">Registration</div>
              <div className="swap mt-4">
                <div className="swap-box">
                  <div className="node">
                    <p className="node-title">Referrer ID</p>
                    <input
                      className="input-node bg-dashboard form-control ps-2"
                      defaultValue="0"
                      placeholder="Referral Id"
                      type="number"
                      id="referralIdInput"
                    />
                  </div>
                  <div className="node">
                    <p className="node-title">Amount</p>
                    <input
                      className="input-node bg-dashboard form-control ps-2"
                      defaultValue="0"
                      placeholder="Registration Amount"
                      type="number"
                      id="regAmountInput"
                    />
                  </div>
                  <div className="pay text-center mt-4">
                    <button className="mybtn1" onClick={handlePayNowClick}>
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* )} */}
        </div>

        <div className="row px-5">
          {/*Close Round*/}
          <div id="onlyForPartner1" className="col-lg-6 mt-6">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">Close Round</div>
              <div className="swap">
                <div className="swap-box">
                  <div className="node">
                    <p className="node-title">Close Round Percentage</p>
                    <input
                      id="closeRoundPercent"
                      className="input-node bg-dashboard form-control ps-2"
                      placeholder="Percentage"
                      type="text"
                    />
                  </div>
                  <div className="pay text-center mt-5">
                    <button
                      className="mybtn1"
                      onClick={handleCloseRoundPercent}
                    >
                      Close Round
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Withdraw ROI */}
          <div id="onlyExamQualifier1" className="col-lg-6 mt-4">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">Withdraw ROI</div>
              <div className="pay text-center mt-5">
                <button className="mybtn1" onClick={handleWithdrawROI}>
                  Withdraw ROI
                </button>
              </div>
            </div>
          </div>

          {/* depositProfit (0x33c19ab0)*/}
          <div id="onlyForPartner1" className="col-lg-6 mt-6">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">Deposit Profit</div>
              <div className="swap">
                <div className="swap-box">
                  <div className="node">
                    <p className="node-title">Deposit Profit Amount</p>
                    <input
                      id="depositProfitInput"
                      className="input-node bg-dashboard form-control ps-2"
                      placeholder="Amount"
                      type="text"
                    />
                  </div>
                  <div className="pay text-center mt-5">
                    <button className="mybtn1" onClick={handleDepositProfit}>
                      Deposit Profit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* setRoundCloserAddress (0x29b51cff)*/}
          <div id="onlyForPartner1" className="col-lg-6 mt-6">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">
                Set Round Closer Address
              </div>
              <div className="swap">
                <div className="swap-box">
                  <div className="node">
                    <p className="node-title">Round Closer Address </p>
                    <input
                      id="roundCloserAddressInput"
                      className="input-node bg-dashboard form-control ps-2"
                      placeholder="Address"
                      type="text"
                    />
                  </div>
                  <div className="pay text-center mt-5">
                    <button
                      className="mybtn1"
                      onClick={handleRoundCloserAddress}
                    >
                      Round Closer Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* withdrawalStableCoin (0x4f3283fe) */}
          <div className="col-lg-6 mt-4">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">
                Withdrawal Stable Coin
              </div>
              <div className="swap mt-4">
                <div className="swap-box">
                  <div className="node">
                    <p className="node-title">To Address</p>
                    <input
                      className="input-node bg-dashboard form-control ps-2"
                      // defaultValue="0"
                      placeholder="Address"
                      type="string"
                      id="toAddressInput"
                    />
                  </div>
                  <div className="node">
                    <p className="node-title">Amount</p>
                    <input
                      className="input-node bg-dashboard form-control ps-2"
                      // defaultValue="0"
                      placeholder="Withdraw Amount"
                      type="number"
                      id="stableAmountInput"
                    />
                  </div>
                  <div className="pay text-center mt-4">
                    <button className="mybtn1" onClick={handleWithdrawStable}>
                      Withdrawal Stable Coin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* {userId > 0 && (
            <div
              id="upgradeSectionHiding"
              className="col-lg-6 mt-4 hideshowSection"
            >
              <div className="swap-wrap p-5">
                <div className="swap-head text-center">Upgrade Level</div>
                <div className="swap">
                  <div className="swap-box">
                    <div className="node">
                      <p className="node-title">Level</p>
                      <input
                        id="upgradeLevelIn"
                        className="input-node bg-dashboard form-control ps-2"
                        value={upgradeLevelValue}
                        onChange={(e) => setUpgradeLevelValue(e.target.value)}
                        placeholder="round number"
                        type="text"
                      />
                    </div>
                    <div className="pay text-center mt-5">
                      <button className="mybtn1" onClick={upgradeLevel}>
                        Upgrade Level
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {partnerId > 0 && (
            <div id="onlyForPartner" className="col-lg-6 mt-4">
              <div className="swap-wrap p-5">
                <div className="swap-head text-center">
                  Upgrade Partner Level
                </div>
                <div className="swap">
                  <div className="swap-box">
                    <div className="node">
                      <p className="node-title">Level</p>
                      <input
                        id="upgradePartnerLevel"
                        className="input-node bg-dashboard form-control ps-2"
                        placeholder="Level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        type="text"
                      />
                    </div>
                    <div className="pay text-center mt-5">
                      <button className="mybtn1" onClick={UpgradePartnerLevel}>
                        Upgrade Partner Level
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
