// Dependencies //
var mysql = require("mysql");
var inquirer = require("inquirer");
var newAmount = 0;
var productSales = 0;

// Connection To MySQL //
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
});

// Function for having the option to quit from the command line //
function quit(inq) {
  if (inq.toLowerCase() === "q") {
    connection.end();
    process.exit(0);
  }
}

// List of groceries available on bamazon //
connection.query("SELECT * FROM bamazon_products", function (err, results) {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
    console.log(results[i].item + " " + 
                results[i].product + " " +
                results[i].price + " ")
    }
    groceryList(results);
})

// Function to display groceries available //
function groceryList(databaseFetch) {
    inquirer.prompt({
        name: "item",
        type: "input",
        message: "Enter the item number of the product you would like to purchase. Type 'q' to quit."
      })
      .then(function(list) {
        quit(list.item)
        var query = "SELECT * FROM bamazon_products WHERE Item = ?";
        connection.query(query, list.item, 
        function(err, results) {
          for (var i = 0; i < results.length; i++) {
          }
          console.log("Your Item: " + databaseFetch[list.item -1].product);
          quantity(databaseFetch, list.item);
        });
      });
  }

// Function to display the quantity that the user chooses from the list // 
function quantity(units, priorInput) {
  inquirer.prompt({
        name: "quantity",
        type: "input",
        message: "Enter the quantity of each item that you would like to purchase."
  })
  .then(function(list) {
    quit(list.quantity)
    var query = "SELECT * FROM bamazon_products WHERE Item = ?";
    connection.query(query, priorInput, 
    function(err, result) {
      console.log("result", result[0]);
      console.log("Quantity available in stock:", result[0].quantity, "\nAmount of product wanting to purchase:", list.quantity);
      if (parseInt(list.quantity) <= parseInt(result[0].quantity)) {
// Allow the purchase //
        console.log("Your product is in stock!");
        connection.query("UPDATE bamazon_products SET quantity = '" + (parseInt(result[0].quantity) - parseInt(list.quantity)) + "' WHERE item = " + priorInput, function(err, data){
          if (err) throw err;
        }); 
      } else {
// Disallow the purchase with an error //
      console.log("Sorry, we have run out of the item " + result[0].product + " you are requesting.");
      console.log("Bamazon will be restocking " + result[0].product + " shortly.", "\nShop Bamazon!");
      }
      if (result[0].quantity){
        var buyerTotal = result[0].price * list.quantity;
        console.log("You purchased " + list.quantity + " unit(s) of " + units[priorInput -1].product + ".");
        console.log("The total price for your order is " + "$" + buyerTotal);
        console.log("Thank you for shopping Bamazon!");
      } 
    });
  });
}