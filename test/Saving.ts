import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import { ethers } from "hardhat";

  describe("SavingContract erc20 & ether", () => {

    const deploySavingContract = async () => {

         const addrZero = ethers.ZeroAddress;
 
         const [owner, otherAccount] = await ethers.getSigners();
         
         const Erc20Token = await ethers.getContractFactory('ManoToken');
 
         const erc20Token = await Erc20Token.deploy(owner);
 
         const Saving = await ethers.getContractFactory("Saving");
 
         const saving = await Saving.deploy(erc20Token.target);
 
         const contAddr = saving.target;
 
         return {saving, owner, contAddr, otherAccount, addrZero, erc20Token};
    }

    describe("deposit in erc20", () => {

        it("should deposit erc20 to savings contract", async () => {
            const {saving, contAddr, erc20Token, owner} = await loadFixture(deploySavingContract);

            const savingBeforeDeposit = await saving.checkBalanceInToken(owner);

            const ownerBalErc20TokenBeforeDeposit = await erc20Token.connect(owner).balanceOf(owner);

            await erc20Token.approve(contAddr, 200)

            await saving.connect(owner).depositInERC20(200);

            const savingsAfterDeposit = await saving.checkBalanceInToken(owner)

            const ownerBalErc20TokenAfterDeposit = await erc20Token.connect(owner).balanceOf(owner);

            await expect(await saving.checkBalanceInToken(owner)).eq(200)

            await expect(savingsAfterDeposit).to.be.greaterThan(savingBeforeDeposit);

            await expect(ownerBalErc20TokenBeforeDeposit).to.eq(2000)

            await expect(ownerBalErc20TokenAfterDeposit).to.eq(1800)
        })
     })

     describe("deposit in ether", () => {

        it("should deposit ether to savings contract", async () => {
            const {saving,  owner} = await loadFixture(deploySavingContract);

            const amount = ethers.parseEther('2')

            const checkingAmount = ethers.parseEther('1')
            await saving.connect(owner).depositInEther({value: amount});

            await expect(await saving.checkBalanceInEther(owner)).eq(checkingAmount)

        })
     })

     describe("withdrawal in erc20 token", () => {
        it("should successful withdraw tokens", async () => {
            const {saving, contAddr, erc20Token, owner} = await loadFixture(deploySavingContract);

            await erc20Token.approve(contAddr, 200)

            await saving.connect(owner).depositInERC20(200);

            const savingsBeforeWithdrawal = await saving.checkBalanceInToken(owner)

            await saving.connect(owner).withdrawToken(200);

            const savingsAfterWithdrawal = await saving.checkBalanceInToken(owner)

            await expect(savingsBeforeWithdrawal).to.be.greaterThan(savingsAfterWithdrawal);

        })
     })

     describe("withdraw in Ether", () => {

        it("should successful withdraw ether", async () => {
            const {saving,  owner} = await loadFixture(deploySavingContract);

            await saving.connect(owner).depositInEther({value: 2});

            await saving.connect(owner).withdrawInEther();

            await expect(await saving.checkBalanceInEther(owner)).eq(0)

        })
     })

     describe("sendOut ether savings", () => {

        it("should successfully sendout ether savings", async () => {
            const {saving,  owner, otherAccount} = await loadFixture(deploySavingContract);

            await saving.connect(owner).depositInEther({value: 2});

            await saving.connect(owner).sendOutSavingInEther(otherAccount, 1);

            await expect(await saving.checkBalanceInEther(owner)).eq(1)

        })
     })
  })