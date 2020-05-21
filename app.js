/*
//modules 

let budgetController  = (function(){
    let x = 23;

    var add = function(a){
        return x + a;
    }

    return{
        publicTest: function(b){
            return (add(b))
        }
    }

}());

let UI_controller = (function(){

}());


let controller = (function(budgetCtrl, uiCtrl){
  let s =  budgetCtrl.publicTest(6);

  return {
      another: function(){
          console.log(s)
      }
  }

}(budgetController, UI_controller));

*/




//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        } 
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
     
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function (type) {
        let sum = 0;

        data.allItems[type].forEach(function (cur) {
            sum += cur.value;

            /*
             for example:
             in our first iteration our element is 0
             0
             [200, 500, 800]
             sum = 0 + 200
             sum = 200 + 500
             sum = 700 + 800 = 1200 in the end
            
              */
        });

        //we can add the sum to our data structure
        data.totals[type] = sum;

    };



    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element, so it can be acessible to other modules
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index;
            //id = 6
            //ids = [1 2 4 6 8]
            //we have to look for the index of 6
            //index = 3 

            ids = data.allItems[type].map(function (current) {
                //in this function that is called for each element, we'll always return something and then this will then be stored in a new array
                return current.id;
            });

            index = ids.indexOf(id);

            //-1 means when the element but index in this case is not in existence
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            //Calculate total Income and Expences
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget: Income - Expences
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of Income that we spent
            //just an example of how it will work
            //Expense = 100 and Income 200, spent 50% = 100 / 200 = 0.5 * 100
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){
            /*
            a = 20
            b  = 40
            c = 10
            income = 100
            a = 20 / 100 = 20%
            b = 40 / 100 = 40%
            c = 10 / 100 = 40%

            The Expense is always divided by the income
            */

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();

            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIcontroller = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        checkbtn: '.check__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabwl: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    let formatNumber = function(num, type){
        let numSplit, int, dec;

        /*
        + or - before number
        exactly two decimal points
        comma seperating the thousands

        2310.1223 -> + 2,310.13
        2000 -> - 2,000.00
        
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        //Tnis will split it into two parts, the int amd decimal
        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            //the argument of the substr are, the index where we want to start from and how many characters we want to read
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input -> 2310, output -> 2,310
        }

        dec = numSplit[1];

      /*  type === 'exp' ? sign = '-' : sign = '+';
        return type + ' ' + inc + dec;*/

        return (type === 'exp' ? '-' : '+')
        + ' ' + int + '.' + dec;

    };

    let nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                //The parseFloat function is going to take the Stringed number in the inputted fields and change it to a number
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            //this anonymous function in this case can receive uoto 3 argument
            //1. The current value, that means the value if the array that is currently been processed
            //2. We also have the index number, that is the number going from 0 to the length of the array -1
            //3. And we have access to the entire array too, which in this case will be the original array thats is the fields array
            fieldsArr.forEach(function (cur, i, arr) {
                //the forEach method, loops tru the fieldsArr and set the value of all of them to the empty ""
                cur.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },


        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMstrings.expensePercLabwl);
            //In the DOM tree,each element is called a node
            //we need to loop over all these nodes in our selection amd then change the textContent
           
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });

        },

        displayDate: function(){
            let now, months, month, year;

            now = new Date();
           // var chrismas = new Date(2020, 11, 25);
           months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

           // This now obj, now inherit a bunch of methods from the date prototype
           month = now.getMonth();
           year = now.getFullYear();
           document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        
        changeType: function(){

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.checkbtn).classList.toggle('red');

        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();



// APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var DOM = UICtrl.getDOMstrings();


    var setupEventListeners = function () {

        document.querySelector(DOM.checkbtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });


        //The ctrlDeleteItem will be called each time someone clicks somewhere on this container 
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    let updateBudget = function () {

        // 1. Calculate and budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget 
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    let updatePercentages = function(){
        //Calculate percentages
        budgetCtrl.calculatePercentages();

        //Read percentages from budgetController
       let percentages = budgetCtrl.getPercentages();

        //Update UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };


    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }

    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //this breaks the element into different parts, returning an array of all the elements that comes before and after the split strings, removing the split strings
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //Update and show the new budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }  
    };


    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller);


controller.init();
