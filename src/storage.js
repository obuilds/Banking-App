class Storage{
    static getUser(){
        let Users 
        if(localStorage.getItem('Users')=== null){
            Users = []
        }else{
            Users = JSON.parse(localStorage.getItem('Users'))
        }
        return Users
    }
    static setUser(user){
        localStorage.setItem('Users', JSON.stringify(user))
    }
    static getBalance(){
        let balance
        if(localStorage.getItem('UserBalance') === null){
            balance = 0
        }else{
            balance = JSON.parse(localStorage.getItem('UserBalance'))
        }
       return balance
    }
    static setBalance(balances){
         localStorage.setItem('UserBalance', JSON.stringify(balances))
    }
    static getcurrentUser(defaultUser = null){
        let currentUser
        if(localStorage.getItem('currentUser') === null){
           currentUser = defaultUser

        }else{
           currentUser = localStorage.getItem('currentUser')
        }
        return currentUser
}
    static setcurrentUser(accountNumber){
    localStorage.setItem('currentUser', accountNumber)
}
    static getTransactions(){
    let Transaction
    if(localStorage.getItem('Transactions') === null){
        Transaction = []
    }else{
        Transaction = JSON.parse(localStorage.getItem('Transactions'))
    }
   return Transaction
}
    static setTransactions(transactions){
    localStorage.setItem('Transactions', JSON.stringify(transactions))
}
}

export default Storage