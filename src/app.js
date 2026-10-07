import './css/style.css'
import Storage from './storage'
import Bank from './bank'
import {Modal} from 'bootstrap'
import{Account, User} from './services'


class App{
    constructor(){
        this.bank = new Bank()
        
        this._loadSavedUser()
        window
        .addEventListener('DOMContentLoaded', this.reload.bind(this))
        document
        .getElementById('login-form')
        .addEventListener('submit', this._login.bind(this))
        document
        .getElementById('signup-form')
        .addEventListener('submit', this._signup.bind(this))
        document
        .getElementById('deposit-form')
        .addEventListener('submit',this._deposit.bind(this))
        document
        .getElementById('withdraw-form')
        .addEventListener('submit',this._withdraw.bind(this))
        document
        .getElementById('transfer-form')
        .addEventListener('submit',this._transfer.bind(this))
        document
        .getElementById('logout-btn')
        .addEventListener('click',this._logout.bind(this))
        document
        .getElementById('login-signup')
        .addEventListener('click',this._formlink.bind(this))
        document
        .getElementById('signup-login')
        .addEventListener('click',this._formlink.bind(this))
        this._setupDepositConfirmation()
        this._setupWithdrwalConfirmation()
        this._setupConfirmTransfer()
        this._loadSavedData()
        this._loadTransactions()
    }
    
