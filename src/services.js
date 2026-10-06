class Account{
    constructor(accountNumber){
        this.accountNumber = accountNumber
        this.balance = 0

    }
}
class User{
    constructor(name, account){
        this.name = name
        this.account = account
    }
}

class Transactions{
    constructor(type, sdescription, rdescription, amount, sender, receiver){
        this.type = type
        this.sdescription = sdescription
        this.rdescription = rdescription
        this.amount = amount
        this.time = new Date()
        this.sender = sender
        this.receiver = receiver

    }
}

export {
    Account,
    User,
    Transactions
}