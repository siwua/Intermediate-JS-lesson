// Basic concepts of module:
// IIFE to create private function & data
//var budgetController = (function() {
//    
//    // Private only
//    var x = 23;
//    var add = function(a) {
//        return x + a;
//    };
//    
//    // Publicity
//    return {
//        publicTest: function(b) {
//            return add(b);
//        }
//    };
//})();
//
//var UIController = (function() {
//    // some code 
//})();
//
//var controller = (function(budgetCtrl, UICtrl) {
//    var z = budgetCtrl.publicTest(5);
//    
//    return {
//        anotherPublic: function() {
//            console.log(z);
//        }
//    };
//})(budgetController, UIController);


// BUDGET CONTROLLER
var budgetController = (function() {
    
    // Constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentages = function(totalIncome) {
        
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome)* 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;  
    };
    
    
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
        data.total[type] = sum;
    };
    
    // Data structure 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
      addItem: function(type, desc, val) {
          var newItem, ID;
          
          // Create new ID 
          if (data.allItems[type].length > 0) {
              ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
          } else {
              ID = 0;
          }
           
          // Create new item based on type 'inc' or 'exp'
          if (type === 'exp') {
              newItem = new Expense(ID, desc, val);
          } else if (type === 'inc') {
              newItem = new Income(ID, desc, val);
          }
        
          // Push it into our data structure
          data.allItems[type].push(newItem);
          
          // Return the new element
          return newItem;
      },
      deleteItem: function(type, ID) {
          var ids, index;
          // 'map' returns a new array
          ids = data.allItems[type].map(function(current) {
              return current.id; // An array of id
          });
          
          index = ids.indexOf(ID);
          
          if (index !== -1) {
              data.allItems[type].splice(index, 1);
          }
          
      },
      calculateBudget: function() {
          
          // Calculate total income & expenses
          calculateTotal('exp');
          calculateTotal('inc');
          
          // Calculate the budget: income - expenses
          data.budget = data.total.inc - data.total.exp;
          
          // Calculate the percentage of income we spent
          if (data.total.inc > 0) {
              data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
          } else {
              data.percentage = -1;
          }
      },
      calculatePercentages: function() {
          data.allItems.exp.forEach(function(cur) {
              cur.calcPercentages(data.total.inc);
          });
      },
      getPercentages: function() {
          var allPerc = data.allItems.exp.map(function(cur) {
              return cur.getPercentage();
          });
          return allPerc;
      },
      getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.total.inc,
              totalExp: data.total.exp,
              percentage: data.percentage
          };
      },
      testing: function(){
          return data.allItems;
      }
    
    };
    
})();


// UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type) {
            /* 
                + or - before number
                exactly 2 decimal points
                comma separating the thousands
                
                2310.4567 -> + 2,310.46
                2000 -> 2,000.00
            */
            var numSplit, int, dec, type, addTime, offset;
            num = Math.abs(num);
            num = num.toFixed(2); // Returned as string
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            // 100000
            offset = int.length % 3;
            addTime = (int.length / 3) -1 + offset;
            if (int.length > 3) {
                // input 2310 -> output 2,310
                for (var i = 0; i < addTime; i++) {
                    int = int.substr(0, (int.length - 3) + 3 * i) + ',' + int.substr((int.length - 3) + 3 * i, 3 + 3 * i);
                }
            }
            dec = numSplit[1];

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // Create HTML strings with placeholder tag
            // Hard-coded
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div    class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            // Replace the placeholder tag with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            // Use prototype of Array to introduce its method
            // (since fields is not an array, but a nodelist)
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type ='inc' : type = 'exp';
            
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
            // fields is a nodelist returned from document
            
            // Callback func
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        displayDate: function() {
            var now, year, month, months;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            ); 
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.addButton).classList.toggle('red');
        },
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventlistener = function() {
        
        var DOM =UICtrl.getDOMstrings();
        
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            // Keycode of enter is 13
            // which is for older browser that doesn't have keycode property
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        // Event Delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    
    };

    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budgetController
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get filled input data
        input = UICtrl.getInput();

        // Input validation
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields 
            UICtrl.clearFields();

            // 5. Calculate & update budget
            updateBudget();
            
            // 6. Calculate & update percentages
            updatePercentages();
        }
    };
    // Hard-coded
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        
            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Calculate & update budget
            updateBudget();
            
            // 4. Calculate & update percentages
            updatePercentages(); 
        }
    };
     
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                  budget: 0,
                  totalInc: 0,
                  totalExp: 0,
                  percentage: -1
            });
            setupEventlistener();
        }
    };
    
})(budgetController, UIController);

controller.init();