    addcomastonumber (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    Captialize(value){
        return value.charAt(0).toUpperCase() + value.slice(1)
    }

    _formlink(){
        const loginPage = document.getElementById('login-page')
        const signupPage = document.getElementById('Signup-page')
        if(!loginPage.classList.contains('display')){
            loginPage.classList.add('display')
            signupPage.classList.remove('display')
        }else{
            loginPage.classList.remove('display')
            signupPage.classList.add('display')

        }

    }
    
    _login(e){
        e.preventDefault()
        const loginPage =document.getElementById('login-page')
        const dashBoard = document.getElementById('dashboard')
        const formInput = document.getElementById('form-input')
        if(formInput.value === ''){
        this.Alert('alert-danger', 'Please Fill In Your Account Details')
        return
    }
    this.accountNumber = +formInput.value
    const user = this.bank.findUser(this.accountNumber)
    formInput.value = ''
    if(!user){
        this.Alert('alert-danger', 'User Does Not Exist')
        return
    }
    this.bank.login(this.accountNumber)
    this.Alert('alert-success', 'Login Successful')
    loginPage.classList.add('display')
    dashBoard.classList.remove('display')
    Storage.setcurrentUser(this.accountNumber)
    this.balanceDetails()
    this._displayTransactions()
    this.headerDetails()
    }
    Alert(classList, text){
        const div = document.getElementById('alert-container')
        div.classList.remove('alert-danger', 'alert-info', 'alert-success', 'alert-warning')
        const btn = document.createElement('button')
        div.classList.add(classList)
        div.innerHTML = text
        div.classList.remove('display')
        btn.setAttribute('id', 'btn-remove')
        btn.classList.add('btn-close')
        div.appendChild(btn)
       setTimeout(this.show, 5000)
       this.closeBtn()
    }
    show(){
        document.getElementById('alert-container').classList.add('display')
    }
    closeBtn(){
        document.getElementById('btn-remove').addEventListener('click', this.show)
        clearTimeout(this.show)
    }
    
    _signup(e){
        e.preventDefault()
        const userName = document.getElementById('name-input')
        const userAge = document.getElementById('age-input')


       if(+userAge.value === '' || userName.value === ''){
            this.Alert('alert-danger', 'Please Fill In Your Details')
            return
        }
        if(!+userAge.value || !String(userName)){
             this.Alert('alert-danger', 'Incorrect Input')
            return
        }
        if(+userAge.value < 18){
             this.Alert('alert-info', 'You Have To Be 18 Years And Above To An Account')
            return
        }
        const user = this.bank.createUser(this.Captialize(userName.value))
        this.Alert('alert-success' ,` Account Created Successfully
            <p>Account Number : ${user.account.accountNumber}</p>
            <small>Login With Your Account Number</small>`)
                    clearTimeout(this.show)
        this._saveuser()
        userName.value = ''
        userAge.value = ''
    }
    
    
    headerDetails(){
    const hsec = document.getElementById('header-sec')
        hsec.innerHTML = `
    <div class="rounded-pill">
    <h4>${this.bank.currentUser.name[0].toUpperCase()}</h4>
    </div>
    <div id="details" class="header-details">
    <h4 class="acct-header">${this.bank.currentUser.name}</h4>
    <p class="acct">Acc: ${this.bank.currentUser.account.accountNumber}</p>
    </div>
    <div class="drop-down" >
                        <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown"></button>
                        <div class="dropdown-menu">
                            <div>
                                <h4 class="acct-header">${this.bank.currentUser.name}</h4>
                                <p class="acct">Acc: ${this.bank.currentUser.account.accountNumber}</p>
                            </div>
                        </div>
                    </div>
    `
    }
        
_logout(){
    const loginPage =document.getElementById('login-page')
    const dashBoard = document.getElementById('dashboard')
    loginPage.classList.remove('display')
    dashBoard.classList.add('display')
    this.bank.logout()
    Storage.setcurrentUser(null)
    this.Alert('alert-info', 'You Logged Out')

}
reload(){
    const savedUser = Storage.getcurrentUser('currentUser')
    if(savedUser){
    const user = this.bank.findUser(Number(savedUser))
    if(user){
        this.bank.login(user.account.accountNumber)
        const loginPage =document.getElementById('login-page')
        const signupPage = document.getElementById('Signup-page')
        const dashBoard = document.getElementById('dashboard')
        loginPage.classList.add('display')
        signupPage.classList.add('display')
        dashBoard.classList.remove('display')
        this.balanceDetails()
        this._displayTransactions()
        this.headerDetails()
        this._saveTransaction()
    }
}
}

//  Deposit Methods
_deposit(e, acc, amount){
    const Dform = document.getElementById('deposit')
    
    e.preventDefault()
    acc = this.bank.currentUser.account.accountNumber
    amount = +Dform.value
    this.pendingDeposit = amount

        if(!amount|| Dform.value < 1000){
            this.Alert('alert-info', 'Amount can not be less than $1000')
            return
        }
        Dform.value = ''
        
        const modalEl = document.getElementById('deposit-modal')
        const modal = Modal.getInstance(modalEl)
        modal.hide()
        this.confirmdeposit(acc)
        
    }
confirmdeposit(acc){
        
        const dconfirm = document.getElementById('dconfirm-body')
        dconfirm.innerHTML = `<p>You are about to deposit</p>
        <h2>$${this.addcomastonumber(this.pendingDeposit)}</h2>
        <div class="confirm-content">
        <span>Into account</span>
        <div class="confirm-body">
        <div class="rounded-pill">
        <h4>${this.bank.currentUser.name[0]}</h4>
        </div>
        <div class="confirm-details">
        <h4>${this.bank.currentUser.name}</h4>
        <p>${acc}</p>
        </div>
        </div>
        </div>`                                   
const depositModal = document.getElementById('cdeposit-modal')
const modal = new Modal(depositModal)
modal.show()
                                    
                                }
_setupDepositConfirmation(){
    const confirmBtn = document.getElementById('Confirm')
    confirmBtn.addEventListener('click', ()=>{
    const amount = this.pendingDeposit
                                        
    this.bank.deposit(this.bank.currentUser.account.accountNumber, amount)
                                        
    const modalEl = document.getElementById('cdeposit-modal')
    const modal = Modal.getInstance(modalEl)
    modal.hide()
    this.finaldeposit()
    this.pendingDeposit = 0
    })
}
finaldeposit(){
        
const finaldiv = document.getElementById('final-deposit')
const finalbtn = document.getElementById('Finished')
        
finaldiv .innerHTML = `<h2>Deposit Successful</h2>
<p class="form-label">$${this.addcomastonumber(this.pendingDeposit)} has been deposited into your account</p>
<div class="confirm-content">
<div class="confirm-body">
                    
<div class="confirm-details">
        <span>Into account</span>
    <h4>${this.bank.currentUser.name}</h4>
    <p>${this.bank.currentUser.account.accountNumber}</p>
</div>
<div class="new-balance">
    <span>New Balance</span>
    <h3>$${this.addcomastonumber(this.bank.currentUser.account.balance)}</h3>
</div>
</div>
</div>`
this._displayTransactions()
this._savesBalances()
this._saveTransaction()
        
finalbtn.addEventListener('click', ()=>{
    const modalEl = document.getElementById('fdeposit-modal')
    const modal = Modal.getInstance(modalEl)
    modal.hide()
        } )
    const fdepositModal = document.getElementById('fdeposit-modal')
    const modal = new Modal(fdepositModal)
    modal.show()
    this.balanceDetails()
    }
    

    // Withdrawal Methods
_withdraw(e, acc, amount){
        const Wform = document.getElementById('withdraw')
        
        e.preventDefault()
        acc = this.bank.currentUser.account.accountNumber
        amount = +Wform.value
        this.pendingWithdrawal = amount
        if(!amount || Wform.value < 500){
            this.Alert('alert-info', 'Amount can not be less than $500')
            return
        }
        Wform.value = ''

        
        const modalEl = document.getElementById('withdraw-modal')
        const modal = Modal.getInstance(modalEl)
        modal.hide()

        this._confirmWithdrawal(acc)
        
    }
    _confirmWithdrawal(acc){

        const dconfirm = document.getElementById('wconfirm-body')
        dconfirm.innerHTML = `<p>You are about to withdraw</p>
                        <h2 class='text-danger'>$${this.addcomastonumber(this.pendingWithdrawal)}</h2>
                        <div class="confirm-content">
                            <span>From account</span>
                            <div class="confirm-body">
                                <div class="rounded-pill">
                                    <h4>${this.bank.currentUser.name[0]}</h4>
                                </div>
                                <div class="confirm-details">
                                    <h4>${this.bank.currentUser.name}</h4>
                                    <p>${acc}</p>
                                </div>
                            </div>
                        </div>`

                        const cWithdrawalModal = document.getElementById('cwithdraw-modal')
                        const modal = new Modal(cWithdrawalModal)
                        modal.show()

    }
    _setupWithdrwalConfirmation(){
        const wconfirmBtn = document.getElementById('Confirm-withdraw')
        wconfirmBtn.addEventListener('click', ()=>{
            const amount = this.pendingWithdrawal

            if(amount > this.bank.currentUser.account.balance){
                this.Alert('alert-warning', 'Insufficient Funds')
                return
            }
        this.bank.withdraw(this.bank.currentUser.account.accountNumber, amount)

        const cWithdrawalModal = document.getElementById('cwithdraw-modal')
        const modal = Modal.getInstance(cWithdrawalModal)
        modal.hide()
            this._finalWithdrawal()
            this.pendingWithdrawal = 0
        })
    }
    _finalWithdrawal(){
        
        const finaldiv = document.getElementById('final-withdraw')
        const finalbtn = document.getElementById('Finished-withdrawal')

        finaldiv .innerHTML = `<h2>Withdrawal Successful</h2>
                        <p class="form-label">$${this.addcomastonumber(this.pendingWithdrawal)} has been withdrawn from your account</p>
                        <div class="confirm-content">
                            <div class="confirm-body">
                    
                                <div class="confirm-details">
                                    <span>Into account</span>
                                    <h4>${this.bank.currentUser.name}</h4>
                                    <p>${this.bank.currentUser.account.accountNumber}</p>
                                </div>
                                <div class="new-balance">
                                    <span>New Balance</span>
                                    <h3>$${this.addcomastonumber(this.bank.currentUser.account.balance)}</h3>
                                </div>
                            </div>
                        </div>`
                        this._savesBalances()
        this._displayTransactions()
        this._saveTransaction()
                        
                        finalbtn.addEventListener('click', ()=>{
                            const fwithdrawModal = document.getElementById('fwithdraw-modal')
                            const modal = Modal.getInstance(fwithdrawModal)
                            modal.hide()
                        } )

                        const fwithdrawModal = document.getElementById('fwithdraw-modal')
                        const modal = new Modal(fwithdrawModal)
                        modal.show()

                        this.balanceDetails()
    }

    _transfer(e, acc){
        e.preventDefault()
        const receiverDetails = document.getElementById('receiver-details')
        const TransferAmount = document.getElementById('transfer-amount')
        acc = +receiverDetails.value
        const user = this.bank.findUser(acc)
        this.pendingTransfer = +TransferAmount.value
        this.pendingreceiver = user
        
        if(receiverDetails.value === '' || TransferAmount.value === '' ){
            this.Alert('alert-danger', 'Please Fill In Your Details')
            return
        }
        if(user ===this.bank.currentUser){
            this.Alert('alert-warning', 'Sender Cannot Be Receiver')
            return
        }
        if(!+TransferAmount.value || !user){
            this.Alert('alert-danger', 'Invalid Details: Check Account Number or Amount')
            return
        }
        receiverDetails.value = ''
        TransferAmount.value = ''
        
        const modalEl = document.getElementById('transfer-modal')
        const modal = Modal.getInstance(modalEl)
        modal.hide()
        this._confirmTransfer()
        
    }
    _confirmTransfer(){
        const ctransfer = document.getElementById('tconfirm-body')
        ctransfer.innerHTML = `   <p>Send</p>
                        <h1 class='transfer-amount'>$${this.addcomastonumber(this.pendingTransfer)}</h1>
                        <span>From</span>
                        <div class="confirm-content">
                            <div class="confirm-body">
                        
                                <div class="tdetails">
                                    <div class="rounded-pill sender">
                                        <h4>${this.bank.currentUser.name[0].toUpperCase()}</h4>
                                    </div>
                                    <div>
                                        <h4 class= 'mb-0'>${this.bank.currentUser.name}</h4>
                                        <p class='.mt-5'>Account: ${this.bank.currentUser.account.accountNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span>To</span>
    
                        <div class="confirm-content">
                            <div class="confirm-body">
                                <div class="tdetails">
                                    <div class="rounded-pill ">
                                        <h4>${this.pendingreceiver.name[0].toUpperCase()}</h4>
                                    </div>
                                    <div>
                                        <h4 class= 'mb-0'>${this.pendingreceiver.name}</h4>
                                        <p class='.mt-5'>Account: ${this.pendingreceiver.account.accountNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
                    const transferModal = document.getElementById('ctransfer-modal')
                    const modal = new Modal(transferModal)
                    modal.show()

    }
    _setupConfirmTransfer(){
        document.getElementById('Confirm-transfer').addEventListener('click', ()=>{


            if(this.pendingTransfer > this.bank.currentUser.account.balance){
                this.Alert('alert-warning', 'Insufficient Funds')
            const modalEl = document.getElementById('ctransfer-modal')
            const modal = Modal.getInstance(modalEl)
            modal.hide()
                return
            }
            this.bank.transfer(this.bank.currentUser.account.accountNumber, this.pendingreceiver.account.accountNumber, this.pendingTransfer)
            const transferModal = document.getElementById('ctransfer-modal')
            const modal = Modal.getInstance(transferModal)
            modal.hide()

            this._finaltransfer()
            this.pendingTransfer = 0
        })
    }
    _finaltransfer(){
        const finaldiv = document.getElementById('final-transfer')
        const finalbtn = document.getElementById('Finished-transfer')

        finaldiv.innerHTML = `<h2>Transfer Successful</h2>
                        <p class="form-label">$${this.addcomastonumber(this.pendingTransfer)} has been sent to ${this.pendingreceiver.name}</p>
                        
                        <div class="confirm-content">
                            <div class="confirm-body">
                        
                                <div class="finalTransfer-details">
                                    <div>
                                        <p>To:</p>
                                        <p>From:</p>
                                        <p>New Balance:</p>
                                    </div>
                                    <div class="transfer-details">
                                        <p>${this.pendingreceiver.name}(${this.pendingreceiver.account.accountNumber})</p>
                                        <p>${this.bank.currentUser.name}(${this.bank.currentUser.account.accountNumber})</p>
                                        <h3>$${this.addcomastonumber(this.bank.currentUser.account.balance)}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>`
                        this._savesBalances()
                this._displayTransactions()
                this._saveTransaction()
                        finalbtn.addEventListener('click', ()=>{
                            const modalEl = document.getElementById('ftransfer-modal')
                            const modal = Modal.getInstance(modalEl)
                            modal.hide()
                        })
                        const transferModal = document.getElementById('ftransfer-modal')
                        const modal = new Modal(transferModal)
                        modal.show()
                        this.balanceDetails()

    }
    _displayTransactions(){
        const transactionsDiv = document.getElementById('transactions')
            transactionsDiv.innerHTML = `<div class="text-center">
                    <h3>No Transactions Yet</h3>
                    <p>Your Transactions Will Show Once You Make A Deposit, Withdrawal Or Transfer</p>
                </div>`
                
                const transactions =  this.bank.transactions.filter((transaction) =>{
                    if(transaction.receiver === this.bank.currentUser || transaction.sender === this.bank.currentUser){
                        transactionsDiv.innerHTML = ''     
                return true
            }
        } )
        transactions.forEach((transaction)=>{
            if(transaction.receiver === this.bank.currentUser && transaction.type === 'Deposit'){
                transactionsDiv.innerHTML += `
                    <div class="transacts" id="transact-receipt">
        <div class="transact-type">
            <span class="rounded-pill transact-Deposit">
                <i class="fa-solid fa-download"></i>
            </span>
        </div>
        <div class='transact-div'>
            <h4 class='mb-0'>${transaction.type}</h4>
            <p>${transaction.rdescription}</p>
        </div>
        <div class="transact-div">
            <h4 class='text-success mb-0'>+$${transaction.amount}</h4>
            <p>${transaction.time.toLocaleString('default', {month: 'short', day:'numeric', year:'numeric', hour:'numeric', minute:'numeric'})}</p>
        </div>
        </div>
                    `}
           else if(transaction.receiver === this.bank.currentUser && transaction.type === 'Withdrawal'){
                    transactionsDiv.innerHTML += `
                    <div class="transacts" id="transact-receipt">
        <div class="transact-type">
            <span class="rounded-pill transact-Withdraw">
                <i class="fa-solid fa-upload"></i>
            </span>
        </div>
        <div class='transact-div'>
            <h4 class='mb-0'>${transaction.type}</h4>
            <p>${transaction.rdescription}</p>
        </div>
        <div class="transact-div">
            <h4 class='text-danger mb-0'>-$${transaction.amount}</h4>
            <p>${transaction.time.toLocaleString('default', {month: 'short', day:'numeric', year:'numeric', hour:'numeric', minute:'numeric'})}</p>
        </div>
        </div>
                    `}
               else if(transaction.sender === this.bank.currentUser && transaction.type === 'Transfer'){   
                transactionsDiv.innerHTML += `
                    <div class="transacts" id="transact-receipt">
        <div class="transact-type">
            <span class="rounded-pill transact-Tansfer">
                <i class="fa-brands fa-telegram"></i>
            </span>
        </div>
        <div class='transact-div'>
            <h4 class='mb-0'>${transaction.type}</h4>
            <p>${transaction.rdescription}</p>
        </div>
        <div class="transact-div">
            <h4 class='text-danger mb-0'>-$${transaction.amount}</h4>
            <p>${transaction.time.toLocaleString('default', {month: 'short', day:'numeric', year:'numeric', hour:'numeric', minute:'numeric'})}</p>
        </div>
        </div>
                    `

                }
               else if(transaction.receiver === this.bank.currentUser && transaction.type === 'Transfer'){
                transactionsDiv.innerHTML += `
                    <div class="transacts" id="transact-receipt">
        <div class="transact-type">
            <span class="rounded-pill transact-Tranfer">
                <i class="fa-brands fa-telegram"></i>
            </span>
        </div>
        <div class='transact-div'>
            <h4 class='mb-0'>${transaction.type}</h4>
            <p>${transaction.sdescription}</p>
        </div>
        <div class="transact-div">
            <h4 class='text-success mb-0'>+$${transaction.amount}</h4>
            <p>${transaction.time.toLocaleString('default', {month: 'short', day:'numeric', year:'numeric', hour:'numeric', minute:'numeric'})}</p>
        </div>
        </div>
                    `

                }
        })
    }
    _savesBalances(){
        const balances = this.bank.users.map((user)=>{
            return{
                accountNumber: user.account.accountNumber,
                balance: user.account.balance
            }
        })
        Storage.setBalance(balances)

    }
    _loadSavedData(){
        const balances = Storage.getBalance()
        
        balances.forEach((savedBalance)=>{
            const user = this.bank.findUser(savedBalance.accountNumber)
            if(!user){
                return
            }
            user.account.balance = savedBalance.balance
        })
        
    }
    _saveuser(){
        const users = this.bank.users.map((user)=>{
            return{
                name : user.name,
                accountNumber: user.account.accountNumber
            }
        })
        Storage.setUser(users)
    }
    _loadSavedUser(){
        const users = Storage.getUser()
        users.forEach((user)=>{
            const acct = new Account(user.accountNumber)
            const newUser = new User(user.name, acct)
            this.bank.users.push(newUser)  
        })
        
    }
    
    _saveTransaction(){
        const transactions = this.bank.transactions.map((transaction)=>{
            return{
            amount: transaction.amount,
            rdescription: transaction.rdescription,
            receiver: transaction.receiver ? transaction.receiver.account.accountNumber:null ,
            sdescription: transaction.sdescription,
            sender: transaction.sender ? transaction.sender.account.accountNumber:null,
            time : transaction.time.toLocaleString('default', {month: 'short', day:'numeric', year:'numeric', hour:'numeric', minute:'numeric'}),
            type : transaction.type
            }
        })
        Storage.setTransactions(transactions)
    }
    _loadTransactions(){
        const transactions = Storage.getTransactions()

        transactions.forEach((savedTransactions) =>{
            const sender = savedTransactions.sender ?this.bank.findUser(savedTransactions.sender):null
            const receiver = savedTransactions.receiver ?this.bank.findUser(savedTransactions.receiver) :null
        this.bank.transactions.push({
            amount: savedTransactions.amount,
            rdescription: savedTransactions.rdescription,
            receiver: receiver,
            sdescription: savedTransactions.sdescription,
            sender: sender,
            time : savedTransactions.time.toLocaleString('default', {month: 'short', day:'numeric', year:'numeric', hour:'numeric', minute:'numeric'}),
            type : savedTransactions.type
        })
        })
        
        
    }
    
    
    balanceDetails(){
        const baldetails = document.getElementById('display-details')

    baldetails.innerHTML = `<div class="acct-details">
                    <h6>Available Balance</h6>
                    <h1>$${this.addcomastonumber(this.bank.currentUser.account.balance)}.00</h1>
                    <small>Account Number: ${this.bank.currentUser.account.accountNumber}</small>
                </div>
                <div class="motto-container">
                    <p class="text-end">Your trust<br> is our priority</p>
                    <i class="fa-solid fa-shield"></i>
                </div>`
                this._savesBalances()
                this._saveTransaction()

    }


}

const app = new App()