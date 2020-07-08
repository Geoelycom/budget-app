//BUDGET CONTROLLER 
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentages = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
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
        addItem: function(type, des, val) {
            var newItem, ID;
            if (data.allItems[type].lenght > 0) {
                ID = data.allItems[type][data.allItems[type].lenght - 1].id + 1;
            } else {
                ID = 0;

            }
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudjet: function() {
            // calculate total income and exp
            calculateTotal('exp');
            calculateTotal('inc');

            // caculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income the we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

    };

})();


//UI CONTROLLER
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title__month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.lenght > 3) {
            int = int.substr(0, int.lenght - 3) + ',' + int.substr(int.lenght - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' +
            int + '.' + dec;

    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.lenght; i++) {
            callback(list[i], i);
        }
    };


    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class ="item__description">%description%</div><div class ="right clearfix"><div class ="item__value">%value%</div><div class ="item__delete"><button class ="item__delete--btn"><i class ="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div> ';
            }

            // replace placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '___';
                }
            });


        },

        displayMonths: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },


        getDOMstrings: function() {
            return DOMstrings;
        }
    };


})();

// Global APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    var setUpEeventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }

        });
        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {
        //calculate the budget
        budgetCtrl.calculateBudjet();
        //  return the budget
        var budget = budgetCtrl.getBudget();
        //Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1.calculte the percentages
        budgetCtrl.calculatePercentages();
        // 2. read from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };



    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getinput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            // calculate and update the percentages
            updatePercentages();
        }

    };

    var ctrDeleteItem = function(e) {
        var itemID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
        }
    };


    return {
        init: function() {
            console.log('Application as started');
            //UICtrl.displayMonths();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEeventListeners();
        }
    };

    // TODO LIST

})(budgetController, UIController);

controller.init();
