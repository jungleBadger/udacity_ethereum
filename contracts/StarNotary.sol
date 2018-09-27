pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string dec;
        string mag;
        string cent;
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(string => uint32) private coordinatesMapping;

    event StarExists(bool _status);


    function append(string a, string b, string separator) internal pure returns (string) {
        return string(abi.encodePacked(a, separator, b));
    }

    function createStar(string _name, string _dec, string _mag, string _cent, string _story, uint256 _tokenId) public {
        require(checkIfStarExist(_dec, _mag) == false);

        coordinatesMapping[append(_dec, _mag, ":")] = 1;

        Star memory newStar = Star(_name, _dec, _mag, _cent, _story);
        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function checkIfStarExist(string _dec, string _mag) public returns (bool) {
        if (coordinatesMapping[append(_dec, _mag, ":")] == 1) {
            emit StarExists(true);
            return true;
        } else {
            emit StarExists(false);
            return false;
        }
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] =  _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);


        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }

    }

}