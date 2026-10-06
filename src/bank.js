import{Account, User, Transactions} from './services'

class Bank {
    constructor(){
        this.users = []
        this.transactions = []
    }
    createUser(name){
        this.name = name
        const accountNumber = 100001 + this.users.length
        const acct = new Account(accountNumber)
        const user = new User(name, acct)
        this.users.push(user)
        return user
    }
    findUser(accountNumber){
        const user = this.users.find(user => user.account.accountNumber === accountNumber)
        return user
    }
    login(accountNumber){
        const currentUser = this.findUser(accountNumber)
        
        if(!currentUser){
            return
        }else{
            this.currentUser = currentUser
        }
    }
    logout(){
        this.currentUser = null
    }
    deposit(accountNumber, amount){
        const user = this.findUser(accountNumber)

        if(!user){
            return
        }
        if(amount <= 0){
            return
        }
        this.#processdeposit(user, amount)
    }
    withdraw(accountNumber, amount){
        const user = this.findUser(accountNumber)
        if(!user){
            return
        }
        if(amount <= 0){
            return
        }
        if(user.account.balance < amount){
            return
        }
        this.#processwithdrawal(user, amount)

    }
    transfer(senderAccountNumber, receiverAccountNumber, amount){
        const sender = this.findUser(senderAccountNumber)
        const receiver = this.findUser(receiverAccountNumber)

        if(!sender || !receiver){
            return
        }
        if(amount <= 0){
            return
        }
        if(sender.account.balance < amount){
            return
        }
        
        this.#processTransfer(sender,receiver, amount)

    }
    #processdeposit(user, amount){
        user.account.balance += amount
        this.transactions.push(new Transactions(
            'Deposit',
            null,
            'Self-Deposit',
            amount,
            null, 
            user
        ))
    }
    #processwithdrawal(user, amount){
        user.account.balance -= amount
        this.transactions.push(new Transactions(
            'Withdrawal',
            null,
            'Self-Withdrawal',
            amount,
            null, 
            user
        ))
    }
    #processTransfer(sender, receiver, amount){
        sender.account.balance -= amount
        receiver.account.balance += amount

        this.transactions.push(new Transactions(
            'Transfer',
            `From: ${sender.name}(${sender.account.accountNumber})`,
            `To:${receiver.name}(${receiver.account.accountNumber})`,
            amount,
            sender, 
            receiver,
        ))
    }
}

export default Bank