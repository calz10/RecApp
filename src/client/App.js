import React, { Component } from 'react'
import { Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3 from 'web3';
import IPFS from 'ipfs-api'

const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


const web3 = new Web3(window.web3.currentProvider);
const address = '0x3df5f89abadf0b08ac75469b7b54660fdfc8d57e'

const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "x",
				"type": "string"
			}
		],
		"name": "sendHash",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getHash",
		"outputs": [
			{
				"name": "x",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]

const storehash = new web3.eth.Contract(abi, address);


class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ipfsHash: null,
            buffer: '',
            ethAddress: '',
            transactionHash: '',
            txReceipt: ''
        };
        this.convertToBuffer = this.convertToBuffer.bind(this)
        this.onClick = this.onClick.bind(this)
        this.captureFile = this.captureFile.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    captureFile(event){
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = async() => await this.convertToBuffer(reader)
    }
    //Convert the file to buffer to store on IPFS
    async convertToBuffer(reader){
        //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
        //set this buffer-using es6 syntax
        this.setState({ buffer });
    }
    //ES6 async function
    async onClick() {
        try {
            this.setState({ blockNumber: "waiting.." });
            this.setState({ gasUsed: "waiting..." });
            await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
                console.log(err, txReceipt);
                this.setState({ txReceipt });
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async onSubmit(event){
        event.preventDefault();
        //bring in user's metamask account address
        const accounts = await web3.eth.getAccounts();
        //obtain contract address from storehash.js
        const ethAddress = await storehash.options.address;
        this.setState({ ethAddress });
        //save document to IPFS,return its hash#, and set hash# to state
        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err, ipfsHash);
            //setState by setting ipfsHash to ipfsHash[0].hash
            this.setState({ ipfsHash: ipfsHash[0].hash });
            // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
            //return the transaction hash from the ethereum contract
            storehash.methods.sendHash(this.state.ipfsHash).send({
                from: accounts[0]
            }, (error, transactionHash) => {
                console.log(transactionHash);
                this.setState({ transactionHash });
            });
        })
    }


    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Ethereum and IPFS using Infura</h1>
                </header>
                <hr />
                <grid>
                    <h3> Choose file to send to IPFS </h3>
                    <form onSubmit={this.onSubmit}>
                        <input
                            type="file"
                            onChange={this.captureFile}
                        />
                        <Button
                            bsStyle="primary"
                            type="submit">
                            Send it
                 </Button>
                    </form>
                    <hr />
                    <Button onClick={this.onClick}> Get Transaction Receipt </Button>
                    <hr />
                    <table bordered responsive>
                        <thead>
                            <tr>
                                <th>Tx Receipt Category</th>
                                <th> </th>
                                <th>Values</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>IPFS Hash stored on Ethereum</td>
                                <td> : </td>
                                <td>{this.state.ipfsHash}</td>
                            </tr>
                            <tr>
                                <td>Ethereum Contract Address</td>
                                <td> : </td>
                                <td>{this.state.ethAddress}</td>
                            </tr>
                            <tr>
                                <td>Tx # </td>
                                <td> : </td>
                                <td>{this.state.transactionHash}</td>
                            </tr>
                        </tbody>
                    </table>
                </grid>
            </div>
        )
    }
}
export default App;