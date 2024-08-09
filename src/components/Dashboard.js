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
  const [web3, setWeb3] = useState();
  const [isOwner, setIsOwner] = useState();
  const [rewardInfo, setRewardInfo] = useState([]);
  const [searchRound, setSearchRound] = useState(1);
  const [roundProfitData, setRoundProfitData] = useState(null);
  const [userProfitData, setUserProfitData] = useState(null);

  const [isExamQualifier, setIsExamQualifier] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem("connectedAddress");
    if (storedAddress) {
      setConnectedAddress(storedAddress);
      // setConnectedAddress("0xb8D4217B314192857a2Ba34F413008F4EAdfd0f0");

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
        setWeb3(web3);
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
        let ownerWallet = await contractInstance.methods
          .ownerWallet()
          .call({ from: connectedAddress });

        if (connectedAddress.toLowerCase() == ownerWallet.toLowerCase()) {
          setIsOwner(true);
          console.log("its set to true", isOwner);
        } else {
          setIsOwner(false);
        }

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
          .roundProfitPercent(Number(currRound) - 1)
          .call({ from: connectedAddress });
        setRoundProfitData(roundProfitPercent.profit);
        let roundProfitUser = await contractInstance.methods
          .roundProfitUser(Number(currRound) - 1, connectedAddress)
          .call({ from: connectedAddress });
        setUserProfitData(roundProfitUser);

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
        setStartRound(Number(startRound));

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
        let teams = await contractInstance.methods
          .levels(connectedAddress)
          .call({ from: connectedAddress });

        const levelIncome = [
          { level: 1, income: levels.one, team: teams ? Number(teams.one) : 0 },
          { level: 2, income: levels.two, team: teams ? Number(teams.two) : 0 },
          {
            level: 3,
            income: levels.three,
            team: teams ? Number(teams.three) : 0,
          },
          {
            level: 4,
            income: levels.four,
            team: teams ? Number(teams.four) : 0,
          },
          {
            level: 5,
            income: levels.five,
            team: teams ? Number(teams.five) : 0,
          },
          { level: 6, income: levels.six, team: teams ? Number(teams.six) : 0 },
          {
            level: 7,
            income: levels.seven,
            team: teams ? Number(teams.seven) : 0,
          },
          {
            level: 8,
            income: levels.eight,
            team: teams ? Number(teams.eight) : 0,
          },
          {
            level: 9,
            income: levels.nine,
            team: teams ? Number(teams.nine) : 0,
          },
          {
            level: 10,
            income: levels.ten,
            team: teams ? Number(teams.ten) : 0,
          },
          {
            level: 11,
            income: levels.eleven,
            team: teams ? Number(teams.eleven) : 0,
          },
          {
            level: 12,
            income: levels.twelve,
            team: teams ? Number(teams.twelve) : 0,
          },
          {
            level: 13,
            income: levels.thirteen,
            team: teams ? Number(teams.thirteen) : 0,
          },
          {
            level: 14,
            income: levels.forteen,
            team: teams ? Number(teams.forteen) : 0,
          },
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
        let users1 = await contractInstance.methods
          .users(connectedAddress) //connectedAddress
          .call({ from: connectedAddress });
        const userList = [
          { title: "User ID", value: Number(users1.id) },
          { title: "Referrer ID", value: Number(users1.referrerID) },
          { title: "Referred Users", value: users1.referredUsers1 },
          {
            title: "Income",
            value:
              users1.income > 0
                ? parseFloat(
                    Web3.utils.fromWei(users1.income, "ether")
                  ).toFixed(4)
                : "0.0000",
          },
          {
            title: "Level Income Received",
            value: users1.levelIncomeReceived
              ? parseFloat(
                  Web3.utils.fromWei(users1.levelIncomeReceived, "ether")
                ).toFixed(4)
              : "0.0000",
          },
          {
            title: "Taken ROI",
            value: users1.takenROI
              ? parseFloat(
                  Web3.utils.fromWei(users1.takenROI, "ether")
                ).toFixed(4)
              : "0.0000",
          },
          {
            title: "Stake Times",
            value:
              Number(users1.stakeTimes) > 0
                ? moment.unix(Number(users1.stakeTimes)).format("DD-MMMM-YYYY")
                : "00/00/00",
          },
          { title: "Income Missed", value: users1.incomeMissed },
          {
            title: "Deposit ",
            value: users1.deposit
              ? parseFloat(Web3.utils.fromWei(users1.deposit, "ether")).toFixed(
                  4
                )
              : "0.0000",
          },
        ];

        setUsers(userList);
      }
    };
    userLevelInfoCall();
  }, [contractInstance, connectedAddress]);

  useEffect(() => {
    const rewardInfos = async () => {
      if (contractInstance && connectedAddress) {
        const rewardIn = [
          { level: 1, status: "NO" },
          { level: 2, status: "NO" },
          { level: 3, status: "NO" },
          { level: 4, status: "NO" },
          { level: 5, status: "NO" },
          { level: 6, status: "NO" },
          { level: 7, status: "NO" },
        ];
        for (let i = 0; i < 7; i++) {
          let rewards = await contractInstance.methods
            .rewards(i + 1, connectedAddress)
            .call({ from: connectedAddress });
          rewardIn[i].status = rewards ? "YES" : "NO";
        }
        setRewardInfo(rewardIn);
      }
    };
    rewardInfos();
  }, [contractInstance, connectedAddress]);

  const handlePayNowClick = async () => {
    let referrerId = document.getElementById("referralIdInput").value;
    let regAmount = document.getElementById("regAmountInput").value;
    regAmount = web3.utils.toWei(regAmount, "ether");

    console.log("Referr ID: ", referrerId, regAmount);

    try {
      setIsLoading(true);

      let userList = await contractInstance.methods
        .userList(referrerId)
        .call({ from: connectedAddress });
      await stableCoinInstance.methods
        .approve(contractAddress, regAmount)
        .send({ from: connectedAddress })
        .on("error", function (error) {
          alert("Error On apprve:", error);
          setIsLoading(false); // Stop loading on error
        })
        .on("receipt", async function (receipt) {
          await contractInstance.methods
            .Registration(referrerId, regAmount)
            .send({ from: connectedAddress, value: 0 })
            .on("error", function (error) {
              console.log("Contract error: ", error);
              alert("Error On Registration:", error);
              setIsLoading(false); // Stop loading on error
            })
            .on("receipt", async function (receipt) {
              alert("Registered Successfully");
              setIsLoading(false); // Stop loading on error
            });
        });
    } catch (e) {
      console.log("Error: ", e);
      setIsLoading(false); // Stop loading on error

      alert("Error in Catch");
    }

    // payNow(referrerId, coReferrerId);
  };
  const handleWithdrawStable = async () => {
    const toAddressInput = document.getElementById("toAddressInput").value;
    let stableAmountInput = document.getElementById("stableAmountInput").value;
    stableAmountInput = web3.utils.toWei(stableAmountInput, "ether");

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
  const handleCloseRoundPercent = async () => {
    let closeRoundPercentage =
      document.getElementById("closeRoundPercent").value;
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

  const handleSearchClick = async () => {
    if (connectedAddress && contractInstance) {
      let searchData = document.getElementById("searchRoundInput").value;
      const roundData = await contractInstance.methods
        .roundProfitPercent(searchData)
        .call({ from: connectedAddress });
      setRoundProfitData(Number(roundData.profit));
      const userData = await contractInstance.methods
        .roundProfitUser(searchData, connectedAddress) //connectedAddress
        .call({ from: connectedAddress });
      setUserProfitData(Number(userData));
    }
    // }
  };
  const handleDepositProfit = async () => {
    let depositProfitInput =
      document.getElementById("depositProfitInput").value;
    depositProfitInput = web3.utils.toWei(depositProfitInput, "ether");

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
          alert("Withdraw ROI Successfully");
        });
      // });
    } catch (e) {
      alert("Error in Catch", e);
    }
  };
  const handleWithdrawPrincipal = async () => {
    try {
      await contractInstance.methods
        .withdrawPrincipal()
        .send({ from: connectedAddress })
        .on("error", function (error) {
          console.log("Contract error: ", error);
          alert("Error On PAy Partner Fee:", error);
        })
        .on("receipt", async function (receipt) {
          alert("Widrwal Principal Successfull");
        });
      // });
    } catch (e) {
      alert("Error in Catch", e);
    }
  };

  return (
    <div className="wrap">
      {isLoading && (
        <div>
          <div className="loader">Transacting...</div>
        </div>
      )}{" "}
      {/* Display loader when isLoading is true */}
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
                        .format("DD-MMMM-YYYY")
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
                    : "0.0000"}
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
                    ? moment.unix(Number(endTime)).format("DD-MMMM-YYYY")
                    : "00/00/0000"}
                </p>
                <p className="cards-title">End Time</p>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerCount1" className="cards-numbers">
                  {Number(regTime) > 0
                    ? moment.unix(Number(regTime)).format("DD-MMMM-YYYY")
                    : "00/00/00"}
                </p>
                <p className="cards-title">Register Time</p>
              </div>
            </div>
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
                <p id="totalReward" className="cards-numbers">
                  {withdrawableROI
                    ? parseFloat(
                        Web3.utils.fromWei(withdrawableROI, "ether")
                      ).toFixed(4)
                    : "0.0000"}{" "}
                  <span className="sub-number"></span>
                </p>
                <p className="cards-title">Withdrawable ROI</p>
              </div>
            </div>
          </div>
        </div>
        {/* Third Row */}
        <div className="head-card skew mx-5 mt-4">
          <div className="row">
            <div className="col-lg-3 col-sm-6">
              <div className="box">
                <p id="partnerCount1" className="cards-numbers">
                  {totalDeposit
                    ? parseFloat(
                        Web3.utils.fromWei(totalDeposit, "ether")
                      ).toFixed(4)
                    : "0.0000"}{" "}
                </p>
                <p className="cards-title">Stake Amount</p>
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
                    ? moment.unix(Number(startTime)).format("DD-MMMM-YYYY")
                    : "00/00/0000"}

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

        <div className="row px-5">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center mt-4">
              <div className="network-heading text-center rounded-top-2">
                Level Income
              </div>
            </div>
            <div className="user-box">
              <div className="user-item">
                <div className="col-4 user-title">Level Number</div>
                <div className="col-4  user-value">Income</div>
                <div className="col-4  user-value">Team</div>

                {/* <div className="col-3 user-value">Upgraded Count</div>
                <div className="col-2 user-value">Upgrade Status</div> */}
              </div>
              {levelIncome.map(({ level, income, team }) => (
                <div className="user-item" key={level}>
                  <div className="col-4 user-title">Level {level}</div>
                  <div className="col-4 user-value">
                    {/* {income ? Number(income) : 0} */}
                    {income
                      ? parseFloat(Web3.utils.fromWei(income, "ether")).toFixed(
                          4
                        )
                      : "0.0000"}
                  </div>
                  <div className="col-4 user-value">
                    {team ? Number(team) : 0}
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
                    {income
                      ? parseFloat(Web3.utils.fromWei(income, "ether")).toFixed(
                          4
                        )
                      : "0.0000"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row px-5">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center mt-4">
              <div className="network-heading text-center rounded-top-2">
                Reward Info
              </div>
            </div>
            <div className="user-box">
              <div className="user-item">
                <div className="col-6 user-title">Reward Level</div>
                <div className="col-6 user-value">Status</div>
              </div>
              {rewardInfo.map(({ level, status }) => (
                <div className="user-item" key={level}>
                  <div className="col-6 user-title">Level {level}</div>
                  <div className="col-6 user-value">{status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Data */}
          <div className="col-lg-6 mt-4">
            <div className="swap-wrap p-3">
              <div className="swap-head1 text-center">Round Info</div>
              <div className="swap">
                <div className="swap-box">
                  <div className="node mb-3 d-flex align-items-center">
                    {/* <p className="node-title me-2 mb-0">Search by Round:</p> */}
                    <input
                      className="input-node bg-dashboard form-control ps-2 me-2"
                      placeholder="Enter Round"
                      type="number"
                      id="searchRoundInput"
                    />
                    <button className="mybtn2" onClick={handleSearchClick}>
                      Search
                    </button>
                  </div>
                  <div className="result-box mt-4">
                    <div className="result-item">
                      <div className="result-title">Profit:</div>
                      <div id="resultProfit" className="result-value">
                        {Number(roundProfitData) > 0
                          ? Number(roundProfitData)
                          : "0.0000"}
                      </div>
                    </div>
                    <div className="result-item">
                      <div className="result-title">Reward:</div>
                      <div id="resultReward" className="result-value">
                        {userProfitData
                          ? Number(userProfitData) > 0
                            ? parseFloat(
                                Web3.utils.fromWei(
                                  userProfitData.toString(),
                                  "ether"
                                )
                              ).toFixed(4)
                            : "0.0000"
                          : "0.0000"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* </div> */}
        <div className="row px-2">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center ">
              <div className="network-heading text-center rounded-top-2">
                USERS Data
              </div>
            </div>
            <div className="user-box">
              {users.map(({ title, value }) => (
                <div className="user-item" key={title}>
                  <div className="col-6 user-title">{title}</div>
                  <div id={title} className="col-6 user-value">
                    {value ? value : 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* {currentUserId} */}
          {(users.length > 0 ? Number(users[0].value) : 0) == 0 && (
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
          )}
          {/* {console.log("Users Id is :", users[0].value)} */}
          {(users.length > 0 ? Number(users[0].value) : 0) > 0 && (
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
          )}
          {/* )} */}
        </div>

        <div className="row px-5">
          {/*Close Round*/}
          {isOwner && (
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
          )}
          {/* Withdraw ROI */}
          {(users.length > 0 ? Number(users[0].value) : 0) == 0 && (
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
          )}

          {/* {(users.length > 0 ? Number(users[0].value) : 0) > 0 && ( */}
          <div id="onlyExamQualifier1" className="col-lg-6 mt-4">
            <div className="swap-wrap p-5">
              <div className="swap-head text-center">Withdraw Principal</div>
              <div className="pay text-center mt-5">
                <button className="mybtn1" onClick={handleWithdrawPrincipal}>
                  Withdraw Principal
                </button>
              </div>
            </div>
          </div>
          {/* )} */}
          {/* depositProfit (0x33c19ab0)*/}
          {isOwner && (
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
          )}

          {/* setRoundCloserAddress (0x29b51cff)*/}
          {isOwner && (
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
          )}
          {/* withdrawalStableCoin (0x4f3283fe) */}
          {isOwner && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
