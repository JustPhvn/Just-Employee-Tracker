const inquirer = require("inquirer");
const sql = require("mysql");

async function menu() {
  const connection = await sql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employees_db"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log(`Connected as ID  ${connection.threadId}`);
  });
  const action = await inquirer.prompt([
    {
      name: "option",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "Add Department",
        "Add Role",
        "Add Employee",
        "View Department",
        "View Roles",
        "View Employees",
        "Update Employee"
      ]
    }
  ]);
  //   console.log(action.option);

  switch (action.option) {
    case "Add Department":
      const department = await inquirer.prompt([
        {
          name: "department",
          type: "input",
          message: "What department would you like to add?"
        },
        {
          name: "id",
          type: "number",
          message: "What is the department ID?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        }
      ]);
      connection.query(
        "INSERT INTO department SET ?",
        {
          id: department.id,
          dept_name: department.department
        },
        function(err) {
          if (err) throw err;
          console.log("Department successfully created");
          menu();
        }
      );
      break;
    case "Add Role":
      const role = await inquirer.prompt([
        {
          name: "role",
          type: "input",
          message: "What role would you like to add?"
        },
        {
          name: "id",
          type: "number",
          message: "What is the role ID?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        },
        {
          name: "salary",
          type: "number",
          message: "What is the role salary?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        },
        {
          name: "deptID",
          type: "number",
          message: "What department does the role belong to?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        }
      ]);
      connection.query(
        "INSERT INTO role SET ?",
        {
          id: role.id,
          title: role.role,
          salary: role.salary,
          department_id: role.deptID
        },
        function(err) {
          if (err) throw err;
          console.log("Role was created successfully");
          menu();
        }
      );
      break;
    case "Add Employee":
      const employee = await inquirer.prompt([
        {
          name: "firstName",
          type: "input",
          message:
            "What is the first name of the employee would you like to add?"
        },
        {
          name: "lastName",
          type: "input",
          message:
            "What is the last name of the employee would you like to add?"
        },
        {
          name: "id",
          type: "number",
          message: "What is the emplyoee ID?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        },
        {
          name: "roleID",
          type: "number",
          message: "What role ID does the employee have?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        },
        {
          name: "manID",
          type: "number",
          message: "What is the employee's manager's ID?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            } else {
              return false;
            }
          }
        }
      ]);
      connection.query(
        "INSERT INTO employee SET ?",
        {
          id: employee.id,
          first_name: employee.firstName,
          last_name: employee.lastName,
          role_id: employee.roleID,
          manager_id: employee.manID
        },
        function(err) {
          if (err) throw err;
          console.log("Employee successfully added.");
          menu();
        }
      );
      break;
    case "View Department":
      connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        console.table(res);
      });
      menu();
      break;
    case "View Roles":
      connection.query("SELECT * FROM role", function(err, res) {
        if (err) throw err;
        console.table(res);
      });
      menu();
      break;
    case "View Employees":
      connection.query(
        "SELECT m.id, m.first_name,m.last_name, e.first_name AS Manager, r.title AS Position, d.dept_name AS Department, r.salary FROM employee e INNER JOIN employee m ON m.manager_id = e.id LEFT JOIN role r ON r.id = e.role_id LEFT JOIN department d ON d.id = r.department_id",
        function(err, res) {
          if (err) throw err;
          console.table(res);
        }
      );
      menu();
      break;
    case "Update Employee":
      connection.query("SELECT * FROM employee", function(err, res) {
        if (err) throw err;
        const choiceArray = [];
        res.map(employee => choiceArray.push(employee.first_name));
        inquirer
          .prompt({
            name: "employee",
            type: "list",
            choices: choiceArray,
            message: "What employee would you like to update?"
          })
          .then(function(response) {
            connection.query(
              `SELECT * FROM employee WHERE first_name = '${response.employee}'`,
              async function(err, res) {
                if (err) throw err;
                console.table(res);
                inquirer
                  .prompt({
                    name: "roleUpdate",
                    type: "number",
                    message: "What is the new role ID?"
                  })
                  .then(function(update) {
                    connection.query(
                      `UPDATE employee SET ? WHERE first_name = '${response.employee}'`,
                      { role_id: update.roleUpdate },
                      function(err, res) {
                        if (err) throw err;
                        console.log("Employee role was updated!");
                        menu();
                      }
                    );
                  });
              }
            );
          });
      });
      break;
  }
}

module.exports = menu;
