// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./IERC20.sol";

error ADDRESS_ZERO();
error INVALID_AMOUNT();
error INSUFFICIENT_AMOUNT();

contract Saving {

    address owner;
    address savingToken;

    event SavingEvent(address sender, uint256 amount);
    event WithdrawEvent(address receiver, uint256 amount);

    constructor(address _savingToken) {
        savingToken = _savingToken;
        owner = msg.sender;
    }

    mapping(address => uint256) tokenSavings;
    mapping(address => uint256) etherSavings;

     function depositInERC20(uint256 _amount) external {
        if(msg.sender == address(0)) {
            revert ADDRESS_ZERO(); 
        }

        if(_amount <= 0) {
            revert INVALID_AMOUNT();
        }

        if(IERC20(savingToken).balanceOf(msg.sender) < _amount) {
            revert INSUFFICIENT_AMOUNT();
        }

        require(IERC20(savingToken).transferFrom(msg.sender, address(this), _amount), "failed to transfer");

        tokenSavings[msg.sender] += _amount;

        emit SavingEvent(msg.sender, _amount);

    }

     function depositInEther() external payable {
        if(msg.sender == address(0)) {
            revert ADDRESS_ZERO(); 
        }

        require(msg.value > 0, "can't save zero value");
        
        etherSavings[msg.sender] += msg.value;
        
        emit SavingEvent(msg.sender, msg.value);
    }

    function withdrawToken(uint256 _amount) external {
        if(msg.sender == address(0)) {
            revert ADDRESS_ZERO(); 
        }

        require(_amount > 0, "can't withdraw zero value");

        uint256 _userSaving = tokenSavings[msg.sender];

        require(_userSaving >= _amount, "insufficient funds");

        tokenSavings[msg.sender] -= _amount;

        require(IERC20(savingToken).transfer(msg.sender, _amount), "failed to withdraw");

        emit WithdrawEvent(msg.sender, _amount);
    }

    function withdrawInEther() external {
        if(msg.sender == address(0)) {
            revert ADDRESS_ZERO(); 
        }

        uint256 _userSavings = etherSavings[msg.sender];
        require(_userSavings > 0, "you don't have any savings");

        etherSavings[msg.sender] -= _userSavings;

        payable(msg.sender).transfer(_userSavings);
    }

    function sendOutSavingInEther(address _receiver, uint256 _amount) external {
         if(msg.sender == address(0)) {
            revert ADDRESS_ZERO(); 
        }
        require(_amount > 0, "can't send zero value");
        require(etherSavings[msg.sender] >= _amount);
        etherSavings[msg.sender] -= _amount;
        
        payable(_receiver).transfer(_amount);
    }

    function checkBalanceInToken(address _user) external view returns (uint256) {
        return tokenSavings[_user];
    }

    function checkBalanceInEther(address _user) external view returns (uint256) {
        return etherSavings[_user];
    }
